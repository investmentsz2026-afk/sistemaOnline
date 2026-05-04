"use server";

import prisma from "@/lib/prisma";

export async function checkUserStatus(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isActive: true }
    });

    if (user && !user.isActive) {
      return { isBlocked: true };
    }

    return { isBlocked: false };
  } catch (error) {
    return { isBlocked: false };
  }
}
