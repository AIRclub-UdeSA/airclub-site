# Plan: desbloqueo y ejecución del panel de admin (issues #21 y #22)

> Documento vivo. Se va actualizando a medida que se resuelve cada paso — tildar los
> checkboxes en el mismo commit/PR donde se resuelve ese paso, no de una sola vez al final.

## Contexto

Los issues [#21](https://github.com/AIRclub-UdeSA/airclub-site/issues/21) ("Panel de
control para editar el sitio sin tocar código", umbrella) y
[#22](https://github.com/AIRclub-UdeSA/airclub-site/issues/22) ("/talks: Gestión de
charlas", sub-issue piloto de #21) están **ambos bloqueados explícitamente** por falta de
conexión real a Supabase. Verificado en el repo (2026-09-27):

- `.env` con valores de relleno (`DATABASE_URL`/`DIRECT_URL` con `xxxx`/`PASSWORD`), sin
  credenciales reales.
- Sin `prisma/migrations/` — el schema nunca se aplicó a una base real.
- Sin `.vercel/` — el proyecto no está importado a Vercel.
- Sin Auth ni Storage de Supabase configurados; el schema no tiene tablas de usuarios,
  roles ni logs de auditoría todavía.
- `README.md` y `CONTEXTO.md` lo confirman: "Sin login ni RSVP todavía"; "Supabase y
  Vercel todavía no están conectados — el dueño del proyecto los está configurando en
  paralelo".

### Contexto recibido de otro contribuidor

Otra sesión/contribuidor (aparentemente quien llevó la Fase 1 de backend, según
`CONTEXTO.md`) le pasó a Lucio esta guía de desbloqueo, resumida acá para que quede en el
repo:

> Nada está configurado todavía — se confirmó que `.env` sigue con valores dummy de
> localhost y que no hay `.vercel` enlazado, así que esto arranca de cero. `main` sigue sin
> tocarse (solo el commit estático original) y `v2` ya avanzó con bastante trabajo de
> frontend mergeado — el backend tiene que ponerse a la par en `v2`, como siempre.
>
> **Cuentas que solo Lucio puede crear:**
>
> 1. **Supabase** (la base de datos): usar una *Organization* de Supabase, no una cuenta
>    personal, para que no quede atada a una sola persona al graduarse (misma razón por la
>    que el repo ya está en la org `AIRclub-UdeSA`). Proyecto nuevo → password fuerte
>    guardada en un lugar durable (Supabase no la vuelve a mostrar). Región: la más cercana
>    a Argentina (São Paulo si está disponible, si no la región de US más cercana). El
>    plan gratuito alcanza para empezar — dato a tener en cuenta: los proyectos del plan
>    gratuito se pausan tras una semana sin actividad, inofensivo para un sitio de bajo
>    tráfico, solo implica que el primer request después de la pausa tarda más mientras
>    despierta. Una vez creado: Project Settings → Database → Connection string, y ahí sacar
>    **dos** strings — la *pooled* (puerto 6543, `?pgbouncer=true`) y la *directa* (puerto
>    5432). Van al `.env` local (`.env.example` ya documenta cuál es cuál).
> 2. **Vercel** (el hosting): cuenta con GitHub, preferentemente un *Team* de Vercel en vez
>    de cuenta personal, por la misma razón de continuidad. New Project → importar
>    `AIRclub-UdeSA/airclub-site` (puede pedir dar acceso de Vercel a la org de GitHub).
>    Next.js se detecta solo, sin cambios de build. **Importante**: Project Settings → Git
>    → Production Branch → poner `v2`, no `main` — `main` sigue sirviendo el sitio en vivo
>    en Netlify, no queremos que el "production" de Vercel choque con eso hasta el cutover
>    real. Cargar las env vars (Settings → Environment Variables): `DATABASE_URL`,
>    `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` — aplicadas a Production y a Preview.
> 3. **Dominio** (no urgente): vale la pena preguntarle primero a IT de UdeSA por un
>    subdominio tipo `airclub.udesa.edu.ar` (gratis y más oficial que uno comprado). Si se
>    prefiere uno propio: Cloudflare Registrar (a precio de costo, sin markup) o Namecheap,
>    ~US$10-15/año. De cualquier forma, se conecta después vía Domains de Vercel, que da los
>    registros DNS exactos — no bloquea nada más, la URL gratis `*.vercel.app` alcanza
>    mientras tanto.
>
> **Una vez que esas cuentas existan**, avisar (no hace falta pasar los secretos, solo
> confirmar que el `.env` local ya tiene los valores reales en vez de los de relleno) y se
> continúa con:
> 1. `npx prisma migrate dev --name init` contra la base de Supabase real.
> 2. `npm run db:seed` para cargar el contenido actual de eventos/robots/equipo.
> 3. Migrar `lib/events.ts` / `lib/robots.ts` / `lib/team.ts` de los arrays de seed estáticos
>    a queries reales de Prisma — las firmas no cambian, así que nada del trabajo de
>    frontend en curso debería tocarse.
> 4. Un agregado chico de schema: el frontend ya agregó links de LinkedIn/GitHub por
>    integrante (`prisma/seed-data/team.ts`), pero `TeamMember` todavía no tiene columna
>    para eso — `seed.ts` hoy los descarta antes de insertar con un comentario que marca
>    justo este pendiente. Se agrega la columna para que ese dato persista.
> 5. Push a `v2` vía PR para que el preview deploy de Vercel también quede validado contra
>    datos reales.
>
> Más adelante, no ahora: una vez que `v2` mergee a `main`, cambiar el Production Branch de
> Vercel a `main`, apuntar el dominio ahí, y dar de baja Netlify.

**Nota de coordinación**: los pasos de la Etapa 2 de abajo son exactamente los que esa otra
sesión/contribuidor se ofreció a hacer una vez creadas las cuentas. Antes de ejecutarlos acá,
confirmar que no se estén haciendo en paralelo por otro lado.

Objetivo final (criterio de éxito de #21 y de aceptación de #22): que una persona del club
pueda loguearse con Google `@udesa.edu.ar`, cargar una charla en `/admin/talks` sin tocar
código, que quede publicada sin redeploy, y que el cambio aparezca registrado en el log de
auditoría.

## Etapa 1 — Desbloqueo: cuentas externas (solo Lucio puede crearlas)

- [x] Crear *Organization* de Supabase (no cuenta personal) y proyecto nuevo, con password
      guardada en un lugar durable. Región: São Paulo si está disponible, si no la más
      cercana en US.
- [x] Guardar las dos connection strings (panel "Get connected" → tab ORM): pooled, modo
      transacción (puerto 6543) y pooled, modo sesión (puerto 5432, la usa `prisma
      migrate`). Nota: en proyectos nuevos de Supabase ambas pasan por el pooler
      (`*.pooler.supabase.com`), ya no por `db.<ref>.supabase.co` directo — se ajustó el
      comentario del `.env.example` para reflejarlo.
- [ ] Crear *Team* de Vercel (no cuenta personal) con GitHub → New Project → importar
      `AIRclub-UdeSA/airclub-site`.
- [ ] Vercel: Project Settings → Git → Production Branch → `v2` (**no** `main`).
- [ ] Vercel: cargar `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` en Environment
      Variables, aplicadas a Production y Preview.
- [x] Actualizar `.env` local con los valores reales de Supabase (reemplazando los de
      relleno).
- [ ] (No bloqueante) Preguntar en IT de UdeSA por un subdominio `airclub.udesa.edu.ar`; si
      no, evaluar Cloudflare Registrar o Namecheap más adelante.

## Etapa 2 — Conectar la base de datos real

- [ ] `npx prisma migrate dev --name init` contra la base de Supabase real.
- [ ] `npm run db:seed` para cargar eventos/robots/equipo actuales.
- [ ] Agregar a `TeamMember` en `prisma/schema.prisma` las columnas `linkedin`,
      `linkedinPhoto`, `github` (ver `prisma/seed-data/team.ts` y el comentario en
      `prisma/seed.ts`) + nueva migración.
- [ ] Migrar `src/lib/events.ts`, `src/lib/robots.ts` y `src/lib/team.ts` de los arrays de
      `seed-data` a queries reales de Prisma, sin cambiar firmas.
- [ ] Abrir PR contra `v2` para validar el preview deploy de Vercel contra datos reales.

## Etapa 3 — Issue #21, Fase 0: fundación del panel de admin

Se implementa junto con el piloto de `/talks` (Etapa 4).

- [ ] Habilitar Supabase Auth con Google, restringido a `@udesa.edu.ar`.
- [ ] Modelo Prisma para personas autorizadas (rol `admin`/`editor` + secciones permitidas).
- [ ] Verificación de permisos en el servidor para cada acción de escritura (no solo ocultar
      botones).
- [ ] Layout de `/admin` con navegación filtrada por permisos.
- [ ] Componentes reutilizables: lista, formulario, subida de imágenes a Supabase Storage,
      selector de fecha, confirmación de borrado.
- [ ] Borrador/publicado por elemento + revalidación de la página pública al guardar.
- [ ] Modelo de logs de auditoría (persona, fecha, sección, elemento, acción, valor
      anterior/nuevo), escrito en la misma transacción que cada cambio.
- [ ] Vista `/admin/logs` (solo `admin`, con filtros) + historial por elemento.
- [ ] Gestión de usuarios y permisos (solo `admin`).
- [ ] Bucket de Supabase Storage para imágenes/archivos, con validación de tipo/tamaño y
      optimización.

## Etapa 4 — Issue #22: piloto `/admin/talks`

- [ ] Revisar `/talks` (y el estado de #3) y confirmar la lista de campos editables.
- [ ] Decidir manejo de videos/grabaciones (Storage vs. enlace externo YouTube/Drive).
- [ ] Modelo Prisma `Talk`/`TalkMedia`/`TalkSlide`/`TalkLink` (uno a uno con `SeedTalk` de
      `prisma/seed-data/talks.ts`) + migración + seed.
- [ ] `src/lib/talks.ts` lee de Prisma sin cambiar firma.
- [ ] Lista en `/admin/talks` + "nueva charla a confirmar" + flujo de confirmación + carga
      de material en charla pasada.
- [ ] Permiso por sección (`talks`) verificado en servidor + logging de cada acción.
- [ ] Prueba real con una persona no técnica del club (criterio de aceptación del issue).

## Verificación

- Fin de Etapa 2: `npm run dev` local contra la base real; `/`, `/robots`, `/equipo` se ven
  igual que con los datos estáticos (paridad del seed).
- Fin de Etapa 3: login con una cuenta `@udesa.edu.ar` cargada en la tabla de autorizados
  funciona; con una cuenta no cargada, el acceso se rechaza del lado del servidor.
- Fin de Etapa 4: alguien sin conocimientos técnicos crea una charla a confirmar, la
  confirma y le carga fotos/slides sin ayuda; el cambio aparece en `/talks` sin redeploy y
  queda una entrada en `/admin/logs`.
