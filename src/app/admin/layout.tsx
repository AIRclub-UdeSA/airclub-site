import type { Metadata } from "next";

// Todo /admin (login y sin-permiso incluidos) queda fuera de los buscadores (#63).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
