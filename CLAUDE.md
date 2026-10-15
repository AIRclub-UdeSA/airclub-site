@AGENTS.md

## Convenciones (resumen; el detalle está en README.md y DESIGN.md)
- Todo en español: código, commits, PRs, issues y documentación.
- Nunca un trailer `Co-Authored-By` ni "Generated with…": el CI lo rechaza (`block-ai-coauthor.yml`).
- `main` está protegido; todo entra por PR contra `v2` (README.md).
- Antes de tocar UI, leé `DESIGN.md` §7 (checklist para agentes) y la sección de la página; no reintroduzcas nada de "Rechazado".
- Verificación: `npm run typecheck && npm run lint`. `npm run build` necesita `DATABASE_URL` y `DIRECT_URL` de mentira (ver `.github/workflows/ci.yml`).
