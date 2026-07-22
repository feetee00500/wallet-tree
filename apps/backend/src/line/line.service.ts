import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messagingApi, webhook } from '@line/bot-sdk';
import { AuthProvider, UserRole, UserStatus } from '@wallet-tree/database';
import { toCategoryResponse } from '../category/category.mapper';
import { CategoryRepo } from '../category/category.repo';
import { AutoCategorizerService } from './categorizer/auto-categorizer.service';
import { LineRepo } from './line.repo';
import { parseThaiMessage } from './parsers/thai-message.parser';

const HELP_TEXT =
  'วิธีใช้:\n• บันทึก: กาแฟ 65\n• สรุป - ยอดวันนี้\n• เดือนนี้ - ยอดเดือนนี้\n• ยกเลิก - ลบรายการล่าสุด';

@Injectable()
export class LineService {
  private readonly client: messagingApi.MessagingApiClient | null;

  constructor(
    private readonly config: ConfigService,
    private readonly lineRepo: LineRepo,
    private readonly categoryRepo: CategoryRepo,
    private readonly categorizer: AutoCategorizerService,
  ) {
    const channelAccessToken = this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    this.client = channelAccessToken
      ? new messagingApi.MessagingApiClient({ channelAccessToken })
      : null;
  }

  async handleWebhook(body: webhook.CallbackRequest): Promise<void> {
    if (!this.client) {
      throw new ServiceUnavailableException('LINE Messaging API is not configured');
    }
    for (const event of body.events) {
      await this.handleEvent(event);
    }
  }

  private async handleEvent(event: webhook.Event): Promise<void> {
    if (event.type !== 'message') return;
    const messageEvent = event as webhook.MessageEvent;
    if (messageEvent.message.type !== 'text') return;

    const lineUserId = event.source?.userId;
    if (!lineUserId) return;

    const replyToken = messageEvent.replyToken;
    if (!replyToken) return;

    const textMessage = messageEvent.message as webhook.TextMessageContent;
    const text = textMessage.text.trim();

    const user = await this.lineRepo.findOrCreateByLineUserId(lineUserId);
    if (
      user.authProvider !== AuthProvider.LINE ||
      user.role !== UserRole.USER ||
      user.status !== UserStatus.ACTIVE
    ) {
      return;
    }
    const replyText = await this.buildReply(text, user.id);

    await this.client!.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: replyText }],
    });
  }

  private async buildReply(text: string, userId: string): Promise<string> {
    return (
      (await this.handleRecordCommand(text, userId)) ??
      (await this.handleDailySummary(text, userId)) ??
      (await this.handleMonthlySummary(text, userId)) ??
      (await this.handleUndo(text, userId)) ??
      HELP_TEXT
    );
  }

  private async handleRecordCommand(text: string, userId: string): Promise<string | null> {
    const parsed = parseThaiMessage(text);
    if (!parsed) return null;

    const cats = await this.categoryRepo.findAllForUser(userId);
    const category = await this.categorizer.categorize(
      parsed.description,
      parsed.type,
      cats.map(toCategoryResponse),
      userId,
    );
    await this.lineRepo.createTransaction({
      amount: parsed.amount,
      type: parsed.type,
      description: parsed.description,
      categoryId: category.id,
      userId,
    });
    return `บันทึกแล้ว: ${parsed.description} ${formatAmount(parsed.amount)} บาท (${category.name})`;
  }

  private async handleDailySummary(text: string, userId: string): Promise<string | null> {
    if (text !== 'สรุป') return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return this.formatPeriodSummary('สรุปวันนี้', userId, start, end);
  }

  private async handleMonthlySummary(text: string, userId: string): Promise<string | null> {
    if (text !== 'เดือนนี้') return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.formatPeriodSummary('สรุปเดือนนี้', userId, start, end);
  }

  private async handleUndo(text: string, userId: string): Promise<string | null> {
    if (text !== 'ยกเลิก') return null;
    const last = await this.lineRepo.findLastTransaction(userId);
    if (!last) return 'ไม่มีรายการล่าสุด';
    await this.lineRepo.deleteTransaction(last.id);
    const desc = last.description ? `${last.description} ` : '';
    return `ยกเลิกรายการล่าสุดแล้ว: ${desc}${formatAmount(Number(last.amount))} บาท`;
  }

  private async formatPeriodSummary(
    label: string,
    userId: string,
    start: Date,
    end: Date,
  ): Promise<string> {
    const { income, expense } = await this.lineRepo.sumByPeriod(userId, start, end);
    return `${label}\nรายรับ: ${formatAmount(income)} บาท\nรายจ่าย: ${formatAmount(expense)} บาท`;
  }
}

function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
