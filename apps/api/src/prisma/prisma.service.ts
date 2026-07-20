import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbPath = path.resolve(
      (process.env.DATABASE_URL ?? 'file:./prisma/dev.db').replace('file:', ''),
    );
    const { PrismaBetterSqlite3: Adapter } = require('@prisma/adapter-better-sqlite3');
    const adapter = new Adapter({ url: dbPath });
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
