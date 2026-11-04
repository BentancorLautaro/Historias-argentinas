import { buscarSpriteJuego } from '../Compartido/buscadorSprites.js';

class NivelCuatroPlataformas {
  constructor(alCompletar, alSalir) {
    this.canvas = document.getElementById('plataformas-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('plataformas-overlay');
    this.lectura = document.getElementById('plataformas-lectura');
    this.alCompletar = alCompletar;
    this.alSalir = alSalir;
    this.teclas = new Set(); this.activo = false; this.pausado = false; this.terminado = false; this.inicioPendiente = false;
    this.anterior = 0; this.tiempoAnimacionCarrera = 0; this.acumulado = 0; this.velocidadGuardadaLectura = 0; this.vidas = 4; this.provisiones = 0; this.notas = 0; this.tieneCarta = false; this.checkpoint = 180;
    this.jugador = {x:70,y:398,w:20,h:34,vx:0,vy:0,suelo:true,invulnerable:0,direccion:1,aCaballo:false};
    this.mundo = {ancho:6500,alto:540,camara:0};
    this.plataformas = []; this.zanjas = []; this.objetos = []; this.enemigos = []; this.puntos = []; this.carteles = []; this.cartelesLeidos = new Set(); this.peligros = [];
    this.sprites = {};
    this.promesaSprites = this.cargarSprites();
    this.orientacionBloqueada = false;
    window.addEventListener('resize', () => this.actualizarBloqueoOrientacion());
    window.addEventListener('orientationchange', () => this.actualizarBloqueoOrientacion());
    this.actualizarBloqueoOrientacion();
    this.construirMundo(); this.conectarEventos(); this.dibujar(0);
  }
  cargarSprites(){
    const base = new URL('../../../Assets/Sprites/Nivel 4/', import.meta.url);
    const archivos = {
      jugador_idle_d:'Jugador/Quieto_Mirando_Derecha.png',
      jugador_idle_i:'Jugador/Quieto_Mirando_Izquierda.png',
      jugador_jump_d:'Jugador/Saltando_Mirando_Derecha.png',
      jugador_jump_i:'Jugador/Saltando_Mirando_Izquierda.png',
      jugador_fall_d:'Jugador/Cayendo_Mirando_Derecha.png',
      jugador_fall_i:'Jugador/Cayendo_Mirando_Izquierda.png',
      guardia_idle_d:'Guardia/Quieto_Mirando_Derecha.png',
      guardia_idle_i:'Guardia/Quieto_Mirando_Izquierda.png',
      guardia_jump_d:'Guardia/Saltando_Mirando_Derecha.png',
      guardia_jump_i:'Guardia/Saltando_Mirando_Izquierda.png',
      guardia_fall_d:'Guardia/Cayendo_Mirando_Derecha.png',
      guardia_fall_i:'Guardia/Cayendo_Mirando_Izquierda.png',
      guardia_sit_d:'Guardia/Sentado_Mirando_derecha.png',
      guardia_sit_i:'Guardia/Sentado_Mirando_Izquierda.png',
      caballo_idle:'Caballo/Caballo quieto.png',
      jugador_montado_d:'Monturas/Jugador/Quieto der.png',
      jugador_montado_i:'Monturas/Jugador/Quieto izq.png',
      jugador_montado_jump_d_0:'Monturas/Jugador/Saltando der frame 1.png',
      jugador_montado_jump_d_1:'Monturas/Jugador/Saltando der frame 2.png',
      jugador_montado_jump_i_0:'Monturas/Jugador/Saltando izq frame 1.png',
      jugador_montado_jump_i_1:'Monturas/Jugador/Saltando izq frame 2.png',
      jugador_montado_fall_d:'Monturas/Jugador/Cayendo der frame.png',
      jugador_montado_fall_i:'Monturas/Jugador/Cayendo izq frame.png',
      guardia_montado_d:'Monturas/Guardia/Quieto der.png',
      guardia_montado_i:'Monturas/Guardia/Quieto izq.png',
      guardia_montado_jump_d_0:'Monturas/Guardia/Saltando der frame 1.png',
      guardia_montado_jump_d_1:'Monturas/Guardia/Saltando der frame 2.png',
      guardia_montado_jump_i_0:'Monturas/Guardia/Saltando izq frame 1.png',
      guardia_montado_jump_i_1:'Monturas/Guardia/Saltando izq frame 2.png',
      guardia_montado_fall_d:'Monturas/Guardia/Cayendo der frame.png',
      guardia_montado_fall_i:'Monturas/Guardia/Cayendo izq frame.png',
      pinchos:'Peligros/Pinchos.png', fogata:'Peligros/Fogata.png', fogata_2:'Peligros/Fogata 2.png',
      jugador_run_d_0:'Jugador/Corriendo der frame 1.png',
      jugador_run_d_1:'Jugador/Corriendo der frame 2.png',
      jugador_run_d_2:'Jugador/Corriendo der frame 3.png',
      jugador_run_i_0:'Jugador/Corriendo izq frame 1.png',
      jugador_run_i_1:'Jugador/Corriendo izq frame 2.png',
      jugador_run_i_2:'Jugador/Corriendo izq frame 3.png',
      guardia_run_d_0:'Guardia/Corriendo der frame 1.png',
      guardia_run_d_1:'Guardia/Corriendo der frame 2.png',
      guardia_run_d_2:'Guardia/Corriendo der frame 3.png',
      guardia_run_i_0:'Guardia/Corriendo izq  frame 1.png',
      guardia_run_i_1:'Guardia/Corriendo izq frame 2.png',
      guardia_run_i_2:'Guardia/Corriendo izq  frame 3.png',
      jugador_montado_run_d_0:'Monturas/Jugador/Correr der  frame 1.png',
      jugador_montado_run_d_1:'Monturas/Jugador/Correr der  frame 2.png',
      jugador_montado_run_d_2:'Monturas/Jugador/Correr der  frame 3.png',
      jugador_montado_run_d_3:'Monturas/Jugador/Correr der  frame 4.png',
      jugador_montado_run_d_4:'Monturas/Jugador/Correr der  frame 5.png',
      jugador_montado_run_d_5:'Monturas/Jugador/Correr der  frame 6.png',
      jugador_montado_run_i_0:'Monturas/Jugador/Correr izq frame 1.png',
      jugador_montado_run_i_1:'Monturas/Jugador/Correr izq frame 2.png',
      jugador_montado_run_i_2:'Monturas/Jugador/Correr izq frame 3.png',
      jugador_montado_run_i_3:'Monturas/Jugador/Correr izq frame 4 .png',
      jugador_montado_run_i_4:'Monturas/Jugador/Correr izq frame 5.png',
      jugador_montado_run_i_5:'Monturas/Jugador/Correr izq frame 6.png',
      guardia_montado_run_d_0:'Monturas/Guardia/Correr der  frame 1.png',
      guardia_montado_run_d_1:'Monturas/Guardia/Correr der  frame 2.png',
      guardia_montado_run_d_2:'Monturas/Guardia/Correr der  frame 3.png',
      guardia_montado_run_d_3:'Monturas/Guardia/Correr der  frame 4.png',
      guardia_montado_run_d_4:'Monturas/Guardia/Correr der  frame 5.png',
      guardia_montado_run_d_5:'Monturas/Guardia/Correr der  frame 6.png',
      guardia_montado_run_i_0:'Monturas/Guardia/Correr izq  frame 1.png',
      guardia_montado_run_i_1:'Monturas/Guardia/Correr izq frame 2.png',
      guardia_montado_run_i_2:'Monturas/Guardia/Correr izq frame 3.png',
      guardia_montado_run_i_3:'Monturas/Guardia/Correr izq frame 4.png',
      guardia_montado_run_i_4:'Monturas/Guardia/Correr izq  frame 5.png',
      guardia_montado_run_i_5:'Monturas/Guardia/Correr izq frame 6.png',
    };

    const cargas = Object.entries(archivos).map(([id,ruta]) => new Promise((resolver) => {
      const img = new Image();
      img.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = img.naturalWidth;
          cv.height = img.naturalHeight;
          const cx = cv.getContext('2d', {willReadFrequently:true});
          cx.drawImage(img, 0, 0);
          const data = cx.getImageData(0, 0, cv.width, cv.height).data;
          let minX = cv.width, minY = cv.height, maxX = -1, maxY = -1;
          for (let y = 0; y < cv.height; y++) {
            for (let x = 0; x < cv.width; x++) {
              if (data[(y * cv.width + x) * 4 + 3] > 12) {
                minX = Math.min(minX, x); minY = Math.min(minY, y);
                maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
              }
            }
          }
          this.sprites[id] = {img, crop:maxX >= minX ? {x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1} : null};
        } catch (_) {
          this.sprites[id] = {img, crop:null};
        }
        resolver(true);
      };
      img.onerror = () => { delete this.sprites[id]; resolver(false); };
      img.src = new URL(ruta, base).href;
    }));
    return Promise.all(cargas);
  }
  actualizarBloqueoOrientacion(){
    const tactil = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const bloqueado = tactil && matchMedia('(orientation: portrait)').matches;
    const reanudar = this.orientacionBloqueada && !bloqueado;
    this.orientacionBloqueada = bloqueado;
    if (bloqueado) this.teclas.clear();
    if (reanudar && this.activo && !this.pausado && !this.terminado) { this.anterior=performance.now(); requestAnimationFrame(t=>this.bucle(t)); }
  }
  indiceFrameCarrera(tiempo, duracionCuadro=180){
    // Ocho pasos con duración uniforme: 1 -> 2 -> 3 -> 2 -> 1 -> 2...
    // Los índices son 0,1,2,1,0,1,2,1; así el primer PNG también
    // permanece visible el mismo tiempo que los demás.
    const paso = Math.floor(tiempo / duracionCuadro) % 8;
    return [0,1,2,1,0,1,2,1][paso];
  }
  dibujarSprite(c,id,x,y,w,h,flip=false){
    const s=this.sprites[id];
    if(!s?.img?.complete||!s.img.naturalWidth)return false;
    const r=s.crop;
    if(!r){ c.drawImage(s.img,x,y,w,h); return true; }

    // El recorte alfa se dibuja siempre con la misma altura visible (h).
    // La escala es uniforme en ambos ejes: conserva la proporción original,
    // centra horizontalmente y fija el apoyo inferior para evitar saltos.
    const escala=h/r.h;
    const dw=r.w*escala, dh=h;
    let dx=x+(w-dw)/2, dy=y+h-dh;

    c.save();
    if(flip){
      c.translate(dx+dw,0);
      c.scale(-1,1);
      dx=0;
    }
    c.drawImage(s.img,r.x,r.y,r.w,r.h,dx,dy,dw,dh);
    c.restore();
    return true;
  }
  construirMundo() {
    const suelo = (x,w,y=440)=>this.plataformas.push({x,y,w,h:100,tipo:'tierra'});
    // Cuatro sectores conectados, con saltos calculados para una velocidad horizontal moderada.
    suelo(0,700); suelo(755,650); suelo(1460,720); suelo(2220,600); suelo(2850,620); suelo(3500,700); suelo(4240,700); suelo(4980,650); suelo(5670,830);
    const p=(x,y,w,h=18,tipo='madera')=>this.plataformas.push({x,y,w,h,tipo});
    [[180,365,95],[330,330,95],[520,300,90],[820,365,100],[990,320,100],[1160,355,90],[1510,360,110],[1690,315,100],[1900,355,100],[2260,350,100],[2430,305,100],[2640,350,90],[2920,360,110],[3110,315,100],[3330,350,100],[3560,350,110],[3750,300,100],[3970,350,100],[4300,355,110],[4500,310,110],[4730,350,100],[5050,355,110],[5240,305,100],[5430,350,100],[5750,355,110],[5940,310,110],[6160,350,100]].forEach(a=>p(...a));
    this.zanjas=[{x:700,w:55},{x:1405,w:55},{x:2180,w:40},{x:2820,w:30},{x:3460,w:40},{x:4200,w:40}];
    // Peligros estáticos colocados en el camino: hay que saltarlos.
    this.peligros=[{x:620,w:30,h:26,tipo:'pinchos'},{x:1040,w:34,h:28,tipo:'fogata'},{x:1325,w:30,h:26,tipo:'pinchos'},{x:1815,w:36,h:28,tipo:'fogata'},{x:2070,w:32,h:26,tipo:'pinchos'},{x:2565,w:34,h:28,tipo:'fogata'},{x:2760,w:30,h:26,tipo:'pinchos'},{x:3290,w:36,h:28,tipo:'fogata'},{x:3395,w:30,h:26,tipo:'pinchos'},{x:4020,w:36,h:28,tipo:'fogata'},{x:4140,w:30,h:26,tipo:'pinchos'},{x:4650,w:34,h:28,tipo:'fogata'},{x:4880,w:30,h:26,tipo:'pinchos'},{x:5350,w:36,h:28,tipo:'fogata'},{x:5620,w:30,h:26,tipo:'pinchos'},{x:6090,w:34,h:28,tipo:'fogata'}];
    this.puntos=[{x:1520,activado:false},{x:2870,activado:false},{x:4250,activado:false},{x:5000,activado:false},{x:5700,activado:false}];
    this.objetos=[{x:125,y:400,tipo:'carta',recogido:false},{x:430,y:405,tipo:'provision',recogido:false},{x:900,y:400,tipo:'provision',recogido:false},{x:1200,y:405,tipo:'documento',recogido:false,texto:'La Revolución de Mayo de 1810 formó una junta de gobierno en Buenos Aires. El proceso abrió un período de cambios y conflictos; no significó que todo el territorio tuviera una respuesta uniforme.'},{x:1780,y:405,tipo:'provision',recogido:false},{x:2350,y:400,tipo:'documento',recogido:false,texto:'Las ciudades y las campañas rurales tenían economías, vínculos sociales y formas de autoridad diferentes. Sus intereses no siempre coincidían, aunque estaban conectados.'},{x:2730,y:405,tipo:'provision',recogido:false},{x:3210,y:405,tipo:'documento',recogido:false,texto:'Las montoneras fueron fuerzas armadas irregulares, con fuerte presencia de jinetes rurales, que participaron en conflictos políticos del siglo XIX. Sus objetivos y composición variaron según la región y el momento.'},{x:3860,y:405,tipo:'provision',recogido:false},{x:4430,y:400,tipo:'documento',recogido:false,texto:'Sarmiento interpretó la historia argentina mediante la oposición entre civilización y barbarie. Es una mirada influyente, pero discutida: no debe confundirse su valoración de los gauchos con una descripción neutral aceptada por todos los historiadores.'},{x:5200,y:400,tipo:'provision',recogido:false},{x:5850,y:400,tipo:'documento',recogido:false,texto:'El recorrido continúa por caminos rurales y puestos de campaña. Cada punto de control permite retomar el viaje desde un lugar seguro.'}];
    // Todos los guardias empiezan detrás del jugador; ninguno aparece delante al iniciar.
    // Un único guardia, inicializado sobre el primer tramo sólido (y=440).
     // El spawn queda detrás del jugador y fuera del alcance de la hitbox inicial.
     this.enemigos=[{x:0,y:398,min:0,max:6400,v:0,vy:0,w:28,h:42,suelo:true,estado:'PERSIGUIENDO',bordeObjetivo:null,plataformaObjetivo:null,saltoCooldown:0,plataformaSaltoObjetivo:null,objetivoPeligro:null,ultimoX:0,tiempoAtascado:0,tipo:'guardia'}];
    this.carteles=[{x:360,titulo:'EL RANCHO',texto:'El viaje comienza en un rancho de la campaña. Llevás una carta: cruzá las zanjas y buscá el camino hacia el campamento.'},{x:1630,titulo:'LOS CAMINOS DE LAS PAMPAS',texto:'Los caminos rurales conectaban estancias, pueblos y puestos. Los caballos eran esenciales para recorrer largas distancias.'},{x:2980,titulo:'EL CAMPAMENTO',texto:'En los años posteriores a 1810, distintos grupos se movilizaron por motivos políticos y militares. La vida rural también quedó atravesada por esos conflictos.'},{x:4500,titulo:'EL ASENTAMIENTO',texto:'El camino continúa más allá del asentamiento. Avanzá hasta el último puesto para completar la misión.'},{x:5400,titulo:'EL PUESTO DEL CAMINO',texto:'Los puestos rurales servían como lugares de descanso y orientación durante los viajes.'},{x:6250,titulo:'DESTINO',texto:'Llegaste al final del recorrido y podés entregar la carta.'}];
  }
  superficieTierraEn(x,w){
    return this.plataformas.find(p=>p.tipo==='tierra'&&x+w>p.x&&x<p.x+p.w)||null;
  }
  reiniciarGuardiaDetrasDelJugador(e, distancia=105){
    const j=this.jugador;
    // Preferir tierra segura detrás del jugador; nunca elegir una zanja ni una plataforma aérea.
    const tierras=this.plataformas.filter(p=>p.tipo==='tierra'&&p.w>=e.w+4);
    const deseado=Math.max(0,j.x-distancia);
    let tramo=tierras.find(p=>deseado+e.w>p.x&&deseado<p.x+p.w&&p.x<j.x);
    if(!tramo)tramo=tierras.filter(p=>p.x<j.x-20).sort((a,b)=>b.x-a.x)[0];
    if(!tramo)tramo=tierras.find(p=>p.x<=j.x&&p.x+p.w>=j.x);
    if(!tramo)tramo=tierras[0];
    e.x=tramo?Math.max(tramo.x,Math.min(deseado,tramo.x+tramo.w-e.w)):0;
    const suelo=this.superficieTierraEn(e.x,e.w);
    e.y=(suelo?suelo.y:440)-e.h;e.v=0;e.vy=0;e.suelo=!!suelo;
    this.reiniciarIAGuardia(e);
  }
  reiniciarIAGuardia(e, xSeguro=null){
    // Reinicio de navegación sin borrar mejoras permanentes (por ejemplo, ir a caballo).
    if(xSeguro!==null && Number.isFinite(xSeguro)) e.x=xSeguro;
    e.v=0; e.vy=0; e.suelo=!!this.superficieTierraEn(e.x,e.w); 
    const apoyo=this.superficieTierraEn(e.x,e.w);
    if(apoyo) e.y=apoyo.y-e.h;
    e.estado='PERSIGUIENDO'; e.bordeObjetivo=null; e.plataformaObjetivo=null;
    e.saltoCooldown=0.65; e.plataformaSaltoObjetivo=null; e.objetivoPeligro=null;
    e.techoAlternativo=null; e.xObjetivoSalto=null; e.tiempoAtascado=0; e.ultimoX=e.x;
  }
  conectarEventos(){
    window.addEventListener('keydown',e=>{const movimiento=['ArrowLeft','ArrowRight','ArrowUp',' ','w','W','a','A','d','D'];const introVisible=document.querySelector('.intro-narrativa:not(.hidden)');if(introVisible){if([...movimiento,'e','E','Escape'].includes(e.key))e.preventDefault();return;}if([...movimiento,'e','E'].includes(e.key))e.preventDefault();if(this.pausado)return;const yaPresionada=this.teclas.has(e.key);this.teclas.add(e.key);if((e.key==='e'||e.key==='E')&&this.lecturaAbierta){this.cerrarLectura();return;}if(!this.lectura.classList.contains('hidden'))return;if(!yaPresionada&&(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W'))this.saltar();if((e.key==='e'||e.key==='E')&&!this.lecturaAbierta)this.interactuar();});
    window.addEventListener('keyup',e=>this.teclas.delete(e.key));
    document.getElementById('plataformas-jugar').addEventListener('click',()=>{if(this.terminado&&document.getElementById('plataformas-titulo').textContent==='¡Mensaje entregado!'){this.alCompletar();return;}if(this.terminado){this.reiniciarEstado();this.overlay.style.display='';}this.iniciar();});
    const salir=document.getElementById('plataformas-salir');if(salir)salir.addEventListener('click',()=>{this.detener();this.alSalir();});
    document.getElementById('plataformas-cerrar-lectura').addEventListener('click',()=>this.cerrarLectura());
    const controles = document.getElementById('controles-tactiles-nivel-cuatro');
    if (controles) {
      const mantener = (boton, tecla) => {
        const iniciar = (evento) => { evento.preventDefault(); if(this.pausado||!this.activo)return; boton.setPointerCapture?.(evento.pointerId); this.teclas.add(tecla); if(tecla==='a-saltar') this.saltar(); if(tecla==='b-interactuar') this.interactuar(); };
        const terminar = (evento) => { evento.preventDefault(); this.teclas.delete(tecla); };
        boton.addEventListener('pointerdown', iniciar);
        ['pointerup','pointercancel','lostpointercapture'].forEach(tipo=>boton.addEventListener(tipo, terminar));
      };
      mantener(controles.querySelector('[data-tecla="izquierda"]'),'ArrowLeft');
      mantener(controles.querySelector('[data-tecla="derecha"]'),'ArrowRight');
      mantener(controles.querySelector('[data-tecla="saltar"]'),'a-saltar');
      mantener(controles.querySelector('[data-tecla="interactuar"]'),'b-interactuar');
    }
  }
  async iniciar(){
    if(this.activo || this.inicioPendiente) return;
    this.inicioPendiente = true;
    // Esperar la carga y el recorte de los PNG evita mostrar el fallback entre cuadros.
    await this.promesaSprites;
    this.inicioPendiente = false;
    this.overlay.style.display='';
    this.overlay.classList.add('hidden');
    this.activo=true;
    this.pausado=false;
    this.anterior=performance.now();
    this.terminado=false;
    requestAnimationFrame(t=>this.bucle(t));
  }
  reiniciarEstado(){this.vidas=4;this.provisiones=0;this.notas=0;this.tieneCarta=false;this.cartelesLeidos.clear();this.checkpoint=70;this.jugador={x:90,y:398,w:20,h:34,vx:0,vy:0,suelo:true,invulnerable:0,direccion:1,aCaballo:false};this.caballoMontado=false;this.objetos.forEach(o=>o.recogido=false);this.puntos.forEach(p=>p.activado=false);this.enemigos.forEach(e=>{e.x=0;const sueloRespawn=this.superficieTierraEn(Math.max(0,e.x),e.w);e.y=(sueloRespawn?sueloRespawn.y:440)-e.h;e.v=0;e.vy=0;e.suelo=!!sueloRespawn;e.aCaballo=false;e.estado='PERSIGUIENDO';e.bordeObjetivo=null;e.plataformaObjetivo=null;e.saltoCooldown=0;e.plataformaSaltoObjetivo=null;e.objetivoPeligro=null;e.techoAlternativo=null;e.xObjetivoSalto=null;e.ultimoX=e.x;e.tiempoAtascado=0;});this.teclas.clear();this.pausado=false;this.lecturaAbierta=false;this.lectura.classList.add('hidden');this.actualizarHUD();document.getElementById('plataformas-jugar').textContent='JUGAR';document.querySelector('.plataformas-controles')?.classList.remove('hidden');this.overlay.classList.add('hidden');this.terminado=false;this.activo=false;this.mundo.camara=0;}
  actualizarHUD(){
    const vidas=document.getElementById('plataformas-vidas');
    if(vidas){vidas.replaceChildren();for(let i=0;i<this.vidas;i++){const img=document.createElement('img');img.className='plataformas-sprite-vida';img.src='../Assets/Recursos Graficos/Compartido/vida.svg';img.alt='';vidas.appendChild(img);}vidas.setAttribute('aria-label',`${this.vidas} vidas`);}
    const notas=document.getElementById('plataformas-notas');if(notas)notas.textContent=String(this.notas);
    const barra=document.querySelector('.plataformas-progreso');
    const relleno=document.getElementById('plataformas-progreso-valor');
    const progreso=Math.max(0,Math.min(100,((this.jugador?.x||0)/(this.mundo.ancho-(this.jugador?.w||25)))*100));
    if(relleno)relleno.style.width=`${progreso}%`;
    if(barra)barra.setAttribute('aria-valuenow',String(Math.round(progreso)));
  }
  detener(){this.activo=false;this.pausado=false;this.teclas.clear();}
  establecerPausa(pausado){
    if(!this.activo||this.terminado)return;
    const nuevo=Boolean(pausado);
    if(this.pausado===nuevo)return;
    this.pausado=nuevo;
    this.teclas.clear();
    if(!nuevo){this.anterior=performance.now();requestAnimationFrame(t=>this.bucle(t));}
  }
  saltar(){if(this.activo&&!this.pausado&&!this.terminado&&this.lectura.classList.contains('hidden')&&this.jugador.suelo){this.jugador.vy=-540;this.jugador.suelo=false;this.jugador.sueloCoyote=0;}}
  interactuar(){if(!this.activo||this.pausado||this.terminado)return;const j=this.jugador;const cerca=(o)=>Math.abs((o.x||0)-(j.x+j.w/2))<65;
    // El caballo del camino (x=3100) se monta solo cuando el jugador llega
    // hasta él y pulsa E; no hay montura automática por avanzar de nivel.
    if(!j.aCaballo && Math.abs(3100-(j.x+j.w/2))<82 && Math.abs((440-j.h)-j.y)<70){
      j.aCaballo=true;
      this.enemigos.forEach(e=>e.aCaballo=true);
      this.caballoMontado=true;
      return;
    }
    const c=this.carteles.find(o=>cerca(o));if(c){this.mostrarLectura(c.titulo,c.texto);return;}
    const doc=this.objetos.find(o=>o.tipo==='documento'&&!o.recogido&&cerca(o));if(doc){this.mostrarLectura('DOCUMENTO DE CAMINO',doc.texto);doc.recogido=true;this.notas++;this.actualizarHUD();return;}
    if(j.x>4860){if(this.tieneCarta){this.victoria();}else this.mostrarLectura('FALTA LA CARTA','Volvé al comienzo del camino y recogé la carta que te encargaron llevar.');}}
  mostrarLectura(titulo,texto){if(this.lecturaAbierta)return;this.velocidadGuardadaLectura=this.jugador.vx;this.lecturaAbierta=true;document.getElementById('plataformas-lectura-titulo').textContent=titulo;document.getElementById('plataformas-lectura-texto').textContent=texto;this.lectura.classList.remove('hidden');this.teclas.clear();}
  cerrarLectura(){this.lectura.classList.add('hidden');this.lecturaAbierta=false;if(this.activo&&!this.pausado&&!this.terminado){/* Reanudar inmediatamente las teclas que el jugador sigue manteniendo pulsadas. */this.jugador.vx=this.velocidadGuardadaLectura;if(this.teclas.has(' ')||this.teclas.has('ArrowUp')||this.teclas.has('w')||this.teclas.has('W'))this.saltar();this.anterior=performance.now();requestAnimationFrame(t=>this.bucle(t));}}
  bucle(t){if(!this.activo||this.pausado||this.terminado||this.lecturaAbierta||this.orientacionBloqueada)return;const dt=Math.min((t-this.anterior)/1000,.032);this.anterior=t;this.actualizar(dt);this.dibujar(t);requestAnimationFrame(n=>this.bucle(n));}
  actualizar(dt){if(!this.activo||this.pausado||this.terminado||this.lecturaAbierta)return;this.tiempoAnimacionCarrera += dt * 1000;const j=this.jugador;const izq=this.teclas.has('ArrowLeft')||this.teclas.has('a')||this.teclas.has('A');const der=this.teclas.has('ArrowRight')||this.teclas.has('d')||this.teclas.has('D');// A mitad del recorrido, el protagonista monta un caballo y acelera.
    const velocidadBase=j.aCaballo?290:235;const velocidad=izq?-velocidadBase:der?velocidadBase:0;const aceleracion=velocidad!==0?Math.min(1,dt*12):Math.min(1,dt*3.5);j.vx+=(velocidad-j.vx)*aceleracion;if(Math.abs(j.vx)<2)j.vx=0;if(j.vx)j.direccion=Math.sign(j.vx);const antesY=j.y;j.x=Math.max(0,Math.min(this.mundo.ancho-j.w,j.x+j.vx*dt));j.vy=Math.min(760,j.vy+1350*dt);j.y+=j.vy*dt;j.suelo=false;
    // Colisión vertical con superficies: aterriza solo al caer desde arriba.
    if(j.vy>=0){for(const p of this.plataformas){if(j.x+j.w>p.x&&j.x<p.x+p.w&&antesY+j.h<=p.y+4&&j.y+j.h>=p.y){j.y=p.y-j.h;j.vy=0;j.suelo=true;}}}
    if(j.vy<0){for(const p of this.plataformas){if(j.x+j.w>p.x&&j.x<p.x+p.w&&antesY>=p.y+p.h&&j.y<=p.y+p.h){j.y=p.y+p.h;j.vy=0;}}}
    // Zanja: si el jugador no alcanzó la plataforma, cae y reaparece en el punto de control.
    if(j.y>560)this.perderVida();
    this.enemigos.forEach(e=>{
      // Compatibilidad defensiva con guardias creados por partidas anteriores.
      if(!Number.isFinite(e.x))e.x=0;
      if(!Number.isFinite(e.y))this.reiniciarGuardiaDetrasDelJugador(e);
      if(!Number.isFinite(e.vy))e.vy=0;
      const velocidadPersecucion=e.aCaballo?228:180;
      const objetivo=j.x+(j.w-e.w)/2;
      const antesX=e.x, antesY=e.y, antesPies=antesY+e.h;
      const plataformaActual=this.plataformas.find(p=>
        e.x+e.w>p.x+0.5&&e.x<p.x+p.w-0.5&&Math.abs(e.y+e.h-p.y)<=3
      )||null;
      const estaEnPlataformaAlta=!!(plataformaActual&&plataformaActual.tipo!=='tierra');

      // Elegir el borde una sola vez y conservarlo hasta haber salido por completo.
      if(e.estado!=='BUSCANDO_BORDE'&&e.estado!=='CAYENDO'&&e.suelo&&estaEnPlataformaAlta&&j.y>e.y+e.h+18){
        const centroPlataforma=plataformaActual.x+plataformaActual.w/2;
        const jugadorALaIzquierda=j.x+j.w/2<centroPlataforma;
        e.estado='BUSCANDO_BORDE';
        e.plataformaObjetivo=plataformaActual;
        e.bordeObjetivo=jugadorALaIzquierda?'izquierda':'derecha';
      }

      let objetivoX=objetivo;
      const plataformaDescenso=e.plataformaObjetivo;
      if(e.estado==='BUSCANDO_BORDE'&&plataformaDescenso){
        const bordeIzq=plataformaDescenso.x-e.w-2;
        const bordeDer=plataformaDescenso.x+plataformaDescenso.w+2;
        objetivoX=e.bordeObjetivo==='izquierda'?bordeIzq:bordeDer;
        const fueraIzq=e.x+e.w<=plataformaDescenso.x-0.5;
        const fueraDer=e.x>=plataformaDescenso.x+plataformaDescenso.w+0.5;
        if((e.bordeObjetivo==='izquierda'&&fueraIzq)||(e.bordeObjetivo==='derecha'&&fueraDer)){
          e.estado='CAYENDO';e.suelo=false;
        }
      }
      if(e.estado==='CAYENDO'&&plataformaDescenso){
        // No volver horizontalmente sobre la plataforma de salida mientras aún se está cayendo.
        if(e.y<=plataformaDescenso.y+plataformaDescenso.h){
          objetivoX=e.bordeObjetivo==='izquierda'
            ? Math.min(objetivo,plataformaDescenso.x-e.w-2)
            : Math.max(objetivo,plataformaDescenso.x+plataformaDescenso.w+2);
        }else{
          objetivoX=objetivo;
        }
      }

      // IA de salto con objetivo persistente: evita rebotar repetidamente al llegar a una plataforma.
      e.saltoCooldown=Math.max(0,(e.saltoCooldown||0)-dt);
      const direccionGuardia=Math.sign(objetivoX-e.x)||Math.sign(j.x-e.x)||1;
      const frente=direccionGuardia>=0?e.x+e.w:e.x;
      const anticipacion=e.aCaballo?190:165;
      const zanjaCercana=this.zanjas.find(z=>direccionGuardia>=0
        ? z.x>=frente-2&&z.x<=frente+anticipacion
        : z.x+z.w<=frente+2&&z.x+z.w>=frente-anticipacion);
      const trampaCercana=this.peligros.find(q=>direccionGuardia>=0
        ? q.x>=frente-2&&q.x<=frente+anticipacion
        : q.x+q.w<=frente+2&&q.x+q.w>=frente-anticipacion);
      const obstaculo=zanjaCercana||trampaCercana;
      let objetivoMovimiento=objetivoX;
      let techoBajo=false;
      if(obstaculo){
        // La ruta se decide por los peligros y zanjas reales del mapa, no por
        // plataformas decorativas cercanas que antes activaban falsamente un rodeo.
        // Las colisiones inferiores siguen impidiendo atravesar un techo de verdad.
        techoBajo=false;
      }
      if(e.estado==='RETROCEDIENDO_SALTO'){
        const retroObjetivo=Number.isFinite(e.xObjetivoSalto)?e.xObjetivoSalto:e.x;
        objetivoMovimiento=retroObjetivo;
        if(e.suelo&&Math.abs(e.x-retroObjetivo)<5){
          if(e.techoAlternativo){
            // No saltar contra la cara inferior del techo: buscar el lateral de la plataforma.
            const techo=e.techoAlternativo;
            const borde=direccionGuardia>=0 ? techo.x-e.w-8 : techo.x+techo.w+8;
            e.estado='BUSCANDO_BORDE';e.plataformaObjetivo=techo;
            e.bordeObjetivo=direccionGuardia>=0?'izquierda':'derecha';
            e.xObjetivoSalto=null;e.objetivoPeligro=null;e.techoAlternativo=null;
            objetivoMovimiento=borde;
          }else{
            e.estado='PERSIGUIENDO';e.saltoCooldown=0.9;e.plataformaSaltoObjetivo=null;
            e.vy=-(e.aCaballo?610:565);e.suelo=false;e.xObjetivoSalto=null;e.objetivoPeligro=null;
            objetivoMovimiento=objetivoX;
          }
        }
      } else if(e.estado==='PERSIGUIENDO'&&e.suelo&&obstaculo&&!techoBajo&&e.saltoCooldown<=0){
        // Salto único al acercarse al peligro; el cooldown evita saltos en bucle.
        const distancia=direccionGuardia>=0?obstaculo.x-frente:frente-(obstaculo.x+obstaculo.w);
        if(distancia>=-3&&distancia<=(e.aCaballo?165:140)){
          e.vy=-(e.aCaballo?610:565);e.suelo=false;e.saltoCooldown=0.85;
        }
      }
      if(e.estado==='PERSIGUIENDO'&&e.suelo&&j.y+10<e.y&&e.saltoCooldown<=0){
        // Solo intenta subir cuando hay una plataforma objetivo concreta y está cerca de su borde.
        const plataformaSuperior=this.plataformas.find(q=>q.tipo!=='tierra'&&q.x+q.w>e.x-8&&q.x<e.x+e.w+72&&q.y<e.y-12&&q.y+q.h<=e.y+e.h);
        if(plataformaSuperior&&e.plataformaSaltoObjetivo!==plataformaSuperior){
          const bordeCercano=Math.min(Math.abs(e.x-plataformaSuperior.x),Math.abs((e.x+e.w)-(plataformaSuperior.x+plataformaSuperior.w)));
          if(bordeCercano<72){e.vy=-520;e.suelo=false;e.saltoCooldown=0.95;e.plataformaSaltoObjetivo=plataformaSuperior;}
        }
      }

      const dx=objetivoMovimiento-e.x;
      const avanceX=Math.abs(dx)>1.5?Math.sign(dx)*Math.min(Math.abs(dx),velocidadPersecucion*dt):0;
      const xPropuesto=e.x+avanceX;
      // Los pinchos son sólidos para el guardia: no puede atravesarlos caminando.
      // Si llega al obstáculo desde el suelo, inicia un salto y solo lo cruza cuando
      // toda su hitbox está por encima de las puntas.
      const pinchoBloqueante=this.peligros.find(q=>
        xPropuesto+e.w>q.x+1&&xPropuesto<q.x+q.w-1&&
        e.y+e.h>440-q.h+1);
      if(pinchoBloqueante){
        const alturaDespejada=e.y+e.h<=440-pinchoBloqueante.h+1;
        if(e.suelo&&e.saltoCooldown<=0&&!techoBajo){
          e.vy=-(e.aCaballo?610:565);e.suelo=false;e.saltoCooldown=0.85;
        }else if(!alturaDespejada){
          // Si el salto está bloqueado por un techo, retrocede hasta un punto de preparación
          // y vuelve a intentar desde el borde, en vez de quedar vibrando contra el obstáculo.
          if(techoBajo && e.estado!=='RETROCEDIENDO_SALTO'){
            e.estado='RETROCEDIENDO_SALTO';
            e.objetivoPeligro=pinchoBloqueante;
            e.xObjetivoSalto=Math.max(0, e.x-120* (direccionGuardia||1));
            e.techoAlternativo=null;
          }
          // No atraviesa el peligro mientras busca un punto seguro.
        }
      }else{
        e.x=xPropuesto;
      }
      // Guardar la velocidad horizontal real: el renderizador la usa para
      // elegir el sprite de caminar hacia izquierda/derecha. Antes e.v
      // quedaba siempre en 0 y el guardia nunca activaba la animación.
      e.v = dt > 0 ? (e.x - antesX) / dt : 0;
      // Gravedad integrada una sola vez por fotograma.
      e.vy=Math.min(800,e.vy+1350*dt);
      e.y+=e.vy*dt;
      e.suelo=false;

      // Aterrizaje continuo: solo colisiona al cruzar la cara superior descendiendo.
      if(e.vy>=0){
        let aterrizaje=null;
        for(const q of this.plataformas){
          const solapa=e.x+e.w>q.x+0.5&&e.x<q.x+q.w-0.5;
          if(solapa&&antesPies<=q.y+4&&e.y+e.h>=q.y){
            if(!aterrizaje||q.y<aterrizaje.y)aterrizaje=q;
          }
        }
        if(aterrizaje){
          e.y=aterrizaje.y-e.h;e.vy=0;e.suelo=true;
          if(e.estado==='CAYENDO'||e.estado==='ATERRIZANDO'){
            e.estado='ATERRIZANDO';e.plataformaObjetivo=null;e.bordeObjetivo=null;
            // El estado de aterrizaje dura solo este contacto; luego vuelve a perseguir.
            e.estado='PERSIGUIENDO';
          }
        }
      }else{
        // Colisión con la cara inferior para evitar atravesar plataformas al saltar.
        for(const q of this.plataformas){
          const solapa=e.x+e.w>q.x+0.5&&e.x<q.x+q.w-0.5;
          if(solapa&&antesY>=q.y+q.h&&e.y<=q.y+q.h){
            e.y=q.y+q.h;e.vy=0;break;
          }
        }
      }

      // El apoyo se determina por una superficie real; no se fuerza y durante la caída.
      if(!e.suelo){
        const soporte=this.plataformas.find(q=>e.x+e.w>q.x+0.5&&e.x<q.x+q.w-0.5&&Math.abs(e.y+e.h-q.y)<1.25);
        if(soporte&&e.vy===0)e.suelo=true;
      }
      if(e.estado==='BUSCANDO_BORDE'&&e.plataformaObjetivo){
        const q=e.plataformaObjetivo;
        if(e.x+e.w<=q.x-0.5||e.x>=q.x+q.w+0.5){e.estado='CAYENDO';e.suelo=false;}
      }
      if(e.y>560){
        // Recuperación excepcional sobre tierra real, detrás del jugador y con físicas reiniciadas.
        this.reiniciarGuardiaDetrasDelJugador(e,125);
      }

      // Recuperación anti-atasco: si el guardia no avanza durante un tiempo,
      // evita que quede intentando saltar indefinidamente contra pinchos/fuego.
      if(Math.abs(e.x-(e.ultimoX??e.x))<0.8 && (e.suelo || e.estado==='BUSCANDO_BORDE' || e.estado==='RETROCEDIENDO_SALTO')){
        e.tiempoAtascado=(e.tiempoAtascado||0)+dt;
      }else{
        e.tiempoAtascado=0;
      }
      e.ultimoX=e.x;
      if(e.tiempoAtascado>0.9){
        const dir=Math.sign(j.x-e.x)||1;
        const peligroBloqueante=this.peligros.find(q=>dir>0
          ? q.x>=e.x+e.w-3&&q.x<j.x+80
          : q.x+q.w<=e.x+3&&q.x+q.w>j.x-80);
        // Ruta de recuperación determinista: buscar el primer tramo de tierra seguro
        // después del peligro que bloqueó el avance. No elegir huecos entre plataformas
        // ni volver a colocar al guardia delante del mismo obstáculo.
        const tierras=this.plataformas.filter(q=>q.tipo==='tierra'&&q.w>=e.w+8);
        let candidatos=[];
        if(peligroBloqueante){
          candidatos=tierras.filter(t=>dir>0
            ? t.x+t.w>peligroBloqueante.x+peligroBloqueante.w+12
            : t.x<peligroBloqueante.x-12).sort((a,b)=>dir>0?a.x-b.x:b.x-a.x);
        }
        if(!candidatos.length)candidatos=tierras.slice().sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x));
        let elegido=null, destino=null;
        for(const t of candidatos){
          const prueba=dir>0?Math.max(t.x+8,peligroBloqueante?peligroBloqueante.x+peligroBloqueante.w+24:t.x+8):Math.min(t.x+t.w-e.w-8,peligroBloqueante?peligroBloqueante.x-e.w-24:t.x+t.w-e.w-8);
          if(prueba<t.x+2||prueba+e.w>t.x+t.w-2)continue;
          if(this.peligros.some(q=>prueba+e.w>q.x-12&&prueba<q.x+q.w+12))continue;
          elegido=t;destino=prueba;break;
        }
        if(elegido){
          e.x=destino;e.y=elegido.y-e.h;e.vy=0;e.suelo=true;
        }else{
          // Fallback seguro: reaparecer detrás del jugador, reiniciando toda la IA.
          this.reiniciarGuardiaDetrasDelJugador(e,210);
        }
        e.estado='PERSIGUIENDO';e.bordeObjetivo=null;e.plataformaObjetivo=null;e.saltoCooldown=0.6;
        e.plataformaSaltoObjetivo=null;e.objetivoPeligro=null;e.techoAlternativo=null;e.xObjetivoSalto=null;e.tiempoAtascado=0;e.ultimoX=e.x;
      }
      // Contacto con hitboxes físicas; márgenes pequeños para evitar daño a distancia.
      const margenX=e.aCaballo?8:3, margenY=e.aCaballo?6:2;
      const contactoHorizontal=(j.x+j.w)>(e.x-margenX)&&(j.x)<(e.x+e.w+margenX);
      const contactoVertical=(j.y+j.h)>(e.y-margenY)&&(j.y)<(e.y+e.h+margenY);
      if(this.activo&&!this.pausado&&!this.terminado&&(j.invulnerable||0)<=0&&contactoHorizontal&&contactoVertical){
        this.perderVida();
      }
    });
    this.peligros.forEach(p=>{const py=440-p.h;if(j.invulnerable<=0&&j.x+j.w>p.x&&j.x<p.x+p.w&&j.y+j.h>py&&j.y<440)this.perderVida();});
    if((j.invulnerable||0)>0)j.invulnerable=Math.max(0,j.invulnerable-dt);
    // Los carteles se leen automáticamente al llegar a ellos, igual que las notas; cada uno se abre una sola vez por partida.
    const cartelCercano=this.carteles.find((c,i)=>!this.cartelesLeidos.has(i)&&Math.abs((c.x)-(j.x+j.w/2))<38);
    if(cartelCercano&&!this.lecturaAbierta){const indice=this.carteles.indexOf(cartelCercano);this.cartelesLeidos.add(indice);this.mostrarLectura(cartelCercano.titulo,cartelCercano.texto);}
    this.objetos.forEach(o=>{if(o.recogido)return;const oy=o.tipo==='provision'||o.tipo==='documento'?o.y:400;if(j.x<o.x+24&&j.x+j.w>o.x&&j.y<oy+24&&j.y+j.h>oy){if(o.tipo==='carta'){o.recogido=true;this.tieneCarta=true;this.mostrarLectura('CARTA RECOGIDA','La carta está en tus manos. Cruzá las pampas y entregala en el asentamiento.');}else if(o.tipo==='provision'){o.recogido=true;this.provisiones++;}else {o.recogido=true;this.notas++;this.actualizarHUD();this.mostrarLectura('DOCUMENTO DE CAMINO',o.texto);}}});
    this.puntos.forEach(p=>{if(!p.activado&&j.x>p.x){p.activado=true;this.checkpoint=Math.min(this.mundo.ancho-80,p.x+55);}});
    this.mundo.camara=Math.max(0,Math.min(this.mundo.ancho-this.canvas.width,j.x-this.canvas.width*.35));
    this.actualizarHUD();
    if(j.x>6380&&this.tieneCarta)this.victoria();
  }
  perderVida(){
    if(!this.activo||this.pausado||this.jugador.invulnerable>0||this.terminado)return;
    this.vidas=Math.max(0,this.vidas-1);this.actualizarHUD();
    if(this.vidas<=0){
      this.terminado=true;this.activo=false;this.pausado=false;this.teclas.clear();
      this.overlay.classList.remove('hidden');this.overlay.style.display='';
      document.getElementById('plataformas-titulo').textContent='GAME OVER';
      document.getElementById('plataformas-mensaje').textContent='Perdiste las cuatro vidas. Reiniciá para volver al primer checkpoint y comenzar de nuevo.';
      document.querySelector('.plataformas-controles')?.classList.add('hidden');
      document.getElementById('plataformas-jugar').textContent='REINTENTAR DESDE EL INICIO';
      return;
    }
    this.jugador.x=Math.max(70,this.checkpoint);this.jugador.y=398;this.jugador.vx=0;this.jugador.vy=0;this.jugador.suelo=true;this.jugador.aCaballo=false;this.jugador.invulnerable=1.8;
    this.enemigos.forEach(e=>{
      // La muerte del jugador inicia una persecución nueva: no conservar estados de
      // salto, caída o búsqueda de bordes calculados antes del respawn.
      this.reiniciarGuardiaDetrasDelJugador(e,260);
      e.aCaballo=false;
      e.v=0; e.vy=0;
      e.suelo=!!this.superficieTierraEn(e.x,e.w);
      e.estado='PERSIGUIENDO';
      e.bordeObjetivo=null; e.plataformaObjetivo=null;
      e.saltoCooldown=0.8; e.plataformaSaltoObjetivo=null;
      e.objetivoPeligro=null; e.techoAlternativo=null; e.xObjetivoSalto=null;
      e.ultimoX=e.x; e.tiempoAtascado=0;
      e.min=-170; e.max=4700;
    });
  }
  victoria(){if(this.terminado)return;this.terminado=true;this.activo=false;this.overlay.classList.remove('hidden');document.getElementById('plataformas-titulo').textContent='¡Mensaje entregado!';document.getElementById('plataformas-mensaje').textContent='En el capítulo IV, «Revolución de 1810», Sarmiento narra el impacto de la revolución y el papel de las campañas en los conflictos posteriores. Su oposición entre ciudad y campo es una interpretación del autor, no una descripción neutral de toda la sociedad.';document.querySelector('.plataformas-controles')?.classList.add('hidden');document.getElementById('plataformas-jugar').textContent='VOLVER A NIVELES';}
  dibujar(t){
    const c=this.ctx,cam=this.mundo.camara;c.imageSmoothingEnabled=false;c.clearRect(0,0,960,540);
    // Cielo en bandas, con horizonte cálido y nubes pixeladas.
    c.fillStyle='#87b9c8';c.fillRect(0,0,960,540);c.fillStyle='#a9ced0';c.fillRect(0,130,960,170);c.fillStyle='#d9d9b1';c.fillRect(0,260,960,80);
    // Sol bajo, nubes con sombra y parallax en varias distancias.
    c.fillStyle='#f0d79a';c.fillRect(748,68,42,42);c.fillRect(758,58,22,62);c.fillRect(738,78,62,22);
    for(let i=0;i<7;i++){let x=((i*193-cam*.12)%1250+1250)%1250-100,y=45+(i%3)*35;c.fillStyle='#8db4bd';c.fillRect(x+8,y+8,50,12);c.fillRect(x+18,y,27,12);c.fillStyle='#e0e4cf';c.fillRect(x,y,54,12);c.fillRect(x+10,y-8,28,12);c.fillRect(x+32,y,24,12);}
    // Sierras lejanas, lomas intermedias y pastizales próximos.
    c.fillStyle='#a4b99a';for(let i=0;i<8;i++){let x=((i*190-cam*.19)%1500+1500)%1500-120;c.beginPath();c.moveTo(x,325);c.lineTo(x+80,225+(i%3)*18);c.lineTo(x+170,325);c.fill();}
    c.fillStyle='#829c72';for(let i=0;i<10;i++){let x=((i*150-cam*.32)%1400+1400)%1400-100;c.fillRect(x,320,155,95);c.fillRect(x+25,295,105,35);c.fillRect(x+45,280,60,18);}
    c.fillStyle='#6d895a';c.fillRect(0,385,960,155);c.fillStyle='#78945e';c.fillRect(0,400,960,35);
    // Árboles, postes y cercas en capas, con textura de pixel art.
    for(let i=0;i<18;i++){let wx=i*310+120,x=wx-cam*.62;if(x<-40||x>1000)continue;c.fillStyle='#624b32';c.fillRect(x+12,326,9,62);c.fillStyle='#3f6547';c.fillRect(x,292,34,32);c.fillRect(x-8,307,18,25);c.fillStyle='#55784b';c.fillRect(x+5,280,25,20);c.fillStyle='#7e9a60';c.fillRect(x+7,289,8,6);}
    for(let i=0;i<30;i++){let wx=260+i*170,x=wx-cam;if(x<-20||x>980)continue;c.fillStyle='#8a6842';c.fillRect(x,402,4,37);c.fillRect(x+45,402,4,37);c.fillRect(x-3,410,54,5);c.fillRect(x-3,425,54,5);c.fillStyle='#b18a56';c.fillRect(x+1,405,2,5);}
    // Suelo con capas de tierra, raíces, piedras y briznas. Los huecos permanecen abiertos.
    this.plataformas.forEach(p=>{const x=Math.round(p.x-cam);if(x+p.w<0||x>960)return;
      if(p.tipo==='tierra'){c.fillStyle='#65452f';c.fillRect(x,p.y,p.w,p.h);c.fillStyle='#8b6240';c.fillRect(x,p.y,p.w,10);c.fillStyle='#b2a06a';c.fillRect(x,p.y,p.w,4);c.fillStyle='#71834e';for(let q=5;q<p.w;q+=17){c.fillRect(x+q,p.y-4,2,5);c.fillRect(x+q+3,p.y-2,2,3);}for(let q=8;q<p.w;q+=29){c.fillStyle='#65452f';c.fillRect(x+q,p.y+18+(q%3)*8,7,3);c.fillStyle='#9b7951';c.fillRect(x+q+2,p.y+34+(q%2)*7,4,3);}c.fillStyle='#4c3929';for(let q=16;q<p.w;q+=73){c.fillRect(x+q,p.y+p.h-12,10,3);c.fillRect(x+q+4,p.y+p.h-16,3,5);}}
      else {c.fillStyle='#68482e';c.fillRect(x,p.y,p.w,p.h);c.fillStyle='#b58a54';c.fillRect(x,p.y,p.w,5);c.fillStyle='#8b6139';c.fillRect(x,p.y+6,p.w,p.h-6);for(let q=8;q<p.w;q+=24){c.fillStyle='#d0a66a';c.fillRect(x+q,p.y+7,2,3);c.fillStyle='#533a27';c.fillRect(x+q+10,p.y+12,4,2);}}
    });
    this.zanjas.forEach(z=>{const x=Math.round(z.x-cam);c.fillStyle='#40352a';c.fillRect(x,440,z.w,100);c.fillStyle='#302a23';c.fillRect(x,440,z.w,12);c.fillStyle='#58422d';for(let q=4;q<z.w;q+=12)c.fillRect(x+q,460+(q%3)*12,5,3);c.fillStyle='#6e8953';c.fillRect(x-3,437,5,5);c.fillRect(x+z.w-2,437,5,5);});
    const deco=[{x:65,y:440,t:'rancho'},{x:870,y:440,t:'carreta'},{x:1510,y:440,t:'tienda'},{x:1700,y:440,t:'fogata'},{x:2310,y:440,t:'carreta'},{x:2920,y:440,t:'tienda'},{x:3100,y:440,t:'caballo'},{x:4300,y:440,t:'rancho'},{x:4620,y:440,t:'caballo'}];deco.forEach(d=>{if(d.x===3100&&this.jugador.aCaballo)return;this.dibujarDecoracion(c,Math.round(d.x-cam),d.y,d.t);});
    if(!this.jugador.aCaballo && Math.abs(3100-(this.jugador.x+this.jugador.w/2))<145){
      c.save();c.font='bold 12px monospace';c.textAlign='center';c.fillStyle='#2b2118';c.fillRect(Math.round(3100-cam)-91,365,182,22);c.fillStyle='#f6e4b5';c.fillText('PRESIONÁ E PARA MONTAR',Math.round(3100-cam),380);c.restore();
    }
    this.carteles.forEach(o=>{const x=Math.round(o.x-cam);c.fillStyle='#513923';c.fillRect(x-2,367,8,73);c.fillStyle='#8a633c';c.fillRect(x-4,369,3,68);c.fillStyle='#d8bd80';c.fillRect(x-32,349,70,23);c.fillStyle='#8c6841';c.fillRect(x-32,349,70,3);c.fillStyle='#3b3022';c.font='bold 8px monospace';c.fillText('LEER [E]',x-25,364);});
    this.objetos.forEach(o=>{if(o.recogido)return;const x=Math.round(o.x-cam),y=o.y;if(o.tipo==='carta'){c.fillStyle='#7b5937';c.fillRect(x-2,y+3,22,23);c.fillStyle='#f4e4b7';c.fillRect(x,y,18,22);c.fillStyle='#c9b58a';c.fillRect(x+2,y+3,14,16);c.fillStyle='#a64d3a';c.fillRect(x+4,y+6,10,2);c.fillRect(x+4,y+11,8,2);c.fillStyle='#d5b36d';c.fillRect(x+6,y+17,5,2);}
      else if(o.tipo==='provision'){c.fillStyle='#755238';c.fillRect(x+2,y+3,18,17);c.fillStyle='#c6a064';c.fillRect(x,y+2,18,16);c.fillStyle='#e3c784';c.fillRect(x+3,y,12,3);c.fillStyle='#8c6a42';c.fillRect(x+5,y+6,8,8);c.fillStyle='#6b7544';c.fillRect(x+8,y+7,3,6);}
      else {c.fillStyle='#75533a';c.fillRect(x+2,y+2,20,25);c.fillStyle='#f3e5bf';c.fillRect(x,y,20,25);c.fillStyle='#c8b48a';c.fillRect(x+2,y+2,16,21);c.fillStyle='#a34b38';c.fillRect(x+4,y+5,12,2);c.fillRect(x+4,y+10,10,2);c.fillRect(x+4,y+15,7,2);c.fillStyle='#d5bd8b';c.fillRect(x+13,y+18,4,4);}});
    this.puntos.forEach(p=>{const x=Math.round(p.x-cam);c.fillStyle='#513b27';c.fillRect(x,370,7,70);c.fillStyle=p.activado?'#d7bd72':'#8b6843';c.fillRect(x-8,361,24,18);c.fillStyle='#f2e3b8';c.fillRect(x-5,364,18,11);c.fillStyle='#a14d39';c.fillRect(x,366,8,2);});
    this.peligros.forEach(p=>{const x=Math.round(p.x-cam),base=440;if(x+p.w<0||x>960)return;const spriteId=p.tipo==='pinchos'?'pinchos':'fogata';if(this.dibujarSprite(c,spriteId,x-5,base-(p.tipo==='pinchos'?42:38),p.w+10,p.tipo==='pinchos'?42:38))return;if(p.tipo==='pinchos'){c.fillStyle='#5c4a38';c.fillRect(x,base-3,p.w,4);c.fillStyle='#b7b6a2';for(let q=0;q<p.w;q+=8){c.beginPath();c.moveTo(x+q,base-3);c.lineTo(x+q+4,base-p.h);c.lineTo(x+q+8,base-3);c.fill();}c.fillStyle='#77766b';for(let q=2;q<p.w;q+=8)c.fillRect(x+q,base-7,2,3);}else{c.fillStyle='#59412c';c.fillRect(x,base-5,p.w,5);c.fillRect(x+4,base-8,p.w-8,3);c.fillStyle='#c45c2c';c.fillRect(x+6,base-p.h+8,p.w-12,p.h-12);c.fillStyle='#f3ad43';c.fillRect(x+10,base-p.h+3,p.w-20,p.h-12);c.fillStyle='#ffe08a';c.fillRect(x+13,base-p.h+8,5,10);c.fillStyle='#d9d1a5';c.fillRect(x+2,base-2,5,2);c.fillRect(x+p.w-7,base-2,5,2);}});
    this.enemigos.forEach(e=>this.dibujarEnemigo(c,Math.round(e.x-cam),e.y||408,e,t));
    this.dibujarJugador(c,Math.round(this.jugador.x-cam),Math.round(this.jugador.y),t);
    // Viñeta pixelada muy sutil para separar el plano de juego del marco.
    c.fillStyle='#25392a22';c.fillRect(0,520,960,20);
  }
  dibujarEnemigo(c,x,y,e,t){
    if(!e.aCaballo){
      const dir=(e.v||0)<0?'i':'d', estado=!e.suelo?(e.vy<0?'jump':(e.vy>30?'fall':'precaida')):((Math.abs(e.v||0)>15)?'walk':'idle');
      const id=estado==='walk'
        ? `guardia_run_${dir}_${this.indiceFrameCarrera(this.tiempoAnimacionCarrera,180)}`
        : `guardia_${estado}_${dir}`;
      // La caja física mide 34 px: el borde inferior del sprite debe terminar
      // exactamente en y + h (suelas apoyadas, sin margen transparente).
      if(this.dibujarSprite(c,id,x-12,y-22,48,56))return;
    } else {
      const dir=(e.v||0)<0?'i':'d';
      const montadoEstado=!e.suelo?(e.vy<=0?'jump':'fall'):((Math.abs(e.v||0)>15)?'run':'idle');
      const id=montadoEstado==='run'
        ? `guardia_montado_run_${dir}_${Math.floor(t/180)%6}`
        : (montadoEstado==='jump'
          ? `guardia_montado_jump_${dir}_0`
          : (montadoEstado==='fall' ? `guardia_montado_fall_${dir}` : `guardia_montado_${dir}`));
      if(this.dibujarSprite(c,id,x-24,y-34,68,64))return;
    }
    if(e.aCaballo)return;
    // Guardia a pie con uniforme histórico simplificado; silueta claramente humana.
    const paso=Math.floor(t/120)%2;c.save();
    c.fillStyle='#2b3028';c.fillRect(x+5,y+31,7,9+(paso?2:0));c.fillRect(x+17,y+31,7,9+(paso?0:2));
    c.fillStyle='#6f4931';c.fillRect(x+4,y+15,22,18);c.fillStyle='#9b7046';c.fillRect(x+7,y+17,16,12);
    c.fillStyle='#d1b28a';c.fillRect(x+1,y+18,5,14);c.fillRect(x+24,y+18,5,14);
    c.fillStyle='#c89b6b';c.fillRect(x+9,y+4,12,12);c.fillStyle='#29241f';c.fillRect(x+9,y+2,12,4);c.fillRect(x+6,y+5,18,3);
    c.fillStyle='#3b3026';c.fillRect(x+11,y+9,2,2);c.fillRect(x+17,y+9,2,2);
    c.fillStyle='#8c3328';c.fillRect(x+5,y+15,20,4);c.fillStyle='#d5b879';c.fillRect(x+13,y+16,4,3);
    c.restore();
  }
  dibujarJugador(c,x,y,t){const j=this.jugador;
    if(j.invulnerable>0&&Math.floor(t/90)%2===0)return;
    const dir=j.direccion<0?'i':'d', estado=!j.suelo?(j.vy<0?'jump':(j.vy>30?'fall':'precaida')):((Math.abs(j.vx)>30)?'walk':'idle');
    if(j.aCaballo){
      const montadoEstado=!j.suelo?(j.vy<=0?'jump':'fall'):((Math.abs(j.vx)>30)?'run':'idle');
      const id=montadoEstado==='run'
        ? `jugador_montado_run_${dir}_${Math.floor(t/180)%6}`
        : (montadoEstado==='jump'
          ? `jugador_montado_jump_${dir}_0`
          : (montadoEstado==='fall' ? `jugador_montado_fall_${dir}` : `jugador_montado_${dir}`));
      if(this.dibujarSprite(c,id,x-26,y-36,70,66))return;
    } else {
      const id=estado==='walk'
        ? `jugador_run_${dir}_${this.indiceFrameCarrera(this.tiempoAnimacionCarrera,180)}`
        : `jugador_${estado}_${dir}`;
      // La caja física mide 34 px: el borde inferior del sprite debe terminar
      // exactamente en y + h (suelas apoyadas, sin margen transparente).
      if(this.dibujarSprite(c,id,x-12,y-22,48,56))return;
    }
    // Los sprites de montura ya incluyen caballo y jinete; nunca superponer
    // el caballo procedural ni el personaje dibujado por código.
    if(j.aCaballo)return;
    if(j.invulnerable>0&&Math.floor(t/90)%2===0)return;const corriendo=Math.abs(j.vx)>30,salto=!j.suelo,paso=corriendo?Math.floor(t/85)%2:0;
    // Sombra, botas, bombacha, camisa, pañuelo y sombrero de ala ancha.
    c.fillStyle='#35402d66';c.fillRect(x+1,y+40,26,4);
    c.fillStyle='#30271f';c.fillRect(x+4,y+33,8,8);c.fillRect(x+15,y+33+(paso&&!salto?2:0),8,8);c.fillStyle='#6e5438';c.fillRect(x+3,y+38,10,4);c.fillRect(x+14,y+38+(paso&&!salto?2:0),10,4);
    c.fillStyle='#5d7048';c.fillRect(x+4,y+20,18,15);c.fillStyle='#82915c';c.fillRect(x+6,y+21,13,8);c.fillStyle='#d7c49a';c.fillRect(x+8,y+23,3,7);c.fillRect(x+15,y+23,3,7);c.fillStyle='#47382a';c.fillRect(x+3,y+19,21,3);c.fillStyle='#a04d3b';c.fillRect(x+5,y+16,18,5);c.fillStyle='#d9a16a';c.fillRect(x+7,y+16,4,2);
    c.fillStyle='#e9c69b';c.fillRect(x+8,y+5,13,12);c.fillStyle='#3d3024';c.fillRect(x+8,y+4,14,5);c.fillStyle='#f0d5ae';c.fillRect(x+10,y+8,2,2);c.fillRect(x+17,y+8,2,2);c.fillStyle='#392d22';c.fillRect(x+11,y+12,7,2);
    c.fillStyle='#4a3827';c.fillRect(x+3,y+4,24,3);c.fillRect(x+7,y,16,4);c.fillStyle='#87613b';c.fillRect(x+7,y+3,17,2);c.fillStyle='#c4a06a';c.fillRect(x+5,y+5,20,2);
    c.fillStyle='#d8d0ad';c.fillRect(x+10,y+22,2,7);c.fillRect(x+15,y+22,2,7);if(j.tieneCarta){c.fillStyle='#f0dfb0';c.fillRect(x+20,y+22,5,7);c.fillStyle='#a54b38';c.fillRect(x+21,y+24,3,1);}
  }
  dibujarCaballo(c,x,y,t,color){
    const paso=Math.floor(t/75)%2;c.save();
    // Caballo pixel-art en carrera, dibujado detrás del jinete.
    c.fillStyle='#30271f';c.fillRect(x+4,y+27,7,13+(paso?3:0));c.fillRect(x+18,y+27,7,13+(paso?0:3));c.fillRect(x+28,y+25,6,14+(paso?2:0));c.fillRect(x+39,y+25,6,14+(paso?0:2));
    c.fillStyle=color;c.fillRect(x+3,y+10,39,20);c.fillRect(x+30,y+2,12,20);c.fillRect(x+37,y-1,13,10);c.fillRect(x-2,y+8,9,5);
    c.fillStyle='#4a3021';c.fillRect(x+36,y+1,4,8);c.fillRect(x+47,y+2,3,3);c.fillRect(x-6,y+6,7,3);
    c.fillStyle='#b58a58';c.fillRect(x+11,y+13,22,4);c.fillRect(x+33,y+8,5,3);c.fillStyle='#33261d';c.fillRect(x+44,y+2,2,2);
    c.restore();
  }
  dibujarDecoracion(c,x,y,t){if(x<-120||x>1050)return;
    if(t==='rancho'){
      c.fillStyle='#57402b';c.fillRect(x-7,y-43,96,46);c.fillStyle='#b38a58';c.fillRect(x,y-38,80,38);c.fillStyle='#9a7047';c.fillRect(x+5,y-32,70,29);c.fillStyle='#6b4b30';c.fillRect(x-12,y-45,106,10);c.fillStyle='#8b5f39';c.fillRect(x-5,y-51,92,8);c.fillStyle='#c39a61';c.fillRect(x+2,y-42,75,3);c.fillStyle='#493323';c.fillRect(x+31,y-22,18,22);c.fillStyle='#b58a54';c.fillRect(x+34,y-19,12,19);c.fillStyle='#513a27';c.fillRect(x+9,y-27,13,12);c.fillStyle='#e1c995';c.fillRect(x+12,y-24,7,7);c.fillStyle='#755236';c.fillRect(x+55,y-28,13,25);c.fillStyle='#c49a5c';for(let i=0;i<5;i++)c.fillRect(x+8+i*15,y-35,2,5);c.fillStyle='#62462e';c.fillRect(x+25,y-3,5,5);c.fillRect(x+53,y-3,5,5);
    }else if(t==='carreta'){
      c.fillStyle='#60442c';c.fillRect(x+2,y-25,62,22);c.fillStyle='#b58a50';c.fillRect(x+5,y-23,55,16);c.fillStyle='#d3b171';c.fillRect(x+7,y-21,51,3);c.fillStyle='#8d6339';for(let i=0;i<5;i++)c.fillRect(x+10+i*10,y-18,3,10);c.fillStyle='#62472e';c.fillRect(x+10,y-30,49,5);c.fillRect(x+4,y-32,7,8);c.fillRect(x+57,y-32,7,8);c.fillStyle='#473525';c.fillRect(x+9,y-5,17,17);c.fillRect(x+42,y-5,17,17);c.fillStyle='#c09a60';c.fillRect(x+12,y-2,11,11);c.fillRect(x+45,y-2,11,11);c.fillStyle='#63482e';c.fillRect(x+16,y-1,3,9);c.fillRect(x+13,y+2,9,3);c.fillRect(x+49,y-1,3,9);c.fillRect(x+46,y+2,9,3);c.fillStyle='#62472e';c.fillRect(x+28,y-3,4,8);
    }else if(t==='tienda'){
      c.fillStyle='#63482f';c.fillRect(x+5,y-3,47,4);c.fillStyle='#b6a16d';c.beginPath();c.moveTo(x,y);c.lineTo(x+28,y-42);c.lineTo(x+58,y);c.fill();c.fillStyle='#d0bc82';c.beginPath();c.moveTo(x+7,y-3);c.lineTo(x+28,y-35);c.lineTo(x+49,y-3);c.fill();c.fillStyle='#7a5b3b';c.fillRect(x+26,y-22,5,22);c.fillStyle='#4e3b29';c.fillRect(x+24,y-5,9,5);c.fillStyle='#9b8557';c.fillRect(x+14,y-15,5,7);c.fillRect(x+38,y-15,5,7);
    }else if(t==='fogata'){
      c.fillStyle='#6a4c32';c.fillRect(x,y-3,38,5);c.fillRect(x+3,y-6,31,3);c.fillStyle='#8a5a32';c.fillRect(x+6,y-4,25,3);c.fillStyle='#d87932';c.fillRect(x+11,y-19,14,16);c.fillStyle='#f1b548';c.fillRect(x+14,y-24,8,17);c.fillStyle='#f5d778';c.fillRect(x+17,y-17,4,10);c.fillStyle='#9e5732';c.fillRect(x+5,y-8,4,4);c.fillRect(x+31,y-8,4,4);
    }else if(t==='caballo'){
      if(this.dibujarSprite(c,'caballo_idle',x-9,y-54,58,52))return;
      c.fillStyle='#4d3928';c.fillRect(x+2,y-27,35,21);c.fillRect(x+25,y-38,11,17);c.fillRect(x+29,y-42,8,8);c.fillRect(x+3,y-29,8,6);c.fillRect(x-4,y-31,8,5);c.fillStyle='#8a6240';c.fillRect(x+5,y-25,27,14);c.fillStyle='#a67b4d';c.fillRect(x+8,y-23,15,7);c.fillStyle='#513a28';c.fillRect(x+8,y-8,5,13);c.fillRect(x+26,y-8,5,13);c.fillRect(x+15,y-8,4,13);c.fillStyle='#30261d';c.fillRect(x+34,y-36,3,3);c.fillStyle='#c5a16b';c.fillRect(x+30,y-29,7,3);c.fillStyle='#3d2c20';c.fillRect(x+22,y-37,4,9);c.fillRect(x-7,y-34,5,7);c.fillStyle='#a78656';c.fillRect(x+7,y-17,16,3);
    }
  }
}
export { NivelCuatroPlataformas };
