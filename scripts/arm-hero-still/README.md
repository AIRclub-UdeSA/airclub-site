# Foto fija del hero: cómo regenerarla y verificarla

`src/components/home/arm-hero-still.ts` guarda una **foto fija** (data URI) del brazo 3D del hero. Se
muestra apenas carga la página, mientras el canvas WebGL todavía está arrancando, y después se cambia por
el brazo animado. Para que ese cambio **no se note**, la foto tiene que ser un recorte exacto del propio
canvas: mismo brazo, misma pelota, misma perspectiva y en el mismo píxel.

## Cuándo hay que regenerarla

Cada vez que cambia algo **visible en la pose de reposo**: el color o tamaño de la pelota (`BALL_COLOR`,
`BALL_RADIUS`), su posición de origen (`BALL_HOME`), `REST_POSE`, la geometría del brazo, las luces o la
cámara (`CAMERA_DISTANCE` / `CAMERA_FOV_DEG` en `RobotArm3D.tsx`). Si no se regenera, al recargar se ve un
"salto" (por ejemplo, la pelota cambia de color) cuando la foto pasa a animación. No hay un aviso
automático de que quedó vieja.

## Requisitos

- El sitio corriendo (`npm run dev`, por defecto en `http://localhost:3000`; se cambia con `SITE_URL`).
- Playwright con un Chromium instalado (`npx playwright install chromium`). Si la versión del proyecto
  pide otro Chromium que el que tenés, apuntá a uno existente con `PW_CHROMIUM_PATH=/ruta/al/chrome`.
- Python 3 con `pillow` y `numpy` (`pip install pillow numpy`).

## Pasos

```bash
# 1) Captura el canvas vivo (pantalla completa, fondo transparente, cambio foto->animación congelado). ~1 min
node scripts/arm-hero-still/capture-still.mjs

# 2) Recorta en píxeles enteros y ESCRIBE src/components/home/arm-hero-still.ts (imagen + layout)
python3 scripts/arm-hero-still/make-still.py

# 3) (recomendado) Verifica que foto y canvas coincidan en 4 tamaños de pantalla. ~4 min
node scripts/arm-hero-still/verify-match.mjs
python3 scripts/arm-hero-still/compare.py
```

Las capturas intermedias quedan en `scripts/arm-hero-still/out/` (ignorada por git).

## Cómo leer el resultado de `compare.py`

Por cada tamaño imprime la diferencia entre el canvas vivo y la foto (`diff_medio`, sobre 255), el recuadro
que ocupa el dibujo en cada una (`bbox`) y el mejor corrimiento entero entre las dos:

- **`mejor corrimiento: dx=0 dy=0` y `bbox` idénticos** = la foto está clavada en el mismo píxel. Es lo
  que importa. Si da `dx=-1` o `dy=-1`, la foto quedó corrida 1 px.
- A **2×** la diferencia tiene que dar ~0 (con la pelota mauve dio exactamente `0.00`).
- A **1×** queda una diferencia de ~7 a 15 sobre 255: es solo el suavizado de bordes (el navegador reduce
  la foto capturada a 2×, el canvas dibuja nativo a 1×). No es un desfasaje.

## Por qué está hecho así (para no repetir errores)

- **Cámara fija.** El canvas cubre toda la sección (para poder arrastrar la pelota por toda la pantalla),
  pero la cámara no se aleja ni se mueve según el tamaño: solo cambia la ventana de render
  (`camera.setViewOffset`). Así la perspectiva del brazo es idéntica en cualquier pantalla y coincide con la
  foto por construcción.
- **Chrome redondea la posición de una imagen a píxeles enteros al pintarla**, mientras WebGL dibuja con
  subpíxel. Por eso `ArmHero.tsx` fija la foto en píxeles enteros y deriva la ventana del canvas de esa
  misma caja ya redondeada. Nunca centrarla con `transform: translate(-50%)`: agrega otro redondeo.
- **El clip de `page.screenshot` también se redondea solo.** Por eso `capture-still.mjs` saca la pantalla
  completa y el recorte lo hace `make-still.py` con enteros.
- **La captura usa el centro REAL del canvas** (atributo `data-arm-view` del contenedor del canvas en
  `ArmHero.tsx`), no el centro ideal del espaciador.
- Con render por software (sin GPU) cada captura tarda 10–30 s; los scripts ya llevan tiempos de espera
  largos. Con `deviceScaleFactor: 2` en Playwright el redondeo se hace en píxeles CSS, distinto de un
  Chrome retina real: sirve para comparar, pero las decisiones de "snapping" validarlas a 1×.
