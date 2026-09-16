# pagina-web

Sitio institucional del AIR Club UdeSA: quienes somos, los proyectos del club, el equipo y los enlaces al Challenge JAR 2026.

> [!NOTE]
> Esta rama (`v2`) es la reescritura del sitio en Next.js + Supabase. La version en producción (Netlify, rama `main`) todavía es el `index.html` estático original — no se toca hasta el cutover final. Ver el plan completo de la reescritura para el detalle de fases.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4, con Postgres (Supabase) vía Prisma para el contenido dinámico. Sin login ni RSVP todavía — el modelo de datos ya los deja preparados, pero no están construidos en esta fase.

## Estructura

| Carpeta / archivo | Qué es |
| --- | --- |
| `src/app/` | Rutas de la app (Home, Eventos, Plataformas, Equipo, Contacto) |
| `src/components/` | Componentes de layout (`layout/`), compartidos (`shared/`) y de Home (`home/`) |
| `src/lib/` | Acceso a datos (`events.ts`, `robots.ts`, `team.ts`), utilidades y el cliente de Prisma |
| `prisma/schema.prisma` | Modelo de datos (Event, EventRegistration, Robot, TeamMember) |
| `prisma/seed-data/` | Contenido tipado (eventos, robots, equipo) — hoy es la única fuente de datos; en la Fase 2 se siembra a Postgres desde acá |
| `public/` | Imágenes estáticas (logo, favicon, fotos) |
| `netlify.toml` | Deploy de la versión **actual en producción** (rama `main`), sin tocar |

## Ver el sitio localmente

```bash
npm install
npm run dev
```

Y entrar a http://localhost:3000. No hace falta una base de datos para esto: el contenido sale de `prisma/seed-data/` mientras Postgres no esté conectado.

### Variables de entorno

Copiar `.env.example` a `.env`. Con valores dummy alcanza para levantar el sitio (`npm run dev`, `npm run build`); solo hacen falta las credenciales reales de Supabase para `prisma migrate dev` o `npm run db:seed`.

## Cómo proponer un cambio

Mientras dure la reescritura, los PRs entran **a `v2`**, no a `main`:

```bash
git switch v2
git switch -c mi-cambio
# editar
git commit -am "descripcion del cambio"
git push -u origin mi-cambio
gh pr create --base v2
```

CI (`typecheck`, `lint`, `build`) corre en cada PR contra `v2` o `main`.

### Contenido (eventos, robots, equipo)

Por ahora se edita directamente en `prisma/seed-data/*.ts` (arrays tipados) — mismo flujo de PR que el resto del código, sin panel de administración todavía. El estado "próximo/pasado" de un evento se calcula solo a partir de su fecha: no hay que marcarlo a mano ni acordarse de sacarlo cuando termina.

### Imágenes

Las fotos van comprimidas antes de commitearlas. Para una foto, JPEG con calidad ~82 alcanza y pesa un orden de magnitud menos que un PNG:

```bash
convert foto-original.png -strip -interlace Plane -quality 82 foto.jpg
```

## Convenciones

Este repositorio se escribe en **español**: código, commits, PRs, issues y documentación.

Guías generales de la organización: [CONTRIBUTING](https://github.com/AIRclub-UdeSA/.github/blob/main/CONTRIBUTING.md) y [código de conducta](https://github.com/AIRclub-UdeSA/.github/blob/main/CODE_OF_CONDUCT.md).
