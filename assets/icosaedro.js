// Icosaedro navegable de Tramas.
//
// El logotipo de Tramas es un icosaedro dibujado como sólido, visto por un eje
// de simetría de orden 3: por eso su silueta es un hexágono con un triángulo
// dentro. Los tramos de color del logo no son adorno: forman un circuito
// cerrado de seis vértices que alterna el triángulo cercano y el hexágono.
// Esos seis vértices son los seis enlaces del sitio.
//
// Sin WebGL ni librerías: 12 vértices, 30 aristas y 20 caras proyectadas a SVG.
// Las caras sirven para eliminar líneas ocultas, que es lo que le da al objeto
// su aspecto de sólido — el mismo del logo cuando está en reposo.
(function () {
  "use strict";

  var raiz = document.querySelector("[data-icosaedro]");
  if (!raiz) return;

  var svg = raiz.querySelector(".ico__svg");
  var capa = raiz.querySelector(".ico__enlaces");
  if (!svg || !capa) return;

  var NS = "http://www.w3.org/2000/svg";
  var TINTA = "#16253E";
  var COLORES = { rojo: "#C62118", olivo: "#627D2A", amarillo: "#D9D20E" };

  // ---- Geometría del icosaedro ------------------------------------------
  var F = (1 + Math.sqrt(5)) / 2;
  var V = [
    [0, 1, F], [0, 1, -F], [0, -1, F], [0, -1, -F],
    [1, F, 0], [1, -F, 0], [-1, F, 0], [-1, -F, 0],
    [F, 0, 1], [F, 0, -1], [-F, 0, 1], [-F, 0, -1]
  ].map(function (p) {
    var n = Math.hypot(p[0], p[1], p[2]);
    return [p[0] / n, p[1] / n, p[2] / n];
  });

  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

  var lado = Infinity;
  for (var i = 0; i < 12; i++) for (var j = i + 1; j < 12; j++) lado = Math.min(lado, dist(V[i], V[j]));

  var aristas = [], vecinos = V.map(function () { return []; });
  for (i = 0; i < 12; i++) for (j = i + 1; j < 12; j++) {
    if (Math.abs(dist(V[i], V[j]) - lado) < 1e-6) {
      aristas.push([i, j]); vecinos[i].push(j); vecinos[j].push(i);
    }
  }

  var caras = [];
  for (i = 0; i < 12; i++) for (j = i + 1; j < 12; j++) {
    if (vecinos[i].indexOf(j) < 0) continue;
    for (var k = j + 1; k < 12; k++) {
      if (vecinos[i].indexOf(k) >= 0 && vecinos[j].indexOf(k) >= 0) caras.push([i, j, k]);
    }
  }

  // Cada arista guarda las dos caras que la comparten: una arista se ve si al
  // menos una de ellas mira a la cámara.
  var carasDeArista = aristas.map(function (a) {
    var r = [];
    caras.forEach(function (c, ci) {
      if (c.indexOf(a[0]) >= 0 && c.indexOf(a[1]) >= 0) r.push(ci);
    });
    return r;
  });

  // ---- Orientación de reposo: la del logotipo ---------------------------
  // Se gira el sólido para que una cara quede de frente (eje de orden 3) y
  // para que uno de sus vértices apunte hacia arriba, como en la marca.
  function centroide(c) {
    var x = 0, y = 0, z = 0;
    c.forEach(function (v) { x += V[v][0]; y += V[v][1]; z += V[v][2]; });
    var n = Math.hypot(x, y, z);
    return [x / n, y / n, z / n];
  }

  function matrizQueAlinea(a, b) { // rotación que lleva el vector a sobre b
    var v = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    var c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    if (c < -0.999999) return [[-1, 0, 0], [0, -1, 0], [0, 0, 1]];
    var k = 1 / (1 + c);
    return [
      [v[0] * v[0] * k + c, v[0] * v[1] * k - v[2], v[0] * v[2] * k + v[1]],
      [v[1] * v[0] * k + v[2], v[1] * v[1] * k + c, v[1] * v[2] * k - v[0]],
      [v[2] * v[0] * k - v[1], v[2] * v[1] * k + v[0], v[2] * v[2] * k + c]
    ];
  }

  function porMatriz(m, p) {
    return [
      m[0][0] * p[0] + m[0][1] * p[1] + m[0][2] * p[2],
      m[1][0] * p[0] + m[1][1] * p[1] + m[1][2] * p[2],
      m[2][0] * p[0] + m[2][1] * p[1] + m[2][2] * p[2]
    ];
  }

  function multiplica(a, b) {
    var r = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i2 = 0; i2 < 3; i2++) for (var j2 = 0; j2 < 3; j2++)
      for (var k2 = 0; k2 < 3; k2++) r[i2][j2] += a[i2][k2] * b[k2][j2];
    return r;
  }

  var caraFrontal = caras[0];
  var R0 = matrizQueAlinea(centroide(caraFrontal), [0, 0, 1]);
  // Giro sobre Z para que un vértice de la cara frontal quede arriba.
  var pf = porMatriz(R0, V[caraFrontal[0]]);
  var ang = Math.PI / 2 - Math.atan2(pf[1], pf[0]);
  var Rz = [[Math.cos(ang), -Math.sin(ang), 0], [Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]];
  var REPOSO = multiplica(Rz, R0);
  V = V.map(function (p) { return porMatriz(REPOSO, p); });

  // ---- Los seis nodos con enlace ----------------------------------------
  // Cercanos = la cara que mira al frente. Medios = los que forman el hexágono.
  var cercanos = caraFrontal.slice().sort(function (a, b) {
    return Math.atan2(V[b][1], V[b][0]) - Math.atan2(V[a][1], V[a][0]);
  });
  // El de arriba primero, luego en sentido horario.
  cercanos.sort(function (a, b) { return V[b][1] - V[a][1]; });
  var arriba = cercanos[0];
  var otros = cercanos.slice(1).sort(function (a, b) { return V[a][0] - V[b][0]; });
  var cercanoIzq = otros[0], cercanoDer = otros[1];

  function medioEntre(a, b) { // vértice del hexágono vecino de ambos
    for (var n = 0; n < vecinos[a].length; n++) {
      var v = vecinos[a][n];
      if (caraFrontal.indexOf(v) >= 0) continue;
      if (vecinos[b].indexOf(v) >= 0) return v;
    }
    return -1;
  }

  var DESTINOS = raiz.dataset.destinos ? JSON.parse(raiz.dataset.destinos) : [];
  function destino(n) { return DESTINOS[n] || null; }   // null = vértice sin enlace

  // Orden del circuito, tal como se lee en el logotipo.
  var circuito = [
    { v: arriba, color: COLORES.olivo, d: destino(0) },
    { v: medioEntre(arriba, cercanoDer), color: null, d: destino(1) },
    { v: cercanoDer, color: COLORES.amarillo, d: destino(2) },
    { v: medioEntre(cercanoDer, cercanoIzq), color: null, d: destino(3) },
    { v: cercanoIzq, color: COLORES.rojo, d: destino(4) },
    { v: medioEntre(cercanoIzq, arriba), color: null, d: destino(5) }
  ];

  var colorDeNodo = {};
  circuito.forEach(function (n) { if (n.color) colorDeNodo[n.v] = n.color; });

  // Una arista del circuito toma el color de su extremo coloreado.
  var colorDeArista = {};
  for (i = 0; i < circuito.length; i++) {
    var a1 = circuito[i].v, a2 = circuito[(i + 1) % circuito.length].v;
    var col = colorDeNodo[a1] || colorDeNodo[a2];
    colorDeArista[a1 < a2 ? a1 + "-" + a2 : a2 + "-" + a1] = col;
  }

  // ---- Elementos SVG y enlaces HTML -------------------------------------
  var esDeColor = [], estadoArista = [], estadoVertice = [];
  var lineas = aristas.map(function (a, idx) {
    var el = document.createElementNS(NS, "line");
    var clave = a[0] < a[1] ? a[0] + "-" + a[1] : a[1] + "-" + a[0];
    var c = colorDeArista[clave];
    esDeColor[idx] = !!c;
    el.setAttribute("stroke", c || TINTA);
    el.setAttribute("stroke-linecap", "round");
    svg.appendChild(el);
    return el;
  });

  var puntos = V.map(function (_, idx) {
    var el = document.createElementNS(NS, "circle");
    el.setAttribute("fill", TINTA);
    svg.appendChild(el);
    return el;
  });

  function angosto() { return window.innerWidth <= 640; }

  var conEnlace = circuito.filter(function (n) { return n.d; });

  var anclas = conEnlace.map(function (n) {
    var a = document.createElement("a");
    a.className = "ico__nodo";
    a.href = n.d.url;
    a.innerHTML = '<span class="ico__punto" style="background:' + (n.color || TINTA) + '"></span>' +
                  '<span class="ico__texto"></span>';
    a.style.setProperty("--color", n.color || TINTA);
    capa.appendChild(a);
    return a;
  });

  // En un teléfono no cabe "Red de acompañamiento" alrededor de la figura.
  function ponTextos() {
    var corto = angosto();
    conEnlace.forEach(function (n, idx) {
      anclas[idx].querySelector(".ico__texto").textContent =
        corto && n.d.corto ? n.d.corto : n.d.texto;
    });
  }
  ponTextos();
  window.addEventListener("resize", ponTextos);

  // ---- Estado y animación ------------------------------------------------
  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rot = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  var velX = 0, velY = 0, arrastrando = false, ultimoX = 0, ultimoY = 0;
  var entrada = menosMovimiento ? 1 : 0;
  var t0 = null;

  function giroX(t) { var c = Math.cos(t), s = Math.sin(t); return [[1, 0, 0], [0, c, -s], [0, s, c]]; }
  function giroY(t) { var c = Math.cos(t), s = Math.sin(t); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; }

  function dibuja(ts) {
    if (t0 === null) t0 = ts;
    if (entrada < 1) entrada = Math.min(1, (ts - t0) / 1150);
    var e = 1 - Math.pow(1 - entrada, 3);            // suavizado de salida

    if (!arrastrando && (Math.abs(velX) > 0.00002 || Math.abs(velY) > 0.00002)) {
      rot = multiplica(multiplica(giroX(velY), giroY(velX)), rot);
      velX *= 0.95; velY *= 0.95;
    }

    // En reposo el objeto respira: una oscilación pequeña que NO se acumula,
    // de modo que siempre vuelve a quedar de frente al usuario.
    var vaiven = menosMovimiento ? [0, 0]
      : [Math.sin(ts / 3400) * 0.10, Math.sin(ts / 4700) * 0.05];

    var caja = raiz.getBoundingClientRect();
    var ancho = caja.width, alto = caja.height;
    var cx = ancho / 2, cy = alto / 2;
    // El radio reserva sitio para el anillo de etiquetas, que sobresale del
    // sólido: si no, las de arriba y abajo se salen del contenedor.
    var radio = Math.min(ancho * (angosto() ? 0.33 : 0.40), alto * 0.40, (alto / 2 - 42) / 1.32);
    var camara = 3.4;

    svg.setAttribute("viewBox", "0 0 " + ancho + " " + alto);

    // Durante la entrada el objeto sube desde abajo y gira un poco.
    var sube = (1 - e) * alto * 0.32;
    var rotEntrada = multiplica(multiplica(giroX((1 - e) * 0.55 + vaiven[1]), giroY(vaiven[0])), rot);

    var P = V.map(function (p) {
      var q = porMatriz(rotEntrada, p);
      var f = camara / (camara - q[2]);
      return { x: cx + q[0] * radio * f, y: cy - q[1] * radio * f + sube, z: q[2], f: f };
    });

    var caraVisible = caras.map(function (c) {
      var n = [0, 0, 0];
      c.forEach(function (v) { var q = porMatriz(rotEntrada, V[v]); n[0] += q[0]; n[1] += q[1]; n[2] += q[2]; });
      return n[2] / 3 > 0.02;                        // la cara mira a la cámara
    });

    var vertVisible = V.map(function () { return false; });
    caras.forEach(function (c, ci) {
      if (caraVisible[ci]) c.forEach(function (v) { vertVisible[v] = true; });
    });

    // Convención del dibujo técnico: la arista oculta no se borra, se dibuja
    // fina y discontinua. Así la figura conserva su forma en cualquier giro,
    // en vez de deshacerse cuando una cara deja de mirar a la cámara.
    var trazo = Math.max(4, radio * 0.032);
    aristas.forEach(function (a, idx) {
      var visible = carasDeArista[idx].some(function (ci) { return caraVisible[ci]; });
      var el = lineas[idx];
      el.setAttribute("x1", P[a[0]].x); el.setAttribute("y1", P[a[0]].y);
      el.setAttribute("x2", P[a[1]].x); el.setAttribute("y2", P[a[1]].y);
      el.setAttribute("opacity", visible ? e : e * 0.32);
      // El trazo solo se reescribe cuando la arista cambia de estado: en cada
      // fotograma sería recalcular estilos 30 veces sin necesidad.
      if (estadoArista[idx] !== visible) {
        estadoArista[idx] = visible;
        if (visible) {
          el.setAttribute("stroke-width", esDeColor[idx] ? 3.1 : 2.4);
          el.setAttribute("stroke-dasharray", "none");
        } else {
          el.setAttribute("stroke-width", esDeColor[idx] ? 1.8 : 1.5);
          el.setAttribute("stroke-dasharray", trazo.toFixed(1) + " " + (trazo * 0.8).toFixed(1));
        }
      }
    });

    P.forEach(function (p, idx) {
      var el = puntos[idx];
      var escala = p.f * (radio / 200);
      el.setAttribute("cx", p.x); el.setAttribute("cy", p.y);
      var vis = vertVisible[idx];
      el.setAttribute("opacity", vis ? e : e * 0.5);
      el.setAttribute("r", (vis ? (colorDeNodo[idx] ? 7.2 : 6) : 4.6) * escala);
      if (estadoVertice[idx] !== vis) {
        estadoVertice[idx] = vis;
        if (vis) {
          el.setAttribute("fill", TINTA);
          el.setAttribute("stroke", "none");
        } else {
          // Vértice trasero: hueco, como se dibuja en geometría descriptiva.
          el.setAttribute("fill", "#FFFFFF");
          el.setAttribute("stroke", TINTA);
        }
      }
      if (!vis) el.setAttribute("stroke-width", 1.5 * escala);
    });

    conEnlace.forEach(function (n, idx) {
      var p = P[n.v], a = anclas[idx];
      var visible = vertVisible[n.v];
      // La etiqueta se aparta del centro para no tapar la figura.
      var dx = p.x - cx, dy = p.y - (cy + sube);
      var m = Math.hypot(dx, dy) || 1;
      var fuera = radio * 0.32 + 16;
      var ex = p.x + (dx / m) * fuera, ey = p.y + (dy / m) * fuera;
      // Se confina la etiqueta al área visible: en pantallas angostas, si no,
      // se sale por los lados y queda cortada.
      var mx = a.offsetWidth / 2 + 6, my = a.offsetHeight / 2 + 4;
      a.style.left = Math.min(Math.max(ex, mx), ancho - mx) + "px";
      a.style.top = Math.min(Math.max(ey, my), alto - my) + "px";
      a.style.opacity = visible ? e * (0.5 + 0.5 * (p.z + 1) / 2) : 0;
      a.style.pointerEvents = visible && e > 0.9 ? "auto" : "none";
      a.setAttribute("aria-hidden", visible ? "false" : "true");
      a.tabIndex = visible ? 0 : -1;
    });

    requestAnimationFrame(dibuja);
  }
  requestAnimationFrame(dibuja);

  // ---- Manipulación con ratón y táctil ----------------------------------
  function inicia(e) {
    if (e.target.closest(".ico__nodo")) return;   // no robar el clic a un enlace
    arrastrando = true; raiz.classList.add("ico--arrastrando");
    ultimoX = e.clientX; ultimoY = e.clientY;
    raiz.setPointerCapture(e.pointerId);
  }
  function mueve(e) {
    if (!arrastrando) return;
    var dx = (e.clientX - ultimoX) * 0.0075, dy = (e.clientY - ultimoY) * 0.0075;
    ultimoX = e.clientX; ultimoY = e.clientY;
    rot = multiplica(multiplica(giroX(dy), giroY(dx)), rot);
    velX = dx; velY = dy;
    e.preventDefault();
  }
  function termina(e) {
    arrastrando = false; raiz.classList.remove("ico--arrastrando");
    if (raiz.hasPointerCapture && raiz.hasPointerCapture(e.pointerId)) raiz.releasePointerCapture(e.pointerId);
  }
  raiz.addEventListener("pointerdown", inicia);
  raiz.addEventListener("pointermove", mueve);
  raiz.addEventListener("pointerup", termina);
  raiz.addEventListener("pointercancel", termina);

  // Con teclado: las flechas también giran el objeto.
  raiz.addEventListener("keydown", function (e) {
    var paso = 0.12;
    if (e.key === "ArrowLeft") { rot = multiplica(giroY(-paso), rot); }
    else if (e.key === "ArrowRight") { rot = multiplica(giroY(paso), rot); }
    else if (e.key === "ArrowUp") { rot = multiplica(giroX(-paso), rot); }
    else if (e.key === "ArrowDown") { rot = multiplica(giroX(paso), rot); }
    else return;
    e.preventDefault();
  });

  raiz.classList.add("ico--activo");
})();
