import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { playerId: null },
        { playerId: "" }
      ]
    }
  });

  console.log(`Generando IDs para ${users.length} usuarios...`);

  for (const user of users) {
    let uniqueId = "";
    let isUnique = false;

    // Generar un ID de 6 dígitos que no exista
    while (!isUnique) {
      uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await prisma.user.findUnique({
        where: { playerId: uniqueId }
      });
      if (!existing) isUnique = true;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { playerId: uniqueId }
    });
    console.log(`Usuario ${user.email} -> ID: ${uniqueId}`);
  }

  console.log("¡IDs generados con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
