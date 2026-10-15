import type { DefaultSession } from "next-auth";
import type { AdminRole } from "../../generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      adminId: string | null;
      role: AdminRole | null;
      sections: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    adminId: string | null;
    role: AdminRole | null;
    sections: string[];
  }
}
