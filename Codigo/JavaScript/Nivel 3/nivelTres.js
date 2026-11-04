
const HP = 8, TRAMOS = 6, TRONCOS_ARBOL = 2;
// Los tiempos de juego no deben depender de la preferencia de movimiento
// del sistema: esa preferencia solo afecta animaciones visuales en CSS.
const dur = ms => ms;
const $ = id => document.getElementById(id);
const audioNivel3 = {
  talar: new Audio(new URL('../../../Assets/Assets Sonidos/sonidos/Nivel 3/TalarArbol.mp3', document.baseURI)),
  caida: new Audio(new URL('../../../Assets/Assets Sonidos/sonidos/Nivel 3/TalarArbolCaida.mp3', document.baseURI)),
  puente: new Audio(new URL('../../../Assets/Assets Sonidos/sonidos/Nivel 3/ConstruccionPuente.mp3', document.baseURI))
};
Object.values(audioNivel3).forEach(a => { a.preload='auto'; a.volume=.65; });
function sonidoNivel3(nombre){
  const a=audioNivel3[nombre]; if(!a)return;
  try{a.currentTime=0; const p=a.play(); if(p?.catch)p.catch(()=>{});}catch(_){}
}

const RECETAS = [
  {id:'aserrar', nom:'Aserrar tablones', usa:{troncos:1}, da:{tablones:2}, txt:['1 tronco','2 tablones'], golpes:5, verbo:'serruchar'},
  {id:'lijar', nom:'Lijar la madera', usa:{tablones:2}, da:{tablonesLijados:2}, txt:['2 tablones','2 tablones lijados'], golpes:6, verbo:'lijar'},
  {id:'tratar', nom:'Tratar la madera', usa:{tablonesLijados:2}, da:{tablonesTratados:2}, txt:['2 tablones lijados','2 tablones tratados'], golpes:4, verbo:'tratar'},
  {id:'pilote', nom:'Afilar un pilote', usa:{troncos:1}, da:{pilotes:1}, txt:['1 tronco','1 pilote'], golpes:4, verbo:'afilar'}
];

const INGREDIENTES = [{nombre:'Aceite',icono:'🫒'},{nombre:'Resina',icono:'🟠'},{nombre:'Cera',icono:'🟡'},{nombre:'Trementina',icono:'🌿'},{nombre:'Carnaúba',icono:'🌴'},{nombre:'Linaza',icono:'🌰'}];
let S, prev = {}, juegoPausado = false;
const temporizadoresNivel3 = new Set();
let inicioPausaTemporizadores = 0;
function iniciarTemporizadorNivel3(entrada) {
  entrada.inicio = Date.now();
  entrada.id = setTimeout(() => {
    entrada.id = null;
    temporizadoresNivel3.delete(entrada);
    if (!juegoPausado) entrada.fn();
  }, entrada.restante);
}
function programarTemporizadorNivel3(fn, ms) {
  const entrada = { fn, restante: ms, inicio: 0, id: null };
  temporizadoresNivel3.add(entrada);
  if (!juegoPausado) iniciarTemporizadorNivel3(entrada);
  return entrada;
}
function cancelarTemporizadorNivel3(entrada) {
  if (!entrada) return;
  clearTimeout(entrada.id);
  temporizadoresNivel3.delete(entrada);
}
function establecerPausaNivel3(pausado) {
  const nuevoEstado = Boolean(pausado);
  if (juegoPausado === nuevoEstado) return;
  juegoPausado = nuevoEstado;
  if (juegoPausado) {
    inicioPausaTemporizadores = Date.now();
    temporizadoresNivel3.forEach((entrada) => {
      if (entrada.id !== null) {
        clearTimeout(entrada.id);
        entrada.restante = Math.max(0, entrada.restante - (Date.now() - entrada.inicio));
        entrada.id = null;
      }
    });
    return;
  }
  const tiempoPausa = Math.max(0, Date.now() - inicioPausaTemporizadores);
  (S?.workers || []).forEach((trabajador) => {
    if (trabajador.descanso && trabajador.descansoHasta) trabajador.descansoHasta += tiempoPausa;
  });
  temporizadoresNivel3.forEach(iniciarTemporizadorNivel3);
}
function nuevo(){
  S = {troncos:0, tablones:0, tablonesLijados:0, tablonesTratados:0, pilotes:0, hp:HP, busy:false, playerBusy:false, workerBusy:false, last:null, cruzo:false, proceso:null, lijarDrag:false, lijarX:null, lijarDir:1, trabajador:false, trabajadores:0, workers:[], workerTask:null, workerTimer:null, workerFatiga:100, workerDescanso:false, workerDescansoHasta:0, workerRestTimer:null, workerUltimoMovimiento:0, workerProceso:null, workerReserva:null, historia:0, historiaMostrada:0, b:Array.from({length:TRAMOS}, () => ({p:false,t:false}))};
  const g = $('gaucho'); if (g) g.remove();
}

/* ---------- Talar ---------- */
function updArbol(){
  const h = HP - S.hp, w = Math.min(h, 4) * 5;
  $('corteI').setAttribute('d', h ? `M110 205 L${110 + w} 214 L110 223 Z` : '');
  $('corteD').setAttribute('d', h >= 3 ? `M130 195 L${130 - (h - 2) * 5} 204 L130 213 Z` : '');
  $('golpes').textContent = `Golpes: ${h}/${HP}`;
}
function talar(){
  if (juegoPausado || S.playerBusy || S.hp <= 0) return;
  sonidoNivel3('talar');
  const zona = $('zonaCorte');
  const cx = Number(zona.getAttribute('cx')), cy = Number(zona.getAttribute('cy'));
  // El jugador tiene que acertar el punto de corte, no simplemente pulsar un botón.
  S.hp--; S.playerBusy = true;
  $('hacha').animate([{transform:'rotate(-40deg)'},{transform:'translate(48px,-28px) rotate(28deg)',offset:.42},{transform:'rotate(-40deg)'}], {duration:dur(300),easing:'ease-out'});
  $('arbol').animate([{transform:'rotate(0)'},{transform:'rotate(2deg)',offset:.35},{transform:'rotate(-1deg)',offset:.7},{transform:'rotate(0)'}], {duration:dur(280),easing:'ease-out'});
  astillas(); updArbol();
  programarTemporizadorNivel3(() => { S.playerBusy=false; if (S.hp<=0) caer(); }, dur(330));
}
function moverZona(){
  const x = 112 + Math.random()*16, y = 198 + Math.random()*30;
  $('zonaCorte').animate([{transform:`translate(${x-120}px,${y-214}px) scale(.7)`,opacity:.3},{transform:`translate(${x-120}px,${y-214}px) scale(1)`,opacity:1}],{duration:dur(180),fill:'forwards'});
  $('zonaCorte').setAttribute('cx',x); $('zonaCorte').setAttribute('cy',y);
}
function astillas(){
  const g = $('astillas');
  for (let i = 0; i < 5; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    c.setAttribute('x', 106); c.setAttribute('y', 210); c.setAttribute('width', 4); c.setAttribute('height', 3);
    c.setAttribute('class', 'f-corte'); g.appendChild(c);
    const dx = -30 + Math.random() * 26 - 10, dy = -20 + Math.random() * 40;
    c.animate([{transform:'translate(0,0) rotate(0)', opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${Math.random()*200}deg)`, opacity:0}],
      {duration:dur(520), easing:'ease-out', delay:dur(110)}).onfinish = () => c.remove();
  }
}
function caer(){
  sonidoNivel3('caida');
  S.workerBusy = true;
  const a = $('arbol').animate([{transform:'rotate(0)',opacity:1},{transform:'rotate(86deg)',opacity:1,offset:.85},{transform:'rotate(90deg)',opacity:0}],
    {duration:dur(950), easing:'ease-in', fill:'forwards', delay:dur(150)});
  a.onfinish = () => {
    a.cancel();
    S.troncos += TRONCOS_ARBOL; flotante(`+${TRONCOS_ARBOL} troncos`);
    S.hp = HP; updArbol(); moverZona();
    $('arbol').animate([{transform:'scale(.15)'},{transform:'scale(1)'}], {duration:dur(700), easing:'ease-out'});
    S.workerBusy = false; const talador=(S.workers||[]).find(w=>w.task==='talar'); if(talador){ if(talador.timer) cancelarTemporizadorNivel3(talador.timer); talador.timer=null; talador.proceso=null; talador.reserva=null; drawWorker(); workerLoop(talador.id); } refrescar();
  };
}
function flotante(txt){
  const d = document.createElement('div'); d.className = 'flot'; d.textContent = txt; $('stage').appendChild(d);
  d.animate([{transform:'translate(-50%,10px)',opacity:0},{transform:'translate(-50%,0)',opacity:1,offset:.2},{transform:'translate(-50%,-34px)',opacity:0}],
    {duration:dur(1100), easing:'ease-out'}).onfinish = () => d.remove();
}

/* ---------- Craftear ---------- */
const alcanza = r => Object.entries(r.usa).every(([k, v]) => S[k] >= v);
function craftear(id){
  const r = RECETAS.find(x => x.id === id); if (!r || !alcanza(r) || S.proceso) return;
  S.proceso = {id, paso:0, fase:id==='tratar'?'mezcla':'trabajo', mezcla:0, calidad:0};
  if(id==='tratar'){ S.proceso.ingredientes=INGREDIENTES; S.proceso.objetivoMezcla=[...INGREDIENTES].map((_,i)=>i).sort(()=>Math.random()-.5).slice(0,3); S.proceso.seleccionMezcla=[]; S.proceso.fase='seleccionar'; }
  renderProceso();
}
function terminarProceso(){
  if(!S.proceso) return;
  const r=RECETAS.find(x=>x.id===S.proceso.id);
  for (const [k,v] of Object.entries(r.usa)) S[k]-=v;
  for (const [k,v] of Object.entries(r.da)) S[k]+=v;
  S.proceso=null; flotante(r.nom+' terminado'); refrescar();
}
function hacerGolpeProceso(){
  if(juegoPausado || !S.proceso || S.playerBusy) return;
  if(S.proceso.id==='tratar' && S.proceso.fase==='mezcla') return;
  const r=RECETAS.find(x=>x.id===S.proceso.id);
  S.playerBusy=true;
  const tool=document.querySelector('[data-tool="'+r.id+'"]');
  if(tool) tool.animate([{transform:'translate(0,0)'},{transform:'translate(-8px,5px) rotate(-8deg)'},{transform:'translate(0,0)'}],{duration:dur(180),easing:'ease-out'});
  S.proceso.paso++; renderProceso();
  programarTemporizadorNivel3(()=>{S.playerBusy=false; if(S.proceso && S.proceso.paso>=r.golpes) terminarProceso();},dur(200));
}
function moverProcesoConMouse(e){
  if(juegoPausado || !S.proceso || S.proceso.id!=='lijar' || !S.lijarDrag || S.playerBusy) return;
  // Buscamos el SVG actual en cada movimiento: al terminar una pasada se vuelve a dibujar.
  const svg=document.querySelector('.taller-lijar'); if(!svg) return;
  const now=performance.now(), rect=svg.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
  if(S.lijarX===null){ S.lijarX=x; return; }
  const dx=x-S.lijarX; S.lijarX=x;
  if(now-S.workerUltimoMovimiento<100 || Math.abs(dx)<.012) return;
  // Contamos una pasada solo al alcanzar el extremo opuesto; podés empezar desde cualquiera.
  if(S.lijarDir===1 && x>=.88){
    S.lijarDir=-1; S.workerUltimoMovimiento=now; hacerGolpeProceso();
  } else if(S.lijarDir===-1 && x<=.12){
    S.lijarDir=1; S.workerUltimoMovimiento=now; hacerGolpeProceso();
  }
}
function circuloTrabajoClick(e){
  const hit=e.target.closest('.zonaTrabajo');
  if(juegoPausado || !hit || !S.proceso || S.playerBusy) return;
  const r=RECETAS.find(x=>x.id===S.proceso.id);
  if(!r || (r.id!=='aserrar' && r.id!=='pilote')) return;
  e.preventDefault();
  // Medimos la posición REAL de la aguja animada en pantalla. Así el clic
  // queda sincronizado con lo que ve el jugador, no con el reloj global.
  if(r.id==='aserrar' || r.id==='pilote'){
    const svg=hit.closest('svg');
    const aguja=svg?.querySelector(r.id==='aserrar'?'.agujaTiempo':'.agujaRitmo');
    const zona=svg?.querySelector('.zonaPerfecta');
    if(!aguja || !zona){ flotante('No se pudo leer el indicador; probá otra vez'); return; }
    const a=aguja.getBoundingClientRect(), z=zona.getBoundingClientRect();
    const centro=a.left+a.width/2;
    const margen=r.id==='aserrar'?3:2;
    if(centro < z.left-margen || centro > z.right+margen){
      flotante(r.id==='aserrar'?'¡Corte fuera de tiempo! Esperá que la aguja entre en verde':'¡Golpe fuera de ritmo! Esperá que la aguja entre en verde');
      return;
    }
  }
  hacerGolpeProceso();
}
function renderProceso(){
  const zona=$('recetas');
  if(!S.proceso){ drawRecetas(); return; }
  const r=RECETAS.find(x=>x.id===S.proceso.id), restante=r.golpes-S.proceso.paso, pct=Math.min(100,S.proceso.paso/r.golpes*100);
  const paso=S.proceso.paso;
  let art='', instruccion='';
  if(r.id==='aserrar'){
    const corte=90+paso*42;
    art=`<svg class="tallerSvg taller-aserrar" viewBox="0 0 420 220" role="img" aria-label="Aserrar tablones en el taller">
      <rect width="420" height="220" fill="#b8e2dc"/><path d="M0 154H420V220H0Z" fill="#6eaa8a"/><path d="M0 174H420M0 196H420" stroke="#4d8069" stroke-width="3"/>
      <rect x="42" y="128" width="336" height="17" fill="#67412f"/><rect x="62" y="145" width="18" height="53" fill="#8d5838"/><rect x="340" y="145" width="18" height="53" fill="#8d5838"/>
      <rect x="62" y="88" width="296" height="38" fill="#d99a52" stroke="#68452f" stroke-width="4"/><path d="M74 98H345M74 108H345M74 118H345" stroke="#b9793c" stroke-width="3"/>
      <path d="M${corte} 88V126" stroke="#fff0bd" stroke-width="4" stroke-dasharray="4 4"/><rect x="145" y="48" width="130" height="10" rx="3" fill="#263b36"/><rect class="zonaPerfecta" x="196" y="48" width="28" height="10" fill="#4e9c83"/><path class="agujaTiempo" d="M210 43V64" stroke="#e56c45" stroke-width="5" stroke-linecap="round"/>
      <g class="herramienta" data-tool="aserrar" transform="translate(${120+paso*20} 58)"><path d="M-48 0H48" stroke="#566b7b" stroke-width="9"/><path d="M-48 5l8 7 8-7 8 7 8-7 8 7 8-7 8 7 8-7 8 7 8-7" fill="none" stroke="#f7f2dc" stroke-width="3"/><rect x="-12" y="-20" width="24" height="17" fill="#a45e36" stroke="#68452f" stroke-width="3"/></g>
      <circle data-a="process-hit" class="zonaTrabajo" cx="${105+(paso%7)*35}" cy="106" r="25"/><text x="210" y="28" text-anchor="middle" font-size="15" font-weight="900" fill="#263b36">ASERRADERO · SIERRA</text>
      <text x="210" y="214" text-anchor="middle" font-size="11" font-weight="900" fill="#263b36">MADERA FRESCA</text></svg>`;
    instruccion='Esperá a que la aguja pase por la zona verde y hacé clic para cortar. Los cortes fuera de tiempo no cuentan.';
  } else if(r.id==='lijar'){
    art=`<svg class="tallerSvg taller-lijar" viewBox="0 0 420 220" role="img" aria-label="Lijar y suavizar un tablón"><rect width="420" height="220" fill="#f6d58b"/><path d="M0 166H420V220H0Z" fill="#bd8149"/><path d="M0 183H420M0 203H420" stroke="#8c5839" stroke-width="3"/>
      <rect x="42" y="90" width="336" height="64" fill="#d99a52" stroke="#68452f" stroke-width="4"/><path d="M55 104H365M55 119H365M55 134H365" stroke="#b9793c" stroke-width="4"/>
      ${Array.from({length:6},(_,i)=>`<rect x="${58+i*51}" y="94" width="46" height="54" class="${i<paso?'franjaSuave':'franjaAspera'}" stroke="#68452f" stroke-width="1"/>`).join('')}
      <path d="M55 145H365" stroke="#fff0bd" stroke-width="5"/><g class="herramienta" data-tool="lijar" transform="translate(${95+(paso%5)*48} 75) rotate(-8)"><rect x="-38" y="-23" width="76" height="28" rx="3" fill="#4e9c83" stroke="#263b36" stroke-width="4"/><rect x="-27" y="-34" width="54" height="12" fill="#d9e6d8" stroke="#263b36" stroke-width="3"/><path d="M-30 12H30" stroke="#fff0bd" stroke-width="5" stroke-dasharray="4 4"/></g>
      <circle data-a="process-hit" class="zonaTrabajo" cx="${95+(paso%5)*48}" cy="123" r="26"/><text x="210" y="28" text-anchor="middle" font-size="15" font-weight="900" fill="#68452f">BANCO DE LIJADO</text><text x="210" y="202" text-anchor="middle" font-size="11" font-weight="900" fill="#fff0bd">SUAVIZÁ LA SUPERFICIE</text></svg>`;
    instruccion='Mantené apretado y recorré toda la tabla de un extremo al otro. Cada pasada completa lija una franja; alterná el sentido.';
  } else if(r.id==='tratar'){
    if(['seleccionar','mezcla'].includes(S.proceso.fase)){
      const ingredientes=S.proceso.ingredientes;
      art=`<svg class="tallerSvg taller-mezcla" viewBox="0 0 420 220" role="img" aria-label="Preparar mezcla protectora"><rect width="420" height="220" fill="#b8e2dc"/><path d="M0 166H420V220H0Z" fill="#6eaa8a"/><rect x="130" y="65" width="160" height="100" rx="8" fill="#566b7b" stroke="#263b36" stroke-width="5"/><path d="M145 112Q210 ${135+S.proceso.mezcla*3} 275 112L275 151H145Z" fill="${S.proceso.mezcla===3?'#4e9c83':'#d99a52'}" stroke="#263b36" stroke-width="3"/><path d="M194 46L226 46L220 115L200 115Z" fill="#a45e36" stroke="#68452f" stroke-width="4"/><text x="210" y="25" text-anchor="middle" font-size="15" font-weight="900" fill="#263b36">MEZCLA PROTECTORA</text><text x="210" y="193" text-anchor="middle" font-size="12" font-weight="900" fill="#263b36">${Math.min(S.proceso.mezcla+1,3)} / 3</text></svg>`;
      instruccion=S.proceso.fase==='seleccionar'?'Seleccioná exactamente los 3 ingredientes que pide la receta.':'Mezclá los ingredientes seleccionados en el orden indicado.';
    } else {
    const zonas = Array.from({length:4},(_,i)=>{
      const x=70+i*92, hecho=i<paso, activa=i===paso;
      return `<g class="zonaTratamiento ${hecho?'tratada':''} ${activa?'zonaActiva':''}" data-a="treat-zone" data-index="${i}" role="button" aria-label="Zona ${i+1}"><rect x="${x}" y="99" width="72" height="52" rx="3" fill="${hecho?'#4e9c83':'#d99a52'}" stroke="#68452f" stroke-width="4"/><path d="M${x+8} 112H${x+64}M${x+8} 124H${x+64}M${x+8} 136H${x+64}" stroke="${hecho?'#d9e6d8':'#b9793c'}" stroke-width="3"/><circle cx="${x+36}" cy="125" r="13" fill="${hecho?'#d9e6d8':'#fff0bd'}" stroke="#263b36" stroke-width="3"/><text x="${x+36}" y="130" text-anchor="middle" font-size="13" font-weight="900" fill="#263b36">${hecho?'✓':i+1}</text></g>`;
    }).join('');
    art=`<svg class="tallerSvg taller-tratar" viewBox="0 0 420 220" role="img" aria-label="Aplicar tratamiento protector en cuatro zonas"><rect width="420" height="220" fill="#b8e2dc"/><path d="M0 166H420V220H0Z" fill="#6eaa8a"/><path d="M0 187H420M0 207H420" stroke="#4d8069" stroke-width="3"/><path d="M42 158H378" stroke="#68452f" stroke-width="9"/><rect x="47" y="88" width="326" height="70" fill="#8d5838" stroke="#68452f" stroke-width="4"/><path d="M55 101H365M55 116H365M55 131H365M55 146H365" stroke="#b9793c" stroke-width="4"/>${zonas}<g class="herramienta" data-tool="tratar" transform="translate(${70+Math.min(paso,3)*92+36} 62) rotate(-12)"><rect x="-7" y="-25" width="14" height="38" fill="#a45e36" stroke="#68452f" stroke-width="3"/><path d="M-21 12H21L15 31H-15Z" fill="#4e9c83" stroke="#263b36" stroke-width="4"/><path d="M-13 20H13" stroke="#d9e6d8" stroke-width="4"/></g><text x="210" y="25" text-anchor="middle" font-size="15" font-weight="900" fill="#263b36">BAÑO PROTECTOR</text><text x="210" y="202" text-anchor="middle" font-size="11" font-weight="900" fill="#263b36">TRATÁ LAS ZONAS EN ORDEN</text></svg>`;
    instruccion='Hacé clic en las cuatro zonas numeradas, en orden. Cada una queda sellada al tratarla.';
    }
  } else {
    art=`<svg class="tallerSvg taller-pilote" viewBox="0 0 420 220" role="img" aria-label="Afilar la punta de un pilote"><rect width="420" height="220" fill="#f6d58b"/><path d="M0 160H420V220H0Z" fill="#bd8149"/><path d="M0 181H420M0 202H420" stroke="#8c5839" stroke-width="3"/>
      <rect x="70" y="105" width="280" height="48" fill="#67412f" stroke="#352536" stroke-width="4"/><path d="M90 117H330M90 139H330" stroke="#8d5838" stroke-width="4"/>
      <g transform="translate(210 96)"><path d="M-28 -55H28L18 18L0 52L-18 18Z" fill="#d99a52" stroke="#68452f" stroke-width="4"/><path d="M-20 -36H20M-17 -15H17M-13 5H13" stroke="#b9793c" stroke-width="4"/><path d="M-12 19L0 43L12 19" fill="#e6e2cf" stroke="#566b7b" stroke-width="3"/></g>
      <g class="herramienta" data-tool="pilote" transform="translate(${135+(paso%4)*50} 65) rotate(-25)"><rect x="-35" y="-8" width="70" height="16" fill="#566b7b" stroke="#263b36" stroke-width="3"/><rect x="-8" y="-19" width="16" height="38" fill="#a45e36" stroke="#68452f" stroke-width="3"/></g>
      <path d="M210 46V80" stroke="#566b7b" stroke-width="4" stroke-dasharray="4 4"/><rect x="285" y="46" width="88" height="13" rx="3" fill="#263b36"/><rect class="zonaPerfecta" x="319" y="49" width="20" height="7" fill="#4e9c83"/><path class="agujaRitmo" d="M329 42V63" stroke="#e56c45" stroke-width="4" stroke-linecap="round"/><text x="329" y="35" text-anchor="middle" font-size="9" font-weight="900" fill="#263b36">RITMO</text><circle data-a="process-hit" cx="${paso%2===0?174:246}" cy="105" r="25" class="zonaTrabajo"/><text x="210" y="25" text-anchor="middle" font-size="15" font-weight="900" fill="#68452f">ESTACIÓN DE AFILADO</text><text x="210" y="202" text-anchor="middle" font-size="11" font-weight="900" fill="#fff0bd">${paso%2===0?'GOLPEÁ A LA IZQUIERDA':'AHORA A LA DERECHA'}</text></svg>`;
    instruccion='Mirá la barra de RITMO: hacé clic en el pilote cuando la aguja esté sobre la zona verde. Alterná izquierda y derecha; si fallás, no perdés progreso.';
  }
  zona.innerHTML=`<div class="zonaProceso proceso-${r.id}"><div class="procesoCabecera"><span class="procesoIcono">${({aserrar:'🪚',lijar:'🪵',tratar:'🛡️',pilote:'🔨'})[r.id]}</span><div class="procesoTitulo"><b>${r.nom}</b><div class="nota">${instruccion}</div></div><button class="btn cancelarCrafteo" type="button" data-a="cancel-craft">✕ Cerrar</button></div>${art}${r.id==='tratar' && ['seleccionar','mezcla'].includes(S.proceso.fase)?`<div class="ingredientesMezcla">${S.proceso.ingredientes.map((ing,i)=>{const sel=S.proceso.seleccionMezcla.includes(i);const activo=S.proceso.fase==='seleccionar'||sel;return `<button class="btn ingrediente ${sel?'seleccionado':''}" type="button" data-a="mix-ingredient" data-index="${i}" ${activo?'':'disabled'}><span>${ing.icono}</span> ${ing.nombre}</button>`}).join('')}</div><p class="nota">${S.proceso.fase==='seleccionar'?'Elegí estos 3 ingredientes: '+S.proceso.objetivoMezcla.map(i=>S.proceso.ingredientes[i].nombre).join(' · '):'¡Correcto! Ahora tocá los ingredientes en este orden: '+S.proceso.ordenMezcla.map(i=>S.proceso.ingredientes[i].nombre).join(' → ')}</p><div class="seleccionOrden"><strong>${S.proceso.fase==='seleccionar'?'SELECCIÓN DE INGREDIENTES':'ORDEN DE MEZCLA'} · ${S.proceso.fase==='seleccionar'?S.proceso.seleccionMezcla.length+'/3':S.proceso.mezcla+'/3'}</strong><ol>${[0,1,2].map((n)=>{const idx=S.proceso.seleccionMezcla[n];return `<li class="${idx!==undefined?'ocupado':''}"><span>${n+1}.</span> ${idx!==undefined?S.proceso.ingredientes[idx].nombre:'Sin seleccionar'}</li>`}).join('')}</ol></div>${S.proceso.mezclaError?`<p class="nota error">${S.proceso.mezclaError}</p>`:''}`:''}<div class="procesoEstado"><span>PROGRESO DE TRABAJO</span><strong>${paso}/${r.golpes}</strong></div><div class="progreso"><i style="width:${pct}%"></i></div><div class="procesoPistas">${Array.from({length:r.golpes},(_,i)=>`<i class="${i<paso?'hecho':''}"></i>`).join('')}</div><div class="nota procesoResultado">${restante===0?'¡Trabajo terminado!':`Faltan ${restante} acción${restante===1?'':'es'} para completar la pieza.`}</div></div>`;
}
function reclutar(){
  const cantidad=S.trabajadores||0, costo=2*(cantidad+1);
  if(cantidad>=3 || S.troncos<costo || S.cruzo) return;
  S.troncos-=costo; S.trabajadores=cantidad+1; S.trabajador=true;
  S.workers.push({id:S.trabajadores,task:null,timer:null,fatiga:100,descanso:false,descansoHasta:0,proceso:null,reserva:null});
  flotante('Trabajador contratado'); drawWorker(); drawInv();
}
function workerTask(task, workerId){
  if(!S.trabajador || S.cruzo) return;
  if(S.workers.some(w=>w.task===task)){flotante('Cada trabajador debe tener un trabajo diferente');return;}
  const w=workerId ? S.workers.find(x=>x.id===Number(workerId) && !x.task) : S.workers.find(x=>!x.task);
  if(!w){flotante('Todos los trabajadores ya tienen tarea');return;}
  if(task!=='talar'){
    const r=RECETAS.find(x=>x.id===task); if(!r || !alcanza(r)) return;
    w.proceso={id:task,paso:0}; w.reserva={...r.usa};
    for(const [k,v] of Object.entries(r.usa)) S[k]-=v;
  }
  w.task=task; workerLoop(w.id); drawWorker(); drawRecetas();
}
function terminarWorkerProceso(w){
  if(!w.proceso)return;
  const r=RECETAS.find(x=>x.id===w.proceso.id);
  for(const [k,v] of Object.entries(r.da)) S[k]+=v;
  w.proceso=null;w.reserva=null;flotante(`Trabajador ${w.id} terminó: ${r.nom}`);refrescar();
}
function workerLoop(id){
  if (juegoPausado || !S) return;
  const w=S.workers.find(x=>x.id===id); if(!w||!w.task)return;
  if(w.descanso){w.timer=programarTemporizadorNivel3(()=>{w.timer=null;w.fatiga=100;w.descanso=false;w.descansoHasta=0;drawWorker();workerLoop(id);},Math.max(1,w.descansoHasta-Date.now()));drawWorker();return;}
  if(w.fatiga<=0){w.descanso=true;w.descansoHasta=Date.now()+dur(8000);drawWorker();w.timer=programarTemporizadorNivel3(()=>{w.timer=null;w.fatiga=100;w.descanso=false;w.descansoHasta=0;drawWorker();workerLoop(id);},dur(8000));return;}
  if(w.task==='talar'){
    if(S.hp<=0){w.task=null;drawWorker();return;}
    S.workerBusy=true;S.hp--;w.fatiga=Math.max(0,w.fatiga-6);drawWorker();
    $('hacha').animate([{transform:'rotate(-40deg)'},{transform:'translate(48px,-28px) rotate(28deg)',offset:.42},{transform:'rotate(-40deg)'}],{duration:dur(260),easing:'ease-out'});astillas();updArbol();
    w.timer=programarTemporizadorNivel3(()=>{w.timer=null;S.workerBusy=false;if(S.hp<=0)caer();else workerLoop(id);},dur(360));return;
  }
  if(!w.proceso){
    const r=RECETAS.find(x=>x.id===w.task);
    if(!r){w.timer=programarTemporizadorNivel3(()=>{w.timer=null;workerLoop(id);},dur(1200));drawWorker();return;}
    if(!alcanza(r)){w.timer=programarTemporizadorNivel3(()=>{w.timer=null;workerLoop(id);},dur(1200));drawWorker();return;}
    w.proceso={id:w.task,paso:0};w.reserva={...r.usa};
    for(const [k,v] of Object.entries(r.usa)) S[k]-=v;
    drawWorker();drawInv();
  }
  const r=RECETAS.find(x=>x.id===w.proceso.id);w.proceso.paso++;w.fatiga=Math.max(0,w.fatiga-6);drawWorker();
  if(w.proceso.paso>=r.golpes)w.timer=programarTemporizadorNivel3(()=>{w.timer=null;terminarWorkerProceso(w);drawWorker();workerLoop(id);},dur(450));
  else w.timer=programarTemporizadorNivel3(()=>{w.timer=null;workerLoop(id);},dur(650));
}
function pararTrabajador(id){
  const w=S.workers.find(x=>x.id===Number(id));if(!w)return;
  if(w.timer)cancelarTemporizadorNivel3(w.timer);
  if(w.reserva)for(const [k,v] of Object.entries(w.reserva))S[k]+=v;
  w.task=null;w.timer=null;w.descanso=false;w.proceso=null;w.reserva=null;drawWorker();refrescar();
}
function drawWorker(){
  const st=$('workerStatus'),info=$('workerInfo'),a=$('workerActions');if(!st)return;
  const workers=S.workers||[],costo=2*(workers.length+1);
  st.textContent=`${workers.length}/3 trabajadores`;
  st.className='workerBadge '+(workers.length?'ok':'');
  info.textContent=workers.length?'Asignale una tarea a cada trabajador. Seguirá repitiéndola hasta que lo detengas.':'Contratá trabajadores para que hagan tareas automáticamente.';
  const tareas=[['talar','🌳 Talar'],['aserrar','🪚 Aserrar'],['lijar','🪵 Lijar'],['tratar','🛡️ Tratar']];
  const ocupadas=workers.filter(w=>w.task).map(w=>w.task);
  a.innerHTML=`${workers.length<3?`<button class="btn pri" type="button" data-a="recruit" ${S.troncos<costo?'disabled':''}>➕ Contratar (${costo} 🪵)</button>`:''}`+
    workers.map(w=>{const cansancio=100-w.fatiga;const recupera=w.descanso?Math.max(0,Math.ceil((w.descansoHasta-Date.now())/1000)):0;return `<div class="workerMini"><div class="workerMiniHead"><strong>👷 Trabajador ${w.id}</strong><span>${w.descanso?'Descansando':w.task?`⚒️ ${{talar:'Talando',aserrar:'Aserrando',lijar:'Lijando',tratar:'Tratando'}[w.task]}`:'Libre'}</span></div><div class="workerFatiga"><div class="workerFatigaTexto"><span>Cansancio</span><strong>${cansancio}%</strong></div><div class="workerFatigaBarra"><i style="width:${cansancio}%"></i></div><div class="workerRecuperacion">${w.descanso?`Tiempo para recuperarse: <strong data-rest-until="${w.descansoHasta}">${recupera}s</strong>`:'Tiempo de recuperación: —'}</div></div>${w.task?`<div class="workerMiniFoot">${w.descanso?'Recuperando energía…':w.task==='talar'?'Talará árboles continuamente.':w.proceso?'Trabajando en una pieza…':'Esperando materiales para continuar…'} <button class="btn" type="button" data-a="worker-stop" data-id="${w.id}">⏹ Detener tarea</button></div>`:`<div class="workerMiniTasks">${tareas.map(([t,label])=>{const r=RECETAS.find(x=>x.id===t);const sinRecursos=t!=='talar'&&(!r||!alcanza(r));return `<button class="btn" type="button" data-a="worker" data-k="${t}" data-worker-id="${w.id}" ${ocupadas.includes(t)||sinRecursos?'disabled':''}>${label}</button>`}).join('')}</div>`}</div>`}).join('');
}
function falta(){
  const pSin = S.b.filter(x => !x.p).length, tSin = S.b.filter(x => !x.t).length;
  const needP = Math.max(0, pSin - S.pilotes), needT = Math.max(0, tSin * 3 - S.tablonesTratados);
  return Math.max(0, needP + Math.ceil(needT / 2) - S.troncos);
}
function drawRecetas(){
  if(S.proceso){ renderProceso(); return; }
  $('recetas').innerHTML = RECETAS.map(r => `<div class="receta"><div><div class="nom">${r.nom}</div>
    <div class="formula"><b>${r.txt[0]}</b> → <b>${r.txt[1]}</b></div></div>
    <button class="btn pri" type="button" data-a="craft" data-k="${r.id}" ${alcanza(r) ? '' : 'disabled'}>Craftear</button></div>`).join('');
  const f = falta(), fin = S.b.every(x => x.p && x.t);
  $('guia').textContent = fin ? 'No hace falta más madera.' : f > 0 ? `Para terminar el puente todavía tenés que talar ${f} tronco${f === 1 ? '' : 's'}.` : 'Con lo que tenés alcanza para terminar el puente.';
}

const HISTORIA_PUENTE = [
  ['Sección 1 · El campesino argentino',
   'El capítulo presenta al campesino al llegar a la edad viril: independiente y libre de sujeción, formado por la naturaleza y por la falta de una sociedad organizada.',
   '“Yo crecí acostumbrado a valerme por mí mismo. La libertad es parte de mi vida, pero también me deja lejos de un orden común.”'],
  ['Sección 2 · Una campaña dispersa',
   'Sarmiento describe las estancias pastoriles distribuidas a grandes distancias y contrasta esa vida con la agricultura, donde las tareas y relaciones acercan a los habitantes.',
   '“Aquí las casas están lejos unas de otras. No es como en el campo agrícola, donde el trabajo obliga a encontrarse y a depender de los demás.”'],
  ['Sección 3 · La vida pastoril',
   'En la campaña pastoril, los ganados necesitan menos brazos y el hombre queda con pocas ocupaciones forzosas; el hogar puede resultarle ajeno y lo impulsa a salir.',
   '“Tengo pocas obligaciones que me retengan en casa. El campo abierto y el caballo me llaman más que quedarme quieto.”'],
  ['Sección 4 · La sociedad ficticia',
   'El capítulo explica que esa desasociación genera la necesidad de una “sociedad ficticia”: espacios de reunión que compensan la falta de vínculos cotidianos.',
   '“Si vivimos tan separados, necesitamos encontrarnos de alguna manera. Quizás por eso buscamos la pulpería y las reuniones: allí dejamos de estar solos.”'],
  ['Sección 5 · Las reputaciones gauchas',
   'De esas reuniones surgen reputaciones ligadas al valor, el arrojo, la destreza y también a la oposición a la justicia regular de la ciudad.',
   '“En estos encuentros uno gana nombre por su valor y su destreza. Pero también aprendo que esa libertad puede enfrentarse con la justicia y las reglas de la ciudad.”'],
  ['Sección 6 · El cambio de 1810',
   'La Revolución de 1810 lleva movimiento y armas a la campaña. Las asociaciones de la pulpería y la estancia terminan vinculándose con la formación de las montoneras provinciales.',
   '“Ahora el ruido de las armas llega hasta nosotros. Lo que antes era una reunión de hombres de campo empieza a convertirse en algo mucho más grande y peligroso.”']
];
function drawHistoria(){
  const card=$('historiaPuente'); if(!card || S.historia<=S.historiaMostrada) return;
  const idx=Math.min(S.historia,HISTORIA_PUENTE.length)-1;
  const h=HISTORIA_PUENTE[idx];
  $('historiaNumero').textContent=`SECCIÓN ${idx+1} DE ${HISTORIA_PUENTE.length}`;
  $('historiaTitulo').textContent=h[0];
  $('historiaTexto').textContent=h[1];
  $('historiaPensamiento').innerHTML=`<b>PENSAMIENTO DEL GAUCHO</b>${h[2]}`;
  card.hidden=false;
  document.body.classList.add('historiaAbierta');
  $('btnContinuarHistoria')?.focus();
}
function cerrarHistoria(){
  const card=$('historiaPuente');
  if(!card || card.hidden) return;
  S.historiaMostrada=Math.max(S.historiaMostrada,S.historia);
  card.hidden=true;
  document.body.classList.remove('historiaAbierta');
}
function reproducirSonidoConstruccion(){
  const audio=$('sonidoConstruccion');
  if(!audio || !audio.querySelector('source')?.getAttribute('src')) return;
  audio.currentTime=0;
  const reproduccion=audio.play();
  if(reproduccion && typeof reproduccion.catch==='function') reproduccion.catch(()=>{});
}

/* ---------- Puente ---------- */
function paso(){
  for (let i = 0; i < TRAMOS; i++) { if (!S.b[i].p) return {i, k:'p'}; if (!S.b[i].t) return {i, k:'t'}; }
  return null;
}
function construir(){
  sonidoNivel3('puente');
  const s = paso(); if (!s) return;
  if (s.k === 'p' && S.pilotes >= 1) { S.pilotes--; S.b[s.i].p = true; }
  else if (s.k === 't' && S.tablonesTratados >= 3) { S.tablonesTratados -= 3; S.b[s.i].t = true; S.historia = Math.max(S.historia, s.i + 1); }
  else return;
  S.last = s; reproducirSonidoConstruccion(); refrescar();
}
function drawPuente(){
  const nx = paso(), cx = i => 135 + 90 * i;
  let o = `<rect width="720" height="230" class="f-cielo"/>
    <!-- cielo con profundidad: nubes pixeladas y aves -->
    <path d="M0 128 Q120 86 240 116 T480 108 T720 118 V150 H0 Z" class="f-hoja" opacity=".30"/>
    <g class="cielo-pixel" aria-hidden="true">
      <path class="nube" d="M70 45h18v-7h20v-6h28v6h14v7h18v8H70z"/>
      <path class="nube-luz" d="M82 44h20v-5h22v5h18v5H82z"/>
      <path class="nube" d="M505 60h16v-6h22v-7h25v7h16v6h16v8h-95z"/>
      <path class="nube-luz" d="M518 59h20v-5h23v5h17v5h-60z"/>
      <path class="ave" d="M285 52h5l5-4 5 4 5-4h5"/>
      <path class="ave" d="M405 76h4l4-3 4 3 4-3h4"/>
      <path class="ave" d="M575 38h4l4-3 4 3 4-3h4"/>
    </g>
    <rect y="140" width="720" height="90" class="f-agua"/>`;

  /* Orillas más naturales: capas de tierra, césped irregular, piedras y vegetación. */
  o += `<g class="orilla-pixel">
    <!-- margen de tierra izquierda -->
    <path class="f-tierra" d="M0 128h18v-3h17v4h16v-6h20v5h15v-3h12v105H0z"/>
    <path class="f-tierra-oscura" d="M0 157h20v-4h18v6h19v-5h17v7h18v-4h10v69H0z"/>
    <path class="f-tierra-clara" d="M0 139h14v-4h17v5h13v-3h18v6h16v-4h17v7H0z"/>
    <!-- margen de tierra derecha -->
    <path class="f-tierra" d="M628 126h12v4h16v-5h19v6h17v-4h15v3h13v-2h20v102H628z"/>
    <path class="f-tierra-oscura" d="M628 158h14v-5h17v6h18v-4h16v7h19v-5h14v68H628z"/>
    <path class="f-tierra-clara" d="M628 140h15v-5h17v6h16v-4h18v5h14v-3h12v8H628z"/>

    <!-- borde de pasto irregular izquierdo -->
    <path class="f-pasto" d="M0 131h7v-7h3v7h6v-11h3v11h7v-6h4v6h6v-10h3v10h8v-7h3v7h7v-12h3v12h7v-7h4v7h8v-10h3v10h8v-5h4v8H0z"/>
    <path class="f-pasto2" d="M0 138h10v-6h3v6h8v-9h3v9h9v-5h3v5h8v-8h3v8h10v-6h3v6h8v-10h3v10h9v-6h3v6h10v-5h3v8H0z"/>
    <!-- borde de pasto irregular derecho -->
    <path class="f-pasto" d="M628 131h7v-10h3v10h8v-7h3v7h8v-12h3v12h8v-6h3v6h9v-9h3v9h8v-12h3v12h8v-7h3v7h9v-10h3v10h8v-6h3v6h9v-11h3v11h9v-5h3v8H628z"/>
    <path class="f-pasto2" d="M628 138h9v-7h3v7h8v-9h3v9h9v-5h3v5h8v-8h3v8h9v-6h3v6h10v-10h3v10h8v-6h3v6h10v-8h3v8h9v-5h3v8H628z"/>

    <!-- manchas de tierra pixeladas -->
    <g class="suelo-textura">
      <rect x="14" y="170" width="9" height="4"/><rect x="28" y="188" width="5" height="3"/><rect x="49" y="205" width="12" height="4"/>
      <rect x="70" y="178" width="7" height="3"/><rect x="83" y="215" width="8" height="4"/><rect x="642" y="174" width="10" height="4"/>
      <rect x="665" y="201" width="6" height="3"/><rect x="690" y="183" width="11" height="4"/><rect x="705" y="214" width="7" height="4"/>
    </g>

    <!-- piedras con sombra -->
    <g class="decor-pixel">
      <path class="f-piedra-sombra" d="M18 153h7v-3h10v3h5v7H18z"/><path class="f-piedra" d="M22 150h10v3h7v4H22z"/>
      <path class="f-piedra-sombra" d="M74 191h9v-3h8v7H74z"/><path class="f-piedra2" d="M78 187h8v3h7v4H78z"/>
      <path class="f-piedra-sombra" d="M654 155h8v-4h10v7h-4v4h-14z"/><path class="f-piedra" d="M659 151h9v3h5v4h-14z"/>
      <path class="f-piedra-sombra" d="M698 195h8v-3h10v7h-18z"/><path class="f-piedra2" d="M702 191h8v3h6v4h-14z"/>

      <!-- flores -->
      <rect x="51" y="166" width="3" height="12" class="f-tallo"/><rect x="46" y="162" width="6" height="5" class="f-flor"/><rect x="53" y="162" width="6" height="5" class="f-flor2"/>
      <rect x="679" y="172" width="3" height="12" class="f-tallo"/><rect x="674" y="168" width="6" height="5" class="f-flor2"/><rect x="681" y="168" width="6" height="5" class="f-flor"/>

      <!-- juncos junto al agua -->
      <path d="M90 142v-20m5 20v-14m5 14v-18M630 142v-19m-5 19v-14m-5 14v-17" class="f-junco"/>
    </g>
  </g>`;

  /* Agua con líneas escalonadas y una franja de orilla húmeda. */
  for (const y of [162, 180, 198, 216]) {
    let d = `M94 ${y}`;
    for (let k = 0; k < 21; k++) d += ` q12 -4 24 0 t24 0`;
    o += `<path d="${d}" class="s-ola"/>`;
  }
  o += `<rect x="94" y="151" width="532" height="79" class="f-agua-profunda" opacity=".35"/>`;

  const nuevoDe = (i, k) => S.last && S.last.i === i && S.last.k === k ? ' nuevo' : '';
  for (let i = 0; i < TRAMOS; i++) if (S.b[i].p) {
    const x = cx(i);
    o += `<g class="${nuevoDe(i,'p').trim()}">
      <rect x="${x-8}" y="133" width="16" height="66" class="f-pilote"/>
      <rect x="${x-5}" y="136" width="4" height="57" class="f-pilote-luz"/>
      <rect x="${x+4}" y="141" width="3" height="51" class="f-pilote-sombra"/>
    </g>`;
  }
  if (nx && nx.k === 'p') o += `<g class="ghost" data-a="build"><rect x="${cx(nx.i)-8}" y="134" width="16" height="62" rx="2"/></g>`;

  /* Puente: cada tramo tiene tablones, vetas, clavos, vigas y barandas. */
  for (let i = 0; i < TRAMOS; i++) if (S.b[i].t) {
    const x = cx(i);
    o += `<g class="${nuevoDe(i,'t').trim()}">
      <rect x="${x-47}" y="126" width="94" height="16" class="f-puente-borde"/>
      <rect x="${x-44}" y="128" width="43" height="10" class="f-tablon s-tab"/>
      <rect x="${x+1}" y="128" width="43" height="10" class="f-tablon s-tab"/>
      <rect x="${x-42}" y="130" width="28" height="2" class="f-madera-luz"/>
      <rect x="${x-35}" y="134" width="18" height="1" class="f-madera-sombra"/>
      <rect x="${x+6}" y="130" width="28" height="2" class="f-madera-luz"/>
      <rect x="${x+12}" y="134" width="20" height="1" class="f-madera-sombra"/>
      <rect x="${x-40}" y="129" width="3" height="3" class="f-clavo"/>
      <rect x="${x-8}" y="129" width="3" height="3" class="f-clavo"/>
      <rect x="${x+8}" y="129" width="3" height="3" class="f-clavo"/>
      <rect x="${x+37}" y="129" width="3" height="3" class="f-clavo"/>
      <rect x="${x-47}" y="114" width="5" height="15" class="f-pilote"/>
      <rect x="${x+42}" y="114" width="5" height="15" class="f-pilote"/>
      <rect x="${x-47}" y="113" width="94" height="5" class="f-pilote"/>
      <rect x="${x-44}" y="114" width="88" height="2" class="f-madera-luz"/>
      <rect x="${x-47}" y="140" width="94" height="5" class="f-puente-sombra"/>
      <rect x="${x-41}" y="143" width="82" height="2" class="f-puente-borde"/>
      <!-- pequeñas sombras bajo los tablones -->
      <rect x="${x-43}" y="138" width="40" height="2" class="f-madera-sombra"/>
      <rect x="${x+3}" y="138" width="40" height="2" class="f-madera-sombra"/>
    </g>`;
  }
  if (nx && nx.k === 't') o += `<g class="ghost" data-a="build"><rect x="${cx(nx.i)-45}" y="126" width="90" height="12" rx="2"/></g>`;

  $('puente').innerHTML = o;
  const g = $('gaucho'); if (g) $('puente').appendChild(g);
}
function drawAcciones(){
  const s = paso(), a = $('acciones'), t = S.b.filter(x => x.t).length;
  $('nTramos').textContent = t;
  if (!s) {
    $('estado').innerHTML = '<span class="fin">Puente terminado</span>';
    $('ayuda').textContent = S.cruzo ? 'El gaucho cruzó el puente. Nivel 3 completado.' : 'Los seis tramos están en su lugar.';
    a.innerHTML = S.cruzo
      ? `<button class="btn" type="button" data-a="menu">Volver al menú</button>`
      : `<button class="btn pri" type="button" data-a="cruzar">Cruzar el puente</button>`;
    return;
  }
  const esP = s.k === 'p', ok = esP ? S.pilotes >= 1 : S.tablonesTratados >= 3;
  $('estado').textContent = `Tramo ${s.i + 1} de ${TRAMOS}: ${esP ? 'clavar el pilote' : 'colocar los tablones'}`;
  $('ayuda').textContent = ok ? 'Tenés las piezas. Tocá el contorno punteado o el botón.' : esP ? 'Te falta un pilote. Afilá uno con un tronco.' : `Te faltan tablones tratados (${S.tablonesTratados}/3). Aserrá, lijá y tratá la madera.`;
  a.innerHTML = `<button class="btn pri" type="button" data-a="build" ${ok ? '' : 'disabled'}>${esP ? 'Clavar pilote' : 'Colocar tablones tratados'}<small>${esP ? 'usa 1 pilote' : 'usa 3 tablones tratados'}</small></button>`;
}
function volverAlMenu(){
  try {
    if (window.parent && window.parent !== window) {
      if (S.cruzo) {
        window.parent.postMessage({ tipo: 'facundo-nivel-completado', nivel: 3 }, '*');
      } else {
        window.parent.postMessage({ tipo: 'facundo-volver-a-niveles', nivel: 3 }, '*');
      }
      return;
    }
  } catch(e) {}
  if (window.history.length > 1) window.history.back();
}
function cruzar(){
  if ($('gaucho')) return;
  const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
  g.id = 'gaucho';
  g.innerHTML = `<ellipse cx="0" cy="-27" rx="10" ry="2.6" class="f-ink"/><rect x="-4" y="-31" width="8" height="5" rx="1" class="f-ink"/>
    <circle cx="0" cy="-22" r="4.2" class="f-corte"/><rect x="-5" y="-18" width="10" height="11" rx="2" class="f-rep"/>
    <rect x="-4.5" y="-7" width="3.5" height="7" class="f-ink"/><rect x="1" y="-7" width="3.5" height="7" class="f-ink"/>`;
  g.style.transform = 'translate(24px,128px)';
  $('puente').appendChild(g);
  g.animate([{transform:'translate(24px,128px)'},{transform:'translate(696px,128px)'}], {duration:dur(5200), easing:'linear', fill:'forwards'})
    .onfinish = () => { S.cruzo = true; drawAcciones(); };
}

/* ---------- Inventario y refresco ---------- */
function drawInv(){
  for (const [k, id] of [['troncos','vTroncos'],['tablones','vTablones'],['tablonesLijados','vLijados'],['tablonesTratados','vTratados'],['pilotes','vPilotes']]) {
    const el = $(id); el.textContent = S[k];
    if (prev[k] !== undefined && prev[k] !== S[k]) el.animate([{transform:'scale(1.5)'},{transform:'scale(1)'}], {duration:dur(300), easing:'ease-out'});
    prev[k] = S[k];
  }
}
function refrescar(){ drawInv(); drawRecetas(); drawPuente(); drawAcciones(); drawWorker(); drawHistoria(); }

document.addEventListener('pointerdown', e => {
  if (juegoPausado) return;
  const svg=e.target.closest('.taller-lijar');
  if(S.proceso && S.proceso.id==='lijar' && svg) {
    S.lijarDrag=true;
    const rect=svg.getBoundingClientRect();
    S.lijarX=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    // El jugador puede empezar por cualquiera de los extremos.
    S.lijarDir=S.lijarX>.5?-1:1;
    e.preventDefault();
  }
});
document.addEventListener('pointerup', () => { S.lijarDrag=false; S.lijarX=null; });
document.addEventListener('pointercancel', () => { S.lijarDrag=false; S.lijarX=null; });
document.addEventListener('pointermove', moverProcesoConMouse);
document.addEventListener('click', circuloTrabajoClick);
document.addEventListener('click', e => {
  if (juegoPausado) return;
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  const a = b.dataset.a;
  if (a === 'mix-ingredient') {
    e.preventDefault(); e.stopPropagation();
    if (!S.proceso || S.proceso.id !== 'tratar' || !['seleccionar','mezcla'].includes(S.proceso.fase)) return;
    const idx=Number(b.dataset.index);
    if(S.proceso.fase==='seleccionar'){
      const elegidos=S.proceso.seleccionMezcla;
      if(elegidos.includes(idx)){S.proceso.seleccionMezcla=elegidos.filter(i=>i!==idx);S.proceso.mezclaError='';renderProceso();return;}
      if(elegidos.length>=3){flotante('Elegí solamente 3 ingredientes');return;}
      S.proceso.seleccionMezcla.push(idx);
      if(S.proceso.seleccionMezcla.length===3){
        const correctos=[...S.proceso.objetivoMezcla].sort((a,b)=>a-b).join(',');
        const elegidosOrdenados=[...S.proceso.seleccionMezcla].sort((a,b)=>a-b).join(',');
        if(correctos!==elegidosOrdenados){S.proceso.mezclaError='Esa combinación no es la receta. Desmarcá algún ingrediente y corregí tu selección.';flotante('La receta no coincide: corregí la selección');renderProceso();return;}
        S.proceso.mezclaError='';S.proceso.mezcla=3;S.proceso.fase='aplicar';S.proceso.paso=0;
        flotante('¡Ingredientes correctos! Ahora aplicá el tratamiento en las cuatro zonas');
      }
      renderProceso();return;
    }
    const orden=S.proceso.ordenMezcla;
    if(idx!==orden[S.proceso.mezcla]) { flotante('¡La mezcla se separó! Probá el ingrediente indicado'); S.proceso.mezcla=0; renderProceso(); return; }
    S.proceso.mezcla++;
    if(S.proceso.mezcla===3) { S.proceso.fase='aplicar'; S.proceso.paso=0; flotante('¡Sellador preparado! Aplicalo por zonas'); }
    renderProceso(); return;
  }
  if (a === 'treat-zone') {
    if (!S.proceso || S.proceso.id !== 'tratar' || S.proceso.fase !== 'aplicar' || S.playerBusy) return;
    const idx = Number(b.dataset.index);
    if (idx !== S.proceso.paso) { flotante('¡Seguí el orden de las zonas!'); return; }
    hacerGolpeProceso(); return;
  }
  if (a === 'cancel-craft') {
    if (S.proceso) { S.proceso=null; S.lijarDrag=false; S.lijarX=null; S.playerBusy=false; flotante('Crafteo cancelado'); refrescar(); }
  }
  else if (a === 'craft') craftear(b.dataset.k);
  else if (a === 'process') hacerGolpeProceso();
  else if (a === 'recruit') reclutar();
  else if (a === 'worker') workerTask(b.dataset.k,b.dataset.workerId);
  else if (a === 'worker-stop') pararTrabajador(b.dataset.id);
  else if (a === 'build') construir();
  else if (a === 'cruzar') cruzar();
  else if (a === 'reinicio') { window.addEventListener('message', (evento) => {
  if (evento.data?.tipo !== 'facundo-estado-pausa' || Number(evento.data?.nivel) !== 3) return;
  establecerPausaNivel3(Boolean(evento.data.pausado));
  document.getAnimations?.().forEach((animacion) => {
    if (juegoPausado) animacion.pause();
    else animacion.play();
  });
  if (!juegoPausado && S?.workers) {
    S.workers.forEach((trabajador) => {
      if (trabajador.task && !trabajador.timer) workerLoop(trabajador.id);
    });
  }
});

nuevo(); updArbol(); moverZona(); refrescar();
setInterval(()=>{if(juegoPausado)return;document.querySelectorAll('[data-rest-until]').forEach(el=>{const ms=Math.max(0,Number(el.dataset.restUntil)-Date.now());el.textContent=`${Math.ceil(ms/1000)}s`;});},250); }
  else if (a === 'menu') volverAlMenu();
});
$('btnTalar').addEventListener('click', talar);
$('btnContinuarHistoria')?.addEventListener('click', cerrarHistoria);
$('arbolSvg').addEventListener('click', e => {
  if (juegoPausado || S.playerBusy || S.hp<=0) return;
  const pt=$('arbolSvg').createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
  const local=pt.matrixTransform($('arbolSvg').getScreenCTM().inverse());
  const zx=Number($('zonaCorte').getAttribute('cx')), zy=Number($('zonaCorte').getAttribute('cy'));
  // El árbol ampliado acepta clics en toda su zona visible, no solo en el círculo.
  const sobreArbol = local.x >= 42 && local.x <= 198 && local.y >= 52 && local.y <= 280;
  if(sobreArbol || Math.hypot(local.x-zx,local.y-zy)<=42){ talar(); moverZona(); }
});
window.addEventListener('message', (evento) => {
  if (evento.data?.tipo !== 'facundo-estado-pausa' || Number(evento.data?.nivel) !== 3) return;
  establecerPausaNivel3(Boolean(evento.data.pausado));
  document.getAnimations?.().forEach((animacion) => {
    if (juegoPausado) animacion.pause();
    else animacion.play();
  });
  if (!juegoPausado && S?.workers) {
    S.workers.forEach((trabajador) => {
      if (trabajador.task && !trabajador.timer) workerLoop(trabajador.id);
    });
  }
});

nuevo(); updArbol(); moverZona(); refrescar();
setInterval(()=>{if(juegoPausado)return;document.querySelectorAll('[data-rest-until]').forEach(el=>{const ms=Math.max(0,Number(el.dataset.restUntil)-Date.now());el.textContent=`${Math.ceil(ms/1000)}s`;});},250);
