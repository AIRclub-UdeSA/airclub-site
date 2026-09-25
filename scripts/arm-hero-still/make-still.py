# Recorta la captura completa (out/full-still.png) en píxeles enteros del dispositivo y genera
# src/components/home/arm-hero-still.ts con la imagen (data URI) y su "layout": alto y descentrado
# exactos, en unidades del alto del espaciador. Requiere Pillow (pip install pillow).
import json, base64, io, os
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(here, "out")  # salidas de capture-still.mjs
STILL_TS = os.path.normpath(os.path.join(here, "..", "..", "src", "components", "home", "arm-hero-still.ts"))
info = json.load(open(f"{d}/full-still.json"))
dsf, cx, cy, hc = info["dsf"], info["cx"], info["cy"], info["h"]
im = Image.open(f"{d}/full-still.png").convert("RGBA")

def even(v):
    return int(round(v / 2)) * 2

W, H = even(0.7 * dsf * hc), even(1.4 * dsf * hc)
x0 = int(round(cx * dsf - W / 2))
y0 = int(round(cy * dsf - H / 2))
crop = im.crop((x0, y0, x0 + W, y0 + H))
buf = io.BytesIO()
crop.save(buf, "PNG", optimize=True)
png = buf.getvalue()

# centro real de la imagen recortada vs. centro del espaciador, en unidades de alto del espaciador
dx = ((x0 + W / 2) - cx * dsf) / dsf / hc
dy = ((y0 + H / 2) - cy * dsf) / dsf / hc
height_factor = H / (dsf * hc)
width_factor = W / (dsf * hc)

ts = f'''// Generado por scripts/arm-hero-still/make-still.py a partir de una captura del canvas vivo de RobotArm3D
// (ver el comentario de ArmStillImage en ArmHero.tsx y scripts/arm-hero-still/README.md para el contrato
// y cómo regenerarla). No editar a mano.
// Layout: la imagen mide `widthFactor` x `heightFactor` veces el alto del espaciador `.arm-canvas-container` y su
// centro cae a (dx, dy) alturas de espaciador de su centro (el recorte se hizo en pixeles enteros
// del dispositivo, asi que el centro real difiere del ideal en fracciones de pixel; esto lo compensa).
export const ARM_HERO_STILL_LAYOUT = {{ widthFactor: {width_factor:.6f}, heightFactor: {height_factor:.6f}, dx: {dx:.6f}, dy: {dy:.6f} }};
export const ARM_HERO_STILL = "data:image/png;base64,{base64.b64encode(png).decode()}";
'''
open(STILL_TS, "w").write(ts)
print(f"widthFactor={width_factor:.6f} recorte {W}x{H} en ({x0},{y0}); heightFactor={height_factor:.6f} dx={dx:.6f} dy={dy:.6f}; png={len(png)} bytes")
