# Integración de recursos gráficos

El inventario actual está documentado en `README_SPRITES.md` y `manifest.json`.

- Nivel 2: sprites estáticos y animaciones de caminar en 8 direcciones, incluidas las diagonales (8 cuadros por dirección).
- Nivel 4: jugador y guardia a pie con animaciones de correr; caballo solo con sprite quieto; composiciones montadas del jugador y del guardia con quieto, correr, salto y caída; pinchos y fogatas.

Importante: los PNG están sincronizados y organizados, pero el inventario por sí solo no activa animaciones. Cada cargador del nivel debe utilizar las rutas indicadas. Se conserva el fallback gráfico existente cuando un recurso no está disponible.
