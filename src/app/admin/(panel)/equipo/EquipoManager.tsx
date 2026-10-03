"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { FRAME, SIZES, githubUserOf, initialsOf } from "@/components/equipo/TeamTile";
import { GithubIcon } from "@/components/equipo/SocialIcons";
import { uploadToSignedUrl } from "@/lib/admin/upload-client";
import { uploadError } from "@/lib/upload-rules";
import {
  deleteMember,
  discardTeamUpload,
  moveMember,
  prepareTeamPhotoUpload,
  saveMember,
  setMemberActive,
  setMemberPhoto,
  type ActionState,
  type TeamGroup,
} from "./actions";

export type AdminMember = {
  id: string;
  name: string;
  group: TeamGroup;
  role: string;
  linkedin: string;
  github: string;
  photo: string;
  active: boolean;
};

const GROUPS: { id: TeamGroup; title: string; one: string }[] = [
  { id: "FOUNDER", title: "Fundadores", one: "fundador/a" },
  { id: "COLLABORATOR", title: "Colaboradores", one: "colaborador/a" },
];

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:gap-x-4";

/** Sube la foto directo al bucket y devuelve su URL pública. */
async function uploadPhoto(file: File, onProgress: (fraction: number) => void): Promise<string> {
  const signed = await prepareTeamPhotoUpload({ type: file.type, size: file.size });
  if ("error" in signed) throw new Error(signed.error);
  await uploadToSignedUrl(signed.signedUrl, file, onProgress);
  return signed.publicUrl;
}

/** null si se puede usar como foto; si no, el mensaje a mostrar. */
function photoError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Acá va una foto (jpg, png o webp).";
  return uploadError(file);
}

function Face({ name, photo }: { name: string; photo: string }) {
  if (!photo) {
    return (
      <div className="talk-hatch absolute inset-0 flex items-center justify-center text-text" aria-hidden="true">
        <span className="font-logo text-[clamp(2.6rem,7vw,3.6rem)] leading-none tracking-tight">{initialsOf(name)}</span>
      </div>
    );
  }
  // Una foto recién elegida es un blob: del navegador, que next/image no puede optimizar.
  if (photo.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />;
  }
  return <Image src={photo} alt="" fill sizes={SIZES} className="object-cover" />;
}

function GithubBadge({ github }: { github: string }) {
  const user = githubUserOf(github);
  const [failed, setFailed] = useState(false);
  if (!github) return null;
  return (
    <span className="pointer-events-none absolute -right-2 -top-2 z-10 flex size-11 items-center justify-center overflow-hidden rounded-full border border-text bg-bg text-text ring-2 ring-bg">
      {user && !failed ? (
        <Image src={`https://github.com/${user}.png?size=96`} alt="" width={44} height={44} unoptimized onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <GithubIcon className="size-5" />
      )}
    </span>
  );
}

/** La misma ficha de /equipo, con "Cambiar foto" al pasar el mouse y el nombre como botón para editar. */
function MemberTile({ member, onEdit }: { member: AdminMember; onEdit: () => void }) {
  // Vista previa local mientras sube; `over` es la foto que tapa, así deja de mostrarse sola cuando
  // llega la nueva del servidor.
  const [preview, setPreview] = useState<{ url: string; over: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview.url)), [preview]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    const invalid = photoError(file);
    setError(invalid);
    if (invalid) return;

    setPreview({ url: URL.createObjectURL(file), over: member.photo });
    setProgress(0);
    let uploaded: string | null = null;
    try {
      uploaded = await uploadPhoto(file, setProgress);
      const result = await setMemberPhoto(member.id, uploaded);
      if (result.error) throw new Error(result.error);
      uploaded = null; // guardada: ya está en uso
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la foto.");
      setPreview(null);
    } finally {
      if (uploaded) void discardTeamUpload(uploaded);
      setProgress(null);
    }
  }

  const busy = progress !== null;

  return (
    <li className="group relative">
      <div className={`${FRAME} group-hover:border-crimson`}>
        <Face name={member.name} photo={preview?.over === member.photo ? preview.url : member.photo} />
        <label
          className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/55 text-sm font-semibold text-white transition-opacity duration-200 focus-within:opacity-100 ${busy ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {busy ? (
            <span>Subiendo… {Math.round((progress ?? 0) * 100)}%</span>
          ) : (
            <>
              <Camera size={22} aria-hidden="true" />
              <span>{member.photo ? "Cambiar foto" : "Subir foto"}</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={handleFile}
            aria-label={`Cambiar la foto de ${member.name}`}
            className="sr-only"
          />
        </label>
      </div>
      <GithubBadge github={member.github} />

      <button type="button" onClick={onEdit} className="mt-3 flex w-full items-start justify-between gap-2 text-left">
        <span className="font-display text-[1rem] font-bold leading-[1.15] tracking-tight text-text group-hover:text-crimson-text">{member.name}</span>
        <Pencil size={14} className="mt-0.5 shrink-0 text-text3" aria-label="Editar" />
      </button>
      <span className="mt-1 block font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">
        {member.role || (member.linkedin ? "LinkedIn" : "Sin LinkedIn")}
      </span>
      {error && <p className="mt-1 text-xs text-crimson">{error}</p>}
    </li>
  );
}

function AddTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="talk-hatch flex aspect-square w-full flex-col items-center justify-center gap-2 border border-dashed border-text text-text3 transition-colors duration-200 ease-club hover:border-crimson hover:text-crimson-text"
      >
        <Plus size={28} aria-hidden="true" />
        <span className="bg-bg px-2 text-sm font-semibold">{label}</span>
      </button>
    </li>
  );
}

type Editing = { member: AdminMember | null; group: TeamGroup };

export function EquipoManager({ members }: { members: AdminMember[] }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const hidden = members.filter((m) => !m.active);

  return (
    <>
      {GROUPS.map((group) => {
        const list = members.filter((m) => m.active && m.group === group.id);
        return (
          <section key={group.id} className="flex flex-col gap-5">
            <h3 className="flex items-baseline gap-3 font-display text-lg font-bold uppercase text-text">
              {group.title}
              <span className="font-mono text-sm font-normal text-text3">{list.length}</span>
            </h3>
            <ul className={GRID}>
              {list.map((m) => (
                <MemberTile key={m.id} member={m} onEdit={() => setEditing({ member: m, group: m.group })} />
              ))}
              <AddTile label={`Agregar ${group.one}`} onClick={() => setEditing({ member: null, group: group.id })} />
            </ul>
          </section>
        );
      })}

      {hidden.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h3 className="font-display text-base font-bold text-text">Ocultos</h3>
          <p className="text-sm text-text3">No aparecen en /equipo. Su ficha queda guardada por si vuelven.</p>
          <ul className="flex flex-wrap gap-2">
            {hidden.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setEditing({ member: m, group: m.group })}
                  className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-1.5 text-sm text-text2 hover:border-crimson hover:text-crimson-text"
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <MemberDrawer
          key={editing.member?.id ?? `new-${editing.group}`}
          editing={editing}
          position={editing.member ? positionOf(members, editing.member) : null}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function positionOf(members: AdminMember[], member: AdminMember) {
  const list = members.filter((m) => m.active && m.group === member.group);
  const i = list.findIndex((m) => m.id === member.id);
  return i < 0 ? null : { first: i === 0, last: i === list.length - 1 };
}

const INPUT = "rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text";

/** Panel lateral para crear o editar una persona: lo básico a la vista, el resto en "Más opciones". */
function MemberDrawer({
  editing,
  position,
  onClose,
}: {
  editing: Editing;
  position: { first: boolean; last: boolean } | null;
  onClose: () => void;
}) {
  const { member } = editing;
  const [name, setName] = useState(member?.name ?? "");
  const [linkedin, setLinkedin] = useState(member?.linkedin ?? "");
  const [github, setGithub] = useState(member?.github ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [group, setGroup] = useState<TeamGroup>(member?.group ?? editing.group);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    const invalid = photoError(picked);
    setError(invalid);
    if (invalid) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  /** Corre una action y, si salió bien, cierra el panel (salvo `keepOpen`, para mover varias veces seguidas). */
  async function run(label: string, action: () => Promise<ActionState>, keepOpen = false) {
    setBusy(label);
    setError(null);
    try {
      const result = await action();
      if (result.error) return setError(result.error);
      if (!keepOpen) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await run("Guardando…", async () => {
      let uploaded: string | null = null;
      try {
        if (file) {
          setBusy("Subiendo foto…");
          uploaded = await uploadPhoto(file, (f) => setBusy(`Subiendo foto… ${Math.round(f * 100)}%`));
          setBusy("Guardando…");
        }
        const result = await saveMember({ id: member?.id, name, group, role, linkedin, github, photo: uploaded ?? member?.photo ?? "" });
        if (!result.error) uploaded = null;
        return result;
      } finally {
        if (uploaded) void discardTeamUpload(uploaded);
      }
    });
  }

  const photo = preview ?? member?.photo ?? "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={member ? `Editar a ${member.name}` : "Agregar persona"}>
      <button type="button" aria-label="Cerrar" onClick={() => !busy && onClose()} className="absolute inset-0 bg-black/40" />

      <form onSubmit={handleSave} className="relative flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto border-l border-border bg-bg p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-text">{member ? member.name : `Agregar ${GROUPS.find((g) => g.id === group)?.one}`}</h3>
          <button type="button" onClick={onClose} disabled={!!busy} aria-label="Cerrar" className="text-text3 hover:text-crimson-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className={`${FRAME} size-28 shrink-0`}>
            <Face name={name || "?"} photo={photo} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="w-fit cursor-pointer rounded-[var(--r-sm)] border border-border bg-card px-3 py-1.5 text-sm font-medium text-text hover:border-crimson">
              {photo ? "Cambiar foto" : "Elegir foto"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="sr-only" />
            </label>
            <p className="max-w-[14rem] text-xs text-text3">LinkedIn no deja traer la foto sola: descargala de su perfil y subila acá.</p>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder="Nombre y apellido" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          LinkedIn
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={INPUT} placeholder="linkedin.com/in/…" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          GitHub
          <input value={github} onChange={(e) => setGithub(e.target.value)} className={INPUT} placeholder="github.com/usuario" />
          <span className="text-xs font-normal text-text3">La foto de GitHub se trae sola.</span>
        </label>

        <details className="rounded-[var(--r-sm)] border border-border p-3">
          <summary className="cursor-pointer text-sm font-medium text-text2">Más opciones</summary>
          <div className="mt-3 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Cargo
              <input value={role} onChange={(e) => setRole(e.target.value)} className={INPUT} placeholder="Ej. Presidente (opcional)" />
              <span className="text-xs font-normal text-text3">Si está, reemplaza a &ldquo;LinkedIn&rdquo; debajo del nombre.</span>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Grupo
              <select value={group} onChange={(e) => setGroup(e.target.value as TeamGroup)} className={INPUT}>
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </label>
            {member && position && (
              <div className="flex items-center gap-2 text-sm text-text">
                <span className="font-medium">Orden</span>
                <button
                  type="button"
                  disabled={!!busy || position.first}
                  onClick={() => run("Moviendo…", () => moveMember(member.id, -1), true)}
                  className="flex items-center gap-1 rounded-[var(--r-sm)] border border-border bg-card px-2 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Antes
                </button>
                <button
                  type="button"
                  disabled={!!busy || position.last}
                  onClick={() => run("Moviendo…", () => moveMember(member.id, 1), true)}
                  className="flex items-center gap-1 rounded-[var(--r-sm)] border border-border bg-card px-2 py-1 disabled:opacity-40"
                >
                  Después <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </details>

        {error && <p className="text-sm text-crimson">{error}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <button
            type="submit"
            disabled={!!busy}
            className="rounded-full bg-crimson px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ?? (member ? "Guardar" : "Agregar")}
          </button>
          <button type="button" onClick={onClose} disabled={!!busy} className="text-sm font-medium text-text2 hover:text-crimson-text">
            Cancelar
          </button>

          {member && (
            <div className="ml-auto flex flex-col items-end gap-1">
              {member.active ? (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (confirm(`¿Ocultar a ${member.name} de /equipo? Su ficha queda guardada.`)) void run("Ocultando…", () => setMemberActive(member.id, false));
                  }}
                  className="text-sm font-medium text-crimson-text hover:underline"
                >
                  Ocultar de /equipo
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => run("Mostrando…", () => setMemberActive(member.id, true))}
                    className="text-sm font-medium text-crimson-text hover:underline"
                  >
                    Volver a mostrar
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      if (confirm(`¿Borrar a ${member.name} para siempre? No se puede deshacer.`)) void run("Borrando…", () => deleteMember(member.id));
                    }}
                    className="text-xs text-text3 hover:text-crimson-text"
                  >
                    Borrar para siempre
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
