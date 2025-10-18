import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un administrateur par défaut
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecoledelabourse.com' },
    update: {},
    create: {
      email: 'admin@ecoledelabourse.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'EDB',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✅ Admin créé:', admin.email);

  // Créer un coach de test
  const coachPassword = await bcrypt.hash('Coach123!', 10);
  const coach = await prisma.user.upsert({
    where: { email: 'coach@ecoledelabourse.com' },
    update: {},
    create: {
      email: 'coach@ecoledelabourse.com',
      password: coachPassword,
      firstName: 'Coach',
      lastName: 'Test',
      role: 'COACH',
      status: 'ACTIVE',
      emailVerified: true,
      bio: 'Coach expérimenté en trading',
    },
  });

  console.log('✅ Coach créé:', coach.email);

  // Créer un apprenant de test
  const apprenantPassword = await bcrypt.hash('Apprenant123!', 10);
  const apprenant = await prisma.user.upsert({
    where: { email: 'apprenant@test.com' },
    update: {},
    create: {
      email: 'apprenant@test.com',
      password: apprenantPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'APPRENANT',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+221771234567',
    },
  });

  console.log('✅ Apprenant créé:', apprenant.email);

  // Créer une cohorte de test
  const cohort = await prisma.cohort.create({
    data: {
      name: 'Formation Trading - Janvier 2025',
      description: 'Formation complète au trading pour débutants',
      type: 'TRADING_BASICS',
      status: 'ACTIVE',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      maxStudents: 30,
    },
  });

  console.log('✅ Cohorte créée:', cohort.name);

  // Paramètres système
  const settings = [
    {
      key: 'monthly_subscription_price',
      value: '5000',
      type: 'number',
      description: 'Prix abonnement mensuel (XOF)',
    },
    {
      key: 'quarterly_subscription_price',
      value: '13500',
      type: 'number',
      description: 'Prix abonnement trimestriel (XOF)',
    },
    {
      key: 'yearly_subscription_price',
      value: '48000',
      type: 'number',
      description: 'Prix abonnement annuel (XOF)',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Paramètres système créés');
  console.log('\n📋 Identifiants de test:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin     : admin@ecoledelabourse.com / Admin123!');
  console.log('Coach     : coach@ecoledelabourse.com / Coach123!');
  console.log('Apprenant : apprenant@test.com / Apprenant123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
