import { type DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
  role: Role;
  id: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
