import { hash } from 'bcryptjs';
import { z } from 'zod';
import type { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';
import {
  argument,
  confirmWrite,
  hiddenPassword,
  rejectPasswordArguments,
  withDatabase,
} from './db-safety';

type AdminRecord = {
  _id: ObjectId;
  authProvider: 'local_admin';
  role: 'admin';
  status: 'active' | 'disabled';
  username: string;
  usernameNormalized: string;
  email?: string;
  emailNormalized?: string;
  displayName: string;
  lineUserId: string;
  passwordHash: string;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  sessionVersion?: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const passwordSchema = z.string().min(12).max(256);
const usernameSchema = z.string().trim().min(3).max(64).regex(/^[\p{L}\p{N}._-]+$/u);
const emailSchema = z.string().trim().email().max(254);
const normalize = (value: string) =>
  value.trim().normalize('NFKC').toLocaleLowerCase('en-US');

async function requestedPassword(): Promise<string> {
  const password = await hiddenPassword('Password: ');
  const confirmation = await hiddenPassword('Confirm password: ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  return passwordSchema.parse(password);
}

async function main() {
  rejectPasswordArguments();
  const command = process.argv[2];

  await withDatabase(async (db, databaseName) => {
    const users = db.collection<AdminRecord>('users');

    if (command === 'list') {
      process.stdout.write(`Target MongoDB database: ${databaseName}\n`);
      const admins = await users
        .find(
          { authProvider: 'local_admin' },
          {
            projection: {
              username: 1,
              email: 1,
              displayName: 1,
              status: 1,
              mustChangePassword: 1,
              lastLoginAt: 1,
            },
          }
        )
        .sort({ usernameNormalized: 1 })
        .toArray();
      process.stdout.write(
        `${JSON.stringify(
          admins.map((admin) => ({
            username: admin.username,
            email: admin.email,
            displayName: admin.displayName,
            status: admin.status,
            mustChangePassword: admin.mustChangePassword,
            lastLoginAt: admin.lastLoginAt,
          })),
          null,
          2
        )}\n`
      );
      return;
    }

    const username = usernameSchema.parse(argument('--username'));
    const usernameNormalized = normalize(username);
    const emailArg = argument('--email');
    const email = emailArg ? emailSchema.parse(emailArg) : undefined;
    const emailNormalized = email ? normalize(email) : undefined;

    await confirmWrite(databaseName);

    if (command === 'create') {
      const duplicate = await users.findOne({
        $or: [
          { usernameNormalized },
          ...(emailNormalized ? [{ emailNormalized }] : []),
        ],
      });
      if (duplicate) throw new Error('Username or email already exists.');

      const password = await requestedPassword();
      const passwordHash = await hash(password, 12);
      const now = new Date();
      await users.insertOne({
        authProvider: 'local_admin',
        role: 'admin',
        status: 'active',
        lineUserId: `local_admin:${randomUUID()}`,
        username,
        usernameNormalized,
        email,
        emailNormalized,
        displayName: username,
        passwordHash,
        mustChangePassword: true,
        failedLoginAttempts: 0,
        sessionVersion: 0,
        createdAt: now,
        updatedAt: now,
      } as AdminRecord);
      process.stdout.write('Maintenance admin created.\n');
      return;
    }

    const admin = await users.findOne({
      authProvider: 'local_admin',
      usernameNormalized,
    });
    if (!admin) throw new Error('Maintenance admin not found.');

    if (command === 'disable' || command === 'enable') {
      await users.updateOne(
        { _id: admin._id, authProvider: 'local_admin' },
        {
          $set: {
            status: command === 'disable' ? 'disabled' : 'active',
            updatedAt: new Date(),
          },
          $inc: { sessionVersion: 1 },
        }
      );
      process.stdout.write(`Maintenance admin ${command}d.\n`);
      return;
    }

    if (command === 'reset-password') {
      const password = await requestedPassword();
      const passwordHash = await hash(password, 12);
      await users.updateOne(
        { _id: admin._id, authProvider: 'local_admin' },
        {
          $set: {
            passwordHash,
            mustChangePassword: true,
            failedLoginAttempts: 0,
            updatedAt: new Date(),
          },
          $unset: { lockedUntil: '' },
          $inc: { sessionVersion: 1 },
        }
      );
      process.stdout.write('Maintenance admin password reset.\n');
      return;
    }

    throw new Error('Unknown admin command.');
  });
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Command failed.'}\n`);
  process.exitCode = 1;
});
