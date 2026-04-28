"use server";

import { registerSchema, RegisterInput } from "@/schemas/auth.schema";
import { AuthService } from "@/services/auth.service";

export async function registerAction(values: RegisterInput) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos invlidos" };
  }

  try {
    await AuthService.register(validatedFields.data);
    return { success: "Usuario creado correctamente" };
  } catch (error: any) {
    return { error: error.message || "Algo sali mal" };
  }
}
