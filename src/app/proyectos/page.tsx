
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";

const DATA = [
  { id:'nav', title:'Navegación autónoma X3', areas:['Robótica','Inteligencia Artificial'], status:'EN DESARROLLO',
    line:'SLAM y planificación de trayectorias sobre el ROSMaster X3.', x:7, y:10, rot:-2.6, tone:0,
    desc:'El corazón del challenge: que el X3 arme su mapa, se ubique y llegue a un objetivo esquivando obstáculos, todo a bordo de la Raspberry Pi 5.',
    roles:['ROS 2','Nav2 / SLAM','C++ o Python'],
    links:[{label:'yahboom_rosmaster',kind:'GitHub',href:'https://github.com/AIRclub-UdeSA/yahboom_rosmaster'},{label:'Notas de navegación',kind:'Wiki',href:'#'}],
    reqs:['Manejo básico de Linux y terminal','Ganas de romper y arreglar cosas','2 a 4 horas por semana'],
    leads:'Juan Kaplan · Lucio Luque Materazzi',
    pins:[{who:'Lucio',text:'Ya corre el mapeo en el lab, falta afinar el costmap.'},{who:'Juan',text:'Necesitamos a alguien que se meta con Nav2 en serio.'},{who:'Camila',text:'Dejé los rosbags de la última prueba en el Drive.'}] },

  { id:'pinza', title:'Pinza adaptativa', areas:['Robótica'], status:'BUSCANDO EQUIPO',
    line:'Manipulador impreso en 3D para montar sobre el X3.', x:26, y:33, rot:2.2, tone:1,
    desc:'Un brazo simple de 3 grados de libertad con pinza de dos dedos, para que el robot pueda levantar objetos durante las pruebas del challenge.',
    roles:['CAD / impresión 3D','Servos y electrónica','Cinemática'],
    links:[{label:'Piezas y STL',kind:'Drive',href:'#'},{label:'Bitácora de diseño',kind:'Wiki',href:'#'}],
    reqs:['Fusion 360, Onshape o similar','No hace falta experiencia previa en robótica','Venir al lab una vez por semana'],
    leads:'Teo Kaucher',
    pins:[{who:'Teo',text:'Subí el primer boceto del chasis de la pinza al Drive.'},{who:'Francesca',text:'La impresora del lab quedó calibrada, se puede usar.'}] },

  { id:'vision', title:'Visión RGB‑D', areas:['Inteligencia Artificial'], status:'BUSCANDO EQUIPO',
    line:'Detección de objetos con la cámara de profundidad.', x:4, y:52, rot:1.6, tone:2,
    desc:'Detectar y ubicar en 3D los objetos de la pista usando la cámara RGB-D. Modelo liviano, corriendo en tiempo real sobre la Pi.',
    roles:['Python','Visión por computadora','PyTorch / ONNX'],
    links:[{label:'vision_pipeline',kind:'GitHub',href:'#'},{label:'Dataset etiquetado',kind:'Drive',href:'#'}],
    reqs:['Python intermedio','Algo de redes neuronales (o ganas de aprender)','Notebook propia'],
    leads:'Zoe Velazquez',
    pins:[{who:'Zoe',text:'Necesitamos a alguien que sepa Python para la parte de inferencia.'},{who:'Juan',text:'Ojo con la latencia: tiene que correr a 10 fps mínimo.'}] },

  { id:'sim', title:'Gemelo digital', areas:['Software','Robótica'], status:'FASE DE PRUEBAS', 
    line:'Simulador en Gazebo del X3 para los equipos de la JAR.', x:42, y:8, rot:-1.8, tone:1,
    desc:'El entorno público donde los equipos del challenge desarrollan y prueban su código sin tener el robot físico delante. Es nuestra carta de presentación técnica.',
    roles:['Gazebo / URDF','Docker','Documentación'],
    links:[{label:'jar_simulator',kind:'GitHub',href:'https://github.com/AIRclub-UdeSA/yahboom_rosmaster'},{label:'Guía de instalación',kind:'Docs',href:'https://airclub-udesa.github.io/jar_site/'}],
    reqs:['Linux y Docker','ROS 2 Humble','Paciencia con los archivos de configuración'],
    leads:'Lucio Luque Materazzi',
    pins:[{who:'Lucio',text:'La física de las ruedas mecanum ya quedó estable.'},{who:'Tomas',text:'Falta escribir el README para los equipos externos.'}] },

  { id:'web', title:'Web del club', areas:['Software'], status:'EN DESARROLLO',
    line:'Sitio público y este tablero interactivo.', x:55, y:31, rot:2.8, tone:0,
    desc:'La cara pública del AIR: el sitio, el tablero de proyectos y las páginas de cada evento. Front puro, sin framework pesado.',
    roles:['HTML / CSS','JavaScript','Diseño de interacción'],
    links:[{label:'airclub-udesa.github.io',kind:'GitHub',href:'https://github.com/AIRclub-UdeSA'},{label:'Sitio del JAR 2026',kind:'Live',href:'https://airclub-udesa.github.io/jar_site/'}],
    reqs:['CSS con soltura','Gusto por el detalle y la animación','Trabajo mayormente remoto'],
    leads:'Tomas Diaz',
    pins:[{who:'Tomas',text:'El tablero ya tiene el modo foco andando.'},{who:'Camila',text:'Faltan las fotos nuevas del equipo.'}] },
];

const AREAS = ['Robótica','Software','Inteligencia Artificial'];
const TONES = [
  { bg:'linear-gradient(162deg,#c4256e 0%,#a40c4c 62%,#8e0a41 100%)', ink:'#fff3f7', edge:'rgba(60,8,30,.5)', stamp:'#fff', glow:'rgba(214,57,120,.5)' },
  { bg:'linear-gradient(162deg,#fbf8f4 0%,#ece5dc 100%)', ink:'#241017', edge:'rgba(40,20,28,.28)', stamp:'#a40c4c', glow:'rgba(255,245,230,.45)' },
  { bg:'linear-gradient(162deg,#f6d3e0 0%,#e3aec3 100%)', ink:'#3d1024', edge:'rgba(70,12,40,.3)', stamp:'#8e0a41', glow:'rgba(246,211,224,.45)' },
];

const STICKERS = [
  { src: '/stickers/sticker1.png', x: 78, y: 4, width: '11cqw', rot: -6 },
  { src: '/stickers/sticker2.png', x: 2, y: 32, width: '7cqw', rot: 10 },
  { src: '/stickers/sticker3.png', x: 22, y: 68, width: '10cqw', rot: -3 },
  { src: '/stickers/sticker4.png', x: 55, y: 56, width: '9cqw', rot: 5 },
  { src: '/stickers/sticker5.png', x: 32, y: 12, width: '8cqw', rot: -10 },
  { src: '/stickers/sticker6.png', x: 74, y: 44, width: '7cqw', rot: 14 },
];
const PINCOLORS = ['#d6336c','#a40c4c','#e0457f','#b81e64'];
const CLUSTERS = [{x:0.19,y:0.40},{x:0.52,y:0.34},{x:0.83,y:0.40}];

export default function ProyectosPage() {
  const [focus, setFocus] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hoverPin, setHoverPin] = useState(-1);
  const [formOpen, setFormOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const accent = '#a40c4c';
  const showStamps = true;
  const zoomStrength = 0.7;

  const boardRef = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: 0, y: 0, s: 1, tx: 0, ty: 0, ts: 1 });
  const closeTimeout = useRef<any>(null);
  const rafRef = useRef<number>(null);

  useEffect(() => {
    let t = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selId) close();
    };
    window.addEventListener('keydown', onKey);

    if (reduced) return () => window.removeEventListener('keydown', onKey);
    
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const c = cam.current;
      const el = boardRef.current;
      if (!el) return;
      
      c.x += (c.tx - c.x) * 0.075; 
      c.y += (c.ty - c.y) * 0.075; 
      c.s += (c.ts - c.s) * 0.075;
      
      t += 0.016;
      
      const ry = c.x * 4.2 + Math.sin(t * 0.46) * 0.85;
      const rx = 0.5 - c.y * 3 + Math.sin(t * 0.33 + 1.2) * 0.45;
      const rz = Math.sin(t * 0.29 + 0.4) * 0.18;
      const fy = Math.sin(t * 0.4) * 5;
      
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${c.s}) translate3d(${-c.x * 3.2}%, calc(${-c.y * 2.6}% + ${fy}px), 0)`;
    };
    
    rafRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
    };
  }, [selId]);

  const stageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || selId) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    let prox = 0;
    CLUSTERS.forEach(c => {
      const d = Math.hypot((nx - c.x) * 1.6, ny - c.y);
      prox = Math.max(prox, Math.max(0, 1 - d / 0.42));
    });
    cam.current.tx = (nx - 0.5) * (0.55 + prox * 0.45); 
    cam.current.ty = (ny - 0.5); 
    cam.current.ts = 1 + prox * 0.17 * zoomStrength;
  };

  const stageLeave = () => {
    cam.current.tx = 0; 
    cam.current.ty = 0; 
    cam.current.ts = 1;
  };

  const open = (id: string) => {
    setSelId(id);
    setFlipped(false);
    setFormOpen(false);
    setSent(false);
    setHoverPin(-1);
    setClosing(false);
    cam.current.tx = 0; 
    cam.current.ty = 0; 
    cam.current.ts = 1;
  };

  const close = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSelId(null);
      setClosing(false);
      return;
    }
    setClosing(true);
    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setSelId(null);
      setClosing(false);
      setFlipped(false);
      setFormOpen(false);
      setSent(false);
    }, 340);
  };

  const sel = DATA.find(d => d.id === selId) || null;
  const dimming = !!focus;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="proyectos-container">
      <div style={{ maxWidth: '1240px', margin: '0 auto 100px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '18px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.65rem', color: '#a40c4c', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '12px' }}>// Proyectos abiertos</div>
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: 'clamp(1.9rem,3.4vw,2.9rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.02, marginBottom: '12px' }}>El tablero</h2>
          <p style={{ maxWidth: '520px', color: 'var(--text2)', fontSize: '.93rem', lineHeight: 1.7 }}>Todo lo que el club está construyendo, colgado en un corcho. Filtrá por área, acercate a una zona y hacé clic en un papel para ver de qué se trata y anotarte.</p>
        </div>
        <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.62rem', color: 'var(--text3)', letterSpacing: '.14em', textTransform: 'uppercase', lineHeight: 2 }}>
          <div>Clic en un papel → detalle</div>
          <div>Clic en el papel abierto → reverso</div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', perspective: '1500px', perspectiveOrigin: '50% 45%' }} onMouseMove={stageMove} onMouseLeave={stageLeave}>
        <div ref={boardRef} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          <div style={{ position: 'relative', borderRadius: '10px', padding: '20px 20px 0', backgroundColor: '#c3c8cc', backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.30) 0 1px,rgba(70,78,84,.10) 1px 2px,rgba(255,255,255,0) 2px 4px),linear-gradient(180deg,#f4f6f7 0%,#dce0e3 14%,#b3b9bf 46%,#9aa1a7 56%,#c8cdd1 82%,#eff1f2 100%)', boxShadow: '0 2px 0 rgba(255,255,255,.75) inset,0 -2px 0 rgba(90,98,105,.5) inset,0 3px 6px rgba(20,6,12,.16),0 30px 60px rgba(20,6,12,.34),0 60px 110px rgba(20,6,12,.2)' }}>
            
            {/* Hanging clips top */}
            <div style={{ position: 'absolute', top: '-15px', left: '16%', width: '30px', height: '18px', borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,#f0f2f3,#aeb4ba)', boxShadow: '0 -2px 5px rgba(20,6,12,.22)' }}>
              <div style={{ position: 'absolute', left: '50%', top: '5px', width: '9px', height: '9px', marginLeft: '-4.5px', borderRadius: '50%', background: 'radial-gradient(circle at 50% 30%,#4b5157,#23272b)', boxShadow: '0 1px 0 rgba(255,255,255,.6)' }}></div>
            </div>
            <div style={{ position: 'absolute', top: '-15px', right: '16%', width: '30px', height: '18px', borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,#f0f2f3,#aeb4ba)', boxShadow: '0 -2px 5px rgba(20,6,12,.22)' }}>
              <div style={{ position: 'absolute', left: '50%', top: '5px', width: '9px', height: '9px', marginLeft: '-4.5px', borderRadius: '50%', background: 'radial-gradient(circle at 50% 30%,#4b5157,#23272b)', boxShadow: '0 1px 0 rgba(255,255,255,.6)' }}></div>
            </div>

            {/* Corner pieces */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '52px', height: '52px', borderRadius: '9px 0 14px 0', background: 'linear-gradient(135deg,#eef0f1 0%,#c2c7cb 42%,#959ba1 100%)', boxShadow: '0 1px 2px rgba(20,6,12,.28),0 1px 0 rgba(255,255,255,.65) inset', zIndex: 4 }}>
              <div style={{ position: 'absolute', right: '11px', bottom: '11px', width: '11px', height: '11px', borderRadius: '50%', backgroundImage: 'linear-gradient(118deg,transparent 43%,rgba(48,54,60,.8) 43% 57%,transparent 57%),radial-gradient(circle at 34% 28%,#fdfefe,#9aa0a6 68%,#6f767c)', boxShadow: '0 1px 1px rgba(255,255,255,.7)' }}></div>
            </div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '52px', height: '52px', borderRadius: '0 9px 0 14px', background: 'linear-gradient(225deg,#eef0f1 0%,#c2c7cb 42%,#959ba1 100%)', boxShadow: '0 1px 2px rgba(20,6,12,.28),0 1px 0 rgba(255,255,255,.65) inset', zIndex: 4 }}>
              <div style={{ position: 'absolute', left: '11px', bottom: '11px', width: '11px', height: '11px', borderRadius: '50%', backgroundImage: 'linear-gradient(118deg,transparent 43%,rgba(48,54,60,.8) 43% 57%,transparent 57%),radial-gradient(circle at 34% 28%,#fdfefe,#9aa0a6 68%,#6f767c)', boxShadow: '0 1px 1px rgba(255,255,255,.7)' }}></div>
            </div>

            <div style={{ position: 'relative', padding: '5px', borderRadius: '5px', background: 'linear-gradient(180deg,#7f868c,#b9bfc4 40%,#d8dcdf)', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset' }}>
              <div style={{ containerType: 'size', position: 'relative', width: '100%', aspectRatio: '16/9.2', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c2b2d', backgroundImage: 'radial-gradient(circle at 14% 26%,rgba(255,255,255,.14) 0 1.1px,transparent 1.7px),radial-gradient(circle at 63% 72%,rgba(255,255,255,.09) 0 1.3px,transparent 2px),radial-gradient(circle at 84% 17%,rgba(0,0,0,.6) 0 1.4px,transparent 2px),radial-gradient(circle at 33% 87%,rgba(255,255,255,.07) 0 1.6px,transparent 2.3px),radial-gradient(circle at 46% 12%,rgba(255,255,255,.06) 0 1.2px,transparent 1.8px),radial-gradient(ellipse at 50% 34%,#3b393c 0%,#232224 62%,#161517 100%)', backgroundSize: '43px 37px,59px 53px,67px 41px,37px 61px,51px 47px,100% 100%', boxShadow: 'inset 0 0 70px rgba(0,0,0,.6),inset 0 3px 10px rgba(0,0,0,.75),inset 0 -2px 8px rgba(0,0,0,.6)' }}>
                
                
                {STICKERS.map((s, i) => (
                  <img 
                    key={'sticker'+i}
                    src={s.src} 
                    alt="" 
                    style={{
                      position: 'absolute',
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      width: s.width,
                      height: 'auto',
                      transform: `rotate(${s.rot}deg)`,
                      zIndex: dimming ? 1 : 4,
                      filter: dimming ? 'saturate(.35) blur(1.1px)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                      opacity: dimming ? 0.26 : 1,
                      transition: 'opacity .5s ease, filter .5s ease',
                      pointerEvents: 'none'
                    }}
                  />
                ))}

                {/* Dimmer */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(4,2,6,.5) 0%, rgba(4,2,6,.8) 100%)', opacity: dimming ? 1 : 0, transition: 'opacity .55s cubic-bezier(.4,0,.2,1)' }}></div>

                {DATA.map((n) => {
                  const on = !focus || n.areas.includes(focus);
                  const hov = hoverId === n.id;
                  const tone = TONES[n.tone];
                  
                  return (
                    <div 
                      key={n.id}
                      style={{
                        position: 'absolute', left: `${n.x}%`, top: `${n.y}%`, width: '21cqw', cursor: 'pointer',
                        zIndex: hov ? 9 : (on && dimming ? 6 : (dimming ? 1 : 2)),
                        transform: `rotate(${n.rot}deg) translateY(${hov ? -8 : 0}px) scale(${hov ? 1.05 : 1})`,
                        transformOrigin: '50% 0%',
                        transition: 'transform .45s cubic-bezier(.34,1.3,.5,1), opacity .5s ease, filter .5s ease',
                        opacity: on ? 1 : 0.26,
                        filter: on ? 'none' : 'saturate(.35) blur(1.1px)',
                      }}
                      onClick={() => open(n.id)}
                      onMouseEnter={() => setHoverId(n.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <div style={{
                        position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '15.5cqw',
                        padding: '1.6cqw 1.7cqw 1.4cqw', background: tone.bg, borderRadius: '1px', color: tone.ink,
                        backgroundBlendMode: 'normal',
                        boxShadow: on && dimming
                          ? `0 1px 1px rgba(0,0,0,.55), 0 12px 26px rgba(0,0,0,.5), 0 0 34px ${tone.glow}, 0 0 0 1px ${tone.edge}`
                          : `0 1px 2px rgba(0,0,0,.5), 0 ${hov ? 20 : 8}px ${hov ? 34 : 16}px rgba(0,0,0,${hov ? .55 : .45}), 0 0 0 1px ${tone.edge}`,
                        clipPath: 'polygon(0 0,100% 0,100% 89%,89% 100%,0 100%)', overflow: 'hidden',
                        transition: 'box-shadow .45s ease',
                      }}>
                        <div style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 'clamp(10px,1.8cqw,21px)', lineHeight: 1.15, letterSpacing: '-.015em', marginBottom: '.7cqw', overflowWrap: 'break-word' }}>{n.title}</div>
                        <div style={{ fontSize: 'clamp(8px,1.22cqw,14px)', lineHeight: 1.45, opacity: 0.86, overflowWrap: 'break-word' }}>{n.line}</div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', padding: '15px 6px 17px' }}>
              <span style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(40,46,52,.6)', marginRight: '4px', textShadow: '0 1px 0 rgba(255,255,255,.55)' }}>Filtrar por área</span>
              
              {[{ label: 'Todos', key: null, count: DATA.length }, ...AREAS.map(a => ({ label: a, key: a, count: DATA.filter(d => d.areas.includes(a)).length }))].map(f => {
                const active = focus === f.key;
                return (
                  <button 
                    key={f.label}
                    type="button" 
                    onClick={() => setFocus(f.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 13px', borderRadius: '40px', cursor: 'pointer', whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-outfit), sans-serif', fontSize: '.76rem', fontWeight: 500, letterSpacing: '.01em',
                      background: active ? accent : '#2e3338',
                      color: active ? '#fff' : '#e7e9ea',
                      border: `1px solid ${active ? 'rgba(0,0,0,.25)' : '#22272b'}`,
                      boxShadow: active ? `0 4px 14px rgba(164,12,76,.4), 0 1px 0 rgba(255,255,255,.25) inset` : '0 1px 0 rgba(255,255,255,.12) inset, 0 2px 4px rgba(20,6,12,.28)',
                      transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                    }}
                  >
                    {f.label}<span style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.58rem', opacity: active ? 0.55 : 0.45 }}>{f.count}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {sel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 72px', overflowY: 'auto',
          background: 'rgba(26,8,16,.5)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)',
          animation: closing ? 'veilOut .3s ease forwards' : 'veilIn .3s ease'
        }} onClick={close}>
          <div style={{
            position: 'relative', width: 'min(560px,92vw)', perspective: '1600px',
            animation: closing ? 'cardOut .32s cubic-bezier(.4,0,1,1) forwards' : 'cardIn .5s cubic-bezier(.24,1.2,.4,1)'
          }} onClick={stop}>
            
            <div style={{
              position: 'relative', display: 'flex', transformStyle: 'preserve-3d', minHeight: 'min(520px,66vh)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform .8s cubic-bezier(.5,.05,.2,1)',
            }}>

              {/* Front face */}
              <div style={{
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column',
                padding: '30px 30px 26px', borderRadius: '3px', cursor: 'pointer',
                clipPath: 'polygon(0 0,100% 0,100% 94%,93% 100%,0 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,.35), 0 30px 60px rgba(0,0,0,.45), 0 60px 120px rgba(0,0,0,.4)',
                transition: 'opacity .12s linear .38s',
                position: 'relative', flex: '1 1 auto', width: '100%',
                background: 'linear-gradient(162deg,#fcfaf7 0%,#ebe4db 100%)',
                opacity: flipped ? 0 : 1, pointerEvents: flipped ? 'none' : 'auto',
              }} onClick={() => { setFlipped(!flipped); setHoverPin(-1); }}>
                
                {showStamps && (
                  <div style={{
                    position: 'absolute', top: '18px', right: '20px', transform: 'rotate(-9deg)',
                    fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: '.86rem', letterSpacing: '.14em',
                    color: sel.status === 'BUSCANDO EQUIPO' ? accent : '#5a2130',
                    border: '2.5px double currentColor', borderRadius: '5px', padding: '8px 14px',
                    opacity: 0.78, mixBlendMode: 'multiply', pointerEvents: 'none',
                    animation: 'stampIn .45s cubic-bezier(.34,1.4,.5,1) both .2s',
                  }}>{sel.status}</div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {sel.areas.map(a => (
                    <span key={a} style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: '30px', background: 'rgba(164,12,76,.08)', color: accent }}>{a}</span>
                  ))}
                </div>
                
                <h3 style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,3.2vw,2rem)', letterSpacing: '-.025em', lineHeight: 1.05, marginBottom: '12px', color: '#2a0d18' }}>{sel.title}</h3>
                <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'rgba(42,13,24,.78)', marginBottom: '14px' }}>{sel.desc}</p>
                
                <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(42,13,24,.5)', marginBottom: '6px' }}>Buscamos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
                  {sel.roles.map(r => (
                    <span key={r} style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: '30px', background: 'rgba(90,33,48,.07)', color: '#5a2130' }}>{r}</span>
                  ))}
                </div>
                
                <div onClick={() => { setFlipped(!flipped); setHoverPin(-1); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 20px', marginBottom: '18px', borderRadius: '12px', background: 'rgba(164,12,76,.06)', border: '1.5px dashed rgba(164,12,76,.2)', cursor: 'pointer', transition: 'all .25s ease' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(164,12,76,.12)'; e.currentTarget.style.borderColor = 'rgba(164,12,76,.4)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(164,12,76,.06)'; e.currentTarget.style.borderColor = 'rgba(164,12,76,.2)'; }}>
                  <span style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: '#a40c4c', fontWeight: 500 }}>↻ Dar vuelta → ficha técnica, links y requisitos</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
                  <button type="button" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '60px', border: 'none', cursor: 'pointer',
                    background: accent, color: '#fff', fontSize: '.88rem', fontWeight: 600, letterSpacing: '.01em',
                    boxShadow: '0 10px 26px rgba(164,12,76,.32)', transition: 'transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s',
                  }} onClick={(e) => { e.stopPropagation(); setFormOpen(true); setSent(false); }}>¡Quiero sumarme!</button>
                </div>
              </div>

              {/* Back face */}
              <div style={{
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column',
                padding: '30px 30px 26px', borderRadius: '3px', cursor: 'pointer',
                clipPath: 'polygon(0 0,100% 0,100% 94%,93% 100%,0 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,.35), 0 30px 60px rgba(0,0,0,.45), 0 60px 120px rgba(0,0,0,.4)',
                transition: 'opacity .12s linear .38s',
                position: 'absolute', inset: 0, overflow: 'auto', scrollbarWidth: 'none',
                background: 'linear-gradient(162deg,#2a0d18 0%,#48192a 100%)',
                transform: 'rotateY(180deg)',
                opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none',
              }} onClick={() => { setFlipped(!flipped); setHoverPin(-1); }}>
                
                <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(242,205,217,.6)', marginBottom: '16px' }}>Reverso · ficha técnica</div>
                <h3 style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-.02em', marginBottom: '18px', color: '#f5e8ec' }}>{sel.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
                  {sel.links.map(l => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={stop} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(242,205,217,.07)', border: '1px solid rgba(242,205,217,.16)', color: '#f2cdd9', fontSize: '.85rem', fontWeight: 500, transition: 'all .25s cubic-bezier(.4,0,.2,1)'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(242,205,217,.14)'; e.currentTarget.style.borderColor = 'rgba(242,205,217,.4)'; e.currentTarget.style.transform = 'translateX(3px)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(242,205,217,.07)'; e.currentTarget.style.borderColor = 'rgba(242,205,217,.16)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                      <span>{l.label}</span>
                      <span style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.6 }}>{l.kind}</span>
                    </a>
                  ))}
                </div>
                
                <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(242,205,217,.5)', marginBottom: '8px' }}>Requerimientos</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  {sel.reqs.map((q, idx) => (
                    <div key={idx} style={{ fontSize: '.84rem', lineHeight: 1.5, color: 'rgba(245,232,236,.72)', paddingLeft: '16px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '-1px', color: '#dd8fae' }}>›</span>{q}
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed rgba(242,205,217,.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.58rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(242,205,217,.5)', marginBottom: '4px' }}>Referentes</div>
                    <div style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 700, fontSize: '.95rem', color: '#f5e8ec' }}>{sel.leads}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-jbmono), monospace', fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(242,205,217,.38)' }}>Clic → volver al frente</span>
                </div>
              </div>

            </div>

            {/* Comment Stickers (formerly pins) */}
            {!flipped && sel.pins.map((p, i) => {
              const anchors = [{ t:'12%', l:'-14px' }, { t:'42%', l:'-14px' }, { t:'70%', l:'-14px' }, { t:'26%', r:'-14px' }, { t:'58%', r:'-14px' }];
              const a = anchors[i % anchors.length];
              const shown = hoverPin === i;
              const rightSide = !!a.r;
              return (
                <div key={i} style={{ 
                  position: 'absolute', top: a.t, ...(a.l ? { left: a.l } : { right: a.r }), zIndex: shown ? 8 : 5, width: '20px', height: '20px' 
                }} onMouseEnter={() => setHoverPin(i)} onMouseLeave={() => setHoverPin(-1)} onClick={stop}>
                  
                  {/* Sticker Indicator */}
                  <div style={{
                    position: 'relative', width: '20px', height: '20px', cursor: 'help',
                    borderRadius: '50%', backgroundColor: PINCOLORS[i % 4],
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.8)',
                    transform: shown ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                    transition: 'transform .3s cubic-bezier(.34,1.4,.5,1)',
                  }}></div>
                  
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute', top: '-8px', width: '240px', padding: '12px 14px', borderRadius: '10px',
                    background: 'linear-gradient(165deg,#fdf6e6 0%,#f5e4ca 100%)', boxShadow: '0 16px 36px rgba(20,6,12,.4)',
                    opacity: shown ? 1 : 0, pointerEvents: 'none',
                    transform: shown ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity .25s ease, transform .25s ease',
                    ...(rightSide ? { right: '30px' } : { left: '30px' }),
                  }}>
                    <div style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 700, fontSize: '.78rem', color: '#2a0d18', marginBottom: '3px' }}>{p.who}</div>
                    <div style={{ fontSize: '.78rem', lineHeight: 1.45, color: 'rgba(42,13,24,.72)' }}>{p.text}</div>
                  </div>
                </div>
              );
            })}

            <button type="button" aria-label="Cerrar" onClick={close} style={{
              position: 'absolute', top: '-16px', right: '-16px', width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid rgba(242,205,217,.35)', background: 'rgba(26,8,16,.82)', color: '#f2cdd9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', backdropFilter: 'blur(8px)', transition: 'all .3s cubic-bezier(.4,0,.2,1)', zIndex: 6
            }} onMouseEnter={e => { e.currentTarget.style.background = '#a40c4c'; e.currentTarget.style.borderColor = '#a40c4c'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'rotate(90deg)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,8,16,.82)'; e.currentTarget.style.borderColor = 'rgba(242,205,217,.35)'; e.currentTarget.style.color = '#f2cdd9'; e.currentTarget.style.transform = 'rotate(0deg)'; }}>✕</button>

            {formOpen && (
              <div style={{
                position: 'absolute', left: '50%', bottom: '-26px', transform: 'translateX(-50%)', width: 'min(430px,88vw)', zIndex: 7,
                padding: '20px 22px', borderRadius: '12px', background: 'linear-gradient(165deg,#fbe3ec 0%,#f2cdd9 100%)',
                boxShadow: '0 26px 60px rgba(20,6,12,.45)', animation: 'slipUp .38s cubic-bezier(.24,1.2,.4,1)'
              }} onClick={stop}>
                
                {!sent ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: '1.02rem', color: '#2a0d18' }}>Me anoto</div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-jbmono), monospace', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(42,13,24,.45)' }} onMouseEnter={e => e.currentTarget.style.color = '#a40c4c'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(42,13,24,.45)'}>Cancelar</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <input placeholder="Nombre y apellido" style={{ width: "100%", boxSizing: "border-box", gridColumn: 'span 2', padding: '11px 13px', borderRadius: '9px', border: '1.5px solid rgba(164,12,76,.16)', background: 'rgba(255,255,255,.7)', fontSize: '.85rem', color: '#2a0d18', outline: 'none', transition: 'border-color .25s' }} onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = 'rgba(164,12,76,.16)'} />
                      <input placeholder="Mail UdeSA" style={{ width: "100%", boxSizing: "border-box", padding: '11px 13px', borderRadius: '9px', border: '1.5px solid rgba(164,12,76,.16)', background: 'rgba(255,255,255,.7)', fontSize: '.85rem', color: '#2a0d18', outline: 'none', transition: 'border-color .25s' }} onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = 'rgba(164,12,76,.16)'} />
                      <input placeholder="Carrera / año" style={{ width: "100%", boxSizing: "border-box", padding: '11px 13px', borderRadius: '9px', border: '1.5px solid rgba(164,12,76,.16)', background: 'rgba(255,255,255,.7)', fontSize: '.85rem', color: '#2a0d18', outline: 'none', transition: 'border-color .25s' }} onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = 'rgba(164,12,76,.16)'} />
                      <select style={{ width: "100%", boxSizing: "border-box", gridColumn: 'span 2', padding: '11px 13px', borderRadius: '9px', border: '1.5px solid rgba(164,12,76,.16)', background: 'rgba(255,255,255,.7)', fontSize: '.85rem', color: '#2a0d18', outline: 'none' }}>
                        {sel.roles.map(r => <option key={r}>{r}</option>)}
                        <option>Todavía no sé, quiero charlarlo</option>
                      </select>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSent(true); }} style={{ width: '100%', padding: '12px 18px', borderRadius: '60px', border: 'none', cursor: 'pointer', background: accent, color: '#fff', fontSize: '.85rem', fontWeight: 600, boxShadow: '0 8px 20px rgba(164,12,76,.3)' }}>Enviar al coordinador</button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 4px' }}>
                    <div style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#2a0d18', marginBottom: '6px' }}>Listo, quedó anotado</div>
                    <div style={{ fontSize: '.85rem', lineHeight: 1.6, color: 'rgba(42,13,24,.7)' }}>Le avisamos al coordinador del proyecto. Te escribe por mail en los próximos días.</div>
                  </div>
                )}
                
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
