# Guía de posiciones del Nivel 2

El mapa exterior original mide **1376 × 768 px**. Los NPC y las hojas se colocan en coordenadas del mundo y se escalan proporcionalmente al tamaño real de `#mundo-dos`; no dependen de coordenadas de pantalla ni del zoom de cámara.

## NPC exteriores

| Personaje | X | Y | Zona del mapa |
|---|---:|---:|---|
| Rastreador | 1205 | 330 | Claro del este |
| Baqueano | 1190 | 475 | Camino del este |
| Gaucho Malo | 270 | 465 | Camino del oeste |
| Pulpera | 470 | 435 | Calle principal |
| Arriero | 700 | 650 | Camino sur |
| Curandera | 1050 | 610 | Claro del sudeste |

El Cantor conserva la posición interior de la pulpería. Las matrices `MAPA_COLISIONES_MUNDO` y `MAPA_COLISIONES_INTERIOR`, las dimensiones del jugador y la lógica de colisión no se modifican.

## Hojas del Rastreador

| Hoja | X | Y |
|---|---:|---:|
| 1 | 490 | 690 |
| 2 | 930 | 690 |
| 3 | 1120 | 650 |

La detección de proximidad para NPC y hojas se calcula en coordenadas del mundo.


## Conversión para responsive

Las posiciones anteriores son coordenadas del mapa nativo (1376 × 768). En responsive se convierten a `left = X / 1376 × 100%` y `top = Y / 768 × 100%`, aplicadas al elemento `#mundo-dos`. Así, los NPC permanecen anclados al mismo punto del mundo aunque cambie el tamaño del dispositivo. Las reglas están limitadas a `pointer: coarse` o anchos de hasta 700 px; no cambian las reglas de escritorio ni la matriz de colisiones.
