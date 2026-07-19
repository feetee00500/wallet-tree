import { MongoClient, type Db } from 'mongodb';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export function databaseConfig() {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || 'wallet-tree';
  if (!uri) throw new Error('MONGODB_URI is required in the current shell.');
  return { uri, databaseName };
}

export function isProductionTarget(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  );
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

export function argument(name: string): string | undefined {
  const prefix = `${name}=`;
  const direct = process.argv.find((value) => value.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function rejectPasswordArguments(): void {
  if (
    process.argv.some(
      (value) => value === '--password' || value.startsWith('--password=')
    )
  ) {
    throw new Error('Passwords must be entered interactively, never as arguments.');
  }
}

export async function confirmWrite(databaseName: string): Promise<void> {
  stdout.write(`Target MongoDB database: ${databaseName}\n`);
  if (isProductionTarget() && !hasFlag('--confirm-production')) {
    throw new Error(
      'Production writes require the explicit --confirm-production flag.'
    );
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await prompt.question(
      `Type the database name "${databaseName}" to confirm this write: `
    );
    if (answer !== databaseName) throw new Error('Confirmation did not match.');

    if (isProductionTarget()) {
      const productionAnswer = await prompt.question(
        'Type "production" to confirm the production write: '
      );
      if (productionAnswer !== 'production') {
        throw new Error('Production confirmation did not match.');
      }
    }
  } finally {
    prompt.close();
  }
}

export async function hiddenPassword(label: string): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY || !stdin.setRawMode) {
    throw new Error('An interactive TTY is required for password input.');
  }

  stdout.write(label);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    let value = '';
    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };
    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          cleanup();
          reject(new Error('Cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          cleanup();
          resolve(value);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    };
    stdin.on('data', onData);
  });
}

export async function withDatabase<T>(
  callback: (db: Db, databaseName: string) => Promise<T>
): Promise<T> {
  const { uri, databaseName } = databaseConfig();
  const client = new MongoClient(uri);
  try {
    await client.connect();
    return await callback(client.db(databaseName), databaseName);
  } finally {
    await client.close();
  }
}
