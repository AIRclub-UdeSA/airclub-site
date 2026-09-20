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
1. **Anton (`var(--font-anton)`)**: Reservada para el hero ("AIR"), las letras del brazo robótico y palabras monumentales en mayúsculas sostenidas.
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
   * Radio de borde uniforme: `rounded-card` (`--r-card: 22px`).
3. **`border-trail-hover` (`src/app/globals.css`)**:
   * Borde con destello de luz cónica rotativa que se activa en hover. Comunica interacción sin mover el layout.
4. **Botón Mono Técnico (`Button.tsx`)**:
   * Borde fino, esquinas redondeadas (`rounded-full`), tipografía `font-mono text-[.8rem] uppercase` y flecha `ArrowUpRight` en hover.
5. **Eje Temporal con Nodo ("HOY")**:
   * Línea horizontal en desktop y vertical en mobile que ancla los eventos pasados a la izquierda y los futuros a la derecha.

---

## 6. Anti-Patrones Prohibidos (The Anti-Vibecoding Checklist)

Para no regresar a los patrones mediocres de IA, queda **estrictamente prohibido**:

* ❌ **La "Trilogía Aburrida"**: Prohibido crear secciones con 3 tarjetas idénticas de igual tamaño una al lado de la otra. Usar layouts asimétricos tipo afiche (tarjeta líder + módulos secundarios).
* ❌ **Micro-etiquetas con `//`**: Prohibido anteceder títulos con tags como `// SOBRE NOSOTROS` o pills decorativas innecesarias. El título debe tener peso por sí mismo.
* ❌ **Gradientes Violetas / AI-Purple**: Prohibido el degradé genérico morado/azul estilo "cyberpunk" o "SaaS de 2023". Solo la paleta carmesí/lienzo de AIR Club.
* ❌ **Glassmorphism descontrolado**: Prohibido aplicar `backdrop-blur` y fondos semitransparentes en cada elemento. Solo la barra de navegación y los modales usan blur.
* ❌ **Emojis en lugar de íconos**: Cero emojis para ilustrar conceptos de ingeniería. Usar íconos vectoriales SVG limpios (`lucide-react`) con trazo parejo.
* ❌ **Bloques "Sponsor / Empresa" fuera de la landing**: El bloque de vinculación empresarial pertenece únicamente al final de la portada, no a los footers de subpáginas.
* ❌ **Hardcodear datos dentro de los componentes**: Todo contenido estructurado debe residir en `prisma/seed-data/*.ts` y consumirse a través de `src/lib/*.ts`, preparado para su migración a Supabase.

---

## 7. Checklist Pre-Commit para Colaboradores y Agentes

Antes de proponer cualquier PR contra `v2`:

- [ ] **Idiomas**: Código, commits, documentación y comentarios en **español**.
- [ ] **Sin AI Co-Author**: No incluir trailers `Co-authored-by: ... [bot]` (el CI lo rechaza).
- [ ] **Modo Oscuro**: Todo componente nuevo debe verse perfecto en claro (`--bg: #faf8f8`) y en oscuro (`--bg: #0e0407`).
- [ ] **Pruebas de CI**: Debe pasar localmente `npm run typecheck`, `npm run lint` y `npm run build` sin advertencias.
