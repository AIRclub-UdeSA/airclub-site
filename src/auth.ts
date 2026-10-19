import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { adminAccessFor, canSignIn } from "@/lib/auth-access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", error: "/ingresar/error" },
  callbacks: {
    // Entra cualquier cuenta de Google con el mail verificado. El panel sigue siendo solo @udesa (ver jwt).
    async signIn({ profile }) {
      return canSignIn(profile);
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const email = token.email.toLowerCase();
      const found = await prisma.adminUser.findUnique({ where: { email } });
      // Se relee en cada request: desactivar a alguien le corta el acceso en el acto, sin esperar a que venza la sesión.
      // Rol solo con mail @udesa.edu.ar Y fila activa: un mail externo no lo obtiene aunque exista en AdminUser.
      const access = adminAccessFor(email, found);
      token.adminId = access.adminId;
      token.role = access.role;
      token.sections = access.sections;
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
