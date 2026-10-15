// Deteccion de robo pelota<->pinza, en el plano X-Y del brazo (funcion pura, sin three.js).
//
// Antes se comparaba UN instante por cuadro y en 3D: la pelota vive a z=0.15 (solo para no solaparse
// visualmente con el brazo, que esta en z~0), asi que en 3D ese offset se comia casi todo el radio de
// robo (el radio real en el plano quedaba en ~0.10 con CATCH_DIST 0.18), y a pocos cuadros por
// segundo una pelota rodando avanzaba mas que ese radio entre un cuadro y el siguiente, o sea
// podia "atravesar" la pinza sin que ningun cuadro la viera adentro.
// Ahora se ignora z y se recorre el movimiento de los dos (pelota y punta de la pinza) entre el cuadro
// anterior y este, en pasos de `step` unidades, mirando si en algun momento quedaron a menos de `radius`.
export function sweptXYHit(
  ball0: { x: number; y: number },
  ball1: { x: number; y: number },
  tip0: { x: number; y: number },
  tip1: { x: number; y: number },
  radius: number,
  step = 0.05
): boolean {
  const moved = Math.max(Math.hypot(ball1.x - ball0.x, ball1.y - ball0.y), Math.hypot(tip1.x - tip0.x, tip1.y - tip0.y));
  const samples = Math.min(Math.max(Math.ceil(moved / step), 1), 60);
  for (let i = 0; i <= samples; i++) {
    const f = i / samples;
    const bx = ball0.x + (ball1.x - ball0.x) * f;
    const by = ball0.y + (ball1.y - ball0.y) * f;
    const tx = tip0.x + (tip1.x - tip0.x) * f;
    const ty = tip0.y + (tip1.y - tip0.y) * f;
    if (Math.hypot(bx - tx, by - ty) < radius) return true;
  }
  return false;
}
