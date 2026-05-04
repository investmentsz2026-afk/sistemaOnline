"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    // Actualizamos el campo 'image' en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    revalidatePath("/configuracion");
    revalidatePath("/inicio");
    revalidatePath("/recompensas");

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar foto de perfil:", error);
    return { success: false, error: "Error al guardar la imagen" };
  }
}
