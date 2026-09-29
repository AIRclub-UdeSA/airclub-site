"use client";

import { useRef, useState } from "react";
import { sectionLabel } from "@/lib/admin/sections";
import { AdminUserForm, type EditingUser } from "./AdminUserForm";
import { RemoveAdminUserButton } from "./RemoveAdminUserButton";

type AdminUserRow = { id: string; email: string; role: "ADMIN" | "EDITOR"; sections: string[]; active: boolean };

export function UsersManager({ users }: { users: AdminUserRow[] }) {
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function startEditing(user: AdminUserRow) {
    setEditingUser({ email: user.email, role: user.role, sections: user.sections, active: user.active });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activeUsers = users.filter((u) => u.active);
  const inactiveUsers = users.filter((u) => !u.active);

  return (
    <div className="flex flex-col gap-8">
      <div ref={formRef}>
        <AdminUserForm key={editingUser?.email ?? "__new__"} editingUser={editingUser} onDone={() => setEditingUser(null)} />
      </div>

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {activeUsers.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium text-text">{u.email}</p>
              <p className="font-mono text-xs text-text3">
                {u.role}
                {u.role === "EDITOR" && u.sections.length > 0 ? ` · ${u.sections.map(sectionLabel).join(", ")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => startEditing(u)} className="text-sm font-medium text-text2 hover:text-crimson-text">
                Editar
              </button>
              <RemoveAdminUserButton id={u.id} email={u.email} />
            </div>
          </li>
        ))}
      </ul>

      {inactiveUsers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-wide text-text3">Sin acceso</h3>
          <p className="max-w-prose text-xs text-text3">
            Personas a las que se les sacó el acceso. Siguen acá para que el historial de cambios diga quién hizo qué. Reactivar
            abre el formulario para elegir de nuevo el rol y las secciones.
          </p>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {inactiveUsers.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <p className="text-sm text-text3">{u.email}</p>
                <button type="button" onClick={() => startEditing(u)} className="text-sm font-medium text-text2 hover:text-crimson-text">
                  Reactivar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
