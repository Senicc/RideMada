import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const phone = process.argv[2];
  
  if (!phone) {
    console.error('❌ Veuillez fournir un numéro de téléphone.');
    console.error('👉 Exemple : npx ts-node scripts/makeAdmin.ts 0341234567');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    console.error(`❌ Utilisateur introuvable avec le numéro ${phone}.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ SUCCÈS : Le compte de ${user.name} (${phone}) est maintenant ADMIN !`);
}

main()
  .catch((e) => {
    console.error('Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
