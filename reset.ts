import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash("123456", 10);
  
  await prisma.user.updateMany({
    where: { email: "jose@gmail.com" },
    data: { password: hash }
  });
  
  console.log("Password reset successfully for jose@gmail.com");
}

reset().catch(console.error).finally(() => prisma.$disconnect());
