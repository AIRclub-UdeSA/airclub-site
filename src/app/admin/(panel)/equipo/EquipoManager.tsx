"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { FRAME, SIZES, TeamTile, initialsOf } from "@/components/equipo/TeamTile";
import { TeamSections } from "@/components/equipo/TeamSections";
import type { TeamMemberItem } from "@/lib/team";
import { uploadToSignedUrl } from "@/lib/admin/upload-client";
import { uploadError } from "@/lib/upload-rules";
import {
  deleteMember,
  discardTeamUpload,
  moveMember,
  prepareTeamPhotoUpload,
  saveMember,
  setGroupPhoto,
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

/**
 * Elegir una foto y guardarla en el acto (sin botón "Guardar"): la sube directo al bucket y llama a `save`.
 * Mientras sube muestra la foto elegida; deja de mostrarla sola cuando llega la nueva del servidor.
 */
function useInstantPhoto(current: string, save: (url: string) => Promise<ActionState>) {
  const [preview, setPreview] = useState<{ url: string; over: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview.url)), [preview]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    const invalid = photoError(file);
    setError(invalid);
    if (invalid) return;

    setPreview({ url: URL.createObjectURL(file), over: current });
    setProgress(0);
    let uploaded: string | null = null;
    try {
      uploaded = await uploadPhoto(file, setProgress);
      const result = await save(uploaded);
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

  return {
    previewUrl: preview?.over === current ? preview.url : null,
    progress,
    error,
    input: { ref: inputRef, type: "file", accept: "image/jpeg,image/png,image/webp", disabled: progress !== null, onChange, className: "sr-only" } as const,
  };
}

// Los controles aparecen al pasar el mouse; en pantallas táctiles (sin hover) quedan siempre a la vista.
const REVEAL = "opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100";
const OVERLAY = "flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/55 text-sm font-semibold text-white transition-opacity duration-200 ease-club";

function UploadOverlay({ label, progress, error }: { label: string; progress: number | null; error: string | null }) {
  if (progress !== null) return <span>Subiendo… {Math.round(progress * 100)}%</span>;
  return (
    <>
      <Camera size={22} aria-hidden="true" />
      <span>{label}</span>
      {error && <span className="max-w-[90%] text-center text-xs font-normal">{error}</span>}
    </>
  );
}

/** Controles de una ficha: la foto se cambia tocándola, y el lápiz (o el nombre) abre el panel con el resto de los datos. */
function MemberControls({ member, onEdit }: { member: AdminMember; onEdit: () => void }) {
  const photo = useInstantPhoto(member.photo, (url) => setMemberPhoto(member.id, url));
  const showing = photo.progress !== null || photo.error;

  return (
    <>
      {/* Debajo de todo: tocar el nombre también abre el panel. */}
      <button type="button" onClick={onEdit} aria-label={`Editar a ${member.name}`} className="absolute inset-0" />
      <label className={`absolute inset-x-0 top-0 z-[5] aspect-square ${OVERLAY} ${showing ? "opacity-100" : REVEAL}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo.previewUrl && <img src={photo.previewUrl} alt="" className="absolute inset-0 -z-10 size-full object-cover" />}
        <UploadOverlay label={member.photo ? "Cambiar foto" : "Subir foto"} progress={photo.progress} error={photo.error} />
        <input {...photo.input} aria-label={`Cambiar la foto de ${member.name}`} />
      </label>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar los datos de ${member.name}`}
        className={`absolute -left-2 -top-2 z-20 flex size-11 items-center justify-center rounded-full border border-text bg-bg text-text ring-2 ring-bg transition-opacity duration-200 ease-club hover:border-crimson hover:text-crimson-text ${REVEAL}`}
      >
        <Pencil size={18} aria-hidden="true" />
      </button>
    </>
  );
}

/** Sobre la foto grupal de Fundadores: tocarla la cambia. */
function GroupPhotoControls({ current }: { current: string }) {
  const photo = useInstantPhoto(current, (url) => setGroupPhoto("FOUNDER", url));
  const showing = photo.progress !== null || photo.error;

  return (
    <label className={`absolute inset-0 z-10 ${OVERLAY} ${showing ? "opacity-100" : REVEAL}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo.previewUrl && <img src={photo.previewUrl} alt="" className="absolute inset-0 -z-10 size-full object-cover object-[50%_25%]" />}
      <UploadOverlay label="Cambiar foto grupal" progress={photo.progress} error={photo.error} />
      <input {...photo.input} aria-label="Cambiar la foto grupal de Fundadores" />
    </label>
  );
}

/** "Agregar" con la forma de una ficha vacía de /equipo (la trama de "lugar reservado"). */
function AddTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li className="group relative">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <span className={`${FRAME} talk-hatch flex items-center justify-center text-text group-hover:border-crimson group-hover:text-crimson-text`}>
          <Plus size={56} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="mt-3 block font-display text-[1rem] font-bold leading-[1.15] tracking-tight text-text transition-colors group-hover:text-crimson-text">
          Agregar
        </span>
        <span className="mt-1 block font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">{label}</span>
      </button>
    </li>
  );
}

function toItem(m: AdminMember): AdminMember & TeamMemberItem {
  return {
    ...m,
    role: m.role || undefined,
    links: { linkedin: m.linkedin || undefined, linkedinPhoto: m.photo || undefined, github: m.github || undefined },
  } as AdminMember & TeamMemberItem;
}

type Editing = { member: AdminMember | null; group: TeamGroup };

export function EquipoManager({ members, foundersPhoto }: { members: AdminMember[]; foundersPhoto: string }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const visible = (group: TeamGroup) => members.filter((m) => m.active && m.group === group).map(toItem);
  const hidden = members.filter((m) => !m.active);
  const edit = (m: AdminMember) => setEditing({ member: m, group: m.group });
  const add = (group: TeamGroup) => setEditing({ member: null, group });

  return (
    <>
      <TeamSections
        founders={visible("FOUNDER")}
        collaborators={visible("COLLABORATOR")}
        foundersPhoto={foundersPhoto}
        edit={{
          renderTile: (m) => <TeamTile key={m.id} member={m} controls={<MemberControls member={m} onEdit={() => edit(m)} />} />,
          foundersPhotoControls: <GroupPhotoControls current={foundersPhoto} />,
          addFounder: <AddTile label="Fundador/a" onClick={() => add("FOUNDER")} />,
          addCollaborator: <AddTile label="Colaborador/a" onClick={() => add("COLLABORATOR")} />,
        }}
      />

      {hidden.length > 0 && (
        <section className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-12 sm:px-8 md:px-12">
          <h3 className="font-display text-base font-bold text-text">Ocultos</h3>
          <p className="text-sm text-text3">No aparecen en /equipo. Su ficha queda guardada por si vuelven.</p>
          <ul className="flex flex-wrap gap-2">
            {hidden.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => edit(m)}
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
