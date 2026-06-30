/**
 * 🌱 SEED DE TEST — RideMada
 * Crée 3 comptes prêts à l'emploi :
 *   - 1 Admin
 *   - 1 Chauffeur (Driver, approuvé avec véhicule)
 *   - 1 Client (Passenger)
 *
 * Usage : npx ts-node scripts/seedTestUsers.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function clearExisting(phones: string[]) {
  for (const phone of phones) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      // Supprimer les refresh tokens d'abord
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

      if (user.role === 'DRIVER') {
        const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
        if (driver) {
          await prisma.vehicle.deleteMany({ where: { driverId: driver.id } });
          await prisma.driver.delete({ where: { id: driver.id } });
        }
      }

      await prisma.user.delete({ where: { id: user.id } });
      console.log(`🗑️  Ancien compte supprimé : ${phone}`);
    }
  }
}

async function main() {
  console.log('\n🚀 Démarrage du seed de test RideMada...\n');

  const phones = ['0340000001', '0340000002', '0340000003'];

  // Nettoyage des anciens comptes de test
  await clearExisting(phones);

  // ─────────────────────────────────────────────
  // 👑 1. ADMIN
  // ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      phone: '0340000001',
      name: 'Admin RideMada',
      email: 'admin@ridemada.mg',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      isBlocked: false,
      rating: 5.0,
    },
  });
  console.log('✅ ADMIN créé');
  console.log('   📱 Téléphone : 0340000001');
  console.log('   🔑 Mot de passe : Admin@1234');
  console.log('   🪪  Rôle : ADMIN\n');

  // ─────────────────────────────────────────────
  // 🚗 2. CHAUFFEUR (Driver)
  // ─────────────────────────────────────────────
  const driverPassword = await bcrypt.hash('Driver@1234', SALT_ROUNDS);
  const driverUser = await prisma.user.create({
    data: {
      phone: '0340000002',
      name: 'Jean Chauffeur',
      email: 'driver@ridemada.mg',
      password: driverPassword,
      role: 'DRIVER',
      isVerified: true,
      isBlocked: false,
      rating: 4.8,
    },
  });

  // Créer le profil Driver (approuvé)
  const driver = await prisma.driver.create({
    data: {
      userId: driverUser.id,
      isApproved: true,
      status: 'OFFLINE',
      rating: 4.8,
      documents: {
        permis: 'PERMIS-TEST-001',
        cin: 'CIN-TEST-002',
        assurance: 'ASSUR-TEST-003',
      },
    },
  });

  // Créer un véhicule pour le chauffeur
  await prisma.vehicle.create({
    data: {
      driverId: driver.id,
      brand: 'Toyota',
      model: 'Corolla',
      color: 'Blanc',
      plate: 'MAD-TEST-001',
      seats: 4,
      type: 'SEDAN',
      isActive: true,
    },
  });

  console.log('✅ CHAUFFEUR créé');
  console.log('   📱 Téléphone : 0340000002');
  console.log('   🔑 Mot de passe : Driver@1234');
  console.log('   🪪  Rôle : DRIVER');
  console.log('   ✔️  Approuvé : OUI');
  console.log('   🚘 Véhicule : Toyota Corolla Blanc — MAD-TEST-001\n');

  // ─────────────────────────────────────────────
  // 👤 3. CLIENT (Passenger)
  // ─────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Client@1234', SALT_ROUNDS);
  const client = await prisma.user.create({
    data: {
      phone: '0340000003',
      name: 'Marie Client',
      email: 'client@ridemada.mg',
      password: clientPassword,
      role: 'PASSENGER',
      isVerified: true,
      isBlocked: false,
      rating: 5.0,
    },
  });

  console.log('✅ CLIENT créé');
  console.log('   📱 Téléphone : 0340000003');
  console.log('   🔑 Mot de passe : Client@1234');
  console.log('   🪪  Rôle : PASSENGER\n');

  // ─────────────────────────────────────────────
  // 📋 RÉCAPITULATIF
  // ─────────────────────────────────────────────
  console.log('═══════════════════════════════════════════');
  console.log('  🎉 SEED TERMINÉ — Comptes de test créés  ');
  console.log('═══════════════════════════════════════════\n');

  console.log('┌──────────────┬──────────────┬─────────────────┐');
  console.log('│ Rôle         │ Téléphone    │ Mot de passe    │');
  console.log('├──────────────┼──────────────┼─────────────────┤');
  console.log('│ 👑 ADMIN     │ 0340000001   │ Admin@1234      │');
  console.log('│ 🚗 CHAUFFEUR │ 0340000002   │ Driver@1234     │');
  console.log('│ 👤 CLIENT    │ 0340000003   │ Client@1234     │');
  console.log('└──────────────┴──────────────┴─────────────────┘\n');

  console.log('🔗 Endpoint de connexion :');
  console.log('   POST http://localhost:5000/api/auth/login');
  console.log('   Body : { "phone": "...", "password": "..." }\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed :', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
