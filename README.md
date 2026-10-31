# Codetober — proyecto público

Al cerrar la edición, Problems muestra un archivo compacto y las dinámicas pasadas
se conservan en un desplegable; sus banners activos desaparecen. El icono de archivo
del encabezado enlaza ediciones cerradas. El selector de año sigue disponible cuando
hay varias ediciones anunciadas. `?preview=closed` permite revisar estos cambios
en desarrollo; `?preview=editions` conserva el simulador anual.

Los reconocimientos de cierre (`Codetober Finisher`, `Past Halfway`, `Took Part`)
vienen del snapshot privado: 62/62, 32–61 y 1–31 respectivamente. No cambian puntos
ni tiempos y no se conceden antes de cerrar. `Project journal` es una pestaña
estática cargada bajo demanda, con decisiones y aprendizajes; no admite registros
personales ni secretos. Las notas distinguen producción de experimentos locales.

El problema final propio usa `source: "answer-challenge"` en el snapshot y abre
un diálogo de código, descarga y archivo UTF-8. Solo consulta el API al abrir o
realizar una acción; el score sigue leyendo el snapshot estático. El build real
necesita la variable pública `VITE_VALIDATOR_TURNSTILE_SITE_KEY`, nunca un secreto.
Una fuente archivada muestra su cierre sin llamar al backend. El preview local
`?preview=wish-validator` y `npm run test:validator:e2e` usan contenido ficticio;
el ensayo de navegador intercepta la API y no modifica Supabase. La configuración
oficial y el despliegue del validador siguen pendientes.

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

## Editorials / maqueta local

`npm run dev:editorials` abre la pestaña Editorials con un aporte ficticio de
Two Sum y un distintivo en el detalle de su autor. Es una maqueta: no representa
el calendario real ni una contribución de una persona real. También puede abrirse
`/codetober/2026/?preview=editorials#editorials` en el servidor de desarrollo.
No se incluye en el build de producción.

La vista usa Markdown sin HTML ni imágenes remotas, un bloque desplazable de
código (no ejecutable), complejidad y enlaces opcionales a videos. En producción,
los datos vienen de `data.json.editorials`, publicados por el proceso privado
tras el cierre diario. Los snapshots antiguos sin ese campo muestran un estado
vacío. Los enlaces `#editorial-ID` abren la pestaña y el aporte correspondiente.

El formulario suministrado se enlaza solo en 2026 y anuncia cierre de solicitudes
el 2 de noviembre; Google Forms controla la aceptación de respuestas. No se reutiliza
para otras ediciones. El cierre del concurso sigue siendo el 1 de noviembre a las
06:00 de Guadalajara. Las editoriales y los distintivos no alteran puntuación ni rachas.

## Indicadores de editoriales sin abrir

Solo las editoriales sin abrir muestran borde dorado y etiqueta `New`; su pestaña
señala cuando hay aportes pendientes. Abrir una editorial, también mediante un
enlace directo, quita su indicador. Cambiar de pestaña no marca todas como vistas.
Los problemas y el histórico no llevan indicadores ni registran clics.

Se guarda en localStorage, por edición y navegador. Cada nueva editorial tiene
su propio indicador; actualizar un aporte existente no lo reinicia. Los previews
usan almacenamiento separado. Si el almacenamiento está bloqueado funciona durante
la visita. Al borrarlo o cambiar de dispositivo las marcas reaparecen. Se respeta
movimiento reducido. Esto no afecta puntos ni rachas.

## Organización del código

Ver [arquitectura y guía para extender el sitio](ARCHITECTURE.md).

Las tarjetas muestran hasta tres etiquetas destacadas; al expandirlas aparecen todas.
Los tooltips funcionan con mouse, foco de teclado y toque. Las etiquetas se calculan
en el sincronizador y no cambian el ranking. Los snapshots anteriores sin `badges`
siguen siendo válidos. El preview local incluye etiquetas sintéticas.


## Extraordinarios 2026

The scoreboard uses `event.extraordinaryEvents` from the public snapshot. First
acceptances during October 17, 06:00 through October 19, 06:00 Guadalajara time
(end excluded) qualify only for problems whose daily window had ended by the
start. A qualifying solve counts as 24 hours total, with no late penalty;
editorial credits still apply separately. Histories show the fixed cost and
participant cards show the recovery adjustment. No streak or on-time credit is
restored. Benefits remain after the window ends. Before the first full sync with
the new scorer, older snapshots retain their original scoring.

Extraordinary events are optional per edition. Dates and rules come exclusively
from the snapshot; the frontend never enables them based on an edition year.
Editions without this metadata show no extraordinary-event counters or notices.

The event countdown appears only in the full-width header banner, which links
to the temporary Extraordinarios tab. That tab contains the rules and a
searchable list of overdue problems by participant, most pending first. It
uses published problems and recorded first acceptances; it does not change
the competition ranking. The tab hides after event closure, while its direct
link remains available for reference. On mobile, navigation uses a hamburger
menu that closes after choosing a section.


## WhatsApp community

The invitation URL lives in `src/community.ts`. The header icon and About / Join
share the viewed-content indicator; the gold highlight clears after opening
the invitation section and persists in local storage. `#community` opens the
section directly. Its QR stays collapsed until requested and has a PNG download.
The QR is generated locally without an external QR service or tracking redirect.

When changing the invite link, regenerate both committed QR assets with
`python3 scripts/generate-community-qr.py` (requires `qrcode` and `Pillow`),
then scan the PNG to verify it matches the new link. Do not crop its white border.

## Preview de Extraordinarios II y Make a Wish

Con `npm run dev`, abrir:

- `/codetober/2026/?preview=wish#make-a-wish`: domingo activo, varita y polvo de hada en desktop.
- `/codetober/2026/?preview=wish-upcoming#extraordinarios`: cuenta regresiva y pendientes antes del fin de semana.
- `/codetober/2026/?preview=wish-review#make-a-wish`: resultado provisional al cierre.
- `/codetober/2026/?preview=wish-tie#make-a-wish`: empate exacto, revisión por correo.
- `/codetober/2026/?preview=wish-winner#make-a-wish`: ganador confirmado.

Los previews son exclusivos de desarrollo, con personas y problemas ficticios;
no importan ni revelan el calendario privado. Las tarjetas abren diálogos nativos
con cierre por Escape y restauración del foco. Los botones de contacto copian la dirección y una plantilla con la elección;
no abren un cliente de correo ni envían mensajes ni verifican identidades. Si el
portapapeles está bloqueado, muestran texto seleccionable para copia manual.
El efecto del domingo respeta movimiento reducido y se puede apagar.

La interfaz lee el anuncio y resultado de `event.makeAWish`, opcional para
compatibilidad con snapshots anteriores. No deduce un ganador en el navegador.
Los cinco deseos son propuestas sujetas a revisión; no se aplican descuentos
por abrir tarjetas ni enviar una elección.

Validación del preview: `npx playwright test --config playwright.wishes.config.ts`.

### Diseños de los deseos activados

`/codetober/2026/?preview=wish-design&wish=one-more-spell#make-a-wish`
abre un prototipo interactivo exclusivo de desarrollo. El selector permite recorrer
los cinco deseos y sus estados Scheduled / Active / Closed. Las pestañas Problems,
Make a Wish y Scoreboard muestran la navegación, pistas progresivas, práctica
opcional, sorpresa del último día, editorial posterior y desglose de créditos.
Los controles superiores simulan progreso. Make a Wish muestra participantes en
una lista con buscador y filas expandibles, sin una sesión iniciada. Cada aceptado de ejemplo descuenta 2h
una sola vez y conserva los puntos principales. Los problemas y pistas son ficticios.
No hay solicitudes al sincronizador ni cambios en datos reales.

El parámetro `wish` acepta los mismos cinco IDs del catálogo. Los diseños son
propuestas de interfaz, no activan beneficios ni fijan fechas definitivas. Se
prepara la versión conectada a datos después de seleccionar y aprobar el deseo.

El prototipo reutiliza Home, ProblemCards, Scoreboard y ParticipantRow. One More
Spell añade solo una card discreta debajo de los dos problemas diarios; las
misiones fijas y su progreso viven en Make a Wish. Las pistas aparecen bajo
cada problema nuevo. El Scoreboard conserva sus filas: el conteo mágico aparece
solo al expandir el participante, y los aceptados opcionales se integran al
histórico por fecha de aceptación en America/Mexico_City, con su descuento.
Los puntos de extensión de estos componentes son opcionales y el sitio normal
no recibe suplementos ni descuentos desde el preview.
