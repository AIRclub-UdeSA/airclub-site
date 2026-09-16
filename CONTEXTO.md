# Contexto para retomar este proyecto

Este documento es para quien (persona o agente) se sume a trabajar en esta rama sin
haber estado en la conversación donde se tomaron estas decisiones. Léelo antes de tocar
nada — especialmente si venís a trabajar en diseño/frontend.

## Qué es esto

Reescritura del sitio del AIR Club UdeSA: de un `index.html` estático de una sola pieza
(rama `main`, todavía en producción en Netlify, no tocar) a Next.js + TypeScript +
Tailwind v4 + Postgres (Supabase, todavía sin conectar) vía Prisma. Todo el trabajo entra
por PR contra `v2`, no contra `main` — ver README.md para el flujo completo.

## División de trabajo actual

- **Backend / datos / infraestructura**: lo sigue llevando la sesión de Claude que armó
  la Fase 1 (scaffold, schema de Prisma, Supabase/Vercel pendiente de conectar).
- **Diseño / frontend**: se mueve a otro agente a partir de acá. Esta sección es para esa
  persona/agente.

## Diseño: dónde está parado esto

### Lo que NO se toca

- **El brazo robótico del hero es el activo más fuerte del sitio.** Es una animación SVG
  articulada, manejada por scroll, que arma el logo "AIR" en vivo — ver
  `src/components/home/ArmHero.tsx`. No reemplazarlo por un ícono chico ni por una
  ilustración distinta. Cualquier rediseño se construye alrededor de él, no en lugar de él.
- **Paleta actual** (`src/app/globals.css`): canvas claro (`--bg #faf8f8`), crimson/rosa/mauve
  como acentos (`--crimson #a40c4c`, `--rose #ddaabc`, `--mauve #8f5261`). El dueño del
  proyecto rechazó explícitamente reemplazar esto por una paleta nueva.
- **Tipografía**: Syne (headings) + Outfit (body) + JetBrains Mono (labels/datos) + Anton
  (reservada para las letras del logo en el hero). Ya están cargadas vía `next/font/google`
  en `src/app/layout.tsx`.
- Contenido y commits en **español** (ver README.md, sección Convenciones).

### Lo que se está buscando

El pedido explícito: una landing page con calidad de "poster de marca" — algo que se sienta
diseñado, no genérico — que además funcione como entrada al resto del sitio (eventos,
robots, equipo). El objetivo declarado: "necesitamos que la gente entre al sitio y quiera
sumarse."

Como referencia de *nivel*, no de estética literal, se compartieron tres sistemas de diseño
completos (Caldera, Flying Papers, Slush — todo sitios cripto/web3 o de marca con tipografía
de afiche a escala arquitectónica, 100-640px, paletas muy acotadas con roles estrictos por
color, radios de borde decididos y repetidos como firma, cero sombras). El texto completo de
esas tres referencias está en la conversación donde se definió este pedido, no en este repo —
si hace falta el detalle exacto, pedírselo al dueño del proyecto.

### Lo que ya se intentó y se rechazó

**Intento 1**: canvas oscuro nuevo, motivo de "telemetría" (miras, coordenadas, líneas
punteadas) inspirado libremente en las referencias, brazo reducido a un ícono chico en una
esquina. Rechazado: "se siente más vibecoded que antes", "no se parece en nada a las
referencias que di", y sobre todo — sacó al brazo del centro.

**Intento 2**: mismo canvas claro, misma paleta, el brazo real y completo en el centro,
tipografía empujada a mayor escala (Anton para "Think. Build. Compete.", que hoy vive
apagado como texto de footer), sombras eliminadas, radio de tarjetas unificado a uno más
grande. Rechazado también, sin razón específica más allá de "tampoco me gusta".

**Lectura de esto**: el segundo intento corrigió lo que el dueño señaló explícitamente del
primero (paleta, canvas, protagonismo del brazo) y aun así no funcionó — lo que sugiere que
lo que falta no es un ajuste incremental más sobre la misma base, sino entender con más
precisión qué es lo que SÍ funciona para él. Antes de un tercer intento a ciegas, probablemente
conviene pedir ejemplos de sitios reales que le gusten (no solo sistemas de diseño abstractos),
o mockups más chicos/rápidos para iterar más rápido que un landing completo por vuelta.

Los tres artefactos (revisión de diseño de la Fase 1.5, intento 1, intento 2) se publicaron
como Claude Artifacts durante la conversación — privados, puede que no sean accesibles fuera
de esa sesión:
- Revisión Fase 1.5: `https://claude.ai/code/artifact/866fad2e-bd74-47ee-abe5-997faf473b95`
- Intento 1 (rechazado): `https://claude.ai/code/artifact/05463884-5295-477a-9fd6-47304328aa63`
- Intento 2 (rechazado): `https://claude.ai/code/artifact/d43d4cdb-86ea-497f-aeb2-87e9881ab23c`

## Backend: dónde está parado esto

- Schema de Prisma completo en `prisma/schema.prisma` (Event, EventRegistration, Robot,
  TeamMember) — preparado para RSVP y auth a futuro, pero ninguna de las dos cosas está
  construida todavía (a propósito, ver commits de Fase 1).
- Contenido hoy sale de `prisma/seed-data/*.ts` (arrays tipados), leído a través de
  `src/lib/{events,robots,team}.ts`. Esas funciones no cambian de firma cuando se conecte
  Postgres — el frontend no debería necesitar tocarlas para el rediseño, salvo que cambie
  qué datos expone cada tipo de contenido.
- Supabase y Vercel todavía no están conectados — el dueño del proyecto los está
  configurando en paralelo a esto.
- `netlify.toml` y la rama `main` no se tocan hasta el cutover final.

## Convenciones que aplican a cualquiera que toque este repo

Ver README.md — resumen: PR contra `v2`, no contra `main`; sin co-author de IA en los
commits (hay un check de CI que lo bloquea); todo en español.
