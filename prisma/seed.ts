import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const hospital1 = await prisma.hospital.upsert({
    where: { code: 'HCB-01' },
    update: {},
    create: { name: 'Hospital Central Barquisimeto', code: 'HCB-01' },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { code: 'HUC-02' },
    update: {},
    create: { name: 'Hospital Universitario de Caracas', code: 'HUC-02' },
  });

  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      {
        hospitalId: hospital1.id,
        title: 'Revisión de equipos de UCI',
        description: 'Verificar funcionamiento de monitores y ventiladores',
        status: 'PENDING',
        priority: 'HIGH',
      },
      {
        hospitalId: hospital1.id,
        title: 'Mantenimiento generador eléctrico',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
      {
        hospitalId: hospital1.id,
        title: 'Inventario de medicamentos',
        description: 'Conteo mensual de farmacia',
        status: 'COMPLETED',
        priority: 'MEDIUM',
      },
      {
        hospitalId: hospital2.id,
        title: 'Capacitación personal de enfermería',
        description: 'Taller de protocolos de bioseguridad',
        status: 'PENDING',
        priority: 'MEDIUM',
      },
      {
        hospitalId: hospital2.id,
        title: 'Actualización de expedientes',
        status: 'IN_PROGRESS',
        priority: 'LOW',
      },
    ],
  });

  console.log(`Seed completado:`);
  console.log(`  Hospital 1: ${hospital1.name} (id: ${hospital1.id})`);
  console.log(`  Hospital 2: ${hospital2.name} (id: ${hospital2.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
