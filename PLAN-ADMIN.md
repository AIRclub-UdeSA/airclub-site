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
- [x] Crear *Team* de Vercel (plan Hobby, no "commercial/Pro" — sitio no comercial) con
      GitHub → New Project → importar `AIRclub-UdeSA/airclub-site`.
- [x] Vercel: Settings → Environments → Production → Branch Tracking → `v2` (**no**
      `main`). Nota: en la UI actual de Vercel esto vive en "Environments", no en "Git"
      como decía la guía original. Hizo falta un deploy manual ("Deployments → Create
      Deployment", pegando `v2`) para que el nuevo Production Branch tuviera algo que
      servir, y un segundo deploy después de que el Framework Preset se autocorrigiera de
      "Other" a "Next.js" (el primer deploy había quedado con la config vieja, detectada
      cuando el import todavía apuntaba a `main`).
- [x] Vercel: cargar `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` en Environment
      Variables, aplicadas a Production y Preview.
- [x] Confirmado: `https://airclub-site.vercel.app` sirve el sitio de `v2` (hero del brazo,
      botón "Entrar al club") en Production.
- [x] Actualizar `.env` local con los valores reales de Supabase (reemplazando los de
      relleno).
- [ ] (No bloqueante) Preguntar en IT de UdeSA por un subdominio `airclub.udesa.edu.ar`; si
      no, evaluar Cloudflare Registrar o Namecheap más adelante.
- [x] **Migración de cuentas de Lucio a `airclub@udesa.edu.ar`** (2026-09-27): tanto Supabase
      como Vercel se habían creado con la cuenta personal de Lucio — se migraron a la cuenta del
      club para no depender de una sola persona (ídem razonamiento de por qué Organization/Team
      y no proyecto suelto). En Supabase fue trivial: `Organization Settings → Team → Invite
      member` con `airclub@` como Owner, sin recrear nada. En Vercel el plan Hobby no permite
      invitar un segundo miembro sin pagar Pro, así que se recreó el proyecto desde cero con una
      cuenta de GitHub nueva creada para `airclub@`: repo público pero igual hace falta permiso
      de **escritura** (no solo lectura) sobre el repo para que Vercel lo pueda "linkear" —
      resuelto agregando esa cuenta a un GitHub Team (`club`) con permiso `push` sobre
      `airclub-site` puntual, no toda la org. Mismo gotcha de siempre con la rama `main` vs `v2`
      al reimportar. Dominio nuevo: `airclub-site-chi.vercel.app` (el nombre `airclub-site` sin
      sufijo no se reclama solo al borrar el proyecto viejo). Proyecto viejo de la cuenta
      personal ya borrado.

## Etapa 2 — Conectar la base de datos real

- [x] `npx prisma migrate dev --name init` contra la base de Supabase real — migración
      `20260927143209_init`, commiteada en `feat/conectar-supabase` (contra `v2`).
- [x] `npm run db:seed` para cargar eventos/robots/equipo actuales — 2 eventos, 1 robot, 11
      personas.
- [x] Agregar a `TeamMember` en `prisma/schema.prisma` las columnas `linkedin`,
      `linkedinPhoto`, `github` + migración `20260927151020_add_team_member_links`, seed
      actualizado para persistirlas y re-corrido contra la base real. Commiteado en
      `feat/conectar-supabase`.
- [x] Migrar `src/lib/team.ts` de los arrays de `seed-data` a queries reales de Prisma, sin
      cambiar firma. Verificado con `npm run dev` que `/equipo` se ve igual.
      **Decisión (2026-09-27): solo `team.ts` y `talks.ts` se migran ahora.** `/eventos`,
      `/plataformas` (robots) y `/proyectos` todavía no tienen su rediseño de `v2` terminado
      ni definido, así que no tiene sentido conectarlos a la base todavía — el schema de
      `Event`/`Robot` ya está migrado y sembrado, pero `src/lib` sigue leyendo de `seed-data`
      a propósito hasta que se resuelva el diseño de cada subpágina. Queda anotado en los
      issues [#4](https://github.com/AIRclub-UdeSA/airclub-site/issues/4#issuecomment-5857052610)
      y [#7](https://github.com/AIRclub-UdeSA/airclub-site/issues/7#issuecomment-5857053616).
      `/contacto` tampoco se migra: por decisión ya tomada en #19/PR #20, se queda como config
      centralizada en `src/lib/contact.ts`, no va a la base.
- [x] Modelar `Talk`/`TalkMedia`/`TalkSlide`/`TalkLink` en Prisma (uno a uno con `SeedTalk`,
      más `recordingUrl` para la grabación completa) + migración + seed desde
      `prisma/seed-data/talks.ts` + migrar `src/lib/talks.ts` a Prisma sin cambiar firma.
      Decisión de manejo de material registrada en
      [#22](https://github.com/AIRclub-UdeSA/airclub-site/issues/22#issuecomment-5857130067):
      fotos y videos cortos van a Supabase Storage, la grabación completa (opcional) siempre
      por link externo a YouTube, nunca a Storage. Verificado con `npm run dev` que `/talks`
      se ve igual.
- [x] Abrir PR contra `v2` para validar el preview deploy de Vercel contra datos reales:
      [PR #24](https://github.com/AIRclub-UdeSA/airclub-site/pull/24) (`feat/conectar-supabase`,
      incluye también las fotos de equipo). Revisión de código propia antes de abrirlo: 4
      hallazgos (inconsistencia de rutas de fotos entre ramas, PNGs sin comprimir, fragilidad
      de `role` para agrupar founders/collaborators, falta de `revalidate` en `/equipo`),
      los 3 primeros corregidos, el de `role` documentado con comentario.

## Etapa 3 — Issue #21, Fase 0: fundación del panel de admin

Se implementa junto con el piloto de `/talks` (Etapa 4).

- [x] ~~Habilitar Supabase Auth con Google, restringido a `@udesa.edu.ar`~~ **Cambio de
      decisión (2026-09-27)**: se usa NextAuth.js (Auth.js v5) con proveedor de Google en vez
      de Supabase Auth, para no agregar `supabase-js` al proyecto — la Etapa 1 ya desactivó a
      propósito el Data API de Supabase porque toda la app usa Prisma directo. La sesión es
      JWT (sin adapter de base para NextAuth); la autorización real vive en el modelo
      `AdminUser` de abajo, no en Supabase. Login restringido a `@udesa.edu.ar` verificado en
      el callback `signIn` de `src/auth.ts`. Credenciales OAuth creadas en Google Cloud Console
      logueado con `airclub@udesa.edu.ar` (proyecto `airclub-site`, pantalla de consentimiento
      tipo **Interno** — Google restringe el login a `@udesa.edu.ar` a nivel de su propia
      pantalla de login, sin cartel de "app no verificada" ni límite de test users, gracias a
      que esa cuenta pertenece a la organización de Google Workspace `udesa.edu.ar`), con las
      dos redirect URIs (`localhost:3000` y `airclub-site-chi.vercel.app`) `/api/auth/callback/google`.
      `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` cargados en `.env` local; falta cargarlos también en
      Vercel (Production + Preview) junto con `AUTH_SECRET`. **Login probado de punta a punta en
      local (2026-09-27)**: Google restringido a udesa.edu.ar + chequeo de `AdminUser` +
      `/admin` mostrando el rol correctamente.
- [x] (Pedido explícito del usuario) Botón de login visible en el nav general del sitio
      (`src/components/layout/Nav.tsx`): ícono de persona en desktop y mobile. Sin sesión, el
      click abre un menú con "Continuar con Google" que dispara el login directo (server
      action `signInAction`), sin pasar por `/admin/login`. Con sesión, el ícono muestra la
      foto de perfil de Google y el menú ofrece "Cerrar sesión" y, si tiene permisos, un acceso
      directo a "Panel de admin". No habilita ninguna funcionalidad nueva para quien no sea
      admin — solo mantiene la sesión activa. Requirió agregar `lh3.googleusercontent.com` a
      `images.remotePatterns` en `next.config.ts` para poder mostrar la foto de perfil.
- [x] Modelo Prisma para personas autorizadas (rol `ADMIN`/`EDITOR` + `sections: String[]`,
      modelo `AdminUser`) + migración `20260927221143_add_admin_auth_and_audit_log`. Loguearse
      con Google no alcanza por sí solo: además hay que estar cargado acá. Bootstrap inicial
      (Lucio como `ADMIN`) hecho directo en la base, no en seed-data commiteado — a diferencia
      del contenido público, esta es una lista de acceso, no contenido del sitio.
- [x] Verificación de permisos en el servidor para cada acción de escritura (no solo ocultar
      botones): `src/lib/admin/permissions.ts` (`requireAdminSession`/`requireSectionAccess`),
      usada en el layout y de nuevo dentro de cada server action.
- [x] Layout de `/admin` con navegación filtrada por permisos (`src/app/admin/(panel)/layout.tsx`).
      Hoy solo lista "Inicio" y, para `ADMIN`, "Usuarios" — el resto de los items se agregan a
      medida que se construye cada sección (empezando por `/admin/talks` en la Etapa 4).
- [ ] Componentes reutilizables: lista, formulario, subida de imágenes a Supabase Storage,
      selector de fecha, confirmación de borrado.
- [ ] Borrador/publicado por elemento + revalidación de la página pública al guardar.
- [x] Modelo de logs de auditoría (`AuditLog`: persona, fecha, sección, elemento, acción, valor
      anterior/nuevo), escrito en la misma transacción que cada cambio — implementado y en uso
      desde `/admin/usuarios` (ver ítem siguiente); falta que las secciones de contenido
      (Etapa 4) también escriban ahí.
- [ ] Vista `/admin/logs` (solo `admin`, con filtros) + historial por elemento.
- [x] Gestión de usuarios y permisos (solo `admin`): `/admin/usuarios` — alta/baja/cambio de
      rol, con las salvaguardas de seguridad discutidas: chequeo de rol server-side en cada
      acción (nunca solo en el cliente), dominio `@udesa.edu.ar` validado de nuevo en el
      servidor, bloqueo explícito de sacar a la última persona `ADMIN` (para no quedar sin
      nadie que pueda arreglar el panel), y cada alta/baja/cambio queda en `AuditLog`.
- [ ] Bucket de Supabase Storage para imágenes/archivos, con validación de tipo/tamaño y
      optimización.

## Etapa 4 — Issue #22: piloto `/admin/talks`

- [x] Modelo Prisma `Talk`/`TalkMedia`/`TalkSlide`/`TalkLink` (uno a uno con `SeedTalk` de
      `prisma/seed-data/talks.ts`) + migración + seed. **Ya hecho en la Etapa 2** (PR #24) —
      quedaba duplicado/sin tildar acá por error, corregido el 2026-09-27.
- [x] `src/lib/talks.ts` lee de Prisma sin cambiar firma. **Ya hecho en la Etapa 2** (PR #24),
      mismo error de tildado corregido.
- [x] Decidir manejo de videos/grabaciones (Storage vs. enlace externo YouTube/Drive). **Ya
      decidido** en la Etapa 2: fotos y videos cortos van a Supabase Storage, la grabación
      completa (opcional) siempre por link externo a YouTube, nunca a Storage — registrado en
      [#22](https://github.com/AIRclub-UdeSA/airclub-site/issues/22#issuecomment-5857130067).
- [ ] Revisar `/talks` (y el estado de #3) y confirmar la lista de campos editables. **Esto sí
      falta** — es chico, repasar qué campos de `Talk`/`TalkMedia`/`TalkSlide`/`TalkLink`
      necesitan edición desde el panel.
- [ ] Lista en `/admin/talks` + "nueva charla a confirmar" + flujo de confirmación + carga
      de material en charla pasada. **Esto es lo que falta de verdad** — el bloque grande de
      trabajo de esta etapa, todavía sin empezar.
- [ ] Permiso por sección (`talks`) verificado en servidor + logging de cada acción. El
      mecanismo ya existe (`requireSectionAccess` en `src/lib/admin/permissions.ts`, probado en
      `/admin/usuarios`) — falta solo *usarlo* en las páginas de `/admin/talks` que se
      construyan.
- [ ] Prueba real con una persona no técnica del club (criterio de aceptación del issue). No se
      puede hacer hasta que exista la feature.

## Verificación

- Fin de Etapa 2: `npm run dev` local contra la base real; `/`, `/robots`, `/equipo` se ven
  igual que con los datos estáticos (paridad del seed).
- Fin de Etapa 3: login con una cuenta `@udesa.edu.ar` cargada en la tabla de autorizados
  funciona; con una cuenta no cargada, el acceso se rechaza del lado del servidor.
- Fin de Etapa 4: alguien sin conocimientos técnicos crea una charla a confirmar, la
  confirma y le carga fotos/slides sin ayuda; el cambio aparece en `/talks` sin redeploy y
  queda una entrada en `/admin/logs`.
