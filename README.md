# pagina-web

Sitio institucional del AIR Club UdeSA: quienes somos, los proyectos del club, el equipo y los enlaces al Challenge JAR 2026.

Es un sitio estatico sin build. Todo el contenido vive en `index.html`, con el CSS y el JavaScript inline, y las imagenes al lado en la raiz del repo.

## Estructura

| Archivo | Que es |
| --- | --- |
| `index.html` | El sitio entero: markup, estilos y navegacion por hash |
| `logo.png` | Logo del club, usado en el header, el footer y como `og:image` |
| `favicon.png` | Icono de la pestaña |
| `equipo.jpg` | Foto del equipo, en la seccion Equipo |
| `rosmaster.jpg` | Foto del ROSMASTER X3, en la seccion Proyectos |
| `netlify.toml` | Configuracion del deploy y cabeceras de seguridad |

## Ver el sitio localmente

Abrir `index.html` con doble clic alcanza para casi todo. Si algo se comporta raro, conviene servirlo por HTTP:

```bash
python3 -m http.server 8000
```

Y entrar a http://localhost:8000.

## Como se publica

**El sitio se publica solo.** Netlify esta conectado a este repositorio:

- Cada **merge a `main`** publica el sitio en produccion, en unos segundos.
- Cada **pull request** genera un *deploy preview*: una URL propia con los cambios de esa rama, para revisarlos antes de aprobar. El link aparece como un check en el PR.

> [!IMPORTANT]
> Ya no se sube un `.zip` a mano a Netlify. Si alguien arrastra un zip al dashboard, pisa el deploy de Git y el sitio queda desincronizado de lo que dice este repositorio. Los cambios entran por pull request.

## Como proponer un cambio

`main` esta protegido: no acepta pushes directos. Todo entra por pull request con una aprobacion.

```bash
git switch -c mi-cambio
# editar index.html
git commit -am "descripcion del cambio"
git push -u origin mi-cambio
gh pr create
```

Antes de abrir el PR conviene mirar el sitio localmente, y despues revisar el deploy preview que deja Netlify en el PR.

### Imagenes

Las fotos van comprimidas antes de commitearlas: una imagen sin optimizar queda en el historial de Git para siempre, aunque despues se reemplace. Para una foto, JPEG con calidad ~82 alcanza y pesa un orden de magnitud menos que un PNG:

```bash
convert foto-original.png -strip -interlace Plane -quality 82 foto.jpg
```

## Convenciones

Este repositorio se escribe en **español**: codigo, commits, PRs, issues y documentacion.

Guias generales de la organizacion: [CONTRIBUTING](https://github.com/AIRclub-UdeSA/.github/blob/main/CONTRIBUTING.md) y [codigo de conducta](https://github.com/AIRclub-UdeSA/.github/blob/main/CODE_OF_CONDUCT.md).
