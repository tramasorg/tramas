// Salida rápida.
//
// El botón "Salir" es una función de seguridad: sirve para abandonar el sitio
// de inmediato si alguien más se acerca. Un enlace normal no basta, porque la
// página de Tramas se queda en el historial y el botón "atrás" del navegador
// regresa a ella. Aquí usamos location.replace(), que descarta la entrada
// actual del historial.
//
// Límite importante: replace() solo descarta la página actual. Si la persona
// ya recorrió varias páginas del sitio, esas entradas anteriores siguen en el
// historial, y ningún JavaScript puede borrarlas. Por eso el pie enlaza a
// navegacion-segura.html, que explica cómo borrarlo a mano.
(function(){
  "use strict";

  var DESTINO = "https://www.google.com/";
  var VENTANA_MS = 1500;   // margen para las tres pulsaciones de Esc
  var PULSACIONES = 3;

  function salir(){
    try {
      window.location.replace(DESTINO);
    } catch (e) {
      window.location.href = DESTINO;
    }
  }

  var boton = document.querySelector("[data-salida]");
  if (boton){
    boton.addEventListener("click", function(e){
      e.preventDefault();
      salir();
    });
  }

  // Esc tres veces seguidas, para quien no alcance a apuntar al botón.
  var golpes = [];
  document.addEventListener("keydown", function(e){
    if (e.key !== "Escape") return;
    var ahora = Date.now();
    golpes = golpes.filter(function(t){ return ahora - t < VENTANA_MS; });
    golpes.push(ahora);
    if (golpes.length >= PULSACIONES) salir();
  });
})();
