#!/usr/bin/env python3
"""Genera las siluetas de /equipo a partir de la foto grupal.

Para cada persona del archivo de configuración corre un modelo de segmentación (SAM, vía `rembg`) con puntos de
referencia (positivos = es la persona, negativos = es otra cosa), limpia la máscara y guarda un WebP con transparencia
recortado al contorno. Al final imprime el bloque `silhouette` para pegar en prisma/seed-data/team.ts.

Uso (ver docs/equipo-siluetas/README.md):
    pip install -r scripts/requirements-segmentar.txt
    python scripts/segmentar-equipo.py --config scripts/siluetas.json --foto public/equipo.jpg --salida public/equipo

La primera vez `rembg` descarga el modelo (~360 MB) a ~/.u2net.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

PAD = 8  # píxeles de margen alrededor del contorno al recortar
FEATHER = 1.6  # desenfoque gaussiano del borde (px)


def segmentar(img, persona, sesion):
    """Devuelve la máscara (booleana, del tamaño de la foto) de una persona."""
    from rembg import remove

    x0, y0, x1, y1 = persona["crop"]
    prompt = [{"type": "point", "label": 1, "data": [x - x0, y - y0]} for x, y in persona["positivos"]]
    prompt += [{"type": "point", "label": 0, "data": [x - x0, y - y0]} for x, y in persona.get("negativos", [])]
    # Se trabaja sobre un recorte de la zona: el modelo procesa la imagen a ~1024 px, y así queda más detalle.
    m = remove(img.crop((x0, y0, x1, y1)), session=sesion, only_mask=True, post_process_mask=False, sam_prompt=prompt)
    completa = Image.new("L", img.size, 0)
    completa.paste(m.convert("L"), (x0, y0))
    return np.array(completa) > 127


def limpiar(mascara):
    """Se queda con la pieza principal, rellena huecos y alisa el contorno."""
    etiquetas, n = ndi.label(mascara)
    if n == 0:
        sys.exit("El modelo no devolvió ninguna máscara: revisá los puntos positivos.")
    tamanos = ndi.sum(mascara, etiquetas, range(1, n + 1))
    m = etiquetas == (1 + int(np.argmax(tamanos)))
    m = ndi.binary_closing(m, iterations=3)
    m = ndi.binary_fill_holes(m)
    return ndi.binary_opening(m, iterations=1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--foto", default="public/equipo.jpg")
    ap.add_argument("--config", default="scripts/siluetas.json")
    ap.add_argument("--salida", default="public/equipo")
    ap.add_argument("--previsualizar", metavar="CARPETA", help="guarda una imagen por persona con el fondo oscurecido")
    args = ap.parse_args()

    from rembg import new_session

    img = Image.open(args.foto).convert("RGB")
    W, H = img.size
    personas = json.load(open(args.config, encoding="utf-8"))
    sesion = new_session("sam")
    os.makedirs(args.salida, exist_ok=True)
    if args.previsualizar:
        os.makedirs(args.previsualizar, exist_ok=True)

    print(f"Foto: {args.foto} ({W}x{H}). Recordá que PHOTO en FoundersShowcase.tsx debe tener ese tamaño.\n")
    for p in personas:
        mascara = limpiar(segmentar(img, p, sesion))
        alfa = Image.fromarray((mascara * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(FEATHER))
        ys, xs = np.where(np.array(alfa) > 2)
        x0, y0 = max(xs.min() - PAD, 0), max(ys.min() - PAD, 0)
        x1, y1 = min(xs.max() + PAD + 1, W), min(ys.max() + PAD + 1, H)
        rgba = img.convert("RGBA")
        rgba.putalpha(alfa)
        destino = os.path.join(args.salida, f"silueta-{p['slug']}.webp")
        rgba.crop((x0, y0, x1, y1)).save(destino, "WEBP", quality=92, method=6)

        if args.previsualizar:
            a = (np.array(alfa) / 255.0)[..., None]
            v = np.array(img).astype(float)
            Image.fromarray((v * 0.22 * (1 - a) + v * a).astype("uint8")).save(
                os.path.join(args.previsualizar, f"{p['slug']}.png")
            )

        fade = f"\n      fadeBottom: {p['fade_bottom']}," if p.get("fade_bottom") else ""
        rel = os.path.relpath(destino, "public").replace(os.sep, "/")
        url = f"/{rel}" if not rel.startswith("..") else f"/equipo/{os.path.basename(destino)}"
        print(f"// {p['nombre']}  ->  {destino} ({os.path.getsize(destino) // 1024} KB)")
        print(
            f'    silhouette: {{\n      src: "{url}",\n'
            f"      box: {{ x: {x0}, y: {y0}, w: {x1 - x0}, h: {y1 - y0} }},{fade}\n    }},\n"
        )


if __name__ == "__main__":
    main()
