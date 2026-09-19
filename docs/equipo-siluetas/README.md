# Siluetas interactivas en /equipo: versión 1 (solo Francesca)

Snapshot del estado del efecto al 2026-09-19, guardado porque la foto grupal (`public/equipo.jpg`) va a cambiar esta semana.

## Qué muestra el video

`demo-silueta-francesca.mp4` (15 s) es una grabación de pantalla de `localhost:3000/equipo`. Al pasar el mouse por el nombre de
Francesca Ragonesi, ella se "enciende" en la foto y el resto se oscurece. También funciona al revés: pasar el mouse por
ella en la foto enciende su nombre.

- `.mp4`: versión para mandar por WhatsApp (H.264 + AAC, sin recodificar la imagen).
- `.mkv`: grabación original.

## Cómo funciona

Código en `src/components/equipo/FoundersShowcase.tsx`; los datos en `prisma/seed-data/team.ts` (campo `silhouette`).

1. La persona se recortó a mano de `equipo.jpg` y quedó como un PNG/WebP con transparencia
   (`public/equipo/silueta-francesca-ragonesi.webp`, 231x449 px).
2. `silhouette.box` dice dónde va ese recorte, en píxeles de la foto original (960x1280). Se dibuja encima de la foto
   con posición en porcentajes.
3. Encima de todo hay un velo oscuro (opacity 0.78) que aparece cuando hay alguien activo. El recorte queda por arriba
   del velo, con un `drop-shadow` rosado.
4. Para saber si el mouse está sobre la persona, se lee el canal alfa del recorte en un `<canvas>` oculto y se consulta el
   píxel bajo el cursor (más 4 vecinos a ±4 px para que los bordes no parpadeen). Umbral: alfa > 60.
5. `fadeBottom` desvanece el borde inferior del recorte cuando otra persona la tapa por abajo (en Francesca, 22 %).

## Limitaciones de esta versión

- Solo Francesca tiene silueta; los otros 6 nombres no son interactivos.
- El recorte es manual y la máscara es aproximada (bordes duros, sin pelo fino).
- Las coordenadas están pegadas a `equipo.jpg` de 960x1280. Si cambia la foto, hay que rehacer todos los recortes y `box`.
- El campo `silhouette` no existe todavía en la tabla `TeamMember` de Postgres (hoy solo está en el seed).

## Cómo mejorar la segmentación de cada persona

Orden sugerido, de más impacto a menos:

1. **Usar un modelo de segmentación en vez de recortar a mano.** Correr **SAM 2** (Segment Anything) o `rembg` /
   **BiRefNet** / **RMBG-2.0** sobre la foto nueva, con un punto o caja por persona como prompt. Da bordes mucho más limpios,
   incluido el pelo. Es un script offline: `scripts/segmentar-equipo.py` que lee las cajas y escribe un WebP por persona.
2. **Una máscara por persona, no un recorte suelto.** Con SAM 2 cada persona sale como su propia máscara, así se resuelven
   solos los solapamientos (los que se abrazan, los robots en las manos, la gente sentada adelante). Hoy `fadeBottom` es
   un parche para eso.
3. **Suavizar el borde (feather).** Aplicar un desenfoque gaussiano de 1 a 2 px al canal alfa y eliminar píxeles sueltos
   (morfología: apertura y cierre). Evita el efecto "pegatina" y los halos de color del fondo.
4. **Descontaminar el color del borde** (color decontamination / matting). Un modelo de matting (ViTMatte o el propio
   BiRefNet) da alfa parcial en el pelo y evita el halo claro.
5. **Decidir qué es "la persona".** Definir si incluye o no el robot que sostiene. Para el hover conviene incluirlo:
   se ve más natural que la persona sola con las manos vacías.
6. **Foto nueva pensada para esto.** Fondo lo más liso y contrastante posible, luz pareja, y poca superposición
   entre personas (unos 10 cm de aire entre cada una). Hace que cualquier método funcione mejor.
7. **Detección de hover más robusta.** En vez de leer un canvas por persona, generar un único mapa de etiquetas (PNG donde
   cada píxel guarda el índice de la persona). Es una lectura por evento en lugar de N, y desaparece la lógica de vecinos.
8. **Automatizar los datos.** Que el script escriba también `box` y el `silhouette` en `team.ts`, o mejor, guardar las
   máscaras en Postgres (columna nueva en `TeamMember`) para no rehacer nada a mano cuando cambie la foto.
9. **Rendimiento.** Servir las siluetas como WebP chicos (ya lo son) y precalentar el canvas solo cuando la foto entra
   en pantalla.
10. **Accesibilidad.** Las siluetas hoy son `aria-hidden` y la interacción es solo visual; los nombres ya son
    focuseables con teclado, lo que está bien. Falta respetar `prefers-reduced-motion` en la transición de 500 ms.
