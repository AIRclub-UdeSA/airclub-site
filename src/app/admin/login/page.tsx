import { signIn } from "@/auth";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Ese login no es válido: entrá con una cuenta @udesa.edu.ar.",
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const errorKey = Array.isArray(error) ? error[0] : error;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 px-6 pt-24 text-center">
      <h1 className="font-display text-2xl font-black uppercase text-text">AIR Club UdeSA</h1>
      <p className="text-text2">Entrá con tu cuenta de Google de UdeSA (@udesa.edu.ar).</p>
      {errorKey && (
        <p className="text-sm text-crimson">{ERROR_MESSAGES[errorKey] ?? "No se pudo iniciar sesión, probá de nuevo."}</p>
      )}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin" });
        }}
      >
        <button
          type="submit"
          className="rounded-[var(--r-pill)] bg-crimson px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover"
        >
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
