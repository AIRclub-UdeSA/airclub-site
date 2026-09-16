const SCRAMBLE_CHARS = "AIR01#·+×";

export function scrambleText(el: HTMLElement, finalText: string, duration = 700) {
  const len = finalText.length;
  const start = performance.now();
  let raf = 0;

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1);
    let out = "";
    for (let i = 0; i < len; i++) {
      const revealAt = i / len;
      if (finalText[i] === " ") out += " ";
      else if (t > revealAt + 0.18) out += finalText[i];
      else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (t < 1) raf = requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  raf = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(raf);
}
