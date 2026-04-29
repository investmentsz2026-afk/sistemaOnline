import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Usamos la misma configuración que en lib/prisma.ts para que funcione en Neon
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Inicializando seed automático con adaptador Neon...");

  const adminEmail = "admin@sistema.com";
  const adminPassword = "Admin123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ El usuario administrador ya existe.");
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log("✅ Usuario administrador creado con éxito.");
  }

  console.log("✨ Proceso de Seed finalizado.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
