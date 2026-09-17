// Carga la lista de la Red de Acompañamiento desde data/colaboradores.json
(function(){
  var el = document.getElementById('colaboradores-wrap');
  if (!el) return;
  fetch('data/colaboradores.json', {cache: 'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(lista){
      if (!Array.isArray(lista) || !lista.length){
        el.innerHTML = '<p style="font-size:16px;font-style:italic;color:color-mix(in srgb, var(--color-text) 70%, transparent);grid-column:1/-1;margin:0;">Pronto publicaremos aquí a quienes colaboran con nosotros.</p>';
        return;
      }
      el.innerHTML = lista.map(function(p){
        var rol = p.rol ? '<p class="card-body" style="margin:4px 0 0;font-style:italic;">' + escapeHtml(p.rol) + '</p>' : '';
        return '<div class="card"><p class="card-title" style="margin:0;">' + escapeHtml(p.nombre) + '</p>' + rol + '</div>';
      }).join('');
    })
    .catch(function(){
      el.innerHTML = '<p style="font-size:16px;font-style:italic;color:color-mix(in srgb, var(--color-text) 70%, transparent);grid-column:1/-1;margin:0;">Pronto publicaremos aquí a quienes colaboran con nosotros.</p>';
    });

  function escapeHtml(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
})();
