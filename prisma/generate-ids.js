const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
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
  } catch (err) {
    console.error("Error detallado:", err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
