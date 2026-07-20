import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import path from 'path';

const dbUrl = path.resolve(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: 'org-garden-of-hope' },
    update: {},
    create: { id: 'org-garden-of-hope', name: 'Garden of Hope' },
  });

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@fosterkonnect.com' },
    update: {},
    create: {
      email: 'admin@fosterkonnect.com',
      username: 'admin',
      passwordHash,
      firstName: 'Krutik',
      lastName: 'Kapadia',
      role: 'admin',
      mfaPolicy: 'none',
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@fosterkonnect.com' },
    update: {},
    create: {
      email: 'staff@fosterkonnect.com',
      username: 'staff',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'staff',
      mfaPolicy: 'email_otp',
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@fosterkonnect.com' },
    update: {},
    create: {
      email: 'manager@fosterkonnect.com',
      username: 'manager',
      passwordHash,
      firstName: 'Tom',
      lastName: 'Bennett',
      role: 'manager',
      mfaPolicy: 'google_auth',
      organizationId: org.id,
    },
  });

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
