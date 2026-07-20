import { Prisma } from '@prisma/client';

import { prisma } from '../database';
import type { SettingKey } from '../constants/settings';

type Client = Prisma.TransactionClient | typeof prisma;

interface NextDocumentNumberOptions {
  organizationId: string;
  prefixKey: SettingKey;
  nextKey: SettingKey;
  defaultPrefix: string;
  defaultNext?: string;
  padding?: number;
  tx?: Prisma.TransactionClient;
}

const readOrCreate = async (
  client: Client,
  organizationId: string,
  key: string,
  defaultValue: string,
  description?: string,
) => {
  const existing = await client.organizationSetting.findUnique({
    where: { organizationId_key: { organizationId, key } },
  });

  if (existing) {
    return existing;
  }

  return client.organizationSetting.upsert({
    where: { organizationId_key: { organizationId, key } },
    update: {},
    create: {
      organizationId,
      key,
      value: defaultValue,
      description: description ?? null,
    },
  });
};

const generate = async (
  client: Client,
  options: NextDocumentNumberOptions,
): Promise<string> => {
  const {
    organizationId,
    prefixKey,
    nextKey,
    defaultPrefix,
    defaultNext = '1',
    padding = 4,
  } = options;

  const prefixSetting = await readOrCreate(
    client,
    organizationId,
    prefixKey,
    defaultPrefix,
  );

  const nextSetting = await readOrCreate(
    client,
    organizationId,
    nextKey,
    defaultNext,
  );

  const current = Number.parseInt(nextSetting.value, 10);
  const currentNext = Number.isFinite(current) && current > 0 ? current : 1;
  const newNext = currentNext + 1;

  await client.organizationSetting.update({
    where: { organizationId_key: { organizationId, key: nextKey } },
    data: { value: String(newNext) },
  });

  const padded = String(currentNext).padStart(padding, '0');
  return `${prefixSetting.value}-${padded}`;
};

export const nextDocumentNumber = async (
  options: NextDocumentNumberOptions,
): Promise<string> => {
  if (options.tx) {
    return generate(options.tx, options);
  }

  return prisma.$transaction((tx) => generate(tx, options));
};
