# Gate de cifras de precio sin fuente

`scripts/check-price-sources.mjs` (corre dentro de `npm run test:editorial-release` vía `test:price-sources`).

**Regla:** un bloque de `content/*.json` (`<p>`, `<li>`, `<tr>`, `<h*>`, o cada string suelto como la respuesta de una FAQ) que contiene un monto (`$ 123`, `US$`, `USD`, `ARS`, `N mil pesos`) debe tener un link externo `http(s)` a la fuente **en el mismo bloque**. Un link en otro párrafo o un link interno (`/blog/...`) no cuenta. Cada cifra va con fuente y fecha, o se reescribe sin número.

**Allowlist** (`scripts/price-sources-allowlist.json`):
- `strictSlugs`: artículos con cero tolerancia. No pueden tener entradas en la baseline.
- `baseline`: bloques heredados sin fuente (hash por slug + texto normalizado). Solo puede achicarse: un bloque nuevo sin fuente falla (`[nuevo]`), y una entrada que ya no existe falla (`[baseline vieja]`, hay que borrarla). Regenerar con `--update-baseline` solo después de arreglar bloques, y revisar que el diff solo borre entradas.
- Para sumar un artículo a `strictSlugs`: arreglar todos sus bloques (`--list <slug>` imprime los pendientes), agregar el slug y correr `--update-baseline`.

**No cubre** (decisión explícita): porcentajes sueltos y estadísticas sin monto; alcance de precio solamente. `check-price-sources-negative.mjs` prueba que el gate falla con una cifra sin link (estricto y fuera de baseline), con link en otro párrafo y con link interno, y que pasa con link en el mismo bloque.
