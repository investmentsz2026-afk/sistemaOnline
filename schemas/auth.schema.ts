import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invlido"),
  password: z.string().min(6, "La contrasea debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email invlido"),
  password: z.string().min(6, "La contrasea debe tener al menos 6 caracteres"),
  phoneNumber: z.string().min(6, "Teléfono inválido").optional(),
  company: z.string().min(2, "Nombre de empresa inválido").optional(),
  role: z.enum(["ADMIN", "EMPLOYEE", "CLIENT"]).optional().default("CLIENT"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
