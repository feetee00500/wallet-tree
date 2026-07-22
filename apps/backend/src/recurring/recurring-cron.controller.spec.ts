import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecurringCronController } from './recurring-cron.controller';
import { RecurringService } from './recurring.service';

describe('RecurringCronController', () => {
  const processRecurring = jest.fn();
  const controller = new RecurringCronController(
    { getOrThrow: jest.fn().mockReturnValue('cron-secret') } as unknown as ConfigService,
    { processRecurring } as unknown as RecurringService,
  );

  beforeEach(() => processRecurring.mockReset());

  it('rejects requests without the Vercel cron bearer token', async () => {
    await expect(controller.process()).rejects.toBeInstanceOf(UnauthorizedException);
    expect(processRecurring).not.toHaveBeenCalled();
  });

  it('processes recurring transactions with the configured token', async () => {
    processRecurring.mockResolvedValue(undefined);

    await expect(controller.process('Bearer cron-secret')).resolves.toEqual({ ok: true });
    expect(processRecurring).toHaveBeenCalledTimes(1);
  });
});
