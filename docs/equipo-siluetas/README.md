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

1. La persona se recortó de `equipo.jpg` con un modelo de segmentación (SAM, vía `rembg`) guiado por puntos: unos marcan
   "esto es ella" y otros "esto no" (el chico de al lado, la chica sentada). Incluye el robot que sostiene. Después se
   limpió la máscara y quedó como un WebP con transparencia
   (`public/equipo/silueta-francesca-ragonesi.webp`, 231x449 px). El proceso está en `scripts/segmentar-equipo.py`.
2. `silhouette.box` dice dónde va ese recorte, en píxeles de la foto original (960x1280). Se dibuja encima de la foto
   con posición en porcentajes.
3. Encima de todo hay un velo oscuro (opacity 0.78) que aparece cuando hay alguien activo. El recorte queda por arriba
   del velo, con un `drop-shadow` rosado.
4. Para saber si el mouse está sobre la persona, se lee el canal alfa del recorte en un `<canvas>` oculto y se consulta el
   píxel bajo el cursor (más 4 vecinos a ±4 px para que los bordes no parpadeen). Umbral: alfa > 60.
5. `fadeBottom` desvanece el borde inferior del recorte cuando otra persona la tapa por abajo (en Francesca, 22 %).

## Cómo rehacer las siluetas con la foto nueva

1. Reemplazar `public/equipo.jpg` y actualizar `PHOTO` (`src`, `w`, `h`) en `FoundersShowcase.tsx`. El `aspect-[3/4]` de la
   foto también depende de esa proporción.
2. Ver la foto con una grilla para leer coordenadas en píxeles (por ejemplo, dibujarla con Pillow y `ImageDraw`).
3. Por cada persona, agregar una entrada a `scripts/siluetas.json`: `crop` (zona de trabajo alrededor de la persona),
   `positivos` (puntos sobre ella: cabeza, torso, piernas y lo que sostiene), `negativos` (puntos sobre las personas
   vecinas) y, si otra persona la tapa por abajo, `fade_bottom`.
4. Crear un entorno aparte (fuera del repo) y correr el script:
   `pip install -r scripts/requirements-segmentar.txt` y
   `python scripts/segmentar-equipo.py --previsualizar /tmp/prev`. La primera vez `rembg` descarga el modelo (~360 MB,
   queda en `~/.u2net`). Con `--previsualizar` se guarda una imagen por persona con el resto oscurecido, para revisarla.
5. Pegar en `team.ts` el bloque `silhouette` que imprime el script (incluye el `box` ya calculado).
6. Probar el hover y la detección: pasar el mouse por el cuerpo, los bordes y las manos, y por el fondo.

Lo que costó y conviene saber:

- En `rembg` el prompt de puntos va en `sam_prompt` (lista de `{"type": "point", "label": 1|0, "data": [x, y]}`).
  El parámetro `input_points` se ignora sin avisar y devuelve una máscara de otra cosa.
- Hay que **recortar la zona** antes de segmentar: el modelo trabaja a unos 1024 px y una foto vertical completa
  se achica mucho, con lo que la máscara sale gruesa.
- Los puntos **negativos** sobre los vecinos son los que evitan que la máscara se pegue a la persona de al lado.

## Limitaciones de esta versión

- Solo Francesca tiene silueta; los otros 6 nombres no son interactivos.
- El recorte sale de SAM (ViT-B) con unos pocos puntos por persona. El borde se suaviza 1,6 px, pero no hay *matting*: el
  pelo fino queda aproximado. Solo se probó con Francesca.
- Las coordenadas están pegadas a `equipo.jpg` de 960x1280. Si cambia la foto, hay que rehacer todos los recortes y `box`.
- El campo `silhouette` no existe todavía en la tabla `TeamMember` de Postgres (hoy solo está en el seed).

## Cómo mejorar la segmentación de cada persona

Orden sugerido, de más impacto a menos:

1. **Subir de nivel el modelo de segmentación.** Esta versión ya usa SAM (ViT-B, vía `rembg`) desde
   `scripts/segmentar-equipo.py`. Probar **SAM 2** o un encoder más grande (ViT-H), y **BiRefNet** / **RMBG-2.0**, que
   dan bordes más limpios, incluido el pelo. El script ya es offline: lee `scripts/siluetas.json` (puntos por persona) y
   escribe un WebP por persona.
2. **Una máscara por persona, no un recorte suelto.** Con SAM 2 cada persona sale como su propia máscara, así se resuelven
   solos los solapamientos (los que se abrazan, los robots en las manos, la gente sentada adelante). Hoy `fadeBottom` es
   un parche para eso.
3. **Suavizar el borde (feather).** Aplicar un desenfoque gaussiano de 1 a 2 px al canal alfa y eliminar píxeles sueltos
   (morfología: apertura y cierre). Evita el efecto "pegatina" y los halos de color del fondo.
4. **Descontaminar el color del borde** (color decontamination / matting). Un modelo de matting (ViTMatte o el propio
   BiRefNet) da alfa parcial en el pelo y evita el halo claro.
5. **Decidir qué es "la persona".** Definir si incluye o no el robot que sostiene. Para el hover conviene incluirlo:
   se ve más natural que la persona sola con las manos vacías. (La versión 1 lo incluye; el modelo lo dejaba afuera y hubo
   que sumarle puntos positivos sobre el robot.)
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
11. **Segmentar a todos de una vez.** Un modelo de segmentación por instancias (por ejemplo Mask R-CNN o YOLOv8-seg)
    devuelve una máscara por persona sin puntos. Habría que asignar cada máscara a un nombre (por orden o con un clic) y
    revisar las que salgan mal. Ahorra escribir los puntos a mano cuando el equipo crezca.
12. **Retoque manual de la máscara.** Para casos difíciles (abrazos, pelo), abrir la máscara en Krita/GIMP, corregirla y
    que el script acepte una máscara ya editada en vez de correr el modelo.
13. **Foto de mayor resolución.** Con una foto de 2000 px o más de lado largo los recortes se ven nítidos en pantallas
    retina; hoy la foto es de 960 px y la silueta se ve igual de blanda que ella.
14. **Hit-test con polígono.** Alternativa al canvas: simplificar el contorno de cada máscara a un polígono y usarlo con
    `clip-path`, que el navegador respeta al detectar el mouse. Es más liviano, pero hay que generar y guardar el polígono.
