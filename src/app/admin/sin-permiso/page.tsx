import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/layout/SignOutButton";

export default async function AdminSinPermisoPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
      <h1 className="font-display text-2xl font-black uppercase text-text">Sin acceso</h1>
      <p className="text-text2">
        Entraste como <span className="font-medium text-text">{session.user.email}</span>, pero esa cuenta todavía no
        tiene permisos en el panel de admin. Pedile a alguien del equipo que te agregue.
      </p>
      <SignOutButton className="text-sm font-medium text-text2 underline hover:text-crimson">Salir</SignOutButton>
    </div>
  );
}
