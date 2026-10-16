/**
 * TRIVIA KTRONIX · TITÁN PLAZA — receptor de datos para Google Sheets
 * Cuenta: creativo@xmsdigital.com
 *
 * 1) Pegar este código en Extensiones → Apps Script del Google Sheets.
 * 2) Cambiar TOKEN por una clave propia (la misma en config.js).
 * 3) Ejecutar una vez la función "configurar" (crea la hoja y los títulos).
 * 4) Implementar → Nueva implementación → Aplicación web
 *    · Ejecutar como: Yo   · Quién tiene acceso: Cualquier persona
 * 5) Copiar la URL que termina en /exec y pegarla en config.js (SCRIPT_URL).
 * Si se actualiza este código: Implementar → Gestionar implementaciones → ✏ →
 *    Versión: "Nueva versión" → Implementar (la URL /exec no cambia).
 */

const TOKEN = 'ktx-titan-8F3k2';   // ← igual a config.js
// Clave de administración para VER, EDITAR y BORRAR registros desde la tablet.
// NO va en config.js ni en GitHub: solo aquí. Mínimo 10 caracteres.
const ADMIN_KEY = 'CAMBIAR-esta-clave-admin';
const HOJA  = 'Registros';
const ZONA  = 'America/Bogota';

const COLUMNAS = [
  'ID', 'Fecha registro', 'Nombre', 'Celular', 'Correo', 'Mayor de edad',
  'Autoriza datos', 'Fecha autorización', 'Versión texto autorización',
  'Respuesta 1', 'Respuesta 2', 'Respuesta 3', 'Puntaje', 'Código premio',
  'Estado', 'Fecha fin', 'Tablet'
];

function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight('bold').setBackground('#014691').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.getRange('D:D').setNumberFormat('@');          // celular como texto
  sh.autoResizeColumns(1, COLUMNAS.length);
}

function hoja_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!sh) throw new Error('Ejecuta primero la función configurar');
  return sh;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fecha_(iso) {
  const d = iso ? new Date(iso) : new Date();
  return Utilities.formatDate(isNaN(d) ? new Date() : d, ZONA, 'yyyy-MM-dd HH:mm:ss');
}
function limpia_(s, max) { return String(s || '').replace(/^[=+\-@]/, "'").slice(0, max || 120); }

function existe_(sh, cel, mail) {
  const n = sh.getLastRow(); if (n < 2) return false;
  const datos = sh.getRange(2, 4, n - 1, 2).getValues();   // columnas D (celular) y E (correo)
  cel = String(cel || '').trim(); mail = String(mail || '').trim().toLowerCase();
  return datos.some(r => (cel && String(r[0]).trim() === cel) || (mail && String(r[1]).trim().toLowerCase() === mail));
}

/* GET: ?action=ping  |  ?action=check&cel=...&mail=... */
function doGet(e) {
  const p = e.parameter || {};
  if (p.token !== TOKEN) return json_({ ok: false, error: 'token' });
  if (p.action === 'ping') return json_({ ok: true });
  if (p.action === 'check') return json_({ ok: true, dup: existe_(hoja_(), p.cel, p.mail) });
  return json_({ ok: false, error: 'accion' });
}

/* POST: { action:'register' | 'update', ... } */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'json' }); }
  if (d.token !== TOKEN) return json_({ ok: false, error: 'token' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = hoja_();
    if (String(d.action).indexOf('admin') === 0) return admin_(sh, d);
    if (d.action === 'register') {
      // si el ID ya existe (reenvío), no duplicar
      const ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat() : [];
      if (ids.indexOf(d.id) !== -1) return json_({ ok: true, repeated: true });
      const dup = existe_(sh, d.cel, d.mail);
      sh.appendRow([
        limpia_(d.id, 40), fecha_(d.at), limpia_(d.name, 60), "'" + limpia_(d.cel, 15), limpia_(d.mail, 80),
        limpia_(d.adult, 5), limpia_(d.consent, 5), fecha_(d.consentAt), limpia_(d.consentVersion, 20),
        '', '', '', '', '', dup ? 'Registrado (posible duplicado)' : 'Registrado', '', limpia_(d.tablet, 30)
      ]);
      return json_({ ok: true, dup: dup });
    }
    if (d.action === 'update') {
      const n = sh.getLastRow(); if (n < 2) return json_({ ok: true, missing: true });
      const ids = sh.getRange(2, 1, n - 1, 1).getValues().flat();
      const i = ids.lastIndexOf(d.id);
      if (i === -1) return json_({ ok: true, missing: true });   // registro borrado desde el panel
      const fila = i + 2, a = d.answers || [];
      sh.getRange(fila, 10, 1, 7).setValues([[
        limpia_(a[0]), limpia_(a[1]), limpia_(a[2]), (d.score || 0) + ' / ' + (d.total || 3),
        limpia_(d.code, 12), limpia_(d.status, 30), fecha_(d.at)
      ]]);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'accion' });
  } finally {
    lock.releaseLock();
  }
}


/* ===================== ADMINISTRACIÓN (panel de la promotora) ===================== */
function adminOk_(key) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('adminFails') || 0);
  if (fails >= 5) return 'bloqueado';                  // 5 intentos fallidos → bloqueo 15 min
  if (ADMIN_KEY.length >= 10 && ADMIN_KEY.indexOf('CAMBIAR') !== 0 && key === ADMIN_KEY) return 'ok';
  cache.put('adminFails', String(fails + 1), 900);
  return 'clave';
}
function bitacora_(accion, id, detalle) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const b = ss.getSheetByName('Bitácora') || ss.insertSheet('Bitácora');
  if (b.getLastRow() === 0) b.appendRow(['Fecha', 'Acción', 'ID', 'Detalle']);
  b.appendRow([fecha_(), accion, id, detalle || '']);          // sin datos personales
}
function fila_(sh, id) {
  const n = sh.getLastRow(); if (n < 2) return -1;
  const i = sh.getRange(2, 1, n - 1, 1).getValues().flat().lastIndexOf(id);
  return i === -1 ? -1 : i + 2;
}
function admin_(sh, d) {
  const v = adminOk_(String(d.key || ''));
  if (v !== 'ok') return json_({ ok: false, error: v });

  if (d.action === 'adminList') {
    const n = sh.getLastRow(); if (n < 2) return json_({ ok: true, rows: [] });
    const vals = sh.getRange(2, 1, n - 1, 17).getDisplayValues();
    const rows = vals.map(r => ({ id: r[0], at: r[1], name: r[2], cel: String(r[3]).replace(/^'/, ''), mail: r[4],
      score: r[12], code: r[13], status: r[14] })).reverse().slice(0, 300);
    return json_({ ok: true, rows: rows });
  }
  if (d.action === 'adminEdit') {
    const f = fila_(sh, d.id); if (f === -1) return json_({ ok: false, error: 'no existe' });
    const cel = String(d.cel || '').trim(), mail = String(d.mail || '').trim().toLowerCase();
    if (!/^3\d{9}$/.test(cel)) return json_({ ok: false, error: 'celular' });
    // que el nuevo celular/correo no sea de OTRO registro
    const n = sh.getLastRow(), datos = sh.getRange(2, 1, n - 1, 5).getValues();
    const choque = datos.some((r, i) => i + 2 !== f && (String(r[3]).trim() === cel || String(r[4]).trim().toLowerCase() === mail));
    if (choque) return json_({ ok: false, error: 'duplicado' });
    sh.getRange(f, 3, 1, 3).setValues([[limpia_(d.name, 60), "'" + cel, limpia_(mail, 80)]]);
    bitacora_('Editado', d.id, 'nombre/celular/correo');
    return json_({ ok: true });
  }
  if (d.action === 'adminDelete') {
    const f = fila_(sh, d.id); if (f === -1) return json_({ ok: true, missing: true });
    sh.deleteRow(f);
    bitacora_('Borrado', d.id, d.reason || '');
    return json_({ ok: true });
  }
  return json_({ ok: false, error: 'accion' });
}
