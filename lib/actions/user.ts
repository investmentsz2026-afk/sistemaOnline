"use server";

import { UserService } from "@/services/user.service";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuditService } from "@/services/audit.service";

export async function deactivateUserAction(userId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  if ((session?.user as any)?.id === userId) {
    return { error: "No puedes desactivarte a ti mismo" };
  }

  try {
    await (UserService as any).softDelete(userId, (session?.user as any)?.id!);
    revalidatePath("/dashboard/moderators");
    revalidatePath("/dashboard/users");
    return { success: "Usuario desactivado" };
  } catch (error) {
    return { error: "Error al desactivar usuario" };
  }
}

export async function reactivateUserAction(userId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    await UserService.reactivate(userId, (session?.user as any)?.id!);
    revalidatePath("/dashboard/moderators");
    revalidatePath("/dashboard/users");
    return { success: "Usuario reactivado" };
  } catch (error) {
    return { error: "Error al reactivar usuario" };
  }
}

export async function createStaffAction(values: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const { email, password, name, role } = values;
  
  try {
    const existingUser = await (prisma.user as any).findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "El correo ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `staff_${Date.now()}`;

    // Use raw query to bypass stale Prisma Client enum validation
    await prisma.$executeRawUnsafe(
      `INSERT INTO users (id, name, email, password, role, "isActive", "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      userId,
      name,
      email,
      hashedPassword,
      role, // This is the string "MODERATOR"
      true
    );

    await AuditService.log(
      (session?.user as any)?.id!,
      "STAFF_CREATED",
      `Nuevo ${role} creado: ${email}`
    );

    revalidatePath("/dashboard/moderators");
    return { success: "Miembro del equipo creado correctamente" };
  } catch (error: any) {
    console.error("CREATE_STAFF_ERROR:", error);
    return { error: `Error al crear miembro: ${error.message || "Error desconocido"}` };
  }
}

export async function updateStaffAction(userId: string, values: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const { email, password, name, role } = values;
  
  try {
    let query = `UPDATE users SET name = $1, email = $2, role = $3, "updatedAt" = NOW()`;
    const params = [name, email, role];

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $${params.length + 1}`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = $${params.length + 1}`;
    params.push(userId);

    await prisma.$executeRawUnsafe(query, ...params);

    await AuditService.log(
      (session?.user as any)?.id!,
      "STAFF_UPDATED",
      `Miembro del equipo actualizado: ${email}`
    );

    revalidatePath("/dashboard/moderators");
    return { success: "Miembro actualizado correctamente" };
  } catch (error: any) {
    console.error("UPDATE_STAFF_ERROR:", error);
    return { error: `Error al actualizar: ${error.message || "Error desconocido"}` };
  }
}

export async function updateProfileAction(values: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autenticado" };
  }

  const { name, email, password } = values;
  const userId = session.user.id;

  try {
    let query = `UPDATE users SET name = $1, email = $2, "updatedAt" = NOW()`;
    const params = [name, email];

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $${params.length + 1}`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = $${params.length + 1}`;
    params.push(userId);

    await prisma.$executeRawUnsafe(query, ...params);

    await AuditService.log(
      userId,
      "PROFILE_UPDATED",
      "El usuario actualizó su información de perfil"
    );

    revalidatePath("/dashboard/profile");
    return { success: "Perfil actualizado correctamente" };
  } catch (error: any) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    return { error: `Error al actualizar perfil: ${error.message || "Error desconocido"}` };
  }
}

export async function updateAvatarAction(avatarUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autenticado" };
  }

  const userId = session.user.id;

  try {
    // Update image using raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE users SET image = $1, "updatedAt" = NOW() WHERE id = $2`,
      avatarUrl,
      userId
    );

    revalidatePath("/dashboard/profile");
    return { success: "Avatar actualizado correctamente" };
  } catch (error: any) {
    console.error("UPDATE_AVATAR_ERROR:", error);
    return { error: `Error al actualizar avatar: ${error.message || "Error desconocido"}` };
  }
}
