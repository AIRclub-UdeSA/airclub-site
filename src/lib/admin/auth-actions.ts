"use server";

import { signIn } from "@/auth";

export async function signInAction() {
  // "/bienvenida" decide si manda a completar el perfil (primer login) o a "/".
  await signIn("google", { redirectTo: "/bienvenida" });
}
