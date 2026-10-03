# Codetober — proyecto público

Frontend estático React + TypeScript + Vite. Solo contiene datos que ya pueden publicarse. Copia el contenido de **esta carpeta**, incluidos sus archivos ocultos, a la raíz de un repositorio público independiente. Nunca copies `private-sync/` ni su historial Git.

## Desarrollo

Node.js 22.12+:

```sh
npm ci
cp .env.example .env
npm run dev
```

Abrir `http://localhost:5173/codetober/2026/`.

```sh
npm test
npm run build
npm run preview
```

La ruta por defecto es `/codetober/2026/`. El workflow usa automáticamente el nombre real del repositorio para construir `/<repositorio>/2026/` y coloca el build en la carpeta `2026/` del sitio de Pages. Para un dominio propio o repositorio `usuario.github.io`, cambia su comando a `npm run build -- --base=/2026/`. Las pestañas no crean rutas que generen 404 al recargar.

## Ediciones anteriores

Cada edición tiene su propia URL, assets y snapshot. Para conservar una edición al pasar al siguiente año, guarda su build final completo (`dist/`) en `archives/<año>/`, con su `index.html`, `assets/` y `data/`. Versiona esa carpeta. El workflow incluye todas las ediciones de `archives/` en cada despliegue; GitHub Pages reemplaza el sitio completo al publicar.

Al abrir una nueva edición, actualiza el año en la ruta base de Vite, el comando de build y la carpeta de destino del workflow, además de las pruebas y la configuración del evento. No coloques la edición activa en `archives/`: el workflow lo rechaza para evitar sobrescribirla. Actualmente solo se incluye 2026.

Las ediciones inexistentes muestran un `404 not found` con el diseño del sitio. Las URLs de años futuros y la raíz del sitio redirigen al año calendario actual en la zona horaria del evento. Si esa edición todavía no se ha publicado, muestra el 404 sin entrar en un bucle. Las ediciones archivadas existentes se sirven directamente desde sus carpetas. El workflow publica `404.html` en la raíz de Pages; Vite reproduce ese fallback durante desarrollo y preview.

## Variables públicas

Todas estas variables se integran en el bundle. **Nunca incluir secretos en `VITE_*`.** `.env` está ignorado; `.env.example` es la plantilla que sí se versiona.

| Variable | Valor / función |
| --- | --- |
| `VITE_EVENT_NAME` | `Codetober 2026` |
| `VITE_EVENT_TIMEZONE` | `America/Mexico_City`, usado como fallback antes de cargar datos; el snapshot privado es la autoridad para fechas |
| `VITE_JOIN_FORM_URL` | Enlace alternativo de Forms: `docs.google.com/forms/...` o `forms.gle/...` |
| `VITE_PUBLIC_DATA_BASE_URL` | Vacío = `BASE_URL + data/`. Alternativa: directorio HTTPS con `data.json`, con CORS que permita el sitio |

En GitHub, definirlas en **Settings → Secrets and variables → Actions → Variables**. No se leen los `.env` locales desde Actions. Si cambias una variable, vuelve a construir/desplegar.

## Google Forms y biografía

1. Crear un Form de inscripción. Explicar que el nombre público, usuario de LeetCode y progreso serán visibles. No solicitar credenciales de LeetCode.
2. Conectar las respuestas con una hoja de solicitudes **privada**. El sincronizador no lee esa hoja: las aprobaciones se registran en `private/participants.json` del repositorio privado.
3. Publicar el formulario y configurar `VITE_JOIN_FORM_URL` con su enlace para responder. El sitio muestra solo el enlace, sin iframe.
4. Comprobar el formulario en una ventana sin sesión y el enlace alternativo. La disponibilidad real depende de los permisos del Form. No publicar su hoja de respuestas.
5. Editar `src/content.ts` con la biografía aprobada de Alejandra Guerra Castañeda. Actualmente solo se muestra su nombre y la descripción de la iniciativa.

Sin URLs válidas se indica que la inscripción no está abierta. La interfaz acepta únicamente URLs HTTPS de Google Forms. La inscripción se presenta como pendiente hasta aprobación administrativa.

## GitHub Pages

1. Crear un repositorio público, por ejemplo `codetober`, con este proyecto en su raíz y rama `main`.
2. **Settings → Pages → Source: GitHub Actions**.
3. Configurar las variables públicas anteriores.
4. Preparar el proyecto privado, las credenciales y el calendario definitivo. No habilitar despliegue mientras estén pendientes.
5. Crear la variable de repositorio `ENABLE_DEPLOYMENT=true` cuando estés lista para publicar. Sin esta variable el workflow solo valida/compila.
6. Ejecutar **Actions → Build and deploy public site → Run workflow** o enviar un commit a `main`.

El sincronizador privado usa un token con acceso de escritura a este repositorio para actualizar exclusivamente `public/data/data.json`. Ese push activa el workflow de Pages. El `GITHUB_TOKEN` del repositorio privado no sirve como token de publicación entre repositorios; además sus pushes no disparan normalmente otros workflows.

Cada snapshot reemplaza un único archivo, evitando mezclar versiones de calendario y ranking. El despliegue de Pages es atómico. La interfaz consulta el JSON cada minuto, conserva el último snapshot en memoria si falla una actualización y marca datos de más de dos horas como desactualizados. Se muestran el último sync íntegramente exitoso, la fecha del snapshot y la última consulta exitosa por participante.

Los cron de GitHub y Pages pueden retrasarse. La cuenta regresiva no garantiza puntualidad y no desbloquea contenido. Al llegar a cero sin publicación se muestra “Awaiting publication”. El JSON solo contiene contenido liberado por el proceso privado.

## Verificación en navegador

```sh
npx playwright install chromium
npm run test:e2e
```

Las pruebas arrancan Vite bajo `/codetober/2026/`, usan datos ficticios mediante interceptación local y comprueban vistas de laptop, tablet y móvil, teclado, el archivo, progreso, búsquedas y accesibilidad. Esos fixtures no se incluyen en el build. No copiar un demo de fechas simuladas a `public/` para desplegarlo.

Si la descarga de Chromium no está disponible y tienes Chrome instalado, usar `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. Playwright abre un perfil temporal aislado, sin usar sesiones personales.

## Referencias

- [Vite: despliegue estático y ruta base](https://vite.dev/guide/static-deploy).
- [GitHub: eventos, retrasos de schedule y disparo de workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Inscripción y vista local de problemas

La inscripción en el sitio está abierta hasta terminar el 30 de octubre de 2026, Guadalajara. A las 00:00 del 31 de octubre (`2026-10-31T06:00:00Z`) se oculta el enlace. No se incrusta el Form; `VITE_JOIN_FORM_EMBED_URL` ya no se utiliza. `VITE_JOIN_FORM_URL` permite configurar el enlace alternativo. El cierre del sitio no modifica Google Forms: en el editor de Forms, Published → Accepting responses → Set close date or response limit, programa el mismo instante y comprueba la zona horaria. https://support.google.com/docs/answer/139706

Para ver tarjetas de problemas sin liberar el calendario privado:

```bash
npm run dev
```

Abre `http://localhost:5173/codetober/2026/?preview=1`, o ejecuta `npm run dev:demo` para iniciar el servidor y abrir automáticamente la vista de prueba en el puerto disponible. Muestra dos problemas ficticios y un participante de prueba el 1 de octubre simulado. Los enlaces ficticios solo sirven para revisar la interfaz. Sin `?preview=1` ves los datos normales. Este modo solo funciona en Vite de desarrollo; el build de producción elimina el módulo de prueba y no permite adelantar liberaciones. `npm run preview` y GitHub Pages no activan esta demo.

## Vista previa al compartir

`index.html` incluye Open Graph y Twitter Cards con URLs HTTPS absolutas para la edición 2026. La imagen pública `public/social-card-2026.png` mide 1200 × 630 y no contiene datos del calendario privado. Para regenerarla con Chrome instalado:

```bash
PLAYWRIGHT_CHANNEL=chrome node scripts/generate-share-image.mjs
```

Si cambia el dominio o la edición, actualizar las URLs y textos de los metadatos y la portada. Las aplicaciones de mensajería pueden conservar una vista previa anterior en caché.

Para revisar el cierre del concurso en local, usa `npm run dev:closed` o añade `?preview=closed` a la URL de desarrollo. Simula el 2 de noviembre: 31 días y 62 problemas ficticios, resultados finales variados, archivo disponible e inscripción cerrada. No carga el calendario privado y no funciona en producción.

Para probar navegación entre ediciones: `npm run dev:editions` o `?preview=editions`. El selector del título alterna el archivo ficticio 2026 y una edición de ejemplo 2027. El control “Simulate” permite comprobar que “View previous edition” desaparece durante el concurso activo. Los participantes y la inscripción son independientes en cada vista. No anuncia una edición real ni cambia rutas, formularios o datos de producción.

## Ciclo anual automático (desde 2026)

Cada edición empieza el **1 de octubre a las 06:00 de Guadalajara** y cierra el
**1 de noviembre a las 06:00**. Al cerrar se anuncia la siguiente edición con su
contador. Las anteriores permanecen en el selector animado del título. El enlace
“View previous edition →” aparece entre concursos, no durante uno activo.

`automaticAnnualCycle: true` en `src/editions.json` activa el ciclo. El build calcula
las ediciones desde 2026 hasta la que corresponde; no hace falta añadir un año
vacío ni ejecutar `edition:announce`. `latestYear` y `announced` quedan como
configuración de compatibilidad cuando el modo automático está desactivado.
El reloj del visitante no cambia qué ediciones existen ni publica problemas.

El workflow de Pages se ejecuta diariamente a las 12:07 UTC (06:07 Guadalajara con
las reglas actuales), además de pushes y ejecuciones manuales. El primer build
posterior al cierre anuncia la siguiente edición; si falla o GitHub lo retrasa,
una ejecución posterior recupera el cambio. Requiere Actions habilitado y
`ENABLE_DEPLOYMENT=true`. Los workflows programados pueden deshabilitarse por
inactividad en repositorios públicos: revisar Actions si dejan de ejecutarse y
reactivarlos o lanzar el workflow manualmente. No es un cambio instantáneo a las
06:00; una página ya abierta debe recargarse después del despliegue.

Cada año nuevo empieza sin participantes, resultados, formulario ni problemas.
Cuando estén listos, añadir/configurar su entrada en `src/editions.json`:

- `year`: año de la edición.
- `registrationUrl`: su propio enlace público de Google Forms.
- `registrationCloseAt`: cierre de inscripción como instante ISO con zona.
- `snapshot`: `data/AAAA/data.json`, únicamente datos sanitizados de ese año.

Se puede usar la entrada 2027 existente como plantilla. `startAt` y `closeAt` se
calculan con la zona IANA `America/Mexico_City` en el modo automático. Las entradas
futuras configuradas no se anuncian antes del cierre anterior. Dejar formulario y
snapshot en `null` mientras no estén preparados. Nunca copiar el registro ni los
participantes de otra edición; los overrides `VITE_JOIN_FORM_URL` y
`VITE_PUBLIC_DATA_BASE_URL` existentes solo aplican a 2026.

`npm run build:pages` crea `_site/` con un directorio por edición y solo su snapshot.
Reconstruye también los históricos, manteniendo sus datos. Tanto el loader como
el build rechazan snapshots con fechas de otra edición. Los nuevos años omiten
la imagen social 2026 hasta que se prepare una portada correspondiente.

Esto sustituye el anuncio manual y el antiguo montaje de `archives/`. El login
genérico aún no está implementado; por ahora el registro sigue siendo por enlace.
