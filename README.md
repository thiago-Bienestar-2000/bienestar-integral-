# Bienestar Integral — Sitio web

Sitio estático (HTML + CSS + JavaScript) con un sistema real de testimonios
respaldado por [Supabase](https://supabase.com) (base de datos + autenticación).
No requiere build ni servidor propio: Vercel sirve los archivos tal cual, y
Supabase actúa como backend para los testimonios.

## Estructura del proyecto

```
bienestar-integral/
├── index.html            → página principal
├── admin.html             → panel de administración de testimonios (protegido)
├── css/
│   └── styles.css         → todos los estilos (sitio público + panel admin)
├── js/
│   ├── script.js          → menú móvil, animaciones, galería (sin cambios)
│   ├── supabase-config.js → conexión a tu proyecto de Supabase (¡completar!)
│   ├── testimonios.js     → carga testimonios aprobados + formulario público
│   └── admin.js           → lógica del panel de administración
├── supabase/
│   └── schema.sql          → script SQL para crear la tabla y sus permisos
├── images/                 → logo y fotografías
├── vercel.json
└── README.md
```

Todas las rutas de imágenes, CSS y JS son **relativas**, así que el sitio
funciona igual en cualquier computadora manteniendo esta estructura de
carpetas.

## 1. Configurar Supabase (una sola vez)

1. Creá una cuenta gratuita en https://supabase.com y un nuevo proyecto.
2. Andá a **SQL Editor → New query**, pegá todo el contenido de
   `supabase/schema.sql` y ejecutalo. Esto crea la tabla `testimonios` con
   los permisos correctos (Row Level Security):
   - Cualquier visitante puede **enviar** un testimonio, pero siempre queda
     como `pendiente`.
   - Cualquier visitante puede **leer** solamente los testimonios
     `aprobado`.
   - Solo un usuario que inició sesión (Josefina) puede ver todos los
     testimonios, aprobarlos, rechazarlos o eliminarlos.
3. Andá a **Authentication → Providers** y confirmá que el login por
   email/contraseña esté habilitado. Después, en **Authentication → Users**,
   hacé clic en "Add user" y creá manualmente el usuario de Josefina
   (email + contraseña). Ese va a ser el usuario para entrar al panel de
   administración.
4. **Importante — desactivá el auto-registro público:** en
   **Authentication → Providers → Email**, desactivá "Allow new users to
   sign up" (o equivalente). Así nadie más puede crearse una cuenta y
   acceder al panel; el único usuario admin es el que creaste a mano.
5. Andá a **Project Settings → API** y copiá dos valores:
   - **Project URL**
   - **anon public** (la clave pública, no la `service_role`)

## 2. Completar `js/supabase-config.js`

Abrí `js/supabase-config.js` y reemplazá estas dos líneas con los valores
que copiaste en el paso anterior:

```js
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-CLAVE-ANON-PUBLICA";
```

Estos valores **no son secretos** (la clave "anon" está diseñada para vivir
en el código del navegador); la seguridad real la da la Seguridad a Nivel de
Fila (RLS) que configuraste en el paso 1. La clave `service_role` (esa sí
secreta) no se usa en ningún archivo de este proyecto.

## 3. Publicar en Vercel

**Opción A — Arrastrar y soltar:**
1. Entrá a https://vercel.com y creá una cuenta.
2. "Add New..." → "Project" → subí la carpeta `bienestar-integral` completa
   (ya con `js/supabase-config.js` completado).
3. Vercel detecta que es un sitio estático y lo publica. Te da una URL
   pública (por ejemplo `bienestar-integral.vercel.app`).

**Opción B — Con GitHub (recomendada para futuras actualizaciones):**
1. Subí la carpeta a un repositorio de GitHub.
2. En Vercel: "Add New..." → "Project" → "Import Git Repository".
3. Framework Preset: "Other" (no hace falta build command).
4. Cada cambio que subas al repositorio se vuelve a publicar solo.

No hace falta configurar ninguna variable de entorno en Vercel: al ser un
sitio estático sin funciones de servidor, la configuración de Supabase vive
directamente en `js/supabase-config.js`, tal como se explicó arriba.

## 4. Cómo aprobar testimonios (uso diario para Josefina)

1. Entrá a `https://tu-sitio.vercel.app/admin.html`.
2. Iniciá sesión con el email y contraseña creados en el paso 1.3.
3. Vas a ver dos listas:
   - **Pendientes de aprobación**: cada testimonio nuevo aparece acá, con
     nombre, texto, estrellas y fecha. Botones **✓ Aprobar** / **✕ Rechazar**.
   - **Publicados**: los testimonios ya aprobados, con opción de
     **Eliminar** si hace falta bajarlos más adelante.
4. Al aprobar un testimonio, aparece automáticamente en la sección
   "Experiencias" del sitio público (no hace falta volver a publicar nada).

El acceso a `/admin.html` está protegido: sin iniciar sesión con ese usuario,
no se puede ver ni modificar ningún testimonio — las políticas de la base de
datos (RLS) bloquean esas acciones aunque alguien intente llamarlas
directamente, no solo la pantalla de login.

## Editar otro contenido

- **Servicios, horarios, textos**: directamente en `index.html`, en la
  sección correspondiente (comentada, ej. `<!-- SERVICIOS -->`).
- **Fotos**: reemplazá los archivos en `images/` manteniendo el nombre, o
  agregá nuevas y actualizá los `src` en `index.html`.
- **Número de WhatsApp**: aparece en varios botones (`https://wa.me/...`).
  Si cambia, reemplazalo en todas las apariciones dentro de `index.html`.

## Qué se usó y por qué

- **Base de datos y autenticación**: [Supabase](https://supabase.com) (Postgres
  gestionado + Auth). Es gratis para este volumen de uso, no requiere
  escribir backend propio, y su sistema de Row Level Security permite
  proteger correctamente quién puede leer, insertar, aprobar o borrar cada
  testimonio directamente a nivel de base de datos.
- **Hosting**: Vercel, sirviendo el sitio como archivos estáticos (igual que
  antes). No se agregaron funciones de servidor (Vercel Functions): toda la
  lógica de permisos vive en las políticas de Supabase, lo cual es
  suficiente y más simple para este caso de uso.
