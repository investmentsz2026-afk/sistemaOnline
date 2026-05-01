import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "../auth.config";
import { loginSchema } from "@/schemas/auth.schema";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.balance = token.balance as number;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true, balance: true }
      });

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.balance = existingUser.balance;

      return token;
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Intentando iniciar sesión con:", credentials);
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          console.log("Email validado:", email);

          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });
            console.log("Usuario encontrado en BD:", user ? "Sí" : "No");

            if (!user) {
              console.log("Error: Usuario no encontrado");
              return null;
            }
            if (!user.password) {
              console.log("Error: Usuario sin contraseña (quizás usa Google/Facebook)");
              return null;
            }
            if (!user.isActive) {
              console.log("Error: Usuario inactivo");
              return null;
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);
            console.log("¿Contraseña coincide?:", passwordsMatch);

            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            } else {
              console.log("Error: Contraseña incorrecta");
            }
          } catch (dbError) {
            console.error("Error consultando la base de datos:", dbError);
          }
        } else {
          console.log("Error de validación de campos:", validatedFields.error);
        }

        return null;
      },
    }),
  ],
});

