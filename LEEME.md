# Trivia Ktronix · Hot Sale · Titán Plaza

Trivia para tablet (Android, vertical). Registro → 3 preguntas → crispeta.
Los datos llegan a Google Sheets (cuenta creativo@xmsdigital.com).

## Archivos
| Archivo | Para qué |
|---|---|
| `index.html` | La trivia (no hace falta editarlo) |
| `config.js` | **Lo único que se edita**: URL del script, clave, enlace de política, preguntas |
| `apps-script/Codigo.gs` | Código para pegar en Google Apps Script |
| `assets/` | Logos, ícono y fuentes |
| `manifest.json` | Permite "instalarla" en la tablet en pantalla completa |
| `sw.js` | Guarda la trivia en la tablet para que funcione **sin internet** |

## Paso 1 · Google Sheets + Apps Script (cuenta creativo@xmsdigital.com)
1. Crear un Google Sheets nuevo: **Trivia Ktronix Titán**.
2. Menú **Extensiones → Apps Script**. Borrar lo que haya y pegar `apps-script/Codigo.gs`.
3. Cambiar la línea `const TOKEN = '...'` por una clave propia (ej. `ktx-titan-8F3k2`).
4. Guardar (ícono de disquete). Arriba, elegir la función **configurar** y pulsar **Ejecutar**.
   Google pedirá permisos: *Revisar permisos → elegir la cuenta → Configuración avanzada → Ir a (proyecto) → Permitir*.
   En el Sheets aparecerá la hoja **Registros** con los títulos.
5. **Implementar → Nueva implementación → ⚙ Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - **Implementar** → copiar la **URL de la aplicación web** (termina en `/exec`).

> Si luego se cambia el código: Implementar → Gestionar implementaciones → ✏ → Versión: *Nueva versión* → Implementar (la URL no cambia).

## Paso 2 · Configurar la trivia
Abrir `config.js` y llenar:
- `SCRIPT_URL`: la URL `/exec` del paso 1.
- `TOKEN`: la **misma** clave del paso 1.3.
- `POLICY_URL`: enlace a la política de datos de Ktronix (cuando lo tengan).
- `ADMIN_PIN`: clave del panel de la promotora (por defecto 2026).

## Paso 3 · Publicar en GitHub Pages
1. En GitHub: **New repository** → nombre `trivia-ktronix-titan` → Public → Create.
2. **Add file → Upload files** → arrastrar TODO el contenido de esta carpeta (no la carpeta) → Commit.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. En 1–2 minutos queda en: `https://USUARIO.github.io/trivia-ktronix-titan/`

## Paso 4 · Preparar la tablet
1. Abrir la dirección en **Chrome** → menú ⋮ → **Agregar a pantalla principal / Instalar app**.
2. Abrirla desde el ícono (queda en pantalla completa).
3. Recomendado: **Fijar pantalla** (Ajustes → Seguridad → Fijar apps) para que nadie salga de la trivia.
4. Brillo alto, no apagar pantalla (Ajustes → Pantalla → Tiempo de espera: máximo), volumen medio.
5. Hacer 1 registro de prueba y verificar que llegue al Sheets. Borrar esa fila antes del evento.

## Panel de la promotora
Tocar **5 veces seguidas el logo de Ktronix** → clave → muestra participantes, envíos pendientes y estado de conexión. Botón "Enviar pendientes" si hubo caídas de internet.

**Ver / editar / borrar registros:** en el panel → "VER / EDITAR REGISTROS" → pedir la **clave de administración** (`ADMIN_KEY`, está solo en `Codigo.gs`, nunca en GitHub).
- Buscar por nombre, celular o correo; tocar un registro para corregir nombre, celular o correo, o borrarlo (pide confirmar dos veces).
- Con internet se ven todos los registros del Sheets (últimos 300). Sin internet, solo los pendientes de envío de esa tablet.
- Cada edición o borrado queda anotado en la hoja **Bitácora** (fecha, acción e ID, sin datos personales).
- Borrar un registro libera ese celular/correo para que la persona pueda volver a participar.
- 5 claves equivocadas bloquean la administración por 15 minutos.

## Modo sin internet
1. Con internet, abrir la trivia **una vez** y recargarla (queda guardada en la tablet).
2. Panel de la promotora → "Modo sin internet: Listo ✓".
3. Desde ahí funciona aunque se caiga el wifi, incluso si se cierra y se vuelve a abrir.
4. Los registros quedan en la tablet y suben solos al Sheets al volver la conexión (o con "Enviar pendientes").
5. **No borrar datos de Chrome ni usar modo incógnito** mientras haya envíos pendientes.
6. Sin internet, el bloqueo de repetidos usa solo los registros de esa tablet.
7. Si se cambia algún archivo después de publicar, subir la versión en `sw.js` (`ktx-trivia-v2`…).

## Cómo funciona por dentro
- Si se cae el internet, los registros se guardan en la tablet y se envían solos cuando vuelve (cada 15 s).
- No deja participar dos veces con el mismo celular o correo (revisa la tablet y el Sheets).
- Si nadie toca la pantalla 60 s, vuelve al inicio.
- El código de premio (TP-####) se guarda en el Sheets junto al registro.

## Avisos importantes
- **Fuente Eurostile**: es una fuente comercial. Si el repositorio es público, los archivos de `assets/fonts/` quedan descargables por cualquiera. Opciones: (a) confirmar que la licencia de Ktronix lo permite, (b) borrar esa carpeta — la trivia usa automáticamente *Saira Condensed* (gratuita y similar), o (c) usar repositorio privado con GitHub Pro.
- **Datos personales**: compartir el Sheets solo con Focal Brand y Ktronix. Al terminar, entregar la base y borrarla de la cuenta.
- La URL del script queda visible en el código; la clave `TOKEN` evita envíos casuales, no es seguridad fuerte. No guardar en el Sheets nada distinto a lo que pide la trivia.
