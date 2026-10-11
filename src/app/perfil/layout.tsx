import { DisableSmoothScroll } from "@/components/perfil/DisableSmoothScroll";

export default function PerfilLayout({ children }: LayoutProps<"/perfil">) {
  return (
    <>
      <DisableSmoothScroll />
      {children}
    </>
  );
}
