import prisma from "@/lib/prisma";
import { AuditService } from "./audit.service";

export class UserService {
  static async getAll() {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getActive() {
    return await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async softDelete(id: string, adminId: string) {
    // Fetch email using raw query to avoid enum issues
    const users = await prisma.$queryRaw<any[]>`SELECT email FROM users WHERE id = ${id}`;
    const email = users[0]?.email || id;

    await prisma.$executeRawUnsafe(
      `UPDATE users SET "isActive" = false, "deletedAt" = $1 WHERE id = $2`,
      new Date(),
      id
    );

    await AuditService.log(
      adminId,
      "USER_DEACTIVATED",
      `Usuario ${email} fue desactivado por el administrador`
    );
  }

  static async reactivate(id: string, adminId: string) {
    // Fetch email using raw query to avoid enum issues
    const users = await prisma.$queryRaw<any[]>`SELECT email FROM users WHERE id = ${id}`;
    const email = users[0]?.email || id;

    await prisma.$executeRawUnsafe(
      `UPDATE users SET "isActive" = true, "deletedAt" = NULL WHERE id = $1`,
      id
    );

    await AuditService.log(
      adminId,
      "USER_REACTIVATED",
      `Usuario ${email} fue reactivado por el administrador`
    );
  }
}
