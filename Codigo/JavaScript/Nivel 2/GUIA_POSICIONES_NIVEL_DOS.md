# Guía rápida: posiciones del Nivel 2

Todas las posiciones que siguen se expresan como porcentajes del mapa (`left` y `top`), no de la ventana. `left: 0%` es el borde izquierdo y `top: 0%` el borde superior.

## NPCs (mapa exterior e interior)
Archivo: `Juego/Codigo/css/nivelDos.css`

Buscá los selectores:
- `.personaje-rastreador { left: 90%; top: 15%; }` — Cirilo, el rastreador.
- `.personaje-baqueano { left: 78%; top: 30%; }` — Don Eusebio, el baqueano.
- `.personaje-gaucho-malo { left: 15%; top: 15%; }` — el gaucho malo.
- `.personaje-pulpera { left: 48%; top: 42%; }` — Doña Jacinta.
- `.personaje-arriero { left: 36%; top: 20%; }` — Mateo.
- `.personaje-curandera { left: 24%; top: 54%; }` — Tomasa.
- `.personaje-cantor.personaje-cantor-interior { left: 65%; top: 68%; }` — el cantor dentro de la pulpería.

Para mover uno, cambiá los porcentajes de `left` (horizontal) y `top` (vertical). Revisá las colisiones y la cámara después de moverlos. El cantor se oculta afuera y aparece dentro de la pulpería.

## Jugador
Archivo: `Juego/Codigo/js/mapaMovimiento.js`
- Aparición inicial en el exterior: dentro de `iniciar()`, `x: 15 / 100 * this.mundoAncho`, `y: 82 / 100 * this.mundoAlto`. Cambiá `15` y `82`.
- Aparición al entrar a la pulpería: dentro de `alternarPulperia()`, `x: this.mundoAncho * 0.40`, `y: this.mundoAlto * 0.68`. Cambiá `0.40` (horizontal) y `0.68` (vertical).
- Aparición al salir: en el mismo método, `x: this.mundoAncho * 0.39`, `y: this.mundoAlto * 0.39`.

## Notas del rastreador
Archivo: `Juego/Codigo/js/mecanicaRastreador.js`, método `mostrarHojasEnEscenario()`.

Buscá el arreglo `const posiciones = [...]`. Actualmente las tres hojas están en:
- Hoja 1: `left: '53%', top: '41%'`
- Hoja 2: `left: '89%', top: '54%'`
- Hoja 3: `left: '49%', top: '78%'`

Cambiá los porcentajes de cada objeto para mover las notas. Deben quedar en suelo accesible, fuera de techos, paredes y otros obstáculos. La imagen pequeña de cada pista se define en el mismo archivo en `rastreador-icono-pista`; el tamaño/estilo se ajusta en `Juego/Codigo/css/nivelDos.css`.

## Cuadrado oscuro de las notas
El lector de notas está estilizado en `Juego/Codigo/css/nivelDos.css`, selector `.rastreador-lectura-mapa`. Su fondo ahora es una capa uniforme y tenue que cubre la pantalla, en lugar de un rectángulo oscuro localizado. El pergamino se configura en `.rastreador-papel-mapa`.
