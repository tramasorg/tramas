// Carga la lista de la Red de Acompañamiento desde data/colaboradores.json
(function(){
  "use strict";

  var el = document.getElementById('colaboradores-wrap');
  if (!el) return;

  var PENDIENTE = '<p class="vacio">Pronto publicaremos aquí a quienes colaboran con nosotros.</p>';

  fetch('data/colaboradores.json', {cache: 'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(lista){
      if (!Array.isArray(lista) || !lista.length){
        el.innerHTML = PENDIENTE;
        return;
      }
      el.innerHTML = lista.map(function(p){
        var rol = p.rol ? '<p class="card-body card-body--rol">' + escapeHtml(p.rol) + '</p>' : '';
        return '<div class="card"><p class="card-title">' + escapeHtml(p.nombre) + '</p>' + rol + '</div>';
      }).join('');
    })
    .catch(function(){
      el.innerHTML = PENDIENTE;
    });

  function escapeHtml(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
})();
