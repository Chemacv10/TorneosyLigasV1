// ─────────────────────────────────────────────
//  LIGAPÁDEL — UI helpers compartidos
// ─────────────────────────────────────────────

// Módulos de LigaPádel
const LP_MODULOS = [
  { id: 'inicio',          label: 'Inicio',     href: 'index.html',     icon: 'icons/inicio-liga.png' },
  { id: 'jugadores-liga',  label: 'Jugadores',  href: 'jugadores.html', icon: 'icons/jugadores.png'   },
  { id: 'ligas',           label: 'Ligas', href: 'index.html',     icon: 'icons/ligas.png'       },
  { id: 'torneos-liga',    label: 'Torneos',    href: 'torneos.html',   icon: 'icons/torneos.png'     },
  { id: 'pistas-liga',     label: 'Pistas',     href: 'pistas.html',    icon: 'icons/pistas.png'      },
];

// ── Navegación ────────────────────────────────

/**
 * Renderiza el menú de navegación en el elemento #nav-container.
 * @param {string} moduloActivo  id del módulo actual
 */
function renderNav(moduloActivo) {
  const el = document.getElementById('nav-container');
  if (!el) return;
  el.innerHTML = LP_MODULOS.map(m => `
    <a class="nav-item ${m.id === moduloActivo ? 'active' : ''}" href="${m.href}">
      <div class="nav-icon"><img src="${m.icon}" alt="${m.label}"></div>
      <div class="nav-label">${m.label}</div>
    </a>`).join('');
}

// ── Header ────────────────────────────────────

/**
 * Renderiza el header estándar.
 * @param {object} opts  { titulo, subtitulo, icono, botonDerecho }
 *   botonDerecho: 'menu' | 'config' | 'back' | null
 *   onConfig: función a llamar al pulsar ⚙
 *   onBack: href destino del botón ←
 */
function renderHeader({ titulo = 'LigaPádel', subtitulo = '', icono = 'icons/inicio-liga.png',
                         botonDerecho = 'menu', onConfig = null, onBack = null } = {}) {
  const el = document.getElementById('header-container');
  if (!el) return;
  // Usar logo guardado si existe (desde cualquier módulo)
  const escuelaId = typeof Store !== 'undefined' ? Store.escuelaId : null;
  const logoGuardado = escuelaId ? localStorage.getItem('escuela_logo_' + escuelaId) : null;
  if (logoGuardado) icono = logoGuardado;
  // Usar nombre guardado si no se pasa uno específico
  const nombreGuardado = escuelaId ? localStorage.getItem('escuela_nombre_' + escuelaId) : null;
  if (nombreGuardado && titulo === 'Escuela de Pádel') titulo = nombreGuardado;

  let boton = '';
  if (botonDerecho === 'config') {
    boton = `<button class="btn-icon" onclick="(${onConfig})()" title="Configuración" style="background:#eff6ff;border:2px solid #bfdbfe;color:#2563eb;font-size:18px;width:40px;height:40px;border-radius:12px">⚙</button>`;
  } else if (botonDerecho === 'back') {
    boton = `<a class="btn-icon" href="${onBack}" style="background:#eff6ff;border:2px solid #bfdbfe;color:#2563eb;font-size:20px;font-weight:900;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;text-decoration:none">←</a>`;
  } else if (botonDerecho === 'menu') {
    boton = `<button class="btn-icon" id="btn-menu-3puntos" onclick="UI.menuUsuario(this)">⋮</button>`;
  }

  el.innerHTML = `
    <div class="header">
      <div class="hlogo"><img src="${icono}" alt="${titulo}"></div>
      <div class="htext">
        <div class="htitle">${titulo}</div>
        ${subtitulo ? `<div class="hsub">${subtitulo}</div>` : ''}
      </div>
      ${boton}
    </div>
    <div class="sep"></div>`;
}

// ── Filtros ───────────────────────────────────

/**
 * Activa el botón de filtro pulsado y desactiva los hermanos.
 * Llama a onChange(valor) con el value del botón.
 */
function initFiltros(containerSelector, onChange) {
  const btns = document.querySelectorAll(`${containerSelector} .fbtn`);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(btn.dataset.value || '');
    });
  });
}

// ── Bottom Sheets ─────────────────────────────

function openSheet(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  // Bloquear scroll del fondo
  document.body.style.overflow = 'hidden';
  // Interceptar botón atrás del móvil
  history.pushState({ sheet: id }, '');
}

function closeSheet(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  // Restaurar scroll
  const anyOpen = document.querySelector('.overlay.open');
  if (!anyOpen) document.body.style.overflow = '';
}

// Botón atrás del móvil: cerrar sheet en lugar de navegar
window.addEventListener('popstate', e => {
  const open = document.querySelector('.overlay.open');
  if (open) {
    open.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Cerrar sheet al pulsar el overlay
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
    const anyOpen = document.querySelector('.overlay.open');
    if (!anyOpen) document.body.style.overflow = '';
  }
});

// ── Cards expandibles ─────────────────────────

function toggleCard(id) {
  const exp = document.getElementById('exp-' + id);
  const chev = document.getElementById('chev-' + id);
  const card = document.getElementById('card-' + id);
  if (!exp) return;
  const abierta = exp.classList.toggle('open');
  if (chev) chev.classList.toggle('open', abierta);
  if (card) card.classList.toggle('card-open', abierta);
}

// ── Toast ─────────────────────────────────────

function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ── Loading ───────────────────────────────────

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

function showEmpty(containerId, msg = 'Sin datos aún') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state">${msg}</div>`;
}

function showError(containerId, msg = 'Error al cargar') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state error">${msg}</div>`;
}

// ── Avatares ──────────────────────────────────

const COLORES_AV = ['#2563eb','#16a34a','#f59e0b','#e05a5a','#7c3aed','#0891b2','#be185d','#b45309'];

function iniciales(nombre = '') {
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

function colorAvatar(nombre = '') {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_AV[Math.abs(hash) % COLORES_AV.length];
}

function avatarHTML(nombre, claseExtra = '') {
  return `<div class="av ${claseExtra}" style="background:${colorAvatar(nombre)}">${iniciales(nombre)}</div>`;
}

// ── Chips de nivel ────────────────────────────

// ── Paleta de chips ───────────────────────────
// 12 pares fondo/texto — se asignan por posición en lista o hash del string
const _CHIP_PALETA = [
  { bg:'#dbeafe', tx:'#1e40af' }, // azul
  { bg:'#dcfce7', tx:'#15803d' }, // verde
  { bg:'#ffedd5', tx:'#c2410c' }, // naranja
  { bg:'#f3e8ff', tx:'#7c3aed' }, // morado
  { bg:'#fce7f3', tx:'#be185d' }, // rosa
  { bg:'#ccfbf1', tx:'#0f766e' }, // teal
  { bg:'#fef9c3', tx:'#92400e' }, // amarillo
  { bg:'#e0e7ff', tx:'#3730a3' }, // índigo
  { bg:'#fee2e2', tx:'#b91c1c' }, // rojo suave
  { bg:'#d1fae5', tx:'#065f46' }, // esmeralda
  { bg:'#fdf4ff', tx:'#86198f' }, // fucsia
  { bg:'#e0f2fe', tx:'#0369a1' }, // celeste
];

// _chipListas: registro de listas conocidas para asignar color por posición
const _chipListas = {};

function chipRegistrarLista(clave, lista) {
  _chipListas[clave] = lista;
}

function chipColor(valor, clave) {
  if (!valor) return _CHIP_PALETA[0];
  // Si hay lista registrada para esta clave, usar posición
  if (clave && _chipListas[clave]) {
    const idx = _chipListas[clave].indexOf(valor);
    if (idx >= 0) return _CHIP_PALETA[idx % _CHIP_PALETA.length];
  }
  // Fallback: hash del string
  let h = 0;
  for (let i = 0; i < valor.length; i++) h = valor.charCodeAt(i) + ((h << 5) - h);
  return _CHIP_PALETA[Math.abs(h) % _CHIP_PALETA.length];
}

function chipNivel(nivel) {
  if (!nivel) return '';
  const c = chipColor(nivel, 'niveles');
  return `<span class="chip" style="background:${c.bg};color:${c.tx}">${nivel}</span>`;
}

function chipPista(pista) {
  if (!pista) return '';
  const c = chipColor(pista, 'pistas');
  return `<span class="chip" style="background:${c.bg};color:${c.tx}">${pista}</span>`;
}

function chipMonitor(monitor) {
  if (!monitor) return '';
  const c = chipColor(monitor, 'monitores');
  return `<span class="chip" style="background:${c.bg};color:${c.tx}">👤 ${monitor}</span>`;
}

// ── Formato de fecha ──────────────────────────

function formatFecha(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const dias = ['dom','lun','mar','mié','jue','vie','sáb'];
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
}

function formatAnio(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).getFullYear();
}

// ── Confirmación ──────────────────────────────

function confirmar(mensaje, onOk) {
  const overlay = document.getElementById('confirm-overlay');
  const texto   = document.getElementById('confirm-texto');
  const btnOk   = document.getElementById('confirm-ok');
  if (!overlay) return;
  texto.textContent = mensaje;
  overlay.classList.add('open');
  btnOk.onclick = () => { overlay.classList.remove('open'); onOk(); };
}

// ── UI namespace (para llamar desde HTML inline) ──
const UI = {
  openSheet,
  closeSheet,
  toggleCard,
  toast,
  confirmar,
  menuUsuario: (btnEl) => {
    // Cerrar si ya está abierto
    const existing = document.getElementById('menu-dropdown');
    if (existing) { existing.remove(); return; }

    // Crear dropdown compacto
    const dd = document.createElement('div');
    dd.id = 'menu-dropdown';

    // Posicionar bajo el botón ⋮
    const rect = btnEl ? btnEl.getBoundingClientRect() : { right: window.innerWidth - 8, top: 48 };
    const rightOffset = window.innerWidth - rect.right;

    dd.innerHTML = `
      <style>
        #menu-dropdown {
          position:fixed; top:${rect.bottom + 6}px; right:${rightOffset}px;
          background:#fff; border-radius:14px; padding:6px;
          box-shadow:0 8px 32px rgba(15,23,42,.18), 0 2px 8px rgba(15,23,42,.08);
          z-index:500; min-width:200px; border:1px solid #e2e8f0;
          animation: ddIn .15s ease;
        }
        @keyframes ddIn { from { opacity:0; transform:translateY(-6px) scale(.97); } to { opacity:1; transform:none; } }
        .dd-item { display:flex;align-items:center;gap:9px;padding:10px 10px;border-radius:9px;cursor:pointer;transition:background .1s; }
        .dd-item:hover { background:#f1f5f9; }
        .dd-ico { width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
        .dd-lbl { font-size:13px;font-weight:800;color:#1e293b; }
        .dd-sep { height:1px;background:#f1f5f9;margin:3px 0; }
        .dd-item.danger .dd-lbl { color:#e05a5a; }
        .dd-item.disabled { opacity:.45;pointer-events:none; }
      </style>
      <div class="dd-item" onclick="UI._abrirConfig()">
        <div class="dd-ico" style="background:#eff6ff">⚙️</div>
        <div class="dd-lbl">Configurar escuela</div>
      </div>
      <div class="dd-item" onclick="UI._abrirGenerarCobros()">
        <div class="dd-ico" style="background:#f0fdf4">⚡</div>
        <div class="dd-lbl">Generar cobros del mes</div>
      </div>
      <div class="dd-item dd-item disabled" onclick="">
        <div class="dd-ico" style="background:#f0fdf4">📖</div>
        <div class="dd-lbl" style="color:#94a3b8">Tutorial <span style="font-size:10px;font-weight:700;color:#94a3b8">(próximamente)</span></div>
      </div>
      <div class="dd-sep"></div>
      <div class="dd-item danger" onclick="UI._cerrarSesion()">
        <div class="dd-ico" style="background:#fee2e2">🚪</div>
        <div class="dd-lbl">Cerrar sesión</div>
      </div>`;

    document.body.appendChild(dd);

    // Cerrar al clicar fuera
    setTimeout(() => {
      document.addEventListener('click', function cerrar(e) {
        if (!dd.contains(e.target)) { dd.remove(); document.removeEventListener('click', cerrar); }
      });
    }, 50);
  },

  _abrirConfig: () => {
    const existing = document.getElementById('menu-dropdown');
    if (existing) existing.remove();
    // Crear sheet de configuración
    if (!document.getElementById('cfg-overlay')) {
      const el = document.createElement('div');
      el.id = 'cfg-overlay';
      el.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:400;display:flex;align-items:flex-end';
      el.innerHTML = `
        <style>
          #cfg-sheet { background:#fff;border-radius:20px 20px 0 0;padding:16px 15px 32px;width:100%;max-width:480px;margin:0 auto }
          #cfg-sheet .csh { display:flex;align-items:center;gap:9px;margin-bottom:14px }
          #cfg-sheet .cst { font-size:15px;font-weight:900;color:#1e293b;flex:1 }
          #cfg-sheet .csc { width:28px;height:28px;background:#f1f5f9;border:none;border-radius:7px;font-size:14px;font-weight:900;color:#64748b;cursor:pointer }
          #cfg-nombre-escuela { width:100%;background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:10px 12px;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;color:#1e3a8a;outline:none;box-sizing:border-box;margin-top:4px }
          #cfg-nombre-escuela:focus { border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1) }
          .btn-guardar-esc { width:100%;padding:11px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-family:Nunito,sans-serif;font-size:13px;font-weight:900;cursor:pointer;margin-top:10px;box-shadow:0 4px 12px rgba(37,99,235,.25) }
        </style>
        <div id="cfg-sheet">
          <div class="csh">
            <div class="cst">⚙️ Configurar escuela</div>
            <button class="csc" onclick="document.getElementById('cfg-overlay').remove();document.body.style.overflow=''">✕</button>
          </div>
          <div style="font-size:10px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">Nombre de la escuela</div>
          <input id="cfg-nombre-escuela" placeholder="Nombre de tu escuela">
          <button class="btn-guardar-esc" onclick="UI._guardarEscuela()">✓ Guardar nombre</button>
        </div>`;
      el.addEventListener('click', e => { if (e.target === el) { el.remove(); document.body.style.overflow=''; } });
      document.body.appendChild(el);
      document.body.style.overflow = 'hidden';
      // Cargar nombre actual
      (async () => {
        try {
          const { data } = await _sb.from('escuelas').select('nombre').eq('id', Store.escuelaId).single();
          if (data) document.getElementById('cfg-nombre-escuela').value = data.nombre || '';
        } catch(e) {}
      })();
    } else {
      document.getElementById('cfg-overlay').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  _guardarEscuela: async () => {
    const nombre = document.getElementById('cfg-nombre-escuela').value.trim();
    if (!nombre) { toast('Escribe el nombre de la escuela', 'warn'); return; }
    try {
      await _sb.from('escuelas').update({ nombre }).eq('id', Store.escuelaId);
      document.getElementById('menu-overlay').style.display = 'none';
      toast('Nombre guardado ✓', 'ok');
      // Actualizar subtítulo del header si existe
      const sub = document.querySelector('.hsub');
      if (sub) sub.textContent = nombre;
    } catch(e) { toast('Error al guardar', 'err'); }
  },

  _cerrarSesion: async () => {
    if (confirm('¿Cerrar sesión?')) logout();
  },

  _abrirGenerarCobros: () => {
    const existing = document.getElementById('menu-dropdown');
    if (existing) existing.remove();

    // Crear sheet global de generar cobros
    const prev = document.getElementById('gencobros-overlay');
    if (prev) { prev.style.display='flex'; _gcInicializar(); return; }

    const el = document.createElement('div');
    el.id = 'gencobros-overlay';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:600;display:flex;align-items:flex-end;justify-content:center';
    el.innerHTML = `
      <div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:16px 15px 32px;max-height:85vh;overflow-y:auto">
        <div style="width:36px;height:4px;background:#e2e8f0;border-radius:2px;margin:0 auto 14px"></div>
        <div style="font-size:17px;font-weight:900;color:#1e293b;margin-bottom:14px">⚡ Generar cobros del mes</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-size:10px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Mes</div>
            <select id="gc-mes" style="width:100%;background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:700;color:#1e3a8a;outline:none;font-family:Nunito,sans-serif;appearance:none">
              ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map(m=>`<option>${m}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Año</div>
            <select id="gc-anio" style="width:100%;background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:700;color:#1e3a8a;outline:none;font-family:Nunito,sans-serif;appearance:none"></select>
          </div>
        </div>
        <div id="gc-preview-btn">
          <button onclick="UI._gcCalcular()" style="width:100%;padding:12px;border-radius:12px;background:#2563eb;color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;font-family:Nunito,sans-serif">🔍 Calcular preview</button>
        </div>
        <div id="gc-resultado" style="display:none">
          <div id="gc-preview-box" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:10px;max-height:35vh;overflow-y:auto"></div>
          <div style="display:flex;gap:8px">
            <button onclick="document.getElementById('gencobros-overlay').style.display='none'" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Nunito,sans-serif;color:#475569">Cancelar</button>
            <button id="gc-btn-confirmar" onclick="UI._gcConfirmar()" style="flex:2;padding:12px;border-radius:12px;background:#16a34a;color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;font-family:Nunito,sans-serif">✓ Generar</button>
          </div>
        </div>
        <button onclick="document.getElementById('gencobros-overlay').style.display='none'" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;border:none;background:#f1f5f9;font-size:13px;font-weight:800;color:#475569;cursor:pointer;font-family:Nunito,sans-serif">Cerrar</button>
      </div>`;
    el.addEventListener('click', e => { if(e.target===el) el.style.display='none'; });
    document.body.appendChild(el);
    _gcInicializar();
  }
};

// ── Gestionar opciones de config (eliminar con ✕) ─────────────────────────
function abrirGestionOpciones(clave, titulo, listaActual, onGuardar) {
  // listaActual: array de strings
  // onGuardar(nuevaLista): callback cuando se confirma
  const existing = document.getElementById('gesopc-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'gesopc-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:600;display:flex;align-items:flex-end';

  function renderChips(lista) {
    return lista.map((v,i) => `
      <div style="display:inline-flex;align-items:center;gap:5px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:20px;padding:5px 10px;font-size:12px;font-weight:800;color:#1e3a8a;margin:3px">
        <span>${v}</span>
        <button onclick="gesopcEliminar(${i})" style="background:none;border:none;color:#e05a5a;font-size:14px;font-weight:900;cursor:pointer;padding:0;line-height:1">×</button>
      </div>`).join('');
  }

  let lista = [...listaActual];

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px 20px 0 0;padding:18px 16px 32px;width:100%;max-width:480px;margin:0 auto">
      <div style="display:flex;align-items:center;margin-bottom:14px">
        <div style="flex:1;font-size:15px;font-weight:900;color:#1e293b">Gestionar: ${titulo}</div>
        <button onclick="document.getElementById('gesopc-overlay').remove();document.body.style.overflow=''" style="background:#f1f5f9;border:none;border-radius:8px;width:28px;height:28px;font-size:14px;font-weight:900;color:#64748b;cursor:pointer">✕</button>
      </div>
      <div style="font-size:10px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Opciones actuales</div>
      <div id="gesopc-chips" style="margin-bottom:12px">${renderChips(lista)}</div>
      <div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:16px">Los registros que usen una opción eliminada conservarán su valor actual.</div>
      <button onclick="gesopcGuardar()" style="width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-family:Nunito,sans-serif;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,.25)">✓ Guardar cambios</button>
    </div>`;

  window._gesopcLista = lista;
  window._gesopcOnGuardar = onGuardar;
  window.gesopcEliminar = (i) => {
    window._gesopcLista.splice(i, 1);
    document.getElementById('gesopc-chips').innerHTML = renderChips(window._gesopcLista);
  };
  window.gesopcGuardar = () => {
    overlay.remove();
    document.body.style.overflow = '';
    onGuardar(window._gesopcLista);
  };

  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); document.body.style.overflow=''; } });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}


// ── Generar cobros del mes — lógica global ────
let _gcPreviewData = null;

function _gcInicializar() {
  const anio = new Date().getFullYear();
  const sel = document.getElementById('gc-anio');
  if (sel) {
    sel.innerHTML = [anio-1, anio, anio+1].map(a=>`<option value="${a}" ${a===anio?'selected':''}>${a}</option>`).join('');
  }
  const mes = document.getElementById('gc-mes');
  if (mes) mes.value = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][new Date().getMonth()];
  document.getElementById('gc-resultado').style.display = 'none';
  document.getElementById('gc-preview-btn').style.display = 'block';
  _gcPreviewData = null;
}

async function _gcCalcular() {
  const mes  = document.getElementById('gc-mes').value;
  const anio = +document.getElementById('gc-anio').value;
  document.getElementById('gc-preview-btn').innerHTML = '<div style="text-align:center;padding:10px"><div style="width:20px;height:20px;border:2px solid #2563eb;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;display:inline-block"></div></div>';

  try {
    const grupos = await getGruposConImporte();
    if (!grupos.length) {
      toast('Ningún grupo tiene importe mensual configurado', 'warn');
      document.getElementById('gc-preview-btn').innerHTML = '<button onclick="UI._gcCalcular()" style="width:100%;padding:12px;border-radius:12px;background:#2563eb;color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;font-family:Nunito,sans-serif">🔍 Calcular preview</button>';
      return;
    }
    const grupoIds = grupos.map(g => g.id);
    const { data: alumnos } = await _sb.from('alumnos').select('id,nombre,grupo_id').in('grupo_id', grupoIds).eq('escuela_id', Store.escuelaId);
    const yaExisten = await getCobrosExistentesSet(mes, anio);

    const aGenerar = [], omitidos = [];
    (alumnos||[]).forEach(a => {
      const g = grupos.find(x => x.id === a.grupo_id);
      if (!g) return;
      if (yaExisten.has(a.id)) omitidos.push({...a, grupo: g});
      else aGenerar.push({ alumno_id: a.id, nombre: a.nombre, grupo: g, importe: g.importe_mensual });
    });
    _gcPreviewData = { aGenerar, mes, anio };

    const totalImporte = aGenerar.reduce((s,r) => s + r.importe, 0);
    document.getElementById('gc-preview-box').innerHTML = `
      <div style="font-size:13px;font-weight:900;color:#1e293b;margin-bottom:8px">📋 ${mes} ${anio}</div>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:9px;padding:8px 11px;margin-bottom:8px;font-size:12px;font-weight:800;color:#15803d">
        ✓ <strong>${aGenerar.length} cobros</strong> · <strong>${totalImporte.toFixed(2)} €</strong> total
      </div>
      ${aGenerar.map(r=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:#1e293b">${r.nombre}</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:600">${r.grupo.nombre}</div>
          </div>
          <div style="font-size:13px;font-weight:900;color:#16a34a">${r.importe.toFixed(2)}€</div>
        </div>`).join('')}
      ${omitidos.length ? `<div style="margin-top:8px;font-size:10px;font-weight:700;color:#f59e0b">⏭ ${omitidos.length} ya cobrado${omitidos.length!==1?'s':''}: ${omitidos.map(a=>a.nombre).join(', ')}</div>` : ''}`;

    const btn = document.getElementById('gc-btn-confirmar');
    btn.disabled = !aGenerar.length;
    btn.textContent = aGenerar.length ? `✓ Generar ${aGenerar.length} cobros` : 'Sin cobros nuevos';
    document.getElementById('gc-resultado').style.display = 'block';
    document.getElementById('gc-preview-btn').style.display = 'none';
  } catch(e) {
    toast('Error al calcular', 'err'); console.error(e);
    document.getElementById('gc-preview-btn').innerHTML = '<button onclick="UI._gcCalcular()" style="width:100%;padding:12px;border-radius:12px;background:#2563eb;color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;font-family:Nunito,sans-serif">🔍 Calcular preview</button>';
  }
}

async function _gcConfirmar() {
  const { aGenerar, mes, anio } = _gcPreviewData || {};
  if (!aGenerar?.length) { toast('Nada que generar', 'warn'); return; }
  const btn = document.getElementById('gc-btn-confirmar');
  btn.disabled = true; btn.textContent = 'Generando…';
  try {
    const hoy = new Date().toISOString().slice(0,10);
    await saveCobrosLote(aGenerar.map(r => ({
      alumno_id: r.alumno_id, tipo: 'Mensual', importe: r.importe,
      fecha: hoy, mes, forma_pago: 'Efectivo',
    })));
    document.getElementById('gencobros-overlay').style.display = 'none';
    toast(`✓ ${aGenerar.length} cobros generados`, 'ok');
  } catch(e) {
    toast('Error al generar', 'err'); console.error(e);
    btn.disabled = false; btn.textContent = `✓ Generar ${aGenerar.length} cobros`;
  }
}

// ── Selector custom con ✕ integrado (csel) ─────
function cselRender(containerId, opciones, seleccionada, noBorrar, onChange, onDelete, onAdd, placeholder) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const inpId = containerId + '-inp';
  wrap.innerHTML = `
    <div class="csel-trigger" onclick="cselToggle('${containerId}')">
      <div class="csel-trigger-label" id="${containerId}-tlabel">—</div>
      <div class="csel-trigger-arrow" id="${containerId}-arrow">▼</div>
    </div>
    <div class="csel-dropdown" id="${containerId}-drop" style="display:none">
      <div id="${containerId}-lista"></div>
      ${onAdd ? `<div class="csel-add">
        <input class="csel-add-inp" id="${inpId}" placeholder="${placeholder || '+ Añadir…'}"
          onkeydown="if(event.key==='Enter'){event.preventDefault();cselAdd('${containerId}');}">
        <button class="csel-add-btn" onclick="cselAdd('${containerId}')">+</button>
      </div>` : ''}
    </div>`;
  wrap._cselState = { opciones: [...opciones], seleccionada, noBorrar, onChange, onDelete, onAdd, placeholder, open: false };
  cselRefresh(containerId);
}

function cselToggle(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  wrap._cselState.open = !wrap._cselState.open;
  document.getElementById(containerId + '-drop').style.display = wrap._cselState.open ? 'block' : 'none';
  document.getElementById(containerId + '-arrow').style.transform = wrap._cselState.open ? 'rotate(180deg)' : '';
}

function cselRefresh(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  const { opciones, seleccionada, noBorrar, onDelete } = wrap._cselState;
  const tlabel = document.getElementById(containerId + '-tlabel');
  if (tlabel) tlabel.textContent = seleccionada || '—';
  const lista = document.getElementById(containerId + '-lista');
  if (!lista) return;
  lista.innerHTML = opciones.map(op => {
    const sel = seleccionada === op;
    const puedeEliminar = onDelete && op !== noBorrar;
    return `<div class="csel-item${sel ? ' selected' : ''}" onclick="cselSelect('${containerId}','${op.replace(/'/g, "\\'")}')">
      <div class="csel-radio"></div>
      <div class="csel-label">${op}</div>
      ${puedeEliminar ? `<button class="csel-del" onclick="event.stopPropagation();cselDelete('${containerId}','${op.replace(/'/g, "\\'")}')">✕</button>` : ''}
    </div>`;
  }).join('');
}

function cselSelect(containerId, val) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  wrap._cselState.seleccionada = val;
  wrap._cselState.open = false;
  document.getElementById(containerId + '-drop').style.display = 'none';
  document.getElementById(containerId + '-arrow').style.transform = '';
  cselRefresh(containerId);
  if (wrap._cselState.onChange) wrap._cselState.onChange(val);
}

function cselDelete(containerId, val) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  const s = wrap._cselState;
  s.opciones = s.opciones.filter(o => o !== val);
  if (s.seleccionada === val) s.seleccionada = s.opciones[0] || '';
  cselRefresh(containerId);
  if (s.onDelete) s.onDelete(val, s.opciones, s.seleccionada);
}

function cselAdd(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  const inp = document.getElementById(containerId + '-inp');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) { inp.focus(); return; }
  const s = wrap._cselState;
  if (!s.opciones.includes(val)) s.opciones.push(val);
  s.seleccionada = val;
  inp.value = '';
  cselRefresh(containerId);
  if (s.onAdd) s.onAdd(val, s.opciones);
  inp.focus();
}

function cselGetValue(containerId) {
  return document.getElementById(containerId)?._cselState?.seleccionada ?? '';
}

function cselSetValue(containerId, val) {
  const wrap = document.getElementById(containerId);
  if (!wrap?._cselState) return;
  wrap._cselState.seleccionada = val;
  cselRefresh(containerId);
}
