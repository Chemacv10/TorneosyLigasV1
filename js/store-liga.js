// ─────────────────────────────────────────────────────────────
//  LIGAPÁDEL — Store (capa de datos)
//  Todas las operaciones con Supabase van aquí.
//  Prefijo lp_ en todas las tablas para no colisionar con Escuela de Pádel.
// ─────────────────────────────────────────────────────────────

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const LP = {
  orgId: null,
  usuario: null,
};

// ── Init ──────────────────────────────────────────────────────

async function lpInit() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }
  LP.usuario = user;

  // Buscar o crear organizador
  const { data: org } = await _sb
    .from('lp_organizadores')
    .select('id')
    .eq('usuario_id', user.id)
    .maybeSingle();

  if (org) {
    LP.orgId = org.id;
  } else {
    const { data: newOrg, error } = await _sb
      .from('lp_organizadores')
      .insert({ usuario_id: user.id, nombre: 'Mi Club' })
      .select('id')
      .single();
    if (error) { console.error('Error creando organizador:', error); return false; }
    LP.orgId = newOrg.id;
  }
  return true;
}

// ── Organizador ────────────────────────────────────────────────

async function lpGetOrganizador() {
  const { data, error } = await _sb
    .from('lp_organizadores')
    .select('*')
    .eq('id', LP.orgId)
    .single();
  if (error) throw error;
  return data;
}

async function lpSaveOrganizador(datos) {
  const { data, error } = await _sb
    .from('lp_organizadores')
    .update(datos)
    .eq('id', LP.orgId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Jugadores ──────────────────────────────────────────────────

async function lpGetJugadores(filtros = {}) {
  let q = _sb
    .from('lp_jugadores')
    .select('*')
    .eq('organizador_id', LP.orgId)
    .order('apellidos', { nullsFirst: false })
    .order('nombre');
  if (filtros.activo !== undefined) q = q.eq('activo', filtros.activo);
  if (filtros.nivel) q = q.eq('nivel', filtros.nivel);
  if (filtros.busqueda) q = q.or(`nombre.ilike.%${filtros.busqueda}%,apellidos.ilike.%${filtros.busqueda}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function lpSaveJugador(jugador) {
  if (jugador.id) {
    const { id, ...campos } = jugador;
    const { data, error } = await _sb
      .from('lp_jugadores')
      .update({ ...campos, organizador_id: LP.orgId })
      .eq('id', id)
      .eq('organizador_id', LP.orgId)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = jugador;
    const { data, error } = await _sb
      .from('lp_jugadores')
      .insert({ ...sinId, organizador_id: LP.orgId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpDeleteJugador(id) {
  const { error } = await _sb
    .from('lp_jugadores')
    .delete()
    .eq('id', id)
    .eq('organizador_id', LP.orgId);
  if (error) throw error;
}

// ── Ligas ──────────────────────────────────────────────────────

async function lpGetLigas(filtros = {}) {
  let q = _sb
    .from('lp_ligas')
    .select('*, lp_divisiones(count), lp_parejas(count)')
    .eq('organizador_id', LP.orgId)
    .order('created_at', { ascending: false });
  if (filtros.estado) q = q.eq('estado', filtros.estado);
  if (filtros.categoria) q = q.eq('categoria', filtros.categoria);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function lpGetLiga(id) {
  const { data, error } = await _sb
    .from('lp_ligas')
    .select('*')
    .eq('id', id)
    .eq('organizador_id', LP.orgId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Liga no encontrada o no tienes acceso (id: ${id})`);
  return data;
}

async function lpSaveLiga(liga) {
  const now = new Date().toISOString();
  if (liga.id) {
    const { id, ...campos } = liga;
    const { data, error } = await _sb
      .from('lp_ligas')
      .update({ ...campos, organizador_id: LP.orgId, updated_at: now })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = liga;
    const { data, error } = await _sb
      .from('lp_ligas')
      .insert({ ...sinId, organizador_id: LP.orgId, updated_at: now })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpDeleteLiga(id) {
  const { error } = await _sb
    .from('lp_ligas')
    .delete()
    .eq('id', id)
    .eq('organizador_id', LP.orgId);
  if (error) throw error;
}

// ── Divisiones ─────────────────────────────────────────────────

async function lpGetDivisiones(ligaId) {
  const { data, error } = await _sb
    .from('lp_divisiones')
    .select('*')
    .eq('liga_id', ligaId)
    .order('orden');
  if (error) throw error;
  return data || [];
}

async function lpSaveDivision(div) {
  if (div.id) {
    const { id, ...campos } = div;
    const { data, error } = await _sb
      .from('lp_divisiones')
      .update(campos)
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = div;
    const { data, error } = await _sb
      .from('lp_divisiones')
      .insert(sinId)
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpDeleteDivision(id) {
  const { error } = await _sb.from('lp_divisiones').delete().eq('id', id);
  if (error) throw error;
}

// ── Jornadas ───────────────────────────────────────────────────

async function lpGetJornadas(ligaId) {
  const { data, error } = await _sb
    .from('lp_jornadas')
    .select('*')
    .eq('liga_id', ligaId)
    .order('numero');
  if (error) throw error;
  return data || [];
}

async function lpSaveJornada(jornada) {
  if (jornada.id) {
    const { id, ...campos } = jornada;
    const { data, error } = await _sb
      .from('lp_jornadas')
      .update(campos)
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = jornada;
    const { data, error } = await _sb
      .from('lp_jornadas')
      .insert(sinId)
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpSaveJornadasLote(jornadas) {
  const { data, error } = await _sb
    .from('lp_jornadas')
    .insert(jornadas)
    .select();
  if (error) throw error;
  return data || [];
}

async function lpDeleteJornadasLiga(ligaId) {
  const { error } = await _sb.from('lp_jornadas').delete().eq('liga_id', ligaId);
  if (error) throw error;
}

// ── Parejas ────────────────────────────────────────────────────

async function lpGetParejas(ligaId, filtros = {}) {
  let q = _sb
    .from('lp_parejas')
    .select('*')
    .eq('liga_id', ligaId)
    .order('nombre1');
  if (filtros.division_id) q = q.eq('division_id', filtros.division_id);
  if (filtros.estado_inscripcion) q = q.eq('estado_inscripcion', filtros.estado_inscripcion);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function lpSavePareja(pareja) {
  if (pareja.id) {
    const { id, ...campos } = pareja;
    const { data, error } = await _sb
      .from('lp_parejas')
      .update(campos)
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = pareja;
    const { data, error } = await _sb
      .from('lp_parejas')
      .insert(sinId)
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpDeletePareja(id) {
  const { error } = await _sb.from('lp_parejas').delete().eq('id', id);
  if (error) throw error;
}

// ── Partidos ───────────────────────────────────────────────────

async function lpGetPartidos(ligaId, filtros = {}) {
  let q = _sb
    .from('lp_partidos')
    .select('*, lp_jornadas(numero,tipo,fecha_ini,fecha_fin), pareja_a:lp_parejas!lp_partidos_pareja_a_id_fkey(id,nombre1,nombre2), pareja_b:lp_parejas!lp_partidos_pareja_b_id_fkey(id,nombre1,nombre2)')
    .eq('liga_id', ligaId)
    .order('created_at');
  if (filtros.jornada_id) q = q.eq('jornada_id', filtros.jornada_id);
  if (filtros.division_id) q = q.eq('division_id', filtros.division_id);
  if (filtros.estado) q = q.eq('estado', filtros.estado);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function lpSavePartido(partido) {
  const now = new Date().toISOString();
  if (partido.id) {
    const { id, ...campos } = partido;
    const { data, error } = await _sb
      .from('lp_partidos')
      .update({ ...campos, updated_at: now })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = partido;
    const { data, error } = await _sb
      .from('lp_partidos')
      .insert({ ...sinId, updated_at: now })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpSavePartidosLote(partidos) {
  const { data, error } = await _sb
    .from('lp_partidos')
    .insert(partidos)
    .select();
  if (error) throw error;
  return data || [];
}

async function lpDeletePartidosLiga(ligaId) {
  const { error } = await _sb.from('lp_partidos').delete().eq('liga_id', ligaId);
  if (error) throw error;
}

// ── Normativa ──────────────────────────────────────────────────

async function lpGetNormativa(ligaId) {
  const { data, error } = await _sb
    .from('lp_normativa')
    .select('*')
    .eq('liga_id', ligaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function lpSaveNormativa(norm) {
  const { error } = await _sb
    .from('lp_normativa')
    .upsert({ ...norm, updated_at: new Date().toISOString() }, { onConflict: 'liga_id' });
  if (error) throw error;
}

// ── Reservas de pista ──────────────────────────────────────────

async function lpGetReservas(filtros = {}) {
  let q = _sb
    .from('lp_reservas')
    .select('*, lp_partidos(id, pareja_a:lp_parejas!lp_partidos_pareja_a_id_fkey(nombre1,nombre2), pareja_b:lp_parejas!lp_partidos_pareja_b_id_fkey(nombre1,nombre2))')
    .eq('organizador_id', LP.orgId)
    .order('fecha')
    .order('hora_inicio');
  if (filtros.fecha) q = q.eq('fecha', filtros.fecha);
  if (filtros.semana_ini) q = q.gte('fecha', filtros.semana_ini);
  if (filtros.semana_fin) q = q.lte('fecha', filtros.semana_fin);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function lpSaveReserva(reserva) {
  if (reserva.id) {
    const { id, ...campos } = reserva;
    const { data, error } = await _sb
      .from('lp_reservas')
      .update({ ...campos, organizador_id: LP.orgId })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = reserva;
    const { data, error } = await _sb
      .from('lp_reservas')
      .insert({ ...sinId, organizador_id: LP.orgId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function lpDeleteReserva(id) {
  const { error } = await _sb.from('lp_reservas').delete().eq('id', id).eq('organizador_id', LP.orgId);
  if (error) throw error;
}

// ── Publicaciones ──────────────────────────────────────────────

async function lpGetPublicaciones(ligaId) {
  const { data, error } = await _sb
    .from('lp_publicaciones')
    .select('*')
    .eq('liga_id', ligaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function lpSavePublicacion(pub) {
  const { id: _, ...sinId } = pub;
  const { data, error } = await _sb
    .from('lp_publicaciones')
    .insert(sinId)
    .select().single();
  if (error) throw error;
  return data;
}

// ── Algoritmos ─────────────────────────────────────────────────

/**
 * Genera emparejamientos round-robin para N parejas.
 * Devuelve array de jornadas, cada una con array de partidos [idxA, idxB].
 * Usa algoritmo de rotación circular (Berger tables).
 */
function lpGenerarRoundRobin(n) {
  const ids = Array.from({ length: n }, (_, i) => i);
  if (n % 2 !== 0) ids.push(-1); // -1 = bye
  const total = ids.length;
  const jornadas = [];

  for (let r = 0; r < total - 1; r++) {
    const partidos = [];
    for (let i = 0; i < total / 2; i++) {
      const a = ids[i];
      const b = ids[total - 1 - i];
      if (a !== -1 && b !== -1) partidos.push([a, b]);
    }
    jornadas.push(partidos);
    // Rotar: mantener ids[0] fijo, rotar el resto
    ids.splice(1, 0, ids.pop());
  }
  return jornadas;
}

/**
 * Genera emparejamientos americano para N jugadores.
 * Cada jornada tiene N/4 partidos de 4 jugadores (2 parejas).
 * Las parejas rotan para que todos jueguen con y contra todos.
 * Devuelve array de jornadas con partidos [jugA1, jugA2, jugB1, jugB2].
 */
function lpGenerarAmericano(n) {
  // n debe ser múltiplo de 4
  if (n % 4 !== 0) return [];
  const jornadas = [];
  const total_jornadas = n - 1;

  for (let r = 0; r < total_jornadas; r++) {
    const partidos = [];
    const pistas = n / 4;
    for (let p = 0; p < pistas; p++) {
      // Algoritmo de rotación para americano
      const base = r * pistas + p;
      const a1 = base % n;
      const a2 = (base + 1) % n;
      const b1 = (base + 2) % n;
      const b2 = (base + 3) % n;
      partidos.push([a1, a2, b1, b2]);
    }
    jornadas.push(partidos);
  }
  return jornadas;
}

/**
 * Calcula clasificación de una división round-robin.
 * @param {Array} parejas - array de objetos pareja con stats acumuladas
 * @returns {Array} parejas ordenadas por pts, sf-sc, nombre
 */
function lpClasificacionRoundRobin(parejas) {
  return [...parejas].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const difA = a.sf - a.sc;
    const difB = b.sf - b.sc;
    if (difB !== difA) return difB - difA;
    return a.nombre1.localeCompare(b.nombre1, 'es');
  });
}

/**
 * Calcula clasificación americano individual.
 * @param {Array} stats - array lp_stats_americano con datos del jugador
 * @returns {Array} ordenado por victorias, sf-sc, jf-jc
 */
function lpClasificacionAmericano(stats) {
  return [...stats].sort((a, b) => {
    if (b.victorias !== a.victorias) return b.victorias - a.victorias;
    const difSA = a.sf - a.sc;
    const difSB = b.sf - b.sc;
    if (difSB !== difSA) return difSB - difSA;
    const difJA = a.jf - a.jc;
    const difJB = b.jf - b.jc;
    if (difJB !== difJA) return difJB - difJA;
    return 0;
  });
}

/**
 * Recalcula stats de todas las parejas de una división round-robin
 * a partir de los partidos jugados.
 * Devuelve Map<pareja_id, {pj,pg,pp,sf,sc,pts}>
 */
function lpRecalcularStatsRR(partidos, liga) {
  const stats = {};
  const init = () => ({ pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, pts: 0 });

  for (const p of partidos) {
    if (p.estado !== 'jugado' && p.estado !== 'wo_a' && p.estado !== 'wo_b') continue;
    const idA = p.pareja_a_id;
    const idB = p.pareja_b_id;
    if (!stats[idA]) stats[idA] = init();
    if (!stats[idB]) stats[idB] = init();

    if (p.estado === 'wo_a') {
      // WO: ausente = pareja A
      stats[idA].pj++; stats[idA].pp++;
      stats[idA].pts += liga.pts_incomp_ausente ?? 0;
      stats[idB].pj++; stats[idB].pg++;
      stats[idB].pts += liga.pts_incomp_presente ?? 2;
      continue;
    }
    if (p.estado === 'wo_b') {
      stats[idB].pj++; stats[idB].pp++;
      stats[idB].pts += liga.pts_incomp_ausente ?? 0;
      stats[idA].pj++; stats[idA].pg++;
      stats[idA].pts += liga.pts_incomp_presente ?? 2;
      continue;
    }

    // Partido normal: contar sets
    let sA = 0, sB = 0;
    const sets = [[p.s1a, p.s1b], [p.s2a, p.s2b], [p.s3a, p.s3b]];
    for (const [a, b] of sets) {
      if (a == null || b == null) continue;
      if (a > b) sA++; else if (b > a) sB++;
    }

    stats[idA].pj++;
    stats[idA].sf += sA;
    stats[idA].sc += sB;
    stats[idB].pj++;
    stats[idB].sf += sB;
    stats[idB].sc += sA;

    if (sA > sB) {
      stats[idA].pg++;
      stats[idA].pts += liga.pts_victoria ?? 2;
      stats[idB].pp++;
      stats[idB].pts += liga.pts_derrota ?? 1;
    } else if (sB > sA) {
      stats[idB].pg++;
      stats[idB].pts += liga.pts_victoria ?? 2;
      stats[idA].pp++;
      stats[idA].pts += liga.pts_derrota ?? 1;
    }
  }
  return stats;
}

/**
 * Actualiza stats de parejas en Supabase tras anotar un resultado.
 * Recalcula TODO desde cero para evitar inconsistencias.
 */
async function lpActualizarClasificacion(ligaId, divisionId) {
  const [partidos, parejas, liga] = await Promise.all([
    lpGetPartidos(ligaId, { division_id: divisionId }),
    lpGetParejas(ligaId, { division_id: divisionId }),
    lpGetLiga(ligaId),
  ]);

  const statsMap = lpRecalcularStatsRR(partidos, liga);

  // Actualizar cada pareja en paralelo
  await Promise.all(parejas.map(p => {
    const s = statsMap[p.id] || { pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, pts: 0 };
    return _sb
      .from('lp_parejas')
      .update({ pj: s.pj, pg: s.pg, pp: s.pp, sf: s.sf, sc: s.sc, pts: s.pts })
      .eq('id', p.id);
  }));
}

// ── Helpers de fecha ───────────────────────────────────────────

/**
 * Devuelve un array de semanas entre dos fechas.
 * Cada semana: { ini: Date, fin: Date, label: string, semanaNum: int }
 */
function lpGetSemanas(fechaIni, fechaFin) {
  const semanas = [];
  let cur = new Date(fechaIni);
  // Ajustar al lunes de la semana
  const dia = cur.getDay();
  cur.setDate(cur.getDate() - (dia === 0 ? 6 : dia - 1));

  let num = 1;
  while (cur <= new Date(fechaFin)) {
    const ini = new Date(cur);
    const fin = new Date(cur);
    fin.setDate(fin.getDate() + 6);
    semanas.push({
      ini,
      fin,
      label: `${lpFechaCorta(ini)} – ${lpFechaCorta(fin)}`,
      semanaNum: num++,
    });
    cur.setDate(cur.getDate() + 7);
  }
  return semanas;
}

function lpFechaCorta(d) {
  if (!d) return '';
  const f = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return f.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function lpFechaLarga(d) {
  if (!d) return '';
  const f = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return f.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' });
}

function lpDateToISO(d) {
  if (!d) return null;
  const f = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return f.toISOString().slice(0, 10);
}
