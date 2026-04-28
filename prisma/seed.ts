import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Inicializando seed de la base de datos...");

  // Crear usuario admin
  const adminEmail = "admin@sistema.com";
  const adminPassword = "Admin123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Usuario admin ya existe");
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador del Sistema",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        phoneNumber: "+1234567890",
        company: "Sistema Empresarial",
        isActive: true,
      },
    });

    console.log("✅ Usuario admin creado:");
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔐 Contraseña: ${adminPassword}`);
    console.log(`   👤 ID: ${admin.id}`);
  }

  console.log("✨ Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
