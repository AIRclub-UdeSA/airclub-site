# DESIGN.md — AIR Club UdeSA Visual Design System

Este documento define las reglas de diseño, tokens visuales, jerarquías tipográficas, principios de movimiento y anti-patrones prohibidos para el sitio web de **AIR Club UdeSA**.

Cualquier persona o agente de IA que diseñe o modifique páginas y componentes en este repositorio **debe seguir estas reglas sin excepción** para mantener la consistencia y evitar caer en patrones genéricos ("vibecoding").

---

## 0. Identidad & Misión Visual

* **Propósito**: "Necesitamos que la gente entre al sitio y quiera sumarse". El sitio es la vitrina del club de robótica e inteligencia artificial más ambicioso de San Andrés, organizador del Challenge JAR 2026.
* **Estética declarada**: **Póster de Marca / Afiche de Ingeniería**. El sitio debe sentirse diseñado con rigor editorial y arquitectónico (a la altura de referentes como *Caldera*, *Flying Papers* o *Slush*), no como una plantilla SaaS común.
* **El Activo Intocable**: **El brazo robótico del hero (`ArmHero.tsx`) es el activo más fuerte del sitio**. Es una animación SVG articulada que arma el logo "AIR" en vivo al scrollear. Cualquier rediseño se construye alrededor de él, **nunca en lugar de él**.

---

## 1. Las Tres Perillas de Configuración (The Three Dials)

Para todo desarrollo visual nuevo en el sitio, fijamos estas tres perillas (escala 1 a 10):

| Perilla | Valor | Significado en AIR Club |
| :--- | :---: | :--- |
| **`DESIGN_VARIANCE`** | **8 / 10** | **Asimetría editorial y afiche gráfico**. Se evitan las grillas uniformes o predecibles; se combinan escalas monumentales con módulos de densidad variada. |
| **`MOTION_INTENSITY`** | **6 / 10** | **Cinemática física enfocada**. Movimiento rápido, seco y con masa tangible. Se reserva la mayor expresividad para el brazo SVG y el CAD. |
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
* **Jhey Tompkins (Sensación Táctil / Mecánica)**: El movimiento cinético se reserva exclusivamente para los artefactos de laboratorio: el brazo robótico articulado al scrollear y el CAD del Rosmaster.

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
5. **Eje Temporal con Nodo ("HOY")**:
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
* ❌ **Divisores decorativos entre secciones** (reglas de vernier, cintas de texto, dibujos de circuito): todos se probaron en `/talks` y se descartaron, ver sección 8. Las secciones se separan con bandas de color a todo el ancho.
* ❌ **Hardcodear datos dentro de los componentes**: Todo contenido estructurado debe residir en `prisma/seed-data/*.ts` y consumirse a través de `src/lib/*.ts`, preparado para su migración a Supabase.

---

## 7. Checklist Pre-Commit para Colaboradores y Agentes

Antes de proponer cualquier PR contra `v2`:

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

Mismo lenguaje recto que `/talks`, `/equipo` y `/contacto` (secciones 8 a 10). `rounded-card` queda descartado también acá ("vibecoded 101").

### Idea rectora
La landing es una pila de bandas rectas a todo el ancho, con contorno de 1px, sin sombras y con botones píldora. **El fondo no cambia** (lienzo, alternando con `bg-bg2`): el color va en lo de arriba. Las únicas bandas oscuras son las que ya lo eran por contenido: el carrusel y la banda de cuenta regresiva.

### Estructura y archivos
1. `AboutSection.tsx`: manifiesto "Construir. Competir. En comunidad." en Syne, con "Competir." en carmesí.
2. `WordSlideshow.tsx`: carrusel de palabras en Syne sobre fondo oscuro con luz ambiental. El piso del `clamp` del título es `1.2rem`: la palabra más larga ("COMPETENCIAS", 13,8 em) tiene que caber en 320px.
3. `IdeaCallout.tsx`: "Tengo una idea" como banda recta, frase en Anton con interlineado `1.04`.
4. `CountdownStrip.tsx`: banda oscura de marca; números en Anton dentro de celdas rectas de 1px; los segundos en carmesí macizo, sin punto que pulsa.
5. `RosmasterTrack.tsx`: CAD 3D del Rosmaster sobre grilla rosa. Es el único artefacto cinético de la landing (ver sección 4).
6. `EventsTeaser.tsx`: "Próximas actividades" con el `ActivityPanel` compartido con `/eventos` (`src/components/eventos/ActivityPanel.tsx`) y los mismos datos (`getUnifiedCalendarActivities`), máximo 3. Las cajas cambian de forma según cuántas hay: una sola a todo el ancho; con dos o tres, una grande (7 columnas) y las demás chicas (5 columnas). Debajo, la banda de convocatoria.
7. `ArmHero.tsx`: el brazo robótico del hero. **No se tocó** en esta pasada; tendrá una pasada propia (su animación "le falta poder").

### Lo que el dueño aprobó (conservar)
* El carrusel con su luz ambiental ("tono metálico con luz") y en Syne; si algún día se cambia, se pasa **solo** a Anton y no se mezclan.
* La banda de convocatoria en el oscuro de marca `#0e0407` con rosa `#f0357f`, igual que la cuenta regresiva y `/talks`.
* La banda del Rosmaster como está (decorativa, sin leyenda ni foto).
* Cuenta regresiva en Anton, celdas de 1px, segundos en carmesí macizo.

### Rechazado (no reintroducir)
* **Orbes de luz y el shader de fondo** (`ShaderGradientBg`, eliminado), salvo la luz ambiental del carrusel, que se conserva.
* **Bandas de color de fondo** y `rounded-card` en la landing.
* **Anton en el carrusel**: probado lado a lado con Syne y se prefirió Syne por ahora.
* Los vinos fuera de paleta en la banda de convocatoria (`#520b2f` de fondo y `#ff4d8d` de acento). Los del carrusel (`#440924`, `#520b2f`…) se dejan: son parte de su tono.
* Los stickers de `public/stickers` en la landing: varios (robot verde, átomo azul y violeta, píxel art) no están en la paleta.

### Trampas conocidas
* **Syne en mayúscula es muy ancha**: una palabra larga corta el título o ensancha toda la página en mobile. Medir `scrollWidth - innerWidth` de 320 a 1920px y el ancho de cada palabra del carrusel, no solo la primera.
* **Acentos con interlineado apretado**: en Anton con `leading-[0.92]` el acento de la É de "SÉ" pisaba la A de "UNA" de la línea de arriba. Usar `1.04` en frases con tildes.
* **Títulos de `ActivityPanel` con palabras largas** ("DESBLOQUEANDO"): sin permitir el corte de palabra ensanchaban la página en mobile.
* En capturas, esperar a `document.fonts.ready` y ocultar `nextjs-portal`. El robot de `RosmasterTrack` cruza la pista en bucle, también con `reducedMotion: "reduce"` (la animación no lo respeta): una captura lo agarra en cualquier punto, a veces cortado en el borde. No es un error de encuadre.
