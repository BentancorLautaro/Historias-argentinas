/** El informante misterioso: interrogar, comparar versiones y hallar contradicciones. */
class MecanicaBaqueano {
  constructor({ contenedor, datos, audio, onPista }) {
    this.contenedor=contenedor; this.bifurcaciones=datos.bifurcaciones || [];
    this.audio=audio; this.onPista=onPista; this.actual=0;
    this.pausado=false; this.temporizadores=[];
  }
  obtenerTotalPistas(){return this.bifurcaciones.length;}
  programar(entrada){
    entrada.inicio=Date.now();
    entrada.id=setTimeout(()=>{
      entrada.id=null;
      this.temporizadores=this.temporizadores.filter(t=>t!==entrada);
      if(!this.pausado)entrada.fn();
      else{entrada.restante=0;this.temporizadores.push(entrada);}
    },entrada.restante);
  }
  esperar(ms,fn){
    const entrada={fn,restante:ms,inicio:0,id:null};
    this.temporizadores.push(entrada);
    if(!this.pausado)this.programar(entrada);
  }
  establecerPausa(pausado){
    const nuevo=Boolean(pausado);
    if(this.pausado===nuevo)return;
    this.pausado=nuevo;
    if(nuevo){
      const ahora=Date.now();
      this.temporizadores.forEach(t=>{if(t.id!==null){clearTimeout(t.id);t.restante=Math.max(0,t.restante-(ahora-t.inicio));t.id=null;}});
    }else{
      this.temporizadores.filter(t=>t.id===null).forEach(t=>this.programar(t));
    }
  }
  limpiar(){this.temporizadores.forEach(t=>clearTimeout(t.id));this.temporizadores=[];this.pausado=false;}
  render(){this.actual=0;this.mostrarIntro();}
  mostrarIntro(){this.contenedor.innerHTML=`<div class="informante-panel baqueano-intro"><div class="informante-cabecera"><span>EL BAQUEANO · DON EUSEBIO</span><span class="informante-sello">CAPÍTULO: LOS LLANOS</span></div><div class="informante-personaje"><div class="informante-avatar">🧭</div><div><strong>ANTES DE HABLAR</strong><p>Facundo conocía el terreno y podía aprovechar caminos escondidos para desplazarse, encontrar agua y orientarse. Don Eusebio te encarga una misión: después de hablar con él, volvé al mapa y consultá al Rastreador, al Gaucho Malo y al Cantor para reunir sus versiones sobre Facundo.</p></div></div><p><b>Cómo jugar:</b> primero respondé las preguntas de Don Eusebio. Después, regresá al pueblo y acercate a los tres personajes que ya estaban en el mapa; presioná ESPACIO para hablar con cada uno y completar la misión.</p><button type="button" class="informante-opcion baqueano-comenzar">HABLAR CON DON EUSEBIO</button></div>`;this.contenedor.querySelector('button').addEventListener('click',()=>this.renderPregunta());}
  renderPregunta(){
    if(this.actual>=this.bifurcaciones.length){this.contenedor.innerHTML='<div class="informante-final"><h3>TESTIMONIOS RECONSTRUIDOS</h3><p>Comparaste las declaraciones y encontraste los datos que coinciden.</p></div>';return;}
    const b=this.bifurcaciones[this.actual];
    const preguntas=b.opciones.map((o,i)=>({texto:i===0?'Preguntarle por el camino y los movimientos':i===1?'Preguntarle por los detalles que recuerda':'Pedirle que aclare su versión',opcion:o}));
    this.contenedor.innerHTML=`<div class="informante-panel">
      <div class="informante-cabecera"><span>DECLARACIÓN ${this.actual+1} / ${this.bifurcaciones.length}</span><span class="informante-sello">CONFIDENCIAL</span></div>
      <div class="informante-personaje"><div class="informante-avatar">?</div><div><strong>DON EUSEBIO</strong><p>“Preguntá lo que quieras, pero pensá bien qué dato necesitás confirmar.”</p></div></div>
      <div class="informante-pregunta">${b.pregunta}</div>
      <p class="informante-instruccion">Elegí una pregunta para contrastar su testimonio:</p>
      <div class="informante-opciones">${preguntas.map((q,i)=>`<button type="button" class="informante-opcion" data-opcion="${i}">${q.texto}</button>`).join('')}</div>
      <div class="informante-respuesta hidden" aria-live="polite"></div>
    </div>`;
    this.contenedor.querySelectorAll('.informante-opcion').forEach(btn=>{btn.addEventListener('mouseenter',()=>this.audio.reproducirHover());btn.addEventListener('click',()=>this.elegir(Number(btn.dataset.opcion),btn));});
  }
  elegir(i,btn){
    const b=this.bifurcaciones[this.actual],o=b.opciones[i],respuesta=this.contenedor.querySelector('.informante-respuesta');
    respuesta.textContent=o.respuesta;respuesta.classList.remove('hidden','bien','mal');
    if(o.correcta){
      respuesta.classList.add('bien');this.contenedor.querySelectorAll('.informante-opcion').forEach(x=>x.disabled=true);btn.classList.add('acierto');this.audio.reproducirClick();this.onPista(this.actual,b.pista);this.actual++;this.esperar(1250,()=>this.renderPregunta());
    }else{
      respuesta.classList.add('mal');btn.classList.add('fallo');this.esperar(1200,()=>{btn.classList.remove('fallo');respuesta.classList.add('hidden');});
    }
  }
}
export { MecanicaBaqueano };
