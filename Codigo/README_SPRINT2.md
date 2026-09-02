# Sprint 2 — Instancia jugable I

Se incorporó una instancia jugable funcional sin alterar el menú principal existente.

## Flujo
1. Jugar abre un escenario en vista fija sobre una mesa.
2. El jugador abre los 4 diarios y toca sus frases clave.
3. Al reunir los 4 diarios responde un cuestionario breve de verificación.
4. Se abre un tablero con 12 recortes mezclados.
5. El jugador debe relacionar los recortes de a tríadas; cada solución está formada por 3 recortes y normalmente combina diarios distintos.
6. Al resolver las 4 tríadas termina la instancia jugable.


## Correspondencia con Sprint 2
- Mecánica de interacción: exploración + recolección.
- Mecánica de preguntas: selección múltiple + validación inmediata.
- Ciclo de juego: progreso, desempeño y condición de finalización.
- El núcleo jugable está integrado al botón Jugar del menú existente.


## Actualización: frases clave y tablero de investigación

La instancia jugable ahora incorpora una cadena de acciones más directa:

1. El jugador abre cada diario.
2. Las **frases clave** aparecen resaltadas en amarillo y subrayadas.
3. El jugador debe tocar cada frase para recolectar la información.
4. Al completar las frases del diario puede continuar con el siguiente.
5. Al reunir los cuatro diarios responde las preguntas.
6. Luego aparece un **tablero de madera** con recortes.
7. Los 12 recortes permanecen mezclados en un único tablero.
8. Cada relación válida se resuelve con tres recortes de una misma idea; la mayoría cruza información de diarios diferentes.

La interacción del tablero funciona como una mecánica de relación/ordenamiento: una selección incorrecta no avanza la secuencia y el sistema da retroalimentación.


## Ajuste de la instancia jugable
La partida utiliza una vista fija: el jugador permanece frente a una mesa y los cuatro diarios están repartidos sobre ella. No existe movimiento, WASD ni cámara libre. El jugador hace clic en cada diario, lee su contenido y toca las frases clave resaltadas y subrayadas para recolectarlas. Luego responde las preguntas y pasa directamente al tablero de madera para ordenar los recortes. No se agrega una etapa posterior: la resolución de las cuatro tríadas funciona como condición de finalización de la instancia.

### Ajuste de jugabilidad y presentación — versión triadas 2
- Las tres ideas recolectables de cada diario fueron reducidas a frases cortas.
- Las frases aparecen integradas y dispersas en una portada extensa de dos columnas.
- Las portadas contienen múltiples notas, avisos y párrafos para aproximar la lectura de un diario de época.
- El tablero muestra únicamente las frases recolectadas, no explicaciones largas.
