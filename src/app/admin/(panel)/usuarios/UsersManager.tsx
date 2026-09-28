"use client";

import { useRef, useState } from "react";
import { sectionLabel } from "@/lib/admin/sections";
import { AdminUserForm, type EditingUser } from "./AdminUserForm";
import { RemoveAdminUserButton } from "./RemoveAdminUserButton";

type AdminUserRow = { id: string; email: string; role: "ADMIN" | "EDITOR"; sections: string[] };

export function UsersManager({ users }: { users: AdminUserRow[] }) {
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function startEditing(user: AdminUserRow) {
    setEditingUser({ email: user.email, role: user.role, sections: user.sections });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-8">
      <div ref={formRef}>
        <AdminUserForm key={editingUser?.email ?? "__new__"} editingUser={editingUser} onDone={() => setEditingUser(null)} />
      </div>

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {users.map((u) => (
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
    </div>
  );
}
