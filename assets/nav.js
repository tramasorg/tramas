// Menú desplegable desde el logotipo.
//
// El menú no ocupa la primera pantalla: en la portada la protagonista es la
// figura del icosaedro. El logotipo hace de disparador.
//
// Mejora progresiva: este script marca la navegación con .site-nav--js y solo
// entonces el CSS colapsa la lista. Si el script no corre, los enlaces quedan
// visibles y el sitio sigue siendo navegable.
(function(){
  "use strict";

  var nav = document.querySelector(".site-nav");
  if (!nav) return;

  var lista = nav.querySelector(".site-nav__links");
  var boton = nav.querySelector(".site-nav__brand");
  if (!lista || !boton) return;

  if (!lista.id) lista.id = "menu-principal";
  boton.setAttribute("aria-controls", lista.id);
  boton.setAttribute("aria-expanded", "false");

  nav.classList.add("site-nav--js");

  function abrir(si){
    nav.classList.toggle("site-nav--abierto", si);
    boton.setAttribute("aria-expanded", si ? "true" : "false");
  }

  boton.addEventListener("click", function(){
    abrir(!nav.classList.contains("site-nav--abierto"));
  });

  // Se cierra al tocar fuera del menú.
  document.addEventListener("click", function(e){
    if (!nav.contains(e.target)) abrir(false);
  });

  // Nota: Esc no cierra el menú a propósito. Esa tecla está reservada para la
  // salida rápida (tres pulsaciones); ver assets/salida-segura.js.
})();
