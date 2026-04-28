import prisma from "@/lib/prisma";

export class AuditService {
  static async log(userId: string | null, action: string, description: string) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          description,
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  static async getAll() {
    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
