import sys, glob, os
import numpy as np
from PIL import Image

d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")  # salidas de verify-match.mjs
for live_path in sorted(glob.glob(f"{d}/live-*.png")):
    name = os.path.basename(live_path)[5:-4]
    still_path = f"{d}/still-{name}.png"
    if not os.path.exists(still_path):
        continue
    a = np.asarray(Image.open(live_path).convert("RGBA")).astype(float)
    b = np.asarray(Image.open(still_path).convert("RGBA")).astype(float)
    if a.shape != b.shape:
        print(f"{name}: TAMAÑOS DISTINTOS live={a.shape} still={b.shape}")
        continue

    def premult(x):
        al = x[..., 3:4] / 255.0
        return np.concatenate([x[..., :3] * al, x[..., 3:4]], axis=2)

    pa, pb = premult(a), premult(b)
    diff = np.abs(pa - pb).max(axis=2)
    covered = (a[..., 3] > 8) | (b[..., 3] > 8)

    def bbox(x):
        ys, xs = np.where(x[..., 3] > 8)
        return (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None

    print(f"{name}: px_cubiertos={int(covered.sum())} diff_medio={diff[covered].mean():.2f}/255 "
          f"p99={np.percentile(diff[covered], 99):.0f} max={diff.max():.0f} "
          f"px_con_diff>32={int((diff > 32).sum())} ({100 * (diff > 32).sum() / max(covered.sum(), 1):.2f}%)")
    print(f"    bbox live={bbox(a)} still={bbox(b)}")
    # mejor corrimiento entero (para distinguir "desfasado" de "solo resampleo")
    best = (diff[covered].mean(), 0, 0)
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            sb = np.roll(np.roll(pb, dy, 0), dx, 1)
            m = np.abs(pa - sb).max(axis=2)[covered].mean()
            if m < best[0]:
                best = (m, dx, dy)
    print(f"    mejor corrimiento still->live: dx={best[1]} dy={best[2]} (diff_medio={best[0]:.2f})")
    Image.fromarray(np.clip(diff * 4, 0, 255).astype("uint8")).save(f"{d}/diff-{name}.png")
