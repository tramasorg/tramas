# Sitio de Tramas Escucha a Víctimas de Violencia, A.C.

Sitio estático, sin paso de compilación. Se publica en dos lugares a la vez
desde la rama `main`, así que un solo `git push` actualiza ambos.

| Dirección | Para qué |
|---|---|
| https://tramasevv.org | El sitio público (dominio propio) |
| https://tramasorg.github.io/tramas | Espejo permanente y destino de los códigos QR |

## Por qué los códigos QR apuntan a GitHub y no al dominio

Los QR impresos en las constancias apuntan a
`https://tramasorg.github.io/tramas/constancias/?folio=…`, **no** al dominio
propio, y así debe seguir siendo.

Una constancia tiene que poder verificarse dentro de muchos años. El dominio
se paga cada año y puede caducar o perderse; la dirección de GitHub Pages es
gratuita y no depende de una renovación. Como los papeles ya entregados no se
pueden reimprimir, el QR apunta al destino más difícil de perder.

De ahí se siguen dos reglas:

1. **GitHub Pages no se apaga nunca**, aunque el sitio principal viva en otro
   lado.
2. En `github.io` vive el verificador **funcionando**, no una redirección al
   dominio: si fuera una redirección, perder el dominio rompería igualmente
   todas las constancias.

Los dos despliegues salen del mismo repositorio, así que publicar una
constancia nueva en uno la publica en el otro.

## Estructura

```
index.html                     Portada, con el icosaedro navegable
quienes-somos.html
servicios.html
circulos-de-formacion.html
red-de-acompanamiento.html
contacto.html
navegacion-segura.html         Cómo salir del sitio sin dejar rastro
assets/
  styles.css                   Toda la hoja de estilos del sitio
  icosaedro.js                 El icosaedro del logotipo como navegación
  nav.js                       Menú desplegable desde el logotipo
  salida-segura.js             Botón "Salir" y atajo Esc ×3
  site.js                      Lista de la Red de acompañamiento
  logo.png                     Logotipo
  icono.svg                    Icono de pestaña (el icosaedro)
  icono-180.png                Icono para pantalla de inicio en iOS
  compartir.png                Imagen de 1200×630 al compartir el enlace
data/
  colaboradores.json           Lista de la Red de acompañamiento
constancias/                   Verificador público de constancias
  index.html
  data.json                    Registro de constancias emitidas
  qrcodes/                     Un PNG por constancia
  scripts/agregar-constancia.mjs
  scripts/regenerar-qr.mjs
```

## Constancias

```bash
cd constancias
npm install
npm run agregar        # agrega una constancia y genera su QR
npm run regenerar      # rehace todos los QR desde data.json
```

`regenerar` respeta los nombres de archivo puestos a mano: si ya existe un PNG
cuyo nombre contiene el folio (por ejemplo `BelenTEAV-2026-0001.png`), lo
sobrescribe en su sitio en vez de crear un duplicado.

Para cambiar el destino de los QR hay que pasarlo explícitamente, pero
conviene leer antes la sección de arriba:

```bash
npm run regenerar -- https://otra-direccion/constancias
```

## Paleta y tipografía

Ambas salen del logotipo: navy `#16253E`, rojo `#C62118`, olivo `#627D2A` y
amarillo `#D9D20E`, con Outfit para titulares y Plus Jakarta Sans para texto.
