import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const ALLOWED_EMAIL_DOMAIN = "@udesa.edu.ar";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async signIn({ user }) {
      return !!user.email?.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const email = token.email.toLowerCase();
      const found = await prisma.adminUser.findUnique({ where: { email } });
      // Se relee en cada request: desactivar a alguien le corta el acceso en el acto, sin esperar a que venza la sesión.
      const adminUser = found?.active ? found : null;
      token.adminId = adminUser?.id ?? null;
      token.role = adminUser?.role ?? null;
      token.sections = adminUser?.sections ?? [];
      return token;
    },
    async session({ session, token }) {
      session.user.adminId = token.adminId;
      session.user.role = token.role;
      session.user.sections = token.sections;
      return session;
    },
  },
});
