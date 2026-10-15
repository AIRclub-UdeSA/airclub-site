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

El contenido de la base se carga desde `/admin`, no desde el código. `seed-data` solo sirve para poblar una base vacía.

### Migraciones de la base

Para cambiar el modelo de datos se edita `prisma/schema.prisma` y se genera el SQL de la migración comparando la base con el schema, sin escribir en la base:

```bash
mkdir prisma/migrations/AAAAMMDDhhmmss_que_cambia
npx prisma migrate diff --config prisma7.config.ts \
  --from-config-datasource --to-schema prisma/schema.prisma \
  --script -o prisma/migrations/AAAAMMDDhhmmss_que_cambia/migration.sql
```

La carpeta se commitea en el mismo PR. **No usar `prisma migrate dev`**: mientras la base local sea la de producción, ante cualquier diferencia ofrece resetearla, y eso borra todo.

No hay que aplicarla a mano: cuando el PR se mergea, el deploy de producción en Vercel corre `prisma migrate deploy` antes de `next build` (script `vercel-build` de `package.json`). Lo que hace cada entorno:

| Entorno | ¿Migra? | Base |
| --- | --- | --- |
| Producción (Vercel) | Sí, antes del build | La real |
| Preview de un PR (Vercel) | No | La real, igual que producción |
| CI de GitHub (`npm run build`) | No | Ninguna (valores dummy) |

- **Si la migración falla, el deploy falla** y producción sigue sirviendo la versión anterior.
- **Si falla a la mitad**, Prisma la deja marcada como fallida en `_prisma_migrations` y todos los deploys siguientes fallan con `P3009` hasta resolverla a mano. Hay que revisar qué parte del SQL llegó a aplicarse y elegir una de dos salidas. Si se deshizo lo aplicado, se corre `npx prisma migrate resolve --config prisma7.config.ts --rolled-back <nombre>` y el próximo deploy la vuelve a correr. Si se terminó de aplicar a mano, se corre `--applied <nombre>`.
- **`DIRECT_URL`** tiene que estar en las variables de Production de Vercel con el puerto 5432 (conexión de sesión). El 6543 del pooler no sirve para migrar.
- **Migraciones que suman, no que borran.** Mientras corre el build, la versión anterior sigue atendiendo contra la base ya migrada: agregar columnas o tablas no la rompe, pero borrar o renombrar sí. Para eso van dos PRs: primero el código deja de usar la columna y después se borra.
- **Previews de un PR con migración:** como la base todavía no tiene las columnas nuevas, las páginas con fallback muestran `seed-data` y las que no lo tienen (`/admin`) fallan hasta el merge. Una base propia para las previews está pendiente en [#26](https://github.com/AIRclub-UdeSA/airclub-site/issues/26).

### Imágenes

Las fotos van comprimidas antes de commitearlas. Para una foto, JPEG con calidad ~82 alcanza y pesa un orden de magnitud menos que un PNG:

```bash
convert foto-original.png -strip -interlace Plane -quality 82 foto.jpg
```

## Convenciones

Este repositorio se escribe en **español**: código, commits, PRs, issues y documentación.

Guías generales de la organización: [CONTRIBUTING](https://github.com/AIRclub-UdeSA/.github/blob/main/CONTRIBUTING.md) y [código de conducta](https://github.com/AIRclub-UdeSA/.github/blob/main/CODE_OF_CONDUCT.md).
