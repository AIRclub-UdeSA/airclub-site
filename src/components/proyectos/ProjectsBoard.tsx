"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleDashed, LoaderCircle, Mail, X } from "lucide-react";
import {
  AREAS,
  PAPER_SHADES,
  type Area,
  type Fastener as FastenerKind,
  type BoardSticker,
  type ProjectItem as Project,
  type TeaserItem,
} from "@/lib/projects";

const JOIN_MAIL = "airclub@udesa.edu.ar";
const AVATAR_TONES = ["#a40c4c", "#3a1420", "#d66b97"];
/** Cada papel lleva la cinta un poco distinta: inclinación y corrimiento horizontal. */
const TAPES = [
  { r: -5, x: -6 },
  { r: 3, x: 5 },
  { r: -2, x: 0 },
  { r: 6, x: -4 },
  { r: -4, x: 7 },
  { r: 2, x: -2 },
  { r: -6, x: 3 },
];
const shadeStyle = (p: Project) => (p.shade === "paper" ? {} : { "--paper": PAPER_SHADES[p.shade] }) as CSSProperties;
const shadeClass = (p: Project) => (p.shade === "paper" ? "pshade is-paper" : "pshade");
const tapeStyle = (i: number) =>
  ({ "--tr": `${TAPES[i % TAPES.length].r}deg`, "--tx": `${TAPES[i % TAPES.length].x}%` }) as CSSProperties;
/** Título armado con letras recortadas: fuente, papel y rotación de cada una. */
const TITLE = [
  { ch: "P", v: "a", r: -6 },
  { ch: "R", v: "b", r: 4 },
  { ch: "O", v: "c", r: -3 },
  { ch: "Y", v: "d", r: 7 },
  { ch: "E", v: "b", r: -5 },
  { ch: "C", v: "a", r: 3 },
  { ch: "T", v: "c", r: -7 },
  { ch: "O", v: "d", r: 5 },
  { ch: "S", v: "a", r: -2 },
];

type Rect = { left: number; top: number; width: number; height: number };

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/** Transform que lleva el rect final `to` a la posición/tamaño de `from` (para animaciones FLIP). */
function flipFrom(from: Rect, to: Rect, rot: number) {
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height}) rotate(${rot}deg)`;
}

/** Mantiene el foco del teclado dentro de `root` mientras está abierto. */
function trapTab(e: React.KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== "Tab" || !root) return;
  const items = root.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea");
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

interface ProjectsBoardProps {
  projects: Project[];
  teasers: TeaserItem[];
  stickers: BoardSticker[];
}

export function ProjectsBoard({ projects, teasers, stickers }: ProjectsBoardProps) {
  const [filter, setFilter] = useState<Area | null>(null);
  const [modal, setModal] = useState<{ id: string; fromNote: boolean } | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [stickerPos, setStickerPos] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(stickers.map((s) => [s.id, { x: s.x, y: s.y }])),
  );

  const boardRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef(new Map<string, HTMLButtonElement>());

  // Parallax suave con el mouse: escribe --mx/--my en el tablero y cada elemento
  // se desplaza según su profundidad (--d). El loop se apaga cuando se asienta.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || reducedMotion()) return;
    const cur = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      board.style.setProperty("--mx", cur.x.toFixed(4));
      board.style.setProperty("--my", cur.y.toFixed(4));
      const settled = Math.abs(target.x - cur.x) < 0.0005 && Math.abs(target.y - cur.y) < 0.0005;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = board.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    board.addEventListener("pointermove", onMove);
    board.addEventListener("pointerleave", onLeave);
    return () => {
      board.removeEventListener("pointermove", onMove);
      board.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const noteRect = useCallback((id: string): Rect | null => {
    const paper = noteRefs.current.get(id)?.querySelector<HTMLElement>(".pnote-paper");
    return paper ? paper.getBoundingClientRect() : null;
  }, []);

  const focusNote = (id: string) => noteRefs.current.get(id)?.focus({ preventScroll: true });

  const onNoteClick = (p: Project) => {
    // Con la ficha técnica abierta, tocar otro papel cambia de proyecto sin salir del panel.
    if (panelId) setPanelId(p.id);
    else setModal({ id: p.id, fromNote: true });
  };

  const modalProject = modal ? (projects.find((p) => p.id === modal.id) ?? null) : null;
  const panelProject = panelId ? (projects.find((p) => p.id === panelId) ?? null) : null;

  return (
    <>
      <section ref={boardRef} className="pboard" aria-labelledby="pboard-title">
        <div className="pboard-cork" aria-hidden />

        <header className="pboard-head">
          <h1 id="pboard-title" className="ptitle" aria-label="Proyectos">
            {TITLE.map((l, i) => (
              <span
                key={i}
                className={`ptitle-l v-${l.v}`}
                style={{ "--r": `${l.r}deg`, "--i": i } as CSSProperties}
                aria-hidden
              >
                {l.ch}
              </span>
            ))}
          </h1>
          <p className="pboard-sub">
            Todo lo que el club está construyendo, clavado en un corcho. Tocá un papel para ver de qué se trata y
            sumarte.
          </p>
        </header>

        <div ref={stageRef} className="pboard-stage">
          {stickers.map((s) => (
            <Sticker
              key={s.id}
              sticker={s}
              pos={stickerPos[s.id]}
              stageRef={stageRef}
              onMove={(x, y) => setStickerPos((prev) => ({ ...prev, [s.id]: { x, y } }))}
            />
          ))}

          {projects.map((p, i) => {
            const muted = (filter !== null && !p.areas.includes(filter)) || (panelId !== null && panelId !== p.id);
            return (
              <div
                key={p.id}
                className={[
                  "pnote",
                  shadeClass(p),
                  i % 2 ? "side-r" : "side-l",
                  muted && "is-muted",
                  panelId === p.id && "is-selected",
                  modal?.id === p.id && "is-lifted",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--x": `${p.x}%`,
                    "--y": `${p.y}%`,
                    "--r": `${p.rot}deg`,
                    "--i": i,
                    ...shadeStyle(p),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="pnote-btn"
                  aria-haspopup="dialog"
                  ref={(el) => {
                    if (el) noteRefs.current.set(p.id, el);
                    else noteRefs.current.delete(p.id);
                  }}
                  onClick={() => onNoteClick(p)}
                >
                  <Fastener kind={p.fastener} tape={i} />
                  <span className="pnote-paper">
                    <span className="pnote-title">{p.title}</span>
                    <span className="pnote-line">{p.line}</span>
                    <span className="pnote-foot">
                      <span className={`pdot status-${p.status.split(" ")[0].toLowerCase()}`} aria-hidden />
                      {p.status}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}

          {teasers.map((t, i) => {
            const style = {
              "--x": `${t.x}%`,
              "--y": `${t.y}%`,
              "--r": `${t.rot}deg`,
              "--i": projects.length + i,
            } as CSSProperties;
            const cls = `pnote pteaser is-${t.kind} ${(projects.length + i) % 2 ? "side-r" : "side-l"}${
              filter !== null || panelId !== null ? " is-muted" : ""
            }`;
            const inner = (
              <>
                <Fastener kind={t.fastener} tape={projects.length + i} />
                <span className="pnote-paper">
                  {t.kind === "wip" && <span className="pteaser-stamp">En proceso</span>}
                  <span className="pnote-title">{t.title}</span>
                  <span className="pnote-line">{t.line}</span>
                  {t.kind === "wip" ? (
                    <span className="pteaser-redact" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span className="pnote-foot">
                      Proponé una idea <ArrowRight size={12} aria-hidden />
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <div key={t.id} className={cls} style={style}>
                {t.kind === "idea" ? (
                  <a href="#portal-ideas" className="pnote-btn">
                    {inner}
                  </a>
                ) : (
                  <div className="pnote-btn">{inner}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pboard-bar">
          <span className="pboard-bar-label">Filtrar por área</span>
          <div className="pfilters" role="group" aria-label="Filtrar por área">
            {[
              { label: "Todos", key: null as Area | null, count: projects.length },
              ...AREAS.map((a) => ({
                label: a,
                key: a as Area | null,
                count: projects.filter((p) => p.areas.includes(a)).length,
              })),
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                className="pfilter"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="pfilter-count">{f.count}</span>
              </button>
            ))}
          </div>
          <span className="dymo dymo-sm pboard-hint" aria-hidden>
            psst: los stickers se mueven
          </span>
        </div>
      </section>

      {modalProject && modal && (
        <ProjectModal
          key={modalProject.id}
          project={modalProject}
          fromNote={modal.fromNote}
          getNoteRect={() => noteRect(modalProject.id)}
          onClosed={(next) => {
            setModal(null);
            if (next === "panel") setPanelId(modalProject.id);
            else focusNote(modalProject.id);
          }}
        />
      )}

      {panelProject && (
        <ProjectPanel
          project={panelProject}
          onSummary={() => {
            setPanelId(null);
            setModal({ id: panelProject.id, fromNote: false });
          }}
          onClosed={() => {
            setPanelId(null);
            focusNote(panelProject.id);
          }}
        />
      )}
    </>
  );
}

function Fastener({ kind, tape }: { kind?: FastenerKind; tape: number }) {
  if (!kind) return null;
  if (kind === "tape") return <span className="ptape" style={tapeStyle(tape)} aria-hidden />;
  return <PushPin tone={kind === "pin-pink" ? "pink" : "white"} />;
}

/* ───────────── Chinche 3D (vista de costado, clavada en el papel) ───────────── */

const PIN_TONES = {
  pink: { hi: "#fde2ee", base: "#f3a6c8", lo: "#c76692" },
  white: { hi: "#ffffff", base: "#efebe5", lo: "#aaa197" },
};

function PushPin({ tone }: { tone: keyof typeof PIN_TONES }) {
  const id = useId();
  const c = PIN_TONES[tone];
  return (
    <span className="ppin" aria-hidden>
      <svg className="ppin-svg" viewBox="0 0 64 72">
        <defs>
          <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <linearGradient id={`${id}n`} x1="0" x2="1">
            <stop offset="0" stopColor="#7d7f84" />
            <stop offset=".45" stopColor="#f4f5f7" />
            <stop offset="1" stopColor="#66686d" />
          </linearGradient>
          <radialGradient id={`${id}r`} cx=".34" cy=".32" r=".8">
            <stop offset="0" stopColor={c.hi} />
            <stop offset=".45" stopColor={c.base} />
            <stop offset="1" stopColor={c.lo} />
          </radialGradient>
          <linearGradient id={`${id}l`} x1="0" x2="1">
            <stop offset="0" stopColor={c.hi} />
            <stop offset=".35" stopColor={c.base} />
            <stop offset="1" stopColor={c.lo} />
          </linearGradient>
        </defs>
        {/* sombra proyectada sobre el papel */}
        <ellipse cx="40" cy="64" rx="16" ry="4.5" fill="rgba(0,0,0,.5)" filter={`url(#${id}b)`} />
        <g transform="rotate(20 24 66)">
          <path d="M22.8 50 L25.2 50 L24.4 66 L23.6 66 Z" fill={`url(#${id}n)`} />
          <ellipse cx="24" cy="42" rx="13" ry="11.5" fill={`url(#${id}r)`} />
          <path d="M15.5 37 C18 31 18.5 25 17.5 19 L30.5 19 C29.5 25 30 31 32.5 37 Z" fill={`url(#${id}l)`} />
          <ellipse cx="24" cy="18.2" rx="14.5" ry="5.5" fill={c.lo} />
          <ellipse cx="24" cy="15.4" rx="14.5" ry="5.5" fill={`url(#${id}r)`} />
          <ellipse cx="18.4" cy="39" rx="3.2" ry="5" fill="#fff" opacity=".55" />
          <path
            d="M19.6 22 C20.2 27 20 31 18.6 35"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity=".5"
            fill="none"
          />
          <ellipse cx="20" cy="13.8" rx="6" ry="1.7" fill="#fff" opacity=".6" />
        </g>
      </svg>
    </span>
  );
}

/* ───────────── Stickers arrastrables ───────────── */

function Sticker({
  sticker,
  pos,
  stageRef,
  onMove,
}: {
  sticker: BoardSticker;
  pos: { x: number; y: number };
  stageRef: React.RefObject<HTMLDivElement | null>;
  onMove: (x: number, y: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number } | null>(null);

  const clamp = (v: number) => Math.min(96, Math.max(-4, v));

  return (
    <div
      className={`psticker${dragging ? " is-dragging" : ""}`}
      style={
        { "--x": `${pos.x}%`, "--y": `${pos.y}%`, "--r": `${sticker.rot}deg`, "--s": sticker.size } as CSSProperties
      }
      aria-hidden
      onPointerDown={(e) => {
        const stage = stageRef.current;
        if (e.button !== 0 || !stage || window.matchMedia("(max-width: 760px)").matches) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = stage.getBoundingClientRect();
        start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y, w: r.width, h: r.height };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const st = start.current;
        if (!st) return;
        onMove(clamp(st.x + ((e.clientX - st.px) / st.w) * 100), clamp(st.y + ((e.clientY - st.py) / st.h) * 100));
      }}
      onPointerUp={() => {
        start.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDragging(false);
      }}
    >
      <Image
        src={sticker.src}
        alt=""
        width={256}
        height={256}
        sizes="(max-width: 760px) 80px, 12vw"
        draggable={false}
        className="psticker-img"
      />
    </div>
  );
}

/* ───────────── Modal: el papel se expande ───────────── */

function ProjectModal({
  project,
  fromNote,
  getNoteRect,
  onClosed,
}: {
  project: Project;
  fromNote: boolean;
  getNoteRect: () => Rect | null;
  onClosed: (next: "note" | "panel") => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Entrada: el modal arranca con la forma y el color del papel clavado y se expande.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const ghost = ghostRef.current;
    const body = bodyRef.current;
    closeBtnRef.current?.focus({ preventScroll: true });
    if (!card || !ghost || !body || reducedMotion()) return;

    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
    const origin = fromNote ? getNoteRect() : null;
    if (origin) {
      card.animate(
        [{ transform: flipFrom(origin, card.getBoundingClientRect(), project.rot) }, { transform: "none" }],
        { duration: 620, easing: "cubic-bezier(.2,.9,.24,1.04)" },
      );
      ghost.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], {
        duration: 560,
        fill: "forwards",
      });
      body.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], {
        duration: 640,
        easing: "ease-out",
      });
    } else {
      ghost.style.opacity = "0";
      card.animate(
        [
          { opacity: 0, transform: "translateY(36px) scale(.94) rotate(-1.5deg)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 460, easing: "cubic-bezier(.2,.9,.24,1.04)" },
      );
    }
    // Solo al montar: el origen se mide una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(
    async (next: "note" | "panel") => {
      if (closing.current) return;
      closing.current = true;
      const card = cardRef.current;
      const ghost = ghostRef.current;
      const body = bodyRef.current;
      if (card && ghost && body && !reducedMotion()) {
        const origin = next === "note" ? getNoteRect() : null;
        const anims = [
          backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: "forwards" }),
        ];
        if (origin) {
          anims.push(
            card.animate(
              [{ transform: "none" }, { transform: flipFrom(origin, card.getBoundingClientRect(), project.rot) }],
              { duration: 420, easing: "cubic-bezier(.55,0,.3,1)", fill: "forwards" },
            ),
            ghost.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80, fill: "forwards" }),
            body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }),
          );
        } else {
          // Hacia la ficha técnica: el papel se desliza a la derecha, donde aparece el panel.
          anims.push(
            card.animate(
              [
                { transform: "none", opacity: 1 },
                { transform: "translateX(40vw) rotate(4deg) scale(.7)", opacity: 0 },
              ],
              { duration: 360, easing: "cubic-bezier(.55,0,.3,1)", fill: "forwards" },
            ),
          );
        }
        await Promise.all(anims.map((a) => a?.finished)).catch(() => {});
      }
      onClosed(next);
    },
    [getNoteRect, onClosed, project.rot],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close("note");
    };
    window.addEventListener("keydown", onKey);
    // Bloquea el scroll de fondo sin que la página salte por la barra de scroll.
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (gap > 0) html.style.paddingRight = `${gap}px`;
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.paddingRight;
    };
  }, [close]);

  const members = project.members ?? [];
  const notes = project.notes ?? [];
  const leads = members.filter((m) => m.lead);

  return (
    <div className="pmodal-veil" onClick={() => close("note")}>
      <div ref={backdropRef} className="pmodal-backdrop" aria-hidden />
      <div className="pmodal-scroll">
        <div
          ref={cardRef}
          className="pmodal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pmodal-title"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => trapTab(e, cardRef.current)}
        >
          <div
            ref={ghostRef}
            className={`pmodal-ghost ${shadeClass(project)}`}
            style={shadeStyle(project)}
            aria-hidden
          />
          <span className="pmodal-tape" aria-hidden />

          <div ref={bodyRef} className="pmodal-body">
            <header className="pmodal-head">
              <div className="pchips">
                {project.areas.map((a) => (
                  <span key={a} className="pchip">
                    {a}
                  </span>
                ))}
              </div>
              <h2 id="pmodal-title" className="pmodal-title">
                {project.title}
              </h2>
              <span className={`pstamp${project.status === "BUSCANDO EQUIPO" ? " is-hot" : ""}`}>{project.status}</span>
            </header>

            <p className="pmodal-desc">{project.desc}</p>

            <div className="pmodal-grid">
              <div className="pmodal-col">
                <Cover project={project} />
                {notes.length > 0 ? (
                  <section>
                    <h3 className="plabel">Notas del equipo</h3>
                    <div className="ppostits">
                      {notes.map((n, i) => (
                        <figure
                          key={i}
                          className="ppostit"
                          style={{ "--r": `${i % 2 ? 1.6 : -1.4}deg` } as CSSProperties}
                        >
                          <blockquote>{n.text}</blockquote>
                          <figcaption>— {n.who}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section>
                    <h3 className="plabel">Para sumarte</h3>
                    <ul className="preqs">
                      {project.reqs.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="pmodal-col">
                <section>
                  <h3 className="plabel">Tecnologías</h3>
                  <ul className="ptags">
                    {project.tech.map((t) => (
                      <li key={t} className="ptag">
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="plabel">Buscamos</h3>
                  <ul className="ptags">
                    {project.roles.map((r) => (
                      <li key={r} className="ptag ptag-want">
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>

                {members.length > 0 && (
                  <section>
                    <h3 className="plabel">Miembros del proyecto</h3>
                    <ul className="pmembers">
                      {members.map((m, i) => (
                        <li key={m.name} className="pmember">
                          <span
                            className="pavatar"
                            style={{ background: AVATAR_TONES[i % AVATAR_TONES.length] }}
                            aria-hidden
                          >
                            {initials(m.name)}
                          </span>
                          <span>
                            <span className="pmember-name">{m.name}</span>
                            {m.lead && <span className="pmember-role">Referente</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {project.links.length > 0 && (
                  <div className="plinks">
                    {project.links.map((l) =>
                      l.href === "#" ? (
                        <span key={l.label} className="pbtn pbtn-ghost is-soon" title="Todavía no está publicado">
                          {l.kind} <em>pronto</em>
                        </span>
                      ) : (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pbtn pbtn-ghost"
                        >
                          {l.kind} <ArrowUpRight size={14} aria-hidden />
                        </a>
                      ),
                    )}
                  </div>
                )}

                {joinOpen ? (
                  <JoinSlip project={project} leads={leads.map((m) => m.name)} onCancel={() => setJoinOpen(false)} />
                ) : (
                  <div className="pactions">
                    <button type="button" className="pbtn pbtn-primary" onClick={() => setJoinOpen(true)}>
                      ¡Quiero sumarme!
                    </button>
                    <button type="button" className="pbtn pbtn-dark" onClick={() => close("panel")}>
                      Ficha técnica <ArrowRight size={15} aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button ref={closeBtnRef} type="button" className="pclose" aria-label="Cerrar" onClick={() => close("note")}>
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function Cover({ project }: { project: Project }) {
  const { cover } = project;
  return (
    <div className={`pcover pcover-${cover.kind}${cover.fx ? ` fx-${cover.fx}` : ""}`}>
      {cover.src && (
        <div className="pcover-img">
          <Image
            src={cover.src}
            alt={cover.kind === "photo" ? `Foto del proyecto ${project.title}` : ""}
            fill
            sizes="(max-width: 760px) 90vw, 440px"
            className={cover.kind === "photo" ? "object-cover" : "object-contain"}
          />
        </div>
      )}
      {cover.fx === "chat" && (
        <span className="pcover-chat" aria-hidden>
          <span>robot, andá hasta la mesa y esquivá la silla</span>
        </span>
      )}
      {cover.fx === "hockey" && (
        <span className="pcover-hockey" aria-hidden>
          <span className="hk-table">
            <i className="hk-goal hk-goal-l" />
            <i className="hk-goal hk-goal-r" />
            <i className="hk-mallet hk-mallet-l" />
            <i className="hk-mallet hk-mallet-r" />
            <i className="hk-puck" />
          </span>
        </span>
      )}
      {cover.fx === "lidar" && <span className="pcover-sweep" aria-hidden />}
      {cover.fx === "detect" && (
        <span className="pcover-box" aria-hidden>
          <em>cámara_rgbd 0.94</em>
        </span>
      )}
      <span className="pcover-tag" aria-hidden>
        fig. · {project.id}
      </span>
    </div>
  );
}

function JoinSlip({ project, leads, onCancel }: { project: Project; leads: string[]; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [role, setRole] = useState(project.roles[0]);

  const subject = `Quiero sumarme a ${project.title}`;
  const body = [
    `Hola! Me gustaría sumarme a "${project.title}".`,
    "",
    `Nombre: ${name}`,
    `Carrera / año: ${career}`,
    `Me interesa: ${role}`,
    "",
    leads.length ? `(Para ${leads.join(" y ")})` : "",
  ].join("\n");
  const href = `mailto:${JOIN_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="pjoin">
      <div className="pjoin-head">
        <span className="pjoin-title">Me anoto</span>
        <button type="button" className="pjoin-cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
      <label className="sr-only" htmlFor="pjoin-name">
        Nombre y apellido
      </label>
      <input id="pjoin-name" placeholder="Nombre y apellido" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="sr-only" htmlFor="pjoin-career">
        Carrera y año
      </label>
      <input id="pjoin-career" placeholder="Carrera / año" value={career} onChange={(e) => setCareer(e.target.value)} />
      <label className="sr-only" htmlFor="pjoin-role">
        ¿Qué te interesa?
      </label>
      <select id="pjoin-role" value={role} onChange={(e) => setRole(e.target.value)}>
        {project.roles.map((r) => (
          <option key={r}>{r}</option>
        ))}
        <option>Todavía no sé, quiero charlarlo</option>
      </select>
      <a href={href} className="pbtn pbtn-primary pjoin-send">
        <Mail size={15} aria-hidden /> Armar mail al club
      </a>
      <p className="pjoin-note">Se abre tu mail con todo listo para mandar a {JOIN_MAIL}.</p>
    </div>
  );
}

/* ───────────── Panel lateral: ficha técnica ───────────── */

function ProjectPanel({
  project,
  onSummary,
  onClosed,
}: {
  project: Project;
  onSummary: () => void;
  onClosed: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const closing = useRef(false);

  const close = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    if (ref.current && !reducedMotion()) {
      await ref.current
        .animate(
          [
            { transform: "none", opacity: 1 },
            { transform: "translateX(110%)", opacity: 0.4 },
          ],
          {
            duration: 320,
            easing: "cubic-bezier(.55,0,.3,1)",
            fill: "forwards",
          },
        )
        .finished.catch(() => {});
    }
    onClosed();
  }, [onClosed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(".ppanel-close")?.focus({ preventScroll: true });
  }, []);

  const milestones = project.milestones ?? [];
  const notes = project.notes ?? [];
  const score = milestones.reduce((acc, m) => acc + (m.state === "done" ? 1 : m.state === "wip" ? 0.5 : 0), 0);
  const progress = milestones.length ? Math.round((score / milestones.length) * 100) : 0;

  return (
    <aside ref={ref} className="ppanel" aria-label={`Ficha técnica: ${project.title}`}>
      <header className={`ppanel-head ${shadeClass(project)}`} style={shadeStyle(project)}>
        <div className="ppanel-kicker">
          <span>Ficha técnica</span>
          <span>{project.status}</span>
        </div>
        <h2 className="ppanel-title">{project.title}</h2>
        <div className="ppanel-tools">
          <button type="button" className="ppanel-back" onClick={onSummary}>
            <ArrowLeft size={14} aria-hidden /> Resumen
          </button>
          <button type="button" className="ppanel-close" aria-label="Cerrar ficha técnica" onClick={close}>
            <X size={16} aria-hidden />
          </button>
        </div>
      </header>

      <div key={project.id} className="ppanel-body">
        {milestones.length > 0 && (
          <section>
            <div className="ppanel-row">
              <h3 className="plabel">Avance</h3>
              <span className="ppanel-pct">{progress}%</span>
            </div>
            <div
              className="pprogress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance del proyecto"
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <ol className="pmilestones">
              {milestones.map((m) => (
                <li key={m.label} className={`is-${m.state}`}>
                  {m.state === "done" ? (
                    <Check size={15} aria-hidden />
                  ) : m.state === "wip" ? (
                    <LoaderCircle size={15} aria-hidden className="pspin" />
                  ) : (
                    <CircleDashed size={15} aria-hidden />
                  )}
                  <span>{m.label}</span>
                  <span className="sr-only">
                    {m.state === "done" ? "(hecho)" : m.state === "wip" ? "(en curso)" : "(pendiente)"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="ppanel-desc">{project.desc}</p>

        <section>
          <h3 className="plabel">Tecnologías</h3>
          <ul className="ptags">
            {project.tech.map((t) => (
              <li key={t} className="ptag">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="plabel">Buscamos</h3>
          <ul className="ptags">
            {project.roles.map((r) => (
              <li key={r} className="ptag ptag-want">
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="plabel">Requerimientos</h3>
          <ul className="preqs">
            {project.reqs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        {project.links.length > 0 && (
          <section>
            <h3 className="plabel">Links</h3>
            <ul className="ppanel-links">
              {project.links.map((l) => (
                <li key={l.label}>
                  {l.href === "#" ? (
                    <span className="is-soon">
                      <span>{l.label}</span>
                      <em>{l.kind} · pronto</em>
                    </span>
                  ) : (
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      <span>{l.label}</span>
                      <em>
                        {l.kind} <ArrowUpRight size={12} aria-hidden />
                      </em>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {notes.length > 0 && (
          <section>
            <h3 className="plabel">Notas del equipo</h3>
            <ul className="ppanel-notes">
              {notes.map((n, i) => (
                <li key={i}>
                  <span
                    className="pavatar pavatar-sm"
                    style={{ background: AVATAR_TONES[i % AVATAR_TONES.length] }}
                    aria-hidden
                  >
                    {n.who[0]}
                  </span>
                  <p>
                    <strong>{n.who}</strong> {n.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="ppanel-tip">Tocá otro papel del corcho para ver su ficha.</p>
      </div>
    </aside>
  );
}
