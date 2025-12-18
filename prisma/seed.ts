import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@hospital.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin already exists:', email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email,
      password: hashed,
      role: UserRole.ADMIN,
      phone: '+000000000',
    },
  });

  console.log('✅ Seeded admin:', { id: admin.id, email: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
