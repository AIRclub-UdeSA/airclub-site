// Borde almenado (merlones cuadrados) para el filo superior de una banda. Forma adaptada de "SVG Bands" de
// cult-ui (licencia MIT): https://github.com/nolly-studio/cult-ui
const WIDTH = 1440;
const HEIGHT = 14;
const MERLON = 24;

function battlementPath() {
  let d = `M0 ${HEIGHT}V0`;
  for (let x = 0; x < WIDTH; x += MERLON * 2) {
    d += `H${x + MERLON}V${HEIGHT}H${x + MERLON * 2}V0`;
  }
  // Cierra por debajo del filo, solapando 2px con la banda para que no quede rendija.
  return `${d.slice(0, d.lastIndexOf("V0"))}V${HEIGHT + 2}H0Z`;
}

const PATH = battlementPath();

/** Se posiciona pegado arriba de la banda que lo contiene (debe ser `relative`) y toma su color con `fill`. */
export function TalksBattlement({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      className={`pointer-events-none absolute inset-x-0 -top-[14px] block h-[14px] w-full ${className ?? ""}`}
    >
      <path d={PATH} fill="currentColor" />
    </svg>
  );
}
