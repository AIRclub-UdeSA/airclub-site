import { requireSectionEdit } from "@/lib/admin/permissions";
import { EventForm } from "../EventForm";

export default async function NuevoEventoPage() {
  await requireSectionEdit("eventos");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-text">Agregar evento</h2>
      <EventForm />
    </div>
  );
}
