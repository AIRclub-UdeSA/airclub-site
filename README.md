# airclub-site

Sitio institucional del AIR Club UdeSA: quienes somos, los proyectos del club, el equipo y los enlaces al Challenge JAR 2026.

> [!NOTE]
> Esta rama (`v2`) es la reescritura del sitio en Next.js + Supabase. La version en producción (Netlify, rama `main`) todavía es el `index.html` estático original — no se toca hasta el cutover final. **Antes de tocar nada, leer [CONTEXTO.md](CONTEXTO.md)** — tiene el estado real del rediseño de diseño/frontend (qué no se toca, qué ya se probó y se rechazó) y de qué lado del proyecto está cada quien.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4, con Postgres (Supabase) vía Prisma para el contenido dinámico. Sin login ni RSVP todavía — el modelo de datos ya los deja preparados, pero no están construidos en esta fase.

## Estructura

| Carpeta / archivo | Qué es |
| --- | --- |
| `src/app/` | Rutas de la app (Home, Eventos, Plataformas, Equipo, Contacto) |
| `src/components/` | Componentes de layout (`layout/`), compartidos (`shared/`) y de Home (`home/`) |
| `src/lib/` | Acceso a datos (`events.ts`, `robots.ts`, `team.ts`), utilidades y el cliente de Prisma |
| `prisma/schema.prisma` | Modelo de datos (Event, EventRegistration, Robot, TeamMember) |
| `prisma/seed-data/` | Contenido tipado. Eventos, robots, proyectos y contacto se leen directo de acá; equipo y charlas se siembran a Postgres desde acá con `npm run db:seed` |
| `public/` | Imágenes estáticas (logo, favicon, fotos) |
| `netlify.toml` | Deploy de la versión **actual en producción** (rama `main`), sin tocar |

## Ver el sitio localmente

```bash
npm install
npm run dev
```

Y entrar a http://localhost:3000.

### Variables de entorno

Copiar `.env.example` a `.env`. Con valores dummy alcanza para `npm run build` y para las páginas que leen de `prisma/seed-data/` (Home, Eventos, Plataformas, Proyectos, Contacto).

**`/equipo` y `/talks` leen de la base de Supabase**: sin las credenciales reales en `.env`, esas dos páginas dan error. Pedirle el `.env` a quien administra el proyecto de Supabase.

> [!WARNING]
> Hoy hay una sola base: la de tu `.env` es **la misma que usa el sitio en vivo**. Cualquier cambio que hagas en local (desde `/admin`, un script o `npm run db:seed`) se ve al instante en producción. Separar desarrollo y producción está pendiente en [#26](https://github.com/AIRclub-UdeSA/airclub-site/issues/26).

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

Eventos, robots, proyectos y contacto se editan directamente en `prisma/seed-data/*.ts` (arrays tipados), con el mismo flujo de PR que el resto del código. El estado "próximo/pasado" de un evento se calcula solo a partir de su fecha: no hay que marcarlo a mano ni acordarse de sacarlo cuando termina.

El equipo y las charlas viven en la base, y `npm run db:seed` carga en ella lo que dice `prisma/seed-data/`:

- **Equipo:** se edita en `prisma/seed-data/team.ts` y se corre `npm run db:seed`, que crea o actualiza a cada persona. El array (`founders` / `collaborators`) define en qué lista aparece, y `role` es su cargo, opcional. El `slug` de cada persona es su identificador fijo: no cambiarlo aunque cambie el nombre.
- **Charlas:** la fuente de verdad es la base (se editan desde el panel). El seed solo crea las charlas que no existen y nunca modifica una existente, así que correrlo no pisa lo editado.

### Imágenes

Las fotos van comprimidas antes de commitearlas. Para una foto, JPEG con calidad ~82 alcanza y pesa un orden de magnitud menos que un PNG:

```bash
convert foto-original.png -strip -interlace Plane -quality 82 foto.jpg
```

## Convenciones

Este repositorio se escribe en **español**: código, commits, PRs, issues y documentación.

Guías generales de la organización: [CONTRIBUTING](https://github.com/AIRclub-UdeSA/.github/blob/main/CONTRIBUTING.md) y [código de conducta](https://github.com/AIRclub-UdeSA/.github/blob/main/CODE_OF_CONDUCT.md).
