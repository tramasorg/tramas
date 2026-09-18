// Menú de navegación en pantallas angostas.
//
// El menú se despliega con un botón. Sin JavaScript, la lista queda visible
// en escritorio y oculta en móvil; por eso el botón se crea desde aquí y no
// en el HTML: si este script no corre, no aparece un botón que no funciona.
(function(){
  "use strict";

  var nav = document.querySelector(".site-nav");
  if (!nav) return;

  var lista = nav.querySelector(".site-nav__links");
  if (!lista) return;

  if (!lista.id) lista.id = "menu-principal";

  var boton = document.createElement("button");
  boton.type = "button";
  boton.className = "site-nav__toggle";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", lista.id);
  boton.innerHTML = '<span class="site-nav__burger" aria-hidden="true"></span>Menú';
  nav.insertBefore(boton, lista);
  nav.classList.add("site-nav--js");

  function abrir(si){
    nav.classList.toggle("site-nav--abierto", si);
    boton.setAttribute("aria-expanded", si ? "true" : "false");
  }

  boton.addEventListener("click", function(){
    abrir(!nav.classList.contains("site-nav--abierto"));
  });

  // Cerrar al navegar con teclado fuera del menú o al tocar fuera de él.
  document.addEventListener("click", function(e){
    if (!nav.contains(e.target)) abrir(false);
  });

  // Nota: Esc no cierra el menú a propósito. Esa tecla está reservada para
  // la salida rápida (tres pulsaciones); ver assets/salida-segura.js.
})();
