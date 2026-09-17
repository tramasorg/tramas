# Registro de constancias

Sitio estático para verificar constancias con folio y código QR. Sin backend,
sin base de datos: la fuente de la verdad es `data.json`, que tú editas y
subes a GitHub; Vercel redespliega automáticamente en cada `git push`.

## Estructura

- `index.html` — página pública de verificación (lee `data.json`).
- `data.json` — el registro. `institucion` + arreglo `records`.
- `scripts/agregar-constancia.mjs` — asistente de terminal para agregar un
  registro, generar su folio y su código QR (PNG) sin editar el JSON a mano.

## Primera vez

```bash
npm install
```

## Agregar una constancia

```bash
npm run agregar
```

Te pedirá nombre, curso, horas, fecha y el dominio final del sitio. Al
terminar:

- Agrega el registro a `data.json` con un folio nuevo (`INICIALES-AÑO-0001`).
- Guarda el QR en `qrcodes/<folio>.png`, apuntando a
  `https://tu-dominio/?folio=<folio>` — ese PNG es el que pegas en el PDF o
  Word de la constancia.

Luego sube el cambio:

```bash
git add -A
git commit -m "Agrega constancia <folio>"
git push
```

Vercel redespliega solo en cuanto detecta el push (una vez conectado el
repositorio — ver abajo).

## Publicar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (nuevo, vacío):
   ```bash
   git init
   git add -A
   git commit -m "Registro de constancias inicial"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```
2. En [vercel.com/new](https://vercel.com/new), elige "Import Git
   Repository" y selecciona ese repositorio. No necesita configuración
   especial: es un sitio estático, Vercel lo detecta solo.
3. Cuando quieras, dime el nombre del repositorio ya en GitHub y puedo
   conectarlo a tu cuenta de Vercel por ti (ya está enlazada a esta
   conversación) usando el paso de importar proyecto Git.
4. Una vez publicado, vuelve a correr `npm run agregar` usando ese dominio
   real para que los QR apunten al lugar correcto.

## Notas

- Cualquier persona con el enlace puede *consultar* un folio; nadie puede
  editar el sitio salvo quien tiene acceso al repositorio de GitHub.
- No incluyas datos sensibles (CURP, domicilio, etc.) en `data.json`: es un
  archivo público una vez desplegado.
- Esto da *verificabilidad*, no un aval oficial de ninguna autoridad
  educativa (SEP) o laboral (STPS).
