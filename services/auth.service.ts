import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput } from "@/schemas/auth.schema";
import { AuditService } from "./audit.service";

export class AuthService {
  static async register(data: RegisterInput) {
    const { name, email, password, role, phoneNumber, company } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar un Player ID de 6 dígitos único
    let playerId = "";
    let isUnique = false;
    while (!isUnique) {
      playerId = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await prisma.user.findUnique({ where: { playerId } });
      if (!existing) isUnique = true;
    }

    // Generar un código de referido único
    let referralCode = "";
    let isRefUnique = false;
    while (!isRefUnique) {
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      referralCode = `REF-${randomPart}`;
      const existingRef = await prisma.user.findUnique({ where: { referralCode } });
      if (!existingRef) isRefUnique = true;
    }

    // Buscar patrocinador por código de referido
    let referredById: string | undefined = undefined;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode.trim().toUpperCase() }
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        company,
        playerId,
        referralCode,
        referredById,
        balance: 0.02, // Bono de registro
      },
    });

    await AuditService.log(
      user.id,
      "USER_REGISTERED",
      `Usuario ${user.email} se registró con el rol ${user.role} (Bono de $0.02 acreditado). Código de referido: ${referralCode}`
    );

    return user;
  }
}
