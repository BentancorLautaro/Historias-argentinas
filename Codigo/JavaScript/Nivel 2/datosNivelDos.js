/**
 * Contenido didáctico del Nivel 2 · "Voces en la Pulpería".
 * Mantiene los textos, preguntas y relaciones separados de la lógica del nivel,
 * siguiendo el mismo criterio de organización que datosNivelUno.js.
 *
 * A diferencia del Nivel 1, acá cada personaje usa una mecánica distinta para
 * entregar sus tres pistas. El campo "tipoMecanica" le indica a
 * GestorInterrogatorio qué módulo de mecánica debe instanciar, y el campo
 * "datosMecanica" trae la información propia de esa mecánica.
 */

const personajesNivelDos = [
  {
    id: 'rastreador',
    nombre: 'EL RASTREADOR',
    apodo: 'Cirilo, rastreador de los Llanos',
    retrato: 'retrato-rastreador',
    presentacion:
      'Sigue huellas desde antes de que nadie más las note. No cuenta la historia de corrido: hay que leerla en el orden en que quedó marcada en el suelo.',
    tipoMecanica: 'rastreador',
    datosMecanica: {
      instruccion:
        'El rastro se marca con el paso del tiempo. Tocá las huellas en orden, de la más vieja (tenue y borrosa) a la más nueva (marcada y profunda).',
      huellas: [
        {
          etiqueta: 'Huella borrosa, casi borrada por el viento',
          pista: 'Antes de ser caudillo, Facundo fue un simple recluta del ejército en Buenos Aires'
        },
        {
          etiqueta: 'Huella parcialmente marcada, se nota un paso reciente',
          pista: 'Desertó y volvió a los Llanos, donde empezó a hacerse temer entre los gauchos'
        },
        {
          etiqueta: 'Huella fresca y profunda, recién dejada',
          pista: 'Terminó reuniendo bajo su mando a buena parte de los Llanos de la Rioja'
        }
      ]
    }
  },
  {
    id: 'baqueano',
    nombre: 'EL BAQUEANO',
    apodo: 'Don Eusebio, baqueano de la Rioja',
    retrato: 'retrato-baqueano',
    presentacion:
      'Conoce cada legua de los Llanos como la palma de su mano. Para sacarle una pista hay que resolver, como él, el camino correcto en cada encrucijada.',
    tipoMecanica: 'baqueano',
    datosMecanica: {
      bifurcaciones: [
        {
          pregunta: 'Facundo necesita cruzar los Llanos sin que sus enemigos lo vean. ¿Qué camino conviene tomar?',
          opciones: [
            { texto: 'Camino abierto', icono: 'sol', correcta: false, respuesta: 'Ese camino los hubiera dejado expuestos; no es lo que hizo un baqueano.' },
            { texto: 'Camino del monte', icono: 'monte', correcta: true, respuesta: 'Así es: Facundo aprovechaba el monte para moverse sin ser visto.' }
          ],
          pista: 'Facundo usaba caminos ocultos para moverse sin ser detectado por sus enemigos'
        },
        {
          pregunta: 'Sus tropas necesitan agua después de dos días de marcha. ¿Cómo la encuentra un baqueano en el desierto?',
          opciones: [
            { texto: 'Cavar al azar', icono: 'pala', correcta: false, respuesta: 'Así se pierde tiempo y agua; no es el método real.' },
            { texto: 'Leer la vegetación', icono: 'hoja', correcta: true, respuesta: 'Correcto: la vegetación y el suelo indican dónde hay agua cercana.' }
          ],
          pista: 'Un baqueano reconoce el agua oculta por la vegetación y el tipo de suelo'
        },
        {
          pregunta: 'Una tropa enemiga se acerca de noche. ¿Cómo se orienta un baqueano sin luz?',
          opciones: [
            { texto: 'Esperar el sol', icono: 'luna', correcta: false, respuesta: 'Eso hubiera significado perder toda ventaja.' },
            { texto: 'Leer el terreno', icono: 'brujula', correcta: true, respuesta: 'Exacto: de noche, el tacto y el conocimiento del terreno reemplazan a la vista.' }
          ],
          pista: 'De noche, el baqueano se orientaba por los árboles y la inclinación del terreno'
        }
      ]
    }
  },
  {
    id: 'gaucho-malo',
    nombre: 'EL GAUCHO MALO',
    apodo: 'El Chileno, un proscrito que lo conoció',
    retrato: 'retrato-gaucho-malo',
    presentacion:
      'Vive al margen de los pueblos y desconfía de cualquiera. Está prófugo: cada vez que se cruza con una partida que anda buscando a alguien, tenés que elegir cómo se las arregla para que no lo agarren.',
    tipoMecanica: 'gauchoMalo',
    datosMecanica: {
      situaciones: [
        {
          texto: 'Una partida de milicianos pasa cerca buscando a un gaucho prófugo y te preguntan si viste pasar a alguien.',
          opciones: [
            {
              texto: 'Mentirles con total tranquilidad',
              tipo: 'seguro',
              respuesta: '"Nadie por acá, señor." Le creen y siguen de largo.'
            },
            {
              texto: 'Esconderte agachado detrás del rancho',
              tipo: 'riesgo',
              probabilidadExito: 0.5,
              respuestaExito: 'Te agachás justo a tiempo: la partida no te ve.',
              respuestaFallo: 'Te encuentran agachado ahí mismo; eso solo los pone más sospechosos.'
            },
            {
              texto: 'Hacerte el desentendido y seguir caminando rápido',
              tipo: 'fracaso',
              respuesta: 'Tu apuro llama la atención: te paran igual y te revisan.'
            }
          ],
          pista: 'El propio Facundo llegó a pedir ayuda a hombres como este, cuando la ley lo pisaba los talones'
        },
        {
          texto: 'Un capitán te acusa de esconder a un forajido, sin ninguna prueba real, solo por tu fama de gaucho malo.',
          opciones: [
            {
              texto: 'Sostenerle la mirada sin retroceder ni mentir',
              tipo: 'seguro',
              respuesta: 'El capitán duda un segundo: no tiene con qué acusarte de verdad y te deja ir.'
            },
            {
              texto: 'Ofrecerle algo a cambio de que te deje tranquilo',
              tipo: 'riesgo',
              probabilidadExito: 0.5,
              respuestaExito: 'Acepta y se va conforme.',
              respuestaFallo: 'Lo toma como una confesión y te complica más.'
            },
            {
              texto: 'Insultarlo por acusarte en falso',
              tipo: 'fracaso',
              respuesta: 'Eso alcanza para que te lleven preso esa misma noche.'
            }
          ],
          pista: 'Así trataban a cualquier gaucho malo: aplicaban castigos duros sin necesidad de una culpa real, lo mismo que hacía Facundo con los suyos'
        },
        {
          texto: 'Te enterás de que esos mismos milicianos andan detrás de Facundo, que ya se hizo enemigos peligrosos. ¿Qué hacés con esa información?',
          opciones: [
            {
              texto: 'Guardarte el dato y no decir nada a nadie',
              tipo: 'seguro',
              respuesta: 'Con el tiempo sabés que esos enemigos le prepararon una emboscada en Barranca Yaco.'
            },
            {
              texto: 'Avisarle en secreto a alguien de confianza',
              tipo: 'riesgo',
              probabilidadExito: 0.5,
              respuestaExito: 'El aviso llega, aunque tarde para cambiar nada.',
              respuestaFallo: 'Alguien te escucha hablar de más y corre la voz.'
            },
            {
              texto: 'Ir a contárselo directamente a la partida',
              tipo: 'fracaso',
              respuesta: 'Eso te pone en la mira de los dos bandos a la vez.'
            }
          ],
          pista: 'Sus propios enemigos políticos prepararon su muerte en una emboscada'
        }
      ]
    }
  },
  {
    id: 'cantor',
    nombre: 'EL CANTOR',
    apodo: 'Payador que compuso versos sobre Facundo',
    retrato: 'retrato-cantor',
    presentacion:
      'Canta lo que otros solo cuentan en voz baja. Sus versos quedaron incompletos: hay que saber con qué palabra se cierran para entender la pista.',
    tipoMecanica: 'cantor',
    datosMecanica: {
      // "El Cantor de la Pampa": contrapunto de cartas basado en el
      // Capítulo 2 ("Orijinalidad i caracteres arjentinos") del Facundo.
      // Cada combatiente empieza con 10 puntos de Gloria Criolla. La IA
      // ataca con una chicana; el jugador se defiende eligiendo una carta
      // de su mano y cantando un verso que cierre con el pie forzado de
      // esa carta. Cada defensa lograda entrega una de las tres pistas.
      vidaInicial: 30,
      cartasAtaque: [
        {
          id: 'aeda-sin-letras',
          nombre: 'El Aeda sin Letras',
          dano: 4,
          frase: '¡No sabés leer ni escribir, sos un bardo ciego que vaga sin fin!',
          audioId: 'ataque-aeda-sin-letras'
        },
        {
          id: 'himno-tragedias',
          nombre: 'El Himno de las Tragedias',
          dano: 4,
          frase: '¡Tus versos solo cantan a los gauchos malos y a las muertes del desierto!',
          audioId: 'ataque-himno-tragedias'
        },
        {
          id: 'pampa-desierta',
          nombre: 'La Pampa Inmensa y Desierta',
          dano: 4,
          frase: '¡Tu escenario es la soledad bruta donde nadie oye tu canto!',
          audioId: 'ataque-pampa-desierta'
        },
        {
          id: 'desprecio-urbe',
          nombre: 'El Desprecio de la Urbe',
          dano: 7,
          frase: '¡La ciudad culta rechaza tu guitarra desafinada y salvaje!',
          audioId: 'ataque-desprecio-urbe'
        },
        {
          id: 'historia-sin-papel',
          nombre: 'La Historia Sin Papel',
          dano: 4,
          frase: '¡Lo que cantás se lo lleva el viento porque no hay libro que lo guarde!',
          audioId: 'ataque-historia-sin-papel'
        }
      ],
      cartasDefensa: [
        {
          id: 'memoria-desierto',
          nombre: 'La Memoria del Desierto',
          concepto: 'El cantor es la única memoria viva de los pueblos sin imprenta.',
          verso: 'Aunque no haya libro ni imprenta que guarde mi cuento, yo soy la memoria viva que no se lleva el viento.',
          pieForzado: 'viento',
          audioId: 'defensa-memoria-desierto'
        },
        {
          id: 'bardo-pampa',
          nombre: 'El Bardo de la Pampa',
          concepto: 'Equivalente al aeda griego; narra las hazañas de la llanura.',
          verso: 'Yo canto como el aeda que allá en Grecia hizo figura, narrando hazañas del gaucho perdido en la llanura.',
          pieForzado: 'llanura',
          audioId: 'defensa-bardo-pampa'
        },
        {
          id: 'tristeza-triste',
          nombre: 'La Tristeza del Triste',
          concepto: 'La música popular expresa las melancolías del alma criolla.',
          verso: 'Mi copla dice del alma lo que ninguno resiste: canto la pena del pobre y el criollo que en ella insiste.',
          pieForzado: 'insiste',
          audioId: 'defensa-tristeza-triste'
        },
        {
          id: 'acompanante-vihuela',
          nombre: 'El Acompañante de la Vihuela',
          concepto: 'La guitarra pulsa los dolores sin necesidad de leyes escritas.',
          verso: 'No preciso de ley escrita ni de leva que me aferre: mi vihuela dice el dolor con solo pulsar la guitarra.',
          pieForzado: 'guitarra',
          audioId: 'defensa-acompanante-vihuela'
        },
        {
          id: 'cronica-matrero',
          nombre: 'La Crónica del Matrero',
          concepto: 'El cantor inmortaliza al gaucho perseguido convirtiéndolo en leyenda.',
          verso: 'Al gaucho que anda huyendo, perseguido en su hacienda, yo lo canto y lo hago eterno: lo convierto en leyenda.',
          pieForzado: 'leyenda',
          audioId: 'defensa-cronica-matrero'
        }
      ],
      // Las tres pistas se ganan en orden, una por cada réplica lograda
      // contra la IA (coinciden con los tres fragmentos de "El Cantor" en
      // el tablero final de versiones).
      pistas: [
        'Facundo nació en los Llanos de la Rioja, hijo de un gaucho humilde',
        'Su carácter pedía mandar, no obedecer: por eso no toleró la vida militar regular',
        'Fue asesinado en una emboscada en Barranca Yaco'
      ]
    }
  }
];

/**
 * Cuestionario final del Nivel 2. Se habilita cuando los cuatro personajes
 * ya fueron interrogados y sus doce pistas quedaron recolectadas.
 */
const preguntasNivelDos = [
  {
    q: 'Según lo que reconstruyó el Rastreador, ¿por qué Facundo no continuó su carrera en el ejército regular?',
    options: [
      'Porque desertó y volvió a los Llanos, donde empezó a hacerse temer',
      'Porque fue expulsado por no saber montar a caballo',
      'Porque prefería estudiar leyes en la ciudad'
    ],
    answer: 0,
    explain: 'El rastro que siguió el Rastreador muestra que Facundo fue recluta, desertó y volvió a los Llanos, donde empezó a hacerse temer entre los gauchos.'
  },
  {
    q: '¿Qué le permitía a Facundo dominar militarmente el interior del país?',
    options: [
      'Su conocimiento del terreno y la velocidad de sus tropas',
      'Un ejército europeo entrenado en Buenos Aires',
      'El apoyo exclusivo de un gobierno extranjero'
    ],
    answer: 0,
    explain: 'El Baqueano explica que Facundo, como buen conocedor del terreno, usaba caminos ocultos, sabía encontrar agua y orientarse de noche.'
  },
  {
    q: '¿Qué hecho marcó el fin de su poder?',
    options: [
      'Sus enemigos políticos prepararon una emboscada en Barranca Yaco',
      'Se retiró pacíficamente a Chile',
      'Ganó todas sus batallas hasta el final de su vida'
    ],
    answer: 0,
    explain: 'El Gaucho Malo cuenta que Facundo se hizo enemigos poderosos, que finalmente prepararon su muerte en una emboscada en Barranca Yaco.'
  },
  {
    q: '¿Por qué los cuatro testigos dan versiones distintas sobre Facundo?',
    options: [
      'Porque cada uno lo vivió desde un lugar distinto: temor, alianza o admiración',
      'Porque ninguno de los cuatro lo conoció realmente',
      'Porque todos se pusieron de acuerdo para mentir'
    ],
    answer: 0,
    explain: 'El Rastreador, el Baqueano, el Gaucho Malo y el Cantor conocieron a Facundo desde distintas posiciones, y por eso cada versión resalta un aspecto diferente del mismo personaje histórico.'
  }
];

/**
 * Grupos del tablero final. Cada grupo reúne las tres pistas de un mismo
 * personaje, igual que en el Nivel 1 cada grupo reunía las tres frases
 * clave de un mismo diario.
 */
const gruposTableroNivelDos = [
  {
    id: 'caracter-juventud',
    title: 'CARÁCTER Y JUVENTUD DE FACUNDO',
    fragments: [
      { text: 'Antes de ser caudillo, Facundo fue un simple recluta del ejército en Buenos Aires', source: 'EL RASTREADOR' },
      { text: 'Desertó y volvió a los Llanos, donde empezó a hacerse temer entre los gauchos', source: 'EL RASTREADOR' },
      { text: 'Terminó reuniendo bajo su mando a buena parte de los Llanos de la Rioja', source: 'EL RASTREADOR' }
    ]
  },
  {
    id: 'dominio-territorio',
    title: 'DOMINIO DEL TERRITORIO',
    fragments: [
      { text: 'Facundo usaba caminos ocultos para moverse sin ser detectado por sus enemigos', source: 'EL BAQUEANO' },
      { text: 'Un baqueano reconoce el agua oculta por la vegetación y el tipo de suelo', source: 'EL BAQUEANO' },
      { text: 'De noche, el baqueano se orientaba por los árboles y la inclinación del terreno', source: 'EL BAQUEANO' }
    ]
  },
  {
    id: 'violencia-caida',
    title: 'VIOLENCIA Y CAÍDA DEL CAUDILLO',
    fragments: [
      { text: 'El propio Facundo llegó a pedir ayuda a hombres como este, cuando lo necesitaba', source: 'EL GAUCHO MALO' },
      { text: 'Aplicaba castigos duros incluso sin pruebas claras de que hubiera una falta real', source: 'EL GAUCHO MALO' },
      { text: 'Sus propios enemigos políticos prepararon su muerte en una emboscada', source: 'EL GAUCHO MALO' }
    ]
  },
  {
    id: 'memoria-popular',
    title: 'FACUNDO EN LA MEMORIA POPULAR',
    fragments: [
      { text: 'Facundo nació en los Llanos de la Rioja, hijo de un gaucho humilde', source: 'EL CANTOR' },
      { text: 'Su carácter pedía mandar, no obedecer: por eso no toleró la vida militar regular', source: 'EL CANTOR' },
      { text: 'Fue asesinado en una emboscada en Barranca Yaco', source: 'EL CANTOR' }
    ]
  }
];

const recortesTableroNivelDos = gruposTableroNivelDos.flatMap((grupo) =>
  grupo.fragments.map((fragmento, indiceFragmento) => ({
    id: `${grupo.id}-${indiceFragmento}`,
    groupId: grupo.id,
    groupTitle: grupo.title,
    text: fragmento.text,
    source: fragmento.source
  }))
);

export {
  personajesNivelDos,
  preguntasNivelDos,
  gruposTableroNivelDos,
  recortesTableroNivelDos
};
