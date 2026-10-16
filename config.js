// =====================================================================
//  CONFIGURACIÓN DE LA TRIVIA · Ktronix Titán Plaza
//  Este es el ÚNICO archivo que hay que editar.
// =====================================================================
window.TRIVIA_CONFIG = {

  // 1) Dirección de la aplicación web de Google Apps Script (termina en /exec).
  //    Mientras esté vacía, la trivia funciona en "modo prueba": guarda todo
  //    en la tablet y lo envía cuando se configure la dirección.
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz8qRLFjSW_HnrORRrrITrWAQPZ2Am_s7-AZJX4WEcNiU8fM9R7S0MsKpq7Zyy_lych/exec",

  // 2) Clave compartida con el script de Google (debe ser IGUAL a TOKEN en Codigo.gs).
  TOKEN: "ktx-titan-8F3k2",

  // 3) Enlace a la política de tratamiento de datos de Ktronix.
  //    Si se deja vacío, "Ver política" muestra un resumen en pantalla.
  POLICY_URL: "",

  // 4) Nombre de esta tablet (sirve si se usa más de una).
  TABLET_ID: "Tablet-1",

  // 5) Segundos sin actividad para volver al inicio.
  INACTIVITY_SECONDS: 60,

  // 6) Segundos que se muestra la pantalla del premio antes de volver al inicio.
  PRIZE_SECONDS: 20,

  // 7) Sonidos (true = activados).
  SOUND: true,

  // 8) Clave para abrir el panel de la promotora (toque 5 veces el logo).
  ADMIN_PIN: "2026",

  // Versión del texto de autorización (queda guardada en cada registro).
  CONSENT_VERSION: "v1-2026-10",

  CONSENT_TEXT: "Autorizo a Ktronix, como responsable, y a Focal Brand S.A.S. y sus aliados tecnológicos, como encargados, a tratar mis datos personales (nombre, celular y correo) para registrar mi participación en esta actividad y enviarme información comercial de Ktronix, conforme a la Ley 1581 de 2012. Puedo conocer, actualizar, rectificar o suprimir mis datos y revocar esta autorización en los canales de atención de Ktronix.",

  QUESTIONS: [
    { q: "En Ktronix somos líderes en Colombia vendiendo…",
      options: ["Mercados", "Motos y patinetas", "Tecnología"], correct: 2 },
    { q: "Al comprar y pagar en Ktronix, puedes ganarte…",
      options: ["El IVA de tu compra", "El 50% de tu compra presionando el botón rojo", "Pague 1 lleve 2"], correct: 1 },
    { q: "Ktronix es una marca…",
      options: ["Colombiana con participación chilena", "100% colombiana", "Extranjera"], correct: 1 }
  ]
};
