"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "No autorizado" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, message: "Usuario no encontrado" };

    const updateData: any = {};
    
    if (name && name !== user.name) updateData.name = name;
    if (email && email !== user.email) updateData.email = email;

    // Password logic
    if (password && newPassword) {
      if (!user.password) {
        return { success: false, message: "Cuenta social no requiere contraseña actual." };
      }
      
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return { success: false, message: "La contraseña actual es incorrecta." };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      return { success: true, message: "Perfil actualizado correctamente." };
    } else {
      return { success: false, message: "No hubo cambios para actualizar." };
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Error interno al actualizar el perfil." };
  }
}
