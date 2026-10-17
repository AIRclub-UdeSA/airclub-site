# DESIGN.md — AIR Club UdeSA Visual Design System

Este documento define las reglas de diseño, tokens visuales, jerarquías tipográficas, principios de movimiento y anti-patrones prohibidos para el sitio web de **AIR Club UdeSA**.

Cualquier persona o agente de IA que diseñe o modifique páginas y componentes en este repositorio **debe seguir estas reglas sin excepción** para mantener la consistencia y evitar caer en patrones genéricos ("vibecoding").

---

## 0. Identidad & Misión Visual

* **Propósito**: "Necesitamos que la gente entre al sitio y quiera sumarse". El sitio es la vitrina del club de robótica e inteligencia artificial más ambicioso de San Andrés, organizador del Challenge JAR 2026.
* **Estética declarada**: **Póster de Marca / Afiche de Ingeniería**. El sitio debe sentirse diseñado con rigor editorial y arquitectónico (a la altura de referentes como *Caldera*, *Flying Papers* o *Slush*), no como una plantilla SaaS común.
* **El Activo Intocable**: **El brazo robótico del hero (`ArmHero.tsx`) es el activo más fuerte del sitio**. Es un componente 3D (React Three Fiber, `RobotArm3D`) que arma el logo "AIR" en vivo al scrollear. Cualquier rediseño se construye alrededor de él, **nunca en lugar de él**.

---

## 1. Las Tres Perillas de Configuración (The Three Dials)

Para todo desarrollo visual nuevo en el sitio, fijamos estas tres perillas (escala 1 a 10):

| Perilla | Valor | Significado en AIR Club |
| :--- | :---: | :--- |
| **`DESIGN_VARIANCE`** | **8 / 10** | **Asimetría editorial y afiche gráfico**. Se evitan las grillas uniformes o predecibles; se combinan escalas monumentales con módulos de densidad variada. |
| **`MOTION_INTENSITY`** | **6 / 10** | **Cinemática física enfocada**. Movimiento rápido, seco y con masa tangible. Se reserva la mayor expresividad para el brazo 3D y el CAD. |
| **`VISUAL_DENSITY`** | **4 / 10** | **Espacio amplio y respiración ("Art Gallery")**. Fondo limpio, márgenes generosos, cortes precisos y cero ruido ornamental. |

---

## 2. Roles Cromáticos (Regla 60 - 30 - 10)

La paleta es estricta y acotada. No se inventan colores nuevos ni degradés violetas.

```
+-------------------------------------------------------------------------+
| 60% CANVAS BASE (Lienzo)    | 30% ESTRUCTURA & TEXTO | 10% ACENTO MARCA |
| Claro: #faf8f8              | Texto: #0d0407         | Carmesí: #a40c4c |
| Oscuro: #0e0407             | Bordes: #dee2de        | Rosa:    #ddaabc |
|                             | Muted: rgba(..., 0.74) | Mauve:   #8f5261 |
+-------------------------------------------------------------------------+
```

### Tokens Oficiales (`globals.css` / Tailwind v4)

| Token | Rol | Modo Claro | Modo Oscuro | Uso permitido |
| :--- | :--- | :--- | :--- | :--- |
| `--bg` | Canvas principal | `#faf8f8` | `#0e0407` | Fondo de página |
| `--bg2` | Canvas secundario | `#f4efef` | `#16070b` | Fondos de sección alternados, footer |
| `--card` | Superficie de tarjeta | `#ffffff` | `#18080f` | Tarjetas interactivas |
| `--text` | Texto principal | `#0d0407` | `#f5e8ec` | Títulos y texto de alto contraste |
| `--text2` | Texto secundario | `rgba(13,4,7,0.74)` | `rgba(245,232,236,0.68)` | Párrafos de lectura, descripciones |
| `--text3` | Metadatos y etiquetas | `rgba(13,4,7,0.48)` | `rgba(245,232,236,0.48)` | Fechas, links pasivos, notas |
| `--crimson` | Acento protagónico | `#a40c4c` | `#a40c4c` | Botones primarios, nodos activos, selección |
| `--crimson-text` | Acento en texto | `#a40c4c` | `#f0357f` | Enlaces con hover, acento tipográfico |
| `--rose` | Brillo y contorno | `#ddaabc` | `#ddaabc` | Luz en `border-trail`, badges sutiles |
| `--mauve` | Contraste apagado | `#8f5261` | `#c26179` | Subtítulos mono, firmas |
| `--border` | Borde estructural | `#dee2de` | `rgba(221,170,188,0.14)` | Líneas divisorias, contorno de tarjetas |
| `--border-h` | Borde activo/hover | `rgba(164,12,76,0.28)` | `rgba(221,170,188,0.32)` | Hover de tarjetas interactivas |

---

## 3. Tipografía & Jerarquía Escalar

El sitio utiliza **4 tipografías**, cada una con una función estructural fija:

```
ANTON (font-logo) ────────► Frases insignia monumentales (100–240px)
SYNE (font-display) ──────► Títulos de sección rotundos (clamp: 2.4rem a 6rem)
OUTFIT (font-body) ───────► Narrativa, manifiesto y párrafos de lectura
JETBRAINS MONO (font-mono)► Datos técnicos, fechas, métricas, botones técnicos
```

### Reglas de Aplicación Tipográfica:
1. **Anton (`var(--font-anton)`)**: el hero ("AIR") y las letras del brazo robótico; el título de cada subpágina (`AIR TALKS`, `EQUIPO`, `CONTACTO`); los numerales grandes (fechas, conteos, cuenta regresiva); los títulos de sección de `/contacto` y las frases insignia (`IdeaCallout`). No para cuerpo ni etiquetas. Las excepciones por página están en §8-11 (por ejemplo, el carrusel de la landing va en Syne).
2. **Syne (`var(--font-syne)`)**: Pesos 800/900 (`font-extrabold` / `font-black`), tracking tight (`tracking-tight`), interlineado compacto (`leading-[0.95]`). Siempre mayúsculas en encabezados principales.
3. **Outfit (`var(--font-outfit)`)**: Para el cuerpo de texto. Mantener un ancho de línea óptimo (`max-w-[65ch]` a `max-w-[75ch]`) con `leading-[1.7]`.
4. **JetBrains Mono (`var(--font-jbmono)`)**: Metadatos, etiquetas de estado `[EN DESARROLLO]`, botones de acción y coordenadas. Siempre en mayúsculas cuando se use como etiqueta técnica (`uppercase tracking-[0.14em]`).

---

## 4. Principios de Movimiento (Motion with Purpose)

Sintetizamos tres perspectivas de animación:
* **Emil Kowalski (Restricción & Velocidad)**: *¿Esto realmente necesita animarse?* Si no comunica cambio de estado o continuidad espacial, **se elimina**. Transiciones instantáneas y secas (150ms a 240ms con `--ease-club: cubic-bezier(0.4, 0, 0.2, 1)`).
* **Jakub Krehel (Pulido de Producción)**: Profundidad sutil, trazo de luz rotatorio en el borde (`border-trail-hover`) y micro-elevación de 2px sin sombras infladas.
* **Jhey Tompkins (Sensación Táctil / Mecánica)**: El movimiento cinético se reserva exclusivamente para los artefactos de laboratorio: el brazo robótico articulado al scrollear y el CAD del Rosmaster, que además viaja por las uniones de la landing (ver sección 11).

### Reglas de Movimiento:
* **NO usar `hover:scale-105`**: Es el principal cliché de interfaz generada por IA. Para indicar interacción, usar el `border-trail-hover`, cambio de color en el borde o un ligero desplazamiento en Y (`-translate-y-1`).
  * *Excepción aceptada:* la barra de eventos multi-día del calendario de `/eventos` (`CalendarMonthGrid.tsx`) usa `hover:scale-[1.015]` junto con `-translate-y-0.5`. Es un escalado mínimo que ayuda a leer la barra como un solo bloque continuo; se mantiene a propósito y respeta `motion-reduce`.
* **NO usar Stagger-Spam**: Prohibido encadenar retrasos artificiales de 0.1s en cascada infinita que hagan esperar al usuario 2 segundos para ver el contenido.
* **Física de entrada limpia**: Entradas con fade rápido y desplazamiento corto (`translate-y-4` a `translate-y-0`), nunca desde escalas `scale(0)` o con rebotes elásticos absurdos.

---

## 5. Componentes Firma del Sitio

Estos son los patrones que construyen la identidad visual de AIR Club:

1. **`ArmHero` (`src/components/home/ArmHero.tsx`)**:
   * Centro visual absoluto de la portada.
   * Manejado por scroll reactivo; coordina los 4 actuadores para trazar la "A" y la "R".
2. **`TiltCard` (`src/components/shared/TiltCard.tsx`)**:
   * Tarjeta con inclinación 3D contenida (`max={5}, scale={1.02}, lift={0}`).
   * Radio de borde uniforme: `rounded-card` (`--r-card: 22px`). Es la regla de la landing; `/talks` tiene su propio lenguaje de formas, ver sección 8.
3. **`border-trail-hover` (`src/app/globals.css`)**:
   * Borde con destello de luz cónica rotativa que se activa en hover. Comunica interacción sin mover el layout.
4. **Botón Mono Técnico (`Button.tsx`)**:
   * Borde fino, esquinas redondeadas (`rounded-full`), tipografía `font-mono text-[.8rem] uppercase` y flecha `ArrowUpRight` en hover.
5. **`SectionEdge` y `SeamRobot` (landing, ver sección 11)**:
   * `SectionEdge` es la curva que une dos secciones en lugar de un corte recto; `SeamRobot` es el Rosmaster que corre el slalom en la pista del Challenge JAR.
6. **Eje Temporal con Nodo ("HOY")**:
   * Ancla los eventos pasados a la izquierda (línea sólida) y los futuros a la derecha (línea punteada), con el marcador HOY en el corte. Implementado en `TalksTimeline.tsx`, solo horizontal (en mobile se desliza lateralmente; no hay versión vertical).

---

## 6. Anti-Patrones Prohibidos (The Anti-Vibecoding Checklist)

Para no regresar a los patrones mediocres de IA, queda **estrictamente prohibido**:

* ❌ **La "Trilogía Aburrida"**: Prohibido crear secciones con 3 tarjetas idénticas de igual tamaño una al lado de la otra. Usar layouts asimétricos tipo afiche (tarjeta líder + módulos secundarios).
* ❌ **Micro-etiquetas con `//`**: Prohibido anteceder títulos con tags como `// SOBRE NOSOTROS` o pills decorativas innecesarias. El título debe tener peso por sí mismo.
* ❌ **Gradientes Violetas / AI-Purple**: Prohibido el degradé genérico morado/azul estilo "cyberpunk" o "SaaS de 2023". Solo la paleta carmesí/lienzo de AIR Club.
* ❌ **Glassmorphism descontrolado**: Prohibido aplicar `backdrop-blur` y fondos semitransparentes en cada elemento. Solo la barra de navegación y los modales usan blur.
* ❌ **Emojis en lugar de íconos**: Cero emojis para ilustrar conceptos de ingeniería. Usar íconos vectoriales SVG limpios (`lucide-react`) con trazo parejo.
* ❌ **Bloques "Sponsor / Empresa" fuera de la landing**: El bloque de vinculación empresarial pertenece únicamente al final de la portada, no a los footers de subpáginas.
* ❌ **Paréntesis en rótulos de conteo** ("Fotos (5)", "Diapositivas (2)"): el dueño los rechazó. Usar el rótulo solo, o una cifra aparte.
* ❌ **Divisores decorativos entre secciones** (reglas de vernier, cintas de texto, dibujos de circuito): todos se probaron en `/talks` y se descartaron, ver sección 8. Las secciones se separan con bandas de color a todo el ancho. **Excepción en la landing:** las uniones pueden ser curvas (`SectionEdge`) o almenadas, con la regla de la sección 11 (la curva no va en todas).
* ❌ **Hardcodear datos dentro de los componentes**: Todo contenido estructurado debe residir en `prisma/seed-data/*.ts` y consumirse a través de `src/lib/*.ts`, preparado para su migración a Supabase.

---

## 7. Checklist Pre-Commit para Colaboradores y Agentes

Antes de proponer cualquier PR contra `main`:

- [ ] **Idiomas**: Código, commits, documentación y comentarios en **español**.
- [ ] **Sin AI Co-Author**: No incluir trailers `Co-authored-by: ... [bot]` (el CI lo rechaza).
- [ ] **Modo Oscuro**: Todo componente nuevo debe verse perfecto en claro (`--bg: #faf8f8`) y en oscuro (`--bg: #0e0407`).
- [ ] **Next 16**: en `next/image` usar `loading="eager" fetchPriority="high"` (la prop `priority` está deprecada). Antes de escribir código, leer la guía correspondiente en `node_modules/next/dist/docs/`.
- [ ] **Movimiento reducido**: todo lo que se anima debe respetar `prefers-reduced-motion` (ver el bloque al final de las utilidades `talk-*` en `globals.css` y `src/lib/use-reduced-motion.ts`).
- [ ] **Pruebas de CI**: Debe pasar localmente `npm run typecheck`, `npm run lint` y `npm run build` sin advertencias.

---

## 8. AIR Talks (`/talks`): decisiones del dueño, rechazos y mapa

Esta sección es el registro de la sesión de rediseño de `/talks`. Sirve para no repetir lo que ya se probó.

### Idea rectora: el tiempo es el diseño
* La **fecha es el ancla visual**: numerales en Anton (`03`, `12-16`) en el hero, en cada tarjeta y en el modal.
* El **color codifica el estado**: pasado = foto monocromática que "se revela" a color al hover/foco/apertura (`.talk-photo`, `.talk-develop`); la próxima charla = carmesí macizo; por confirmar = trama diagonal (`.talk-hatch`), que se lee como "lugar reservado", no como vacío.
* **HOY** marca el corte entre lo que pasó y lo que viene: sello cuadrado inclinado en la costura del hero y nodo en el eje del cronograma.

### Estructura y archivos (`src/components/talks/`, de arriba hacia abajo)
1. `TalksHero.tsx`: título "AIR TALKS" + dos rectángulos a todo el ancho (última charla | próxima), separados por una línea de 12px del color del canvas. Maneja los casos sin pasada, sin próxima y sin ninguna.
2. `TalksTimeline.tsx`: "Cronograma", pista horizontal sobre banda `bg-bg2` a todo el ancho. Tarjetas con forma de entrada (cuerpo con la fecha, talón con líneas de puntos), sellos inclinados, nodos cuadrados.
3. `CallForSpeakers.tsx`: banda oscura fija (igual en claro y oscuro) a todo el ancho, con `TalksBattlement.tsx` como borde superior almenado.
4. `TalkModal.tsx` + `TalkSlideshow.tsx`: detalle de charla. `TalksHub.tsx` orquesta el estado. `src/lib/talk-format.ts` es el único lugar donde se formatean fechas (siempre en hora de Buenos Aires); `src/lib/use-reduced-motion.ts` es el hook de movimiento reducido.

### Lo que el dueño aprobó (conservar)
* **Título**: "AIR TALKS" en Anton, **centrado**, una sola línea, sin nada debajo, a ≈50% del ancho en desktop. Se bajó en cuatro pasos porque "era demasiado masivo". El tamaño es `min(36rem, calc((100vw - gutters) / N))` con N = 5 / 5.8 / 6.8 por breakpoint (más N = más chico). También se comparó alineado a la izquierda y se eligió centrado.
* **Hero**: rectángulos rectos a todo el ancho. Le gusta "mucho"; no cambiar su composición sin pedirlo. Tiene que entrar en el primer viewport a 1440×900 (la altura de los paneles se calcula con `100dvh` menos el alto del título).
* **Cronograma**: tipografía y numerales (los conserva); formas rectas con contorno de 1px (`border-text`), sin esquinas redondeadas.
* **Modal**: centrado (no un cajón lateral), `<dialog>` nativo, 62rem de ancho, organización minimalista. Arriba, un slideshow de fotos con puntos (el activo más ancho, se va llenando de carmesí para mostrar cuándo cambia; avanza solo cada 5 s, tocar la foto pasa a la siguiente, tocar un punto salta a esa foto; el cursor encima no lo pausa; los videos van mudos con botón de sonido). Pestañas solo **Resumen / Diapositivas / Video**: no hay pestaña de Fotos.
* **Varios oradores**: el hero y las tarjetas muestran al primero y "y N más" (sin rol, que sería el de uno solo); el modal los lista a todos. Cada charla guarda sus oradores en `TalkSpeaker`.
* **Forma**: los botones siguen siendo píldora (`rounded-full`); los paneles y tarjetas de `/talks` son rectos. La landing conserva `rounded-card`. Las subpáginas (`/talks`, `/equipo`, `/contacto`) comparten el lenguaje recto; la landing conserva `rounded-card`. Decisión del dueño al empezar la pasada de `/equipo` y `/contacto` (ver sección 9).

### Rechazado (no reintroducir)
* Barras de progreso a todo el ancho arriba del slideshow del modal: al tocar otra barra tardaban en arrancar (el cursor sobre todo el slideshow las pausaba) y se sentía raro. Se volvió a los puntos, con el activo más ancho; para mostrar cuándo cambia, el punto activo se llena. Más adelante se sacó también la pausa sobre la foto: el avance ya no se detiene con el cursor.
* El diseño original: masthead gigante a la izquierda con regla de vernier y marcas de registro, carrusel automático de fotos con puntos, tres botones píldora seguidos, contadores `[01 / 03]`, "EDICIÓN #01", puntos que pulsan.
* **Cualquier divisor** entre título, hero y cronograma. Se probaron: (a) cinta negra de texto que corre, inclinada y luego recta, entre título y hero y luego entre hero y cronograma (gustó al principio, al final se pidió sacarla); (b) dibujo animado de circuito de placa (rechazado de entrada). El dueño prefiere sin divisores.
* Título a todo el ancho de la página, y título alineado a la izquierda.
* Cajón lateral para el detalle; pestaña de Fotos; paréntesis en los conteos.

### Referencias externas
* El dueño compartió el design.md de **Slush** como referencia. Se adoptaron sus *reglas de construcción* (contorno negro de 1px, colores planos sin sombras, sellos/stickers inclinados, bandas de color a todo el ancho, botones píldora). **No** se adoptó su paleta pastel/arcoíris ni las cintas 3D: chocan con carmesí/lienzo, que el dueño no quiere cambiar.
* Borde almenado: adaptado de **cult-ui "SVG Bands"** (MIT), https://github.com/nolly-studio/cult-ui. Hay crédito en el comentario de `TalksBattlement.tsx`.

### Cómo iterar con el dueño
* Pide ajustes de a poco ("un poco menos"): mover una sola perilla por vez, en pasos de ~12%.
* Cuando duda entre dos opciones, pide **verlas lado a lado**: sacar dos capturas y mostrarlas antes de decidir.
* Verificar cada cambio visual a 1440×900 y 375×812, en claro y oscuro, más `npm run typecheck` y `npm run lint`.

### Trampas conocidas
* Syne extra-bold en mayúsculas es muy ancha: "CRONOGRAMA" desborda en mobile si el tamaño mínimo no es chico (`clamp(1.5rem, 6.6vw, 4rem)`). Ese desborde ensancha el viewport en mobile y rompe toda la página, no solo el título.
* Las animaciones de filtro que deben poder cambiar al hover (`.talk-develop`) usan `animation-fill-mode: backwards`; con `both` el estado final queda fijo y el hover deja de funcionar.
* `<dialog>`: no darle `display` fijo; usar `open:flex`, o queda visible aunque esté cerrado.
* Nada de fecha "de ahora" en componentes cliente: `todayIso` y `daysUntilNext` se calculan en el servidor (`page.tsx`) para no romper la hidratación.
* El panel de navegador de Claude pausa el render cuando está oculto: las capturas salen "a medio fade" o desactualizadas. Esperar y volver a capturar antes de juzgar una animación.

### Pendientes
* El seed tiene una diapositiva con paréntesis en el título ("Cómo reemplazar un tobillo (Tadeo Casiraghi)") y una fecha con mayúscula ("3 de Septiembre"): son datos, se corrigen en el seed o en el panel de administración.

---

## 9. Equipo (`/equipo`): decisiones del dueño, rechazos y mapa

### Decisión previa: lenguaje de formas
El dueño eligió que `/equipo` y `/contacto` usen el **lenguaje recto de `/talks`** (paneles rectos con contorno de 1px, bandas de color a todo el ancho, botones píldora, cero sombras) y no el `rounded-card` de la landing. Las tres subpáginas forman una familia; la landing queda como está.

### Idea rectora: cuántos somos, y con qué cara
* El **conteo real** es el ancla visual: `07` y `04` en Anton (`data.length`, nunca escritos a mano), como la fecha en `/talks`.
* Las **caras** son lo más valioso de la página: fichas cuadradas y grandes en vez de una lista con avatares de 40px.
* Cada persona tiene **dos caras**: la de LinkedIn (la ficha) y la de GitHub (un círculo en la esquina).

### Estructura y archivos
1. `src/app/equipo/page.tsx`: título "EQUIPO" (Anton, centrado, misma altura de letra que "AIR TALKS"), banda Fundadores sobre el lienzo, banda Colaboradores en `bg-bg2` y cierre. Las dos listas usan la misma grilla de 12 columnas (foto o panel a la izquierda, fichas a la derecha en 4 columnas), por eso quedan alineadas.
2. `src/components/equipo/TeamTile.tsx`: `TeamTile` (ficha con foto de LinkedIn + círculo de GitHub; sin foto, trama diagonal con las iniciales en Anton) y `JoinPanel` (trama diagonal "¿Vos?" con el círculo de GitHub vacío, en el lugar de la foto grupal de colaboradores; lleva a `#sumarte`).
3. `src/components/equipo/JoinSection.tsx`: "Cómo sumarte", banda oscura fija (igual en claro y oscuro). Dos pasos en orden: `01 Primero` (carmesí macizo) y `02 Después` (contorno). El texto viene de los motivos `comunidad` y `equipo` de `src/lib/contact.ts`, no está duplicado.
4. `src/lib/team.ts`: lee de Prisma con **fallback al seed** (mismo patrón que `talks.ts`).

### Lo que el dueño aprobó (conservar)
* Fichas cuadradas con contorno de 1px, nombre en Syne y etiqueta mono; el borde y el nombre pasan a carmesí al hover/foco. **Las fotos van a color**: el blanco y negro que se probó primero "se sentía muerto" (se descartó; nada de `grayscale` en las caras).
* El avatar de GitHub es un **círculo** de 44px con contorno de 1px (no un sello cuadrado inclinado). Son dos enlaces hermanos, nunca anidados.
* El bloque "¿Vos? / Tu lugar" va en **Colaboradores**, no en Fundadores (nadie se suma como fundador). Usa la trama diagonal de `/talks` = "lugar reservado".
* Conteo en Anton (`07`, `04`) junto al título de cada banda; "Segundo semestre 2026" como etiqueta mono a la derecha del título de Colaboradores.
* "Cómo sumarte" sin el shader WebGL: banda plana.

### Rechazado (no reintroducir)
* Fotos en blanco y negro que se revelan a color (se sentía "muerto"). Sello inclinado para el avatar de GitHub (tiene que ser un círculo). El bloque "¿Vos?" entre los fundadores. La lista de nombres con dos botones redondos de 40px; la sombra grande y el `rounded-card` en la foto grupal; `hover:scale`; la grilla de puntos del header; la lista numerada 01–04 de beneficios duplicada de `/contacto`.

### Trampas conocidas
* Syne extra-bold en mayúsculas mide ~1.2em por letra: "COLABORADORES" no entra en 4 de 12 columnas ni a 320px si el mínimo del `clamp` es 1.4rem. El título va en una fila propia con mínimo `1.05rem` (`SECTION_TITLE` en `page.tsx`). A 320px, además, un botón con `whitespace-nowrap` dentro de un ítem de grilla ensanchaba todo el viewport: el panel necesita `min-w-0` y el botón poder partirse.
* Las fotos de LinkedIn no se pueden obtener automáticamente (sus términos lo prohíben): son archivos en `public/equipo/linkedin/` que sube cada persona. Las fichas miden ~190px: una foto de 400px o más se ve nítida, una de 180-200px se ve blanda. Si una foto trae bordes negros, recortarla en el archivo.
* `next dev` cachea las imágenes optimizadas en `.next/dev/cache/images`: si reemplazás un archivo con el mismo nombre y se sigue viendo el viejo, borrá esa carpeta.
* Con 7 fundadores, la última fila de la grilla de 4 columnas queda con 3 fichas (hueco a la derecha). Es deliberado.

### Pendientes
* Reemplazar las fotos de baja calidad cuando cada integrante mande la suya (el dueño las va a pedir). La de Juan ya está.

---

## 10. Contacto (`/contacto`): decisiones, rechazos y mapa

Mismo lenguaje recto que `/talks` y `/equipo` (ver sección 9).

### Idea rectora: el motivo decide el destino, y el color dice la intención
La página es un enrutador: elegís el motivo y te lleva al canal. **El fondo no cambia**: es el lienzo, o `bg-bg2` alternado como en `/equipo` y `/talks`. **El color va en los paneles de arriba**, y cada color es una intención, tomado de la paleta de la marca:
* **Carmesí = sumarte** (comunidad, equipo principal). **Rosa = aportar** (charla, workshop, sponsors). **Malva = preguntar** (consultas y prensa).
* Cada sección se titula en primera persona y en Anton: "Quiero sumarme", "Quiero aportar", "Tengo una duda", "O escribinos directo". Ese título es el subtítulo: no hay otro.
* El **tipo de destino** se lee por forma: etiqueta rellena = formulario (otra pestaña), etiqueta con contorno = mail (tu programa de correo). Cada panel muestra en mono lo que va a pasar al tocarlo: `→ docs.google.com` o `→ airclub@udesa.edu.ar · Asunto: Propuesta de AIR Talk`. Antes, cuatro de las seis acciones eran el mismo mail con otro asunto y se veían como enlaces comunes.

### Estructura y archivos
1. `src/app/contacto/page.tsx`: título "CONTACTO" (Anton, centrado, igual que `/talks` y `/equipo`) y cuatro secciones, todas con datos de `src/lib/contact.ts`.
2. `src/components/contacto/IntentSection.tsx`: sección con su título y el tono (`crimson`, `rose`, `mauve`). El tono fija por variable CSS la "tinta" (`--ink`, texto sobre el panel) y el "papel" (`--paper`, relleno del panel). Son colores fijos en claro y oscuro: la tinta siempre contrasta con su papel.
3. `src/components/contacto/ReasonPanels.tsx`: `ReasonPanel`, un panel recto de 1px que es un solo enlace. Variantes: `featured` (la acción principal, con botón píldora), `outline` (solo contorno, se rellena al acercarse) y `strip` (en una línea en desktop). Al acercarse sube 2px y toma el contorno del texto; con movimiento reducido no se mueve.
4. `src/components/contacto/ChannelsBand.tsx`: los cuatro canales en una fila sobre `bg-bg2`; el handle es el diseño (Syne grande). Las líneas entre celdas son de 1px y sirven de grilla, no de adorno.
5. `src/lib/contact.ts`: `ContactReason` expone `kind` (`"form"` o `"mail"`), `destination` y `subject`, para mostrar el destino sin hardcodear nada en los componentes.

### Lo que el dueño aprobó (conservar)
* El fondo de la página no cambia de color; el color va en los paneles, y las secciones alternan `bg`/`bg2`.
* Títulos de sección en primera persona, en Anton, con la última palabra en carmesí.
* Paneles rellenos por intención (carmesí, rosa, malva) y la acción principal (comunidad) más grande, con su botón píldora.
* Mobile: la acción principal va primero y los canales al final.

### Rechazado (no reintroducir)
* **Bandas de color a todo el ancho** (fondo carmesí, rosa y oscuro por sección): "el fondo no cambia". Lo que cambia son las cosas de arriba.
* El subtítulo "Escribinos por", con o sin el conteo grande `06`, y la frase de ayuda grande como apertura ("se siente sin alma"). Tampoco van los conteos en Anton en esta página (sí en `/equipo`).
* Que casi toda la página sea solo lienzo y carmesí ("blanco y rosa").
* Los íconos que no representaban su canal (cámara por Instagram, maletín por LinkedIn), el hueco de ~400px bajo los canales (columna izquierda con `sticky`) y las seis filas numeradas con divisores.

### Trampas conocidas
* Una grilla de una sola columna sin `grid-cols-1` toma el ancho mínimo de su contenido: a 320px la URL/asunto en mono ensanchaba todo el viewport. Usar `grid-cols-1` (que es `minmax(0,1fr)`) y `[overflow-wrap:anywhere]` en el texto largo.
* Los colores de tinta y papel son fijos, no tokens de tema: los tokens cambian en oscuro (por ejemplo `--mauve` se aclara) y le quitarían contraste al texto blanco del panel malva.
* Al sacar capturas de página completa, esperar a `document.fonts.ready`: si no, una palabra en Anton puede salir en la fuente de reemplazo y verse más chica de lo real.

---

## 11. Landing (`/`): decisiones, rechazos y mapa

Paneles y tarjetas rectos con contorno de 1px, sin sombras y con botones píldora, igual que `/talks`, `/equipo` y `/contacto` (secciones 8 a 10). `rounded-card` queda descartado también acá ("vibecoded 101"). **Lo nuevo de esta pasada son las uniones entre secciones**, que ya no son todas cortes rectos (ver "Uniones").

### Idea rectora
La landing es una sola recorrida en **tres actos**, y la conexión entre secciones es **invisible**: no hay numeración ni índice. La dan el orden, el tono, uniones que no se repiten y un personaje (el Rosmaster) que pasa de una sección a otra. Las referencias fueron Slush, Wise, Intercom y Flying Papers: ninguna pone un tratamiento en cada unión; casi todas son cambios de tono rectos y se reserva lo especial para uno o dos momentos.

| Acto | Tono | Contenido |
| :--- | :--- | :--- |
| I. Quiénes somos | Claro | Hero con el brazo, manifiesto y carrusel (el carrusel hace de puente hacia lo oscuro) |
| II. El desafío | Un solo bloque oscuro `#0e0407` | Cuenta regresiva del Challenge JAR y pista del Rosmaster, sin borde entre ellas |
| III. Sumate | Claro | Actividades, "Tengo una idea", convocatoria y alianzas |

Antes la landing tenía seis cambios claro/oscuro y "Tengo una idea" salía antes del hito principal; ahora son dos cambios y los pedidos de participación quedan juntos.

### Estructura y archivos (de arriba hacia abajo)
1. `ArmHero.tsx`: el brazo robótico del hero. Sigue sin tener pasada propia ("le falta poder"); lo único que cambió es que "Entrar al club" baja con `scrollToTarget` (Lenis).
2. `AboutSection.tsx`: manifiesto "Construir. Competir. En comunidad." en Syne. Deja `--edge-h` de padding inferior extra para la colina del carrusel (el extra que quedó "para el robot" ya no hace falta).
3. `WordSlideshow.tsx`: carrusel de palabras en Syne sobre fondo oscuro con luz ambiental. Su colina de arriba es la propia sección recortada (`useEdgeClip`): sube `--edge-h` sobre el manifiesto (`margin-top` negativo y el mismo `padding-top`) y un `clip-path` le da la forma, así que fondo, colina y resplandores cambian de color juntos (transición de 700 ms). El piso del `clamp` del título es `1.2rem`: "COMPETENCIAS" (13,8 em) tiene que caber en 320px.
4. `CountdownStrip.tsx` + `RosmasterTrack.tsx`: un bloque oscuro continuo. Cuenta regresiva con números en Anton en celdas de 1px y segundos en carmesí macizo, cada dígito como una **solapa de tablero mecánico** (`FlapDigit.tsx`, ver "La cuenta regresiva como tablero"); debajo, la pista rosa. `RosmasterTrack` dibuja **solo la pista**, fija (antes corría con el scroll y el robot y los conos se veían deslizarse sobre un piso que se iba para otro lado; ahora se dibuja solo al cargar y al cambiar de tamaño); el robot lo dibuja `SeamRobot`.
5. `EventsTeaser.tsx`: "Próximas actividades" con el `ActivityPanel` compartido con `/eventos` y los mismos datos (`getUnifiedCalendarActivities`), máximo 3; las cajas cambian de forma según cuántas hay. Ya no incluye la convocatoria.
6. `IdeaCallout.tsx`: "Tengo una idea" como banda `bg-bg2`, frase en Anton con interlineado `1.04`.
7. `ConvocatoriaBand.tsx`: banda oscura con el borde almenado de `/talks` (`TalksBattlement`), "Proponé una charla o un workshop" con dos filas (charla, workshop).
8. `SponsorStrip.tsx` (en `layout/`): alianzas, solo en la landing.
9. Archivos de soporte: `src/components/shared/SectionEdge.tsx` (curvas: `SectionEdge` y `useEdgeClip`), `src/components/home/SeamRobot.tsx` y `slalom-scene.ts` (el robot y su escena), `src/components/home/RosmasterModel.tsx` (el CAD repintado, compartido), `src/lib/smooth-scroll.ts` y `src/components/shared/SmoothScrollProvider.tsx` (Lenis).

### Uniones: la curva no va en todas
| Unión | Tratamiento |
| :--- | :--- |
| Hero → manifiesto | ninguno (mismo lienzo) |
| Manifiesto → carrusel | **curva** (abre el tramo oscuro) |
| Carrusel → JAR + Rosmaster | corte recto, de ciruela a negro |
| Rosmaster → actividades | **curva** (cierra el tramo oscuro) |
| Actividades → "Tengo una idea" | cambio de tono recto |
| "Tengo una idea" → convocatoria | **borde almenado** de `/talks` |
| Convocatoria → alianzas | cambio de tono recto |

**Regla:** la curva solo abre y cierra el tramo oscuro. Si se agrega otra unión especial, que sea de otro tipo; no repetir el mismo arco en toda la página.

`SectionEdge` es la colina de la sección que sigue, pintada de su color, que sube sobre el final de la anterior. Con el scroll la cima se desliza de lado y se aplana un poco, pero nunca llega a ser una recta. Cada borde tiene su propia forma (`peak`, `amp`). Se coloca **entre** dos secciones y las de arriba necesitan al menos `--edge-h` de padding inferior (`--edge-h: clamp(48px, 7.5vw, 110px)` en `globals.css`); sin eso la curva tapa texto. Se saca el `border` recto de las secciones que tienen curva arriba. Con movimiento reducido la curva queda quieta. Si la sección que sigue **cambia de color** (el carrusel), no va un `SectionEdge` aparte sino `useEdgeClip` sobre la propia sección: misma fórmula de la curva, recortando la sección en lugar de dibujar otra pieza.

### El Rosmaster en la pista (`SeamRobot`)
El Rosmaster es la mascota de la página, pero hoy hace **una sola escena**: el slalom de la pista del JAR (banda `data-seam="slalom"` de `RosmasterTrack`). Es un solo robot en **un canvas fijo** sobre la ventana (`pointer-events-none`, `z-40`, debajo de la barra de navegación, ortográfico con 1 unidad = 1 px) que no dibuja ni se ve fuera de la ventana de la banda. Lo anterior (escenas en las dos colinas y en las almenas) se **sacó**; ver "Rechazado".

**Escena (`src/components/home/slalom-scene.ts`):** una línea de tiempo de GSAP con **reloj propio** (no depende de la velocidad del scroll): entra por el borde derecho, se detiene a mirar la cuenta regresiva (la cámara RGB-D cabecea) y cruza la pista de derecha a izquierda esquivando conos de tránsito (base cuadrada, cuerpo rosa y dos franjas blancas; tres en pantallas anchas, dos debajo de 640 px), con el LiDAR barriendo en 360°: un disco horizontal pegado a la torreta, a la altura de sus ventanas, que gira con ella (haz fino, estela de un cuarto de vuelta detrás del haz y dos anillos de alcance; radio de 1,2 largos del robot, 0,6 debajo de 640 px). Reemplaza a un abanico plano puesto de frente a la cámara que no salía del sensor; más abajo en pantalla = más cerca = más grande. El robot mide 0,15 del ancho (entre 84 y 210 px): más grande se perdía en la banda y no dejaba lugar a los conos. Entra entero antes de frenarse a mirar la cuenta regresiva. El zigzag y los conos ocupan solo la parte visible del carril (`weaveX`), una curva por cono: pasa por delante de uno y por detrás del siguiente, con una profundidad calculada para no meterse en el cono (medio robot más media base del cono). Una vuelta dura unos 5,8 s (cruza la pista en 4 s: con 2,5 no se alcanzaba a apreciar) y **se repite mientras la banda está a la vista**. Cada vuelta termina con el robot **entero fuera de la pantalla** (`laneX` y `clearFor`: a una distancia del borde igual al radio del barrido del LiDAR, que es lo que más sobresale), así la pausa entre vueltas y el regreso por la derecha no se ven; robot y conos usan la misma cuenta.

**Atada a la banda:**
* Arranca **apenas el borde superior de la banda entra a la pantalla** (`START_AT`): mientras se vea algo de la pista, el robot ya está andando sobre su carril y los conos ya están puestos; nunca aparecen de la nada. (Se probó arrancar cuando el carril llegaba al 92% de la pantalla, para que se viera la entrada del robot, pero con el carril cerca del borde de abajo la pista se veía vacía.) Robot y conos van **siempre sobre el carril real** y suben con la banda: antes, mientras la banda entraba, el robot se adelantaba al borde inferior de la pantalla y se achicaba, y se veía flotando muy arriba de la pista.
* Los conos son **fijos**: siempre en el mismo lugar del carril mientras la pista está a la vista, sin aparecer ni desaparecer con cada vuelta.
* Si se sigue scrolleando, el robot se va con la banda (nada queda flotando en pantalla). Al salir por arriba (`END_AT`) la escena queda en pausa y sigue donde estaba si se vuelve; solo se descarta y arranca de cero cuando la banda sale por completo por abajo (`RESET_AT`).
* **Dwell:** durante la primera vuelta la rueda rinde el 40% (`DWELL_SPEED`, `setWheelSpeed` en `smooth-scroll.ts`), para que alcance a verse sin tomar el control del scroll; después vuelve a la normal. No afecta al táctil (Lenis no lo intercepta, `syncTouch` apagado).
* Render: luz de estudio generada en el cliente (`RoomEnvironment`, `environmentIntensity` 0.3: más alto vuelve rosa el carmesí del chasis), sombra de contacto suave, la torreta del LiDAR gira siempre, la cámara cabecea y **las ruedas giran según lo que avanza el robot** (`groupWheels`: en el CAD cada rueda mecanum son 37 piezas `wheel_*`; los cuerpos son las cuatro con más vértices y cada pieza va con el más cercano; el ángulo es lo avanzado hacia adelante en el sistema del robot dividido por el radio de la rueda en pantalla, así frenan cuando se detiene y no patinan). Se probó un giro visual al 35% del real para evitar el efecto de rueda de carreta y se eligió el físico. El canvas se dibuja hasta al doble de la resolución de la pantalla (`dpr` hasta 2): con el robot más chico, a 1,5 se perdían los lentes y sensores. Del LiDAR gira **solo la torreta**, como en el RPLIDAR real: en el CAD `lidar_sensor` es una sola malla, y `splitLidarTurret` (en `SeamRobot`) la parte en piezas conectadas al cargar; el eje es el centro de la tapa (no el del sensor entero, que incluye la pestaña del motor) y la base, el motor, la polea y la correa quedan quietos.
* Con movimiento reducido el robot queda quieto sobre la pista, con los conos, mientras la banda está a la vista.
* El hover sobre la pista no acelera nada. La banda mide `md:h-[520px]`.

### La cuenta regresiva como tablero (`FlapDigit`)
Cada dígito de `CountdownStrip` es una solapa de tablero split-flap, hecha a mano con GSAP (sin librería de componentes):
* Tres capas por dígito: la mitad de arriba ya con el número nuevo, la de abajo todavía con el viejo, y una solapa que gira 180° sobre la bisagra (`rotateX` con `backface-visibility`): por delante la mitad de arriba vieja, por detrás la de abajo nueva. Cae en dos tramos: `power2.in` hasta quedar de canto (0,3 s) y `power2.out` hasta apoyarse (0,32 s), unos 0,6 s en total y sin rebote. El dueño eligió este ritmo entre cinco variantes (la rápida con rebote de ~0,33 s, esta, y tres con sombra oscura o con el número nuevo apareciendo pasada la mitad).
* La bisagra es una línea de 1px del color de la celda (`--flap-seam`: `#0e0407` en las oscuras y `var(--crimson)` en la de segundos), así que **cada celda nueva que se agregue tiene que definirla** o la línea se ve de otro color.
* Sin giro la primera vez (de `--` a la cifra) ni con `prefers-reduced-motion` (el número cambia de golpe). Cada dígito sigue en una caja de `0.5em`, porque Anton no tiene cifras tabulares.
* Las mitades son **placas opacas** con el fondo de la celda (`--flap-seam`): la de adelante tapa a la de atrás. Se recortan al 50% (`clip-path`) y sobresalen un 8% arriba y abajo porque en Anton las cifras miden ~0,88em de alto y la caja 0,85em (a lo ancho entran: ~0,47em de 0,5em).
* **Sombras atadas al ángulo de la solapa** (`onUpdate` de la línea de tiempo): la solapa se apaga al ponerse de canto, y la mitad nueva de arriba sale de la sombra a medida que queda destapada. La sombra es una capa del color de la celda que apaga la cifra (no oscurece la placa, así no aparece un recuadro).
* **Quieta, la solapa se esconde** y la mitad de abajo cambia al número nuevo en el mismo cuadro (`flushSync`). La solapa tiene `will-change: transform` para no cambiar de nitidez al arrancar.
* Se verificó con el reloj de Playwright (`page.clock`) y cuadros intermedios; el ritmo real, con la rueda y en vivo, lo juzga el dueño.

### Scroll suave (Lenis)
`SmoothScrollProvider` (en el layout) crea la instancia; el resto de la app pasa por `scrollToTarget` (`src/lib/smooth-scroll.ts`), que cae al scroll nativo si Lenis no está activo. No colgar la instancia de `window`. `allowNestedScroll` evita que Lenis trabe el modal de `/talks` y los paneles de `/admin`, y `html.lenis { scroll-behavior: auto }` evita que compita con el `scroll-behavior: smooth` nativo. Se desactiva con `prefers-reduced-motion` y en `/perfil` (el provider no crea la instancia ahí: el formulario cambia de alto seguido y la inercia hace perder el cambio).

### Lo que el dueño aprobó (conservar)
* El carrusel con su luz ambiental ("tono metálico con luz") y en Syne; si algún día se cambia, se pasa **solo** a Anton y no se mezclan.
* La convocatoria en el oscuro de marca `#0e0407` con rosa `#f0357f`, igual que la cuenta regresiva y `/talks`.
* La pista del Rosmaster oscura y pegada a la cuenta regresiva (antes era una banda blanca aparte).
* Cuenta regresiva en Anton, celdas de 1px, segundos en carmesí macizo, con los dígitos como solapas de tablero mecánico (el dueño aprobó el prototipo y lo pidió como valor por defecto).
* Las curvas "con onda" en las dos uniones del tramo oscuro y el borde almenado: "me gustó el vibe, pero no abusar".
* El Rosmaster como personaje de la página, siempre que no repita el mismo movimiento.

### Rechazado (no reintroducir)
* **Orbes de luz y el shader de fondo** (`ShaderGradientBg`, eliminado), salvo la luz ambiental del carrusel, que se conserva.
* **Bandas de color de fondo** y `rounded-card` en la landing.
* **Curvas en todas las uniones**: se probó (seis colinas seguidas) y se pidió variar.
* **Titulares que se "leen" con el scroll** (cada palabra pasa de tenue a plena, como Slush): con poco recorrido casi no se notaba y con más obligaba a scrollear para ver las últimas palabras. Se probó en tres titulares y se revirtió.
* **Escenas del robot en las colinas y en las almenas** (asomarse, saludar, salto con vuelta): se hicieron cuatro y se dejó solo el slalom. Con la unión pegada a la página cada escena tenía unos 2 s a velocidad normal, y la colina del salto queda a unos 190 px de la pista, así que casi nunca se veía completa. Antes de reponerlas, resolver ese espacio (ver "Trampas").
* **Que el robot se suelte de su sección** y siga fijo en pantalla si se sigue scrolleando: se probó y se rechazó, el robot tiene que irse con su sección.
* **El robot cruzando siempre de izquierda a derecha** en distintos tamaños ("siempre repetimos el mismo patrón") y **demasiado rápido**: tiene que verse como una mascota que se asoma y juega, no como algo que pasa corriendo. También se probó una escena donde caía desde arriba rebotando; se cambió por asomarse sobre las almenas.
* **Anton en el carrusel**: probado lado a lado con Syne y se prefirió Syne por ahora.
* Los vinos fuera de paleta en la convocatoria (`#520b2f` de fondo y `#ff4d8d` de acento). Los del carrusel (`#440924`, `#520b2f`…) se dejan: son parte de su tono.
* Los stickers de `public/stickers` en la landing: varios (robot verde, átomo azul y violeta, píxel art) no están en la paleta.
* Numeración o índice visible entre secciones: la conexión tiene que ser invisible.
* **Librerías de componentes** (Componentry, Space UI, Skecher UI, Planes, Arc UI): se revisaron y no se adoptan. Son registros estilo shadcn con Motion (el repo no tiene shadcn ni Motion y ya usa GSAP) y buena parte de lo que traen está prohibido acá: fondos con shaders, glass, formas redondeadas o squircle, cintas de texto, revelado de titulares por palabra y emojis. Sirvieron de idea, no de código: el cambio de tema en círculo y el tablero de la cuenta regresiva salieron de ahí y se hicieron a mano. Planes es de pago. Para `/eventos`, `/admin` o `/talks` podrían servir piezas sueltas (selector de rango de fechas, paleta de comandos, lightbox); revisar licencia y sumar dependencias solo con acuerdo del dueño.
* **Punto de estado pulsante** antes de "Convocatoria abierta" (`ConvocatoriaBand`): se probó (punto rosa con anillo que pulsa) y el dueño no lo quiso.

### Trampas conocidas
* **Syne en mayúscula es muy ancha**: una palabra larga corta el título o ensancha toda la página en mobile. Medir `scrollWidth - innerWidth` de 320 a 1920px y el ancho de cada palabra del carrusel, no solo la primera.
* **Acentos con interlineado apretado**: en Anton con `leading-[0.92]` el acento de la É de "SÉ" pisaba la A de "UNA" de la línea de arriba. Usar `1.04` en frases con tildes.
* **Títulos de `ActivityPanel` con palabras largas** ("DESBLOQUEANDO"): sin permitir el corte de palabra ensanchaban la página en mobile.
* **Tailwind descarta `calc()` sin espacios**: `pb-[calc(var(--edge-h)+2rem)]` no aplica nada (sin error). Escribirlo con guiones bajos: `pb-[calc(var(--edge-h)_+_2rem)]`.
* **La colina del carrusel no puede ser una pieza aparte**: con un `SectionEdge` (SVG) arriba de la sección, la colina y la sección hacen cada una su transición de color de 700 ms y no van exactamente juntas: a mitad del cambio la colina queda con el color anterior y se ve la unión. Además los resplandores aclaraban la sección justo debajo del borde (hasta 38/255 de diferencia), y hubo que desvanecerlos con una máscara. Por eso la colina es la propia sección recortada (`useEdgeClip`): un solo fondo, sin línea posible, y los resplandores ya no necesitan máscara. Medido en cámara lenta ×4 (`Animation.setPlaybackRate` de DevTools): diferencia 0 entre un píxel 15 px arriba y uno 12 px abajo de la vieja unión durante todo el cambio. La forma se comparó columna a columna contra la versión con SVG: 1 px de diferencia como máximo (el suavizado del borde).
* **Las mitades de la solapa transparentes muestran dos números a la vez**: con el número nuevo apoyado se ve el viejo debajo, y con una perspectiva fuerte (`0.9em`) la solapa de canto se agranda y se sale de la caja. Placas opacas y `perspective: 4em`.
* **Detrás de una solapa que cae siempre se destapa algo del número nuevo**: sin sombra, su trazo de arriba (la barra del 7 o del 5) aparece de golpe a pleno brillo, como una barra arriba del número viejo. Se ve en Chrome real y no en las capturas a 60 cuadros por segundo: grabar la pantalla o capturar a 240 con `page.clock`.
* **Una solapa en 3D se dibuja más blanda que el texto plano**: si queda apoyada a la vista, la mitad de abajo del número queda más borrosa que la de arriba hasta el próximo cambio.
* **Las curvas tapan lo que esté cerca del borde**: dejar `--edge-h` de padding inferior en la sección de arriba y subir los puntos del carrusel si hay curva debajo.
* **Una animación atada al scroll (scrub) corre a la velocidad con que se scrollea**: un barrido rápido la reproduce en una fracción de segundo y alargar las ventanas no lo arregla. Por eso las escenas del robot usan un reloj propio (GSAP) y no scrub.
* **Con reloj propio y la escena pegada a su sección, la escena solo se ve entera si la sección se queda en pantalla el tiempo suficiente** (unos 750 px de scroll por sección): de ahí el dwell de la rueda. Si se agregan escenas, dejar entre ellas distancia de sobra o resolver el turno (con un solo robot, la que empezó antes gana).
* **No adelantar el robot al borde de la pantalla**: si se lo sube para que se vea antes de que entre la pista, queda flotando sobre la nada. Va siempre sobre el carril; lo que se ajusta es cuándo arranca la vuelta (`START_AT`, medido en el carril).
* **Con el reductor de movimiento del compilador de React** (`react-hooks/immutability`), el estado de una escena se mueve desde GSAP y se lee en `useFrame`; mutar valores que vienen de hooks o props dentro del componente falla el lint (usar refs, `onCreated` o funciones fuera del componente).
* **`next dev` guarda un candado en `.next/dev/lock`**: si se mata el servidor a medias, borrarlo antes de volver a levantarlo.
* En capturas, esperar a `document.fonts.ready` y ocultar `nextjs-portal`. El canvas del robot necesita WebGL (en Playwright headless: `--use-gl=swiftshader --enable-unsafe-swiftshader`).

### Pendientes
* El dwell no funciona en táctil: en el teléfono el slalom pasa a la velocidad del dedo. Evaluar `syncTouch` de Lenis (cambia el tacto del scroll en toda la página).
* El brazo robótico del hero sigue pendiente de su pasada propia.
* La sección 8 todavía dice que "la landing conserva `rounded-card`" (línea de "Forma"): quedó vieja desde la decisión de la sección 11.
* Abrir el PR contra `main` cuando el dueño lo apruebe.

---

## 12. Barra de navegación (`Nav.tsx`) y toggle de tema

### Comportamiento
* **Landing (`/`)**: la barra aparece recién al pasar el umbral de scroll (`min(35% del alto de la ventana, 260 px)`) o con "Entrar al club" (evento `air-enter-club`), y después no se esconde.
* **Corte de la hamburguesa en `lg` (1024 px)**: con los seis enlaces, entre 768 y ~840 px "AIR Talks" y "AIR Club" se partían en dos líneas (se midió 48 px de alto contra 28). Desde 1024 la barra entra en una línea con margen; si se suma un enlace, medir de nuevo de 768 a 1280 px.
* **Resto de las páginas**: se esconde al bajar y reaparece apenas se sube 4 px. Siempre se ve a menos de 80 px del tope, con el menú mobile abierto o con foco de teclado adentro. Transición de 200 ms, sin animación con `prefers-reduced-motion`.
* **Toggle de tema** (`ThemeToggle.tsx`): vive en la píldora, a la izquierda del botón de cuenta (en mobile, al lado de la hamburguesa). Es un parche de contraste (círculo con una mitad rellena, como el de densidad de una prueba de imprenta) del mismo tamaño que el botón de cuenta (32 px, anillo de 1 px). Al cambiar de tema la mitad rellena gira 180°. El giro sale de la clase `dark` y no del estado de React, así no se anima al cargar con el tema oscuro guardado. **El tema nuevo se abre como un círculo desde el botón** (View Transitions API, `document.startViewTransition`, recorte `circle()` de 520 ms con `--ease-club`): en `globals.css` se apaga el fundido por defecto de `::view-transition-old/new(root)` para que solo se vea el recorte. Sin soporte del navegador o con movimiento reducido el cambio es instantáneo.

### Rechazado (no reintroducir)
* El botón flotante con emojis (🌙 / ☀️) y `hover:scale-110`.
* Sol y luna de `lucide-react`: obligan a pensar si el ícono muestra el tema actual o el que viene.
* Halo alrededor del toggle (luz en oscuro, sombra en claro): se probó y no se eligió.

### Pendiente
* El dueño no estaba del todo conforme con el toggle (el ícono); el círculo que se abre mejora cómo se siente el cambio, pero el ícono sigue siendo lo mejor que se encontró por ahora. Se puede cambiar si aparece una idea mejor.
* La transición de tema se probó solo en Chromium; falta mirarla en Safari y Firefox.

### Trampas conocidas
* **`focus-within` traba la barra**: al hacer clic en un link de la barra el foco queda en él, y como Next navega sin recargar, en la página nueva la barra seguía "con foco" y no se escondía hasta recargar. Por eso la condición es `has-[:focus-visible]` (solo foco de teclado).

---

## 13. Workshops (`/workshops`): decisiones y mapa

Mismo lenguaje recto que `/talks`, `/equipo` y `/contacto`: paneles con contorno de 1px, botones píldora, bandas `bg`/`bg2` alternadas y cierre en banda oscura fija.

### Idea rectora: tres niveles, y en cada uno el orden es el diseño
| Nivel | URL | Qué muestra |
| :--- | :--- | :--- |
| Página general | `/workshops` | Hero, después los **próximos talleres** presenciales de todos los workshops (lo que tiene fecha y botón para inscribirse, bien a la vista: pedido del dueño) y debajo **una caja por workshop en mosaico** (casi cuadradas, tres por fila en escritorio, dos en tablet, una en celular; con dos workshops, dos columnas), en orden: 01 Linux, 02 ROS 2 y robótica… Mientras no haya ninguna fecha, "Próximos talleres" va **debajo** del mosaico. |
| Workshop | `/workshops/<workshop>` | Número de orden en Anton, título y resumen; adentro, sus talleres (la ruta de guías de ROS 2). Si tiene un solo taller y no tiene guías (Linux), la caja lleva directo al taller y esta página se saltea. |
| Taller | `/workshops/<workshop>/<taller>` | Solo ese taller. Una guía: de qué se trata, qué te llevás, comandos, datos, guía y código, anterior y siguiente, y el panel para marcarlo como hecho. Un presencial que ya pasó: el formato del detalle de una charla de `/talks` (ver abajo). "Volver" lleva a su caja en el workshop, o a `/workshops` si la página del workshop se salteó. |

* **Pedidos del dueño (2026-10-12):** la página general muestra solo las cajas de los workshops, no todo el contenido de cada uno, y en mosaico (no tiras a todo el ancho) para que entren más; el orden lo da el número en Anton de cada caja. El texto del hero es general para todos los workshops (no habla de ROS 2). Linux va primero porque es lo inicial, después ROS 2. El orden de las cajas es el del panel (`/admin/workshops`); un workshop nuevo se carga ahí, sin tocar código (su clave va en la URL: el panel no deja cambiarla). Los talleres-evento sin `track` caen en una caja "Otros talleres" (`/workshops/otros`; por eso la clave `otros` está reservada).
* **Review del PR #64 (2026-10-13):** título "WORK" en `text` y "SHOPS" en carmesí, como `EVEN<span>TOS</span>` en `EventsHero.tsx`. Debajo, un párrafo corto (qué es un workshop y cómo se entra), no la frase en Syne de antes. Sin rótulo mono arriba del título en la página del workshop ni en la del taller: el número grande con el título alcanza (la nota "Challenge JAR 2026" queda en la caja). La leyenda de niveles va pegada a la ruta, con sus cuadrados en la columna de los nodos.
* Adentro de un workshop, el recorrido asincrónico es una **ruta**: una línea vertical de 1px con un nodo cuadrado por semana y el número en Anton (`01`, `02`…), igual que la fecha en `/talks`. El **relleno del nodo dice el nivel**: vacío = inicial, medio = intermedio, macizo = avanzado. "Requiere 03 · 04" enlaza a las semanas previas (`#semana-NN`).

### Recorrido de cada persona (learning path)
* Con sesión @udesa.edu.ar, cada persona marca un taller como hecho desde su página (y lo puede desmarcar).
* **Colores del progreso (pedido del dueño), iguales en los dos niveles:** lo hecho pasa a **gris claro** (contorno tenue, número y texto apagados, sello "Hecho" o "Completo") y lo primero que falta va en **carmesí macizo** con el sello "Seguí acá"; sin nada hecho, "Empezá acá". En las cajas, un workshop está completo cuando hizo todos sus talleres; en la ruta, "el primero que falta" va por orden, no por prerequisitos (`routeStates` y `trackStates` en `src/lib/workshop-progress.ts`, compartidos con el perfil).
* Cada caja del mosaico y la intro de la ruta muestran la cifra en Anton (`01/09`) y un casillero por taller (gris = hecho, carmesí = siguiente, contorno = pendiente); sin sesión, invitación a ingresar.
* **Mientras carga** la sesión o el progreso, ni la ruta ni las cajas destacan nada (todas con contorno): antes se veía la 01 en carmesí, como sin sesión, y después saltaba al progreso real.
* **Sellos "Hecho" y "Completo"** en `text2`, no en `text3`: sobre el lienzo `text3` da 3,5:1 en claro y 4,3:1 en oscuro (no llega al AA de 4,5:1) y se leía como deshabilitado; `text2` da 9,1:1 y 7,9:1. El resto de la tarjeta hecha sigue en gris claro (`text3`), como pidió el dueño.

### Talleres presenciales que ya pasaron: el formato de una charla
Pedido del review: no inventar un formato nuevo, reutilizar el de `/talks`. La página del taller lleva su número en Anton (orden cronológico dentro del workshop: el primero que se hizo es el 01, igual que el número de semana de una guía; la fecha gigante se probó y el dueño la descartó porque no dice nada del taller) y, debajo, las mismas piezas que el detalle de una charla: el slideshow de fotos (`TalkSlideshow`) y las pestañas **Resumen / Diapositivas / Video**, solo las que tienen algo (`TalkTabs`, `TalkSlides`, `TalkRecording` y `TalkLinks` en `src/components/talks/TalkMaterial.tsx`, que también usa `TalkModal`). Sin fotos, la trama diagonal. Al costado, el panel para marcarlo como hecho y la fecha, el lugar y quién lo dio. Se cargan desde el panel: fotos y videos, diapositivas (Google Slides o Canva incrustados; de Canva, el link de solo lectura con `?embed`, nunca el de edición), grabación de YouTube y links. Tiene **dos textos**, como una charla (subtítulo y resumen): un **resumen corto** para su tarjeta adentro del workshop y **"qué se vio"** para la pestaña Resumen de su página; si no hay "qué se vio", la página muestra el resumen corto. Antes era un solo texto y la tarjeta repetía, larga, lo mismo que la página. El de Linux sigue el orden de sus diapositivas, sin agregar nada que no esté en ellas.
* **Perfil → Aprendizaje** (`/perfil/aprendizaje`, pestañas "Datos" / "Aprendizaje" en `PerfilTabs`): **solo los workshops donde la persona hizo algo** (pedido del dueño: no todos los que existen), cada uno como una tarjeta **plegada** (`<details>`) con el título y el conteo (`03/09`). Al desplegarla: los talleres que hizo con la fecha en que los marcó, "Seguí con…" y "Ver el workshop". Los talleres que le faltan no se listan acá: se ven entrando al workshop. También en el menú de la cuenta ("Mi aprendizaje").
* Datos: tabla `WorkshopCompletion` (email + slug del taller, sin clave foránea porque los talleres no viven en la base). Server actions en `src/app/workshops/progress-actions.ts`; el progreso se pide desde el cliente (`WorkshopProgress.tsx`) para que las tres páginas sigan siendo estáticas (ISR), igual que la inscripción en `/talks`.

### Cómo se carga un workshop: tres casos
Criterio del club (#69). Los tres se cargan desde `/admin/workshops`, sin tocar código:

| Workshop | Cómo se carga |
| :--- | :--- |
| **Presencial** | Taller presencial con lo que se haya preparado: diapositivas, fotos, videos, grabación, links, resumen corto y "qué se vio" (como Linux). |
| **Asincrónico con página externa** | Guías en tarjetas, como la ruta de ROS 2 (semana, título, qué te llevás, duración, nivel, requisitos), con el botón a la guía completa en su sitio. |
| **Asincrónico sin página externa** | Las mismas tarjetas, con la guía armada adentro del sitio con bloques (ver abajo). |

No se arma una guía con bloques para repetir lo que ya está en las diapositivas de un presencial: se probó con la postinstalación de Linux y se descartó por duplicada.

### Guías con contenido propio (#69)
Una guía puede vivir en otro sitio (las del JAR: link a `jar_site` y código en `jar_workshops`), dentro de este, o las dos cosas. El contenido propio se arma en `/admin/workshops` con **bloques** (decisión de #69, en lugar de Markdown o de traerlo de `jar_site`): subtítulo, texto, pasos, código, imagen, aviso y checkpoint. Cada bloque se dibuja con componentes del sitio (`GuideContent.tsx`), así quien carga no decide nada de diseño:
* **Pasos**: numerales en Anton carmesí (`01`, `02`…) entre líneas de 1px, como el orden en el resto de `/workshops`.
* **Código**: el bloque oscuro fijo de `SetupBlock`; en bash, comandos en rosa y comentarios apagados. Sin resaltado de sintaxis para otros lenguajes.
* **Aviso**: "Ojo" con contorno carmesí, o "Dato" sobre `bg2`. **Checkpoint**: contorno de 1px y "Si ves esto, vas bien".
* **Texto**: solo `` `código` ``, `**negrita**` y `[enlace](url)` (`src/lib/guide-blocks.ts`); nunca HTML cargado a mano.
* Con contenido propio, el panel de "Marcar como hecho" acompaña el scroll en escritorio (`lg:sticky`). El progreso sigue siendo por guía entera.
* Las imágenes van al bucket (`workshops/`) o a `public/`: una de otro sitio no pasa la validación, porque `next/image` no la mostraría.

### Estructura y archivos
1. `src/app/workshops/page.tsx`, de arriba hacia abajo: `WorkshopsHero.tsx` (título "WORKSHOPS" en Anton a dos tonos, párrafo corto, "02 workshops · 10 talleres", "Empezar por el 01"), `UpcomingWorkshops.tsx` sobre `bg-bg2` (eventos de categoría `workshop`; sin ninguno, panel con trama "Todavía no hay fecha", y va después del mosaico), `TrackBoxes.tsx` (el mosaico) y `ProposeWorkshop.tsx` (banda oscura con el motivo `workshop` de `src/lib/contact.ts`).
2. `src/app/workshops/[track]/page.tsx`: la página de un workshop. Adentro, `TrackBody.tsx`: `GuideRoute.tsx` (intro, progreso `RouteProgress.tsx`, bloque de código oscuro fijo y las cajas de `RouteSteps.tsx`) si tiene guías, y `PastWorkshopList` (`PastWorkshops.tsx`: tarjeta líder + módulos, o un panel horizontal si hay uno solo; foto a color o trama diagonal) si tiene talleres presenciales pasados. Si tiene fechas próximas, también `UpcomingWorkshops`.
3. `src/app/workshops/[track]/[slug]/page.tsx`: la página de un taller (`CompletionPanel.tsx` para marcarlo; `SessionMaterial.tsx` para el material de un presencial).
4. Datos: tablas `WorkshopTrack`, `WorkshopGuide` y `WorkshopSession` (con sus fotos, diapositivas y links), editadas desde `/admin/workshops` y leídas por `src/lib/workshops.ts` con respaldo a `prisma/seed-data/workshops.ts` si no hay base, como `src/lib/talks.ts`. Las URLs salen de `src/lib/workshop-href.ts` (`trackHref`, `workshopHref`), que los componentes cliente importan de ahí porque `workshops.ts` trae Prisma. La guía completa vive en el sitio del JAR y el código en `jar_workshops`: acá solo va lo que hace falta para presentarlas. Si cambia el frontmatter de una guía en `jar_site`, actualizarla en el panel.

### Trampas conocidas
* **El número en Anton tapa el enlace de volver**: con `leading-[0.8]` su caja sube por encima de la letra, y sin el rótulo mono que había entre los dos se comía el clic de "Todos los workshops" y del "volver" de cada taller. El enlace lleva `relative z-10`.
* Las cajas del mosaico son cuadradas solo desde `lg`, y el cuadrado es un **mínimo**: la grilla usa `@container` y `auto-rows-[minmax(calc((100cqw_-_1.5rem)/3),auto)]`, así cada fila mide al menos un tercio del ancho y crece si el contenido no entra (las cajas de la fila crecen juntas). No usar `aspect-square` en la caja: con `h-full` deja el alto fijo y, con sesión, la fila de progreso empuja "Ver workshop" afuera (pasaba a ~1300 px). Más angostas llevan `min-h` y el resumen se corta a tres líneas (`line-clamp-3`).
* La URL del `git clone` no entra en mobile: el `<pre>` scrollea de costado dentro de un contenedor `min-w-0`; sin eso ensancha toda la página.
* En oscuro, el bloque de código (`#0e0407`) casi se funde con `bg2` (`#16070b`): por eso lleva contorno de 1px.
* El progreso se pide en el cliente: mientras carga, la ruta y las cajas quedan neutras y después se acomodan. Si la consulta falla, sigue sin progreso en vez de quedarse cargando.
* Un componente cliente que importe un valor de `src/lib/workshops.ts` arrastra Prisma (y `pg`) al navegador y el build falla con "module not found": importar las URLs de `workshop-href.ts` y de `workshops.ts` solo tipos.
* Pesos que no se cargan: JetBrains Mono se carga hasta 500 y Syne llega a 800, pero el sitio usa `font-semibold` en mono y `font-black` en Syne (acá y en el resto de las páginas): el navegador los simula. Si se corrige, que sea en todo el sitio a la vez (`layout.tsx`).

### Pendientes
* Después de mergear la migración `20261015120000_add_workshop_content`, correr `npm run db:seed` una vez contra la base: crea los workshops, las guías y el taller de Linux (sin eso, `/workshops` queda vacío hasta cargarlos a mano en el panel).
* No hay talleres presenciales con fecha cargados: los paneles de "Próximos talleres" y los pasados con foto se probaron con eventos de prueba, no con datos reales.
* Inscripción a talleres presenciales: el dueño decidió que un presencial se marque solo cuando termina, si la persona se inscribió. Falta construir la inscripción (hoy solo hay un enlace externo en `events.ts`).
