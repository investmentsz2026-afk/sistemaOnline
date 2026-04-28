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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        company,
      },
    });

    await AuditService.log(
      user.id,
      "USER_REGISTERED",
      `Usuario ${user.email} se registr con el rol ${user.role}`
    );

    return user;
  }
}
