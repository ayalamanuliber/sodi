# Servicio Bodas: contrato de integración

Servicio aislado de las rutas y almacenamiento de la boda histórica. Ofrece una sesión de celebración por evento, invitación publicada, confirmaciones y organización de mesas. No tiene checkout. La asignación se realiza por decisión de la pareja; las sugerencias requieren aceptación.

Alta gratuita en producción: requiere `BODA_STUDIO_SELF_SERVE_ENABLED=true`, `BODA_STUDIO_PILOT_MAX_EVENTS` explícito y almacenamiento privado configurado. Mantener estas variables en el proyecto, además del despliegue. Las suites `npm run test:boda-service` y `npm run test:boda-launch` prueban el contrato con datos sintéticos aislados.

## Almacenamiento y autorización

- En desarrollo siempre usa archivos privados en `BODA_STUDIO_DATA_DIR`, por defecto `.boda-studio-private` fuera de `public`. Ignora cualquier token Blob heredado en desarrollo. Excluir este directorio de Git.
- Producción requiere `BLOB_READ_WRITE_TOKEN`; usa el prefijo privado `boda-studio/v1/`, escrituras y borrados con ETag, y falla cerrado si falta configuración o se solicita almacenamiento local. `BODA_STUDIO_STORE_PREFIX` permite aislar preview/QA sin consultar eventos del prefijo productivo; acepta sólo un espacio bajo `boda-studio/`, sin traversal. La evidencia de Blob privado del integrador está en `artifacts/bodas-launch-2026-09-08/cloud-storage.json`; no sustituye el ensayo integral del despliegue.
- Operador: cookie administrativa histórica verificada mediante `isWeddingAdminAuthenticated`, o `Authorization: Bearer <BODA_STUDIO_OPERATOR_TOKEN>` configurado explícitamente. Ese token nunca se entrega a parejas.
- Pareja: contraseña exacta de 12–128 caracteres, sin controles, guardada con scrypt y salt aleatorio. Sesión opaca aleatoria, sólo su SHA256 se persiste; cookie `HttpOnly`, `SameSite=Strict`, `Secure` en producción, ruta limitada al evento. Expira a las 12 horas. Reset de contraseña revoca sesiones.
- Login: límites persistentes de 5 fallos consecutivos por evento/origen en 15 minutos; un acceso correcto reinicia ese contador. El límite global de 60 intentos por origen en 15 minutos cuenta también accesos correctos. RSVP: 60 operaciones por evento/origen y 180 por origen en 5 minutos, independientemente del token enviado. Los IDs inexistentes no crean contadores por evento; login y RSVP retienen sólo su contador general por origen. PATCH autenticado: 300 operaciones por evento en 10 minutos. Recuperación: 20 por origen y 5 por evento/origen en 15 minutos. Borrado: cinco verificaciones de contraseña por evento en 15 minutos. Sólo Vercel aporta IP confiable mediante `x-vercel-forwarded-for`; otros entornos usan un bucket compartido, nunca un `x-forwarded-for` aportado libremente.
- Mutaciones comparan el origen del navegador con el Host recibido, sin confiar en x-forwarded-host ni el hostname interno de Next. Exigen HTTPS en producción salvo loopback para QA local. También verifican JSON, tamaño y campos admitidos. Límite general 3 MiB; login 1 KiB y RSVP 128 KiB. Respuestas privadas `no-store`.

## DTO y unidades

Tipos en `types.ts`. `event` tiene `id`, `revision`, `draft`, `photos`, `published`, `rsvpClosed`, `groups`, `people`, `tables`, `assignments`, `review`, `revisions`, `ledger` y `audit`. El handler agrega `viewerRole: operator | couple`; para parejas elimina detalles operativos de ledger/audit/revisiones internas. No incluye hashes, sesiones, tokens de invitación o fotos históricas fuera de la revisión seleccionada.

`Person.attendance`: `pending | confirmed | declined`. `kind`: `adult | child | baby | unknown`. Cada persona tiene ID estable y un grupo. `seatRequired` cuenta lugares; **una persona sin lugar requerido puede tener mesa sin consumir capacidad**, por ejemplo un bebé en brazos. Ocupación de mesa = asignaciones a esa mesa cuyas personas tienen `seatRequired=true`, no `assignments.length`. Asistentes incluye bebés. Revisar no exige mesa a quien no necesita lugar.

El borrador importa contenido normalizado, nunca fotos de ejemplo. Crear desde un trial migra sus grupos/cantidades en personas de identidad pendiente, sin adivinar quién asistía ni replicar menú grupal. Para un evento nuevo, la interfaz debe enviar `guests: []` y `rsvps: []` por defecto. Una importación de datos existentes debe ser deliberada; el trial contiene personas ficticias.

## Rutas

Base `/api/boda-studio`:

| Método y ruta | Acceso y cuerpo | Resultado |
| --- | --- | --- |
| `GET /capabilities` | Sin login | `{selfServeEnabled,availability:open\|paused\|full,limits:{people:200,photos:6},recoveryEnabled:true,beta:true}`; comprueba cohorte durable al habilitar altas |
| `POST /start` | `{workspace,password,acquisitionSource?,requestId?}` con Origin explícito; gate/cohorte abiertos | 201 `{event,recoveryKey}` y cookie; evento/lista vacía/credenciales en un único write. UUID v4 estable por intento permite reintentar sin duplicar |
| `GET /events` | Operador | `{events:[{id,names,updatedAt,published,acquisitionSource,activation}]}` |
| `POST /events` | Operador; `{workspace,password}` | `{event}`, HTTP 201; también crea cookie pareja para el nuevo evento |
| `POST /events/:id/login` | `{password}` | `{event}` y cookie |
| `POST /events/:id/recover` | Sin sesión; `{recoveryKey,password}` | `{event,recoveryKey}` nueva; cambia contraseña y revoca sesiones anteriores |
| `POST /events/:id/delete` | Sesión u operador más contraseña actual; `{revision,password}` | `{ok:true}` sólo tras borrado CAS del objeto completo, cookie expirada |
| `POST /events/:id/logout` | Sesión actual | `{ok:true}`; revoca sesión y cookie |
| `GET /events/:id` | Pareja del evento u operador | `{event}` |
| `PATCH /events/:id` | Pareja del evento u operador; acción de tabla siguiente | `{event,invitationToken?,recoveryKey?}`; claves sólo al rotarlas |
| `GET /public/:id` | Sin login; sólo si publicado | `{id,revision,workspace,photos,rsvpClosed}` sin lista de invitados |
| `POST /rsvp/:id` | Token exclusivamente en JSON | Consultar o responder sólo por ese grupo |
| `GET /events/:id/export?target=guests` | Pareja u operador | CSV de todos los invitados/estados, sin necesidad de mesas |
| `GET /events/:id/export?target=venue\|catering` | Pareja u operador; mesas `ready` | CSV ordenado por mesa natural y nombre (es-AR), sin notas privadas/contactos/tokens |
| `GET /events/:id/backup` | Pareja u operador | `{backup}`; archivo operativo con fotos deduplicadas, sin credenciales; ledger sólo para operador |
| `POST /events/:id/restore` | Pareja u operador; `{revision,backup}` | `{event}`; revoca sesiones y enlaces de invitados, exige volver a ingresar y revisar |

Errores JSON `{error:string}`: 400 validación, 401 login, 403 rol/origen, 404 no disponible, 409 versión/conflicto/cierre/mesas sin revisar, 413 tamaño, 415 contenido, 429 intentos y 503 indisponibilidad. No exponer stack traces ni errores de almacenamiento al cliente.

## Mutaciones

Toda mutación PATCH envía `revision` actual y `action`; los campos adicionales son los de esta tabla. Conflicto 409 conserva el estado anterior completo. Recargar los datos y pedir revisión de la persona, nunca reintentar sobrescribiendo silenciosamente.

| action | Campos adicionales |
| --- | --- |
| `content` | `workspace` |
| `photos` | `photos:string[]` |
| `rsvp_close` | `closed:boolean` |
| `group_add` | `label`, `people:[{name,kind,seatRequired}]` |
| `group_import` | `groups:[{label,people:[{name,kind,seatRequired}]}]`; atómico, hasta 100 grupos/200 personas totales |
| `person_update` | `personId`; opcionales `name,kind,seatRequired,attendance,menu,note,dietaryRestriction,shareDietaryRestriction,accessibilityNeeds` |
| `invitation_rotate` | `groupId`; devuelve el token opaco **una sola vez**, revoca el anterior |
| `table_add` | `name`, `capacity` entero 1–100 |
| `table_update` | `tableId`; opcionales `name,capacity,shape,x,y,width,height,rotation`; no acepta reducir bajo ocupación |
| `table_delete` | `tableId`; exige quitar/mover antes todas las personas vinculadas |
| `assign` | `personIds:string[]`, `tableId:string|null`; `null` quita mesa; movimiento del conjunto atómico |
| `review` | `ready:boolean`; no permite ready con personas que necesitan lugar sin mesa |
| `publish` | Ninguno; exige foto propia, fecha válida, celebración con lugar/hora; ceremonia con ambos o ninguno |
| `unpublish` | Ninguno |
| `rollback` | `snapshotId`; devuelve el estado previo guardado en esa revisión, revoca tokens de invitación, reabre revisión |
| `ledger_add` | Sólo operador. `kind:'payment_verified',amount,currency:'ARS'|'USD',reference`; o `kind:'time',minutes,reference` |
| `sessions_revoke` | Ninguno; revoca sesiones de esta pareja |
| `password_reset` | Sólo operador; `password`; revoca también la clave de recuperación anterior |
| `recovery_rotate` | Ninguno; devuelve una nueva clave una sola vez, invalida la anterior sin cerrar la sesión actual |

`amount` expresa unidades monetarias principales (pesos/dólares) con hasta dos decimales, nunca centavos implícitos. Un pago con el mismo importe, moneda y referencia normalizada ya registrado se rechaza con 409; un reintento de revisión anterior también se rechaza sin duplicar. Ledger y audit son anexos; rollback/restore operativo **preserva el ledger actual** y no importa pagos adjuntos de un archivo. Verificación manual de un pago es declaración del operador con referencia; no acredita verificación bancaria automática ni cobro integrado.

## Fotos y revisiones

Fotos JPEG/PNG/WebP como data URL, firma binaria validada, máximo seis por selección y 350 KiB decodificados por imagen. El límite conjunto de fotos únicas entre borrador y publicación es 2,5 MB codificados para que el backup sea recuperable con el cuerpo permitido. Además, cada guardado verifica el tamaño total del backup JSON, incluido el ledger, y rechaza cambios que superarían el límite recuperable de 3 MiB. La UI comprime fotos; si cambia toda la galería mientras otra versión sigue publicada puede tener que comprimir más. No hay SVG, URL remota ni música automática.

Publicar copia texto/diseño/fotos a una instantánea inmutable hasta otra acción explícita publicar, despublicar, rollback o restore. Un cambio de borrador no modifica el enlace público. Cada mutación guarda estado previo; `revisions[].action` indica la acción **antes de la cual** está ese estado. Hasta 30 revisiones y los últimos 500 registros audit; se reduce la cantidad de revisiones hasta mantener el objeto completo bajo 8 MiB, con recolección de fotos históricas huérfanas. No se recortan personas ni ledger actuales. La lista siempre muestra sólo revisiones recuperables.

Backup deduplica fotos en `assets:{sha256:dataURL}` y usa referencias `@photo:hash` en el estado. La UI debe tratarlo como archivo opaco, descargarlo y subirlo completo en `backup`; no reinterpretarlo. Restore verifica IDs, membresía, capacidades, fotos y hashes, conserva el historial de operación actual y revoca accesos compartidos. Es restauración de estado de un evento existente; no es recuperación de infraestructura ni de una cuenta Blob eliminada. Necesita pruebas/estrategia de retención de infraestructura antes de producción.

## RSVP

Consulta: `{action:'get',token}` → `{group,people,revision,rsvpClosed}`. No aceptar token en query string. El frontend puede llevar un token en fragmento de URL y enviarlo en JSON, evitando logs de URL del servidor.

Respuesta: `{action:'submit',token,revision,people:[{id,name,kind,attendance,seatRequired,menu,dietaryRestriction,shareDietaryRestriction,accessibilityNeeds}]}`. Incluir exactamente las personas de ese grupo, IDs únicos; se permite nombre pendiente. La respuesta es atómica. Baja a declined quita mesa; reconfirmar no restaura la mesa anterior. Cambio de necesidad de lugar que sobreocupa mesa se rechaza para revisión, sin perder el estado previo. Un bebé en brazos puede conservar mesa y consumir cero lugares.

La versión es global del evento en esta primera implementación: un cambio de mesa u otro grupo puede exigir recargar la confirmación antes de guardarla. Es intencionalmente conservador y debe explicarse en la UI con recuperación de selección; no reintentar a ciegas. Una petición duplicada de una versión anterior retorna 409 y no duplica personas ni asistentes. El límite/cierre de respuesta no revela otros grupos.

## Verificación realizada

`node --no-warnings --experimental-strip-types scripts/check-boda-service.mjs`: 38 escenarios sintéticos en un directorio temporal borrado al finalizar. Incluyen aislamiento A/B, expiración, seis o más accesos legítimos sin bloqueo por evento, corte global tras 60 intentos, cinco fallos consecutivos, orden natural de CSV por mesa y nombre, importación atómica, IDs, bebé sin silla, capacidad y rechazo parcial, cambios RSVP, concurrencia, CSV, rol de pagos, rollback/restore, fotos/hashes y producción sin almacenamiento. También se verificó HTTP real en el servidor local 3104: creación desde 127.0.0.1 con Origin correspondiente (201), login desde localhost (200), origen ajeno rechazado (403), pago manual (200) y duplicado (409). El middleware histórico bloquea los User-Agent de curl/undici; las pruebas HTTP deben usar un User-Agent de navegador para alcanzar la ruta. El servidor escucha IPv4, por lo que el cliente Node para localhost utilizó dns.setDefaultResultOrder("ipv4first"). Fixture sintética creada: evt_88f6fe89220d6a4d7d57ad17. ESLint aplicado sólo a este servicio/rutas/script. Los escenarios no tocan Blob remoto ni datos reales.

La integración HTTP/UI completó 35 comprobaciones en navegadores independientes, incluidos RSVP, aislamiento, conflictos de diseño, impresión con nombre de mesa y restauración. También se verificaron importación/exportación/restauración de 50, 150 y 200 personas y seis estilos publicados en móvil. Evidencia: `artifacts/bodas-system-2026-09-08/system-qa.json` y `capacity-and-themes.json`. La ruta de almacenamiento local se elimina de la compilación productiva y las carpetas de pruebas se excluyen del empaquetado.

Pendientes antes de producción: comprobación real de Blob privado en un despliegue autorizado, entrega real y aceptación de un salón. El CSV y la impresión del navegador están integrados; PDF generado en servidor, sillas numeradas y restauración de infraestructura no son funcionalidades acreditadas por este módulo. Las restricciones alimentarias separadas de notas y su permiso para exportar sí están implementados y probados. Los contextos de navegador independientes verifican sesiones separadas, no equivalen a una entrega comercial real.

## Extensión verificada del 08/09

Plano: `room_update`, `floor_feature_add/update/delete` y geometría de `table_update` conservan identidades/asignaciones. Medidas en metros, validación del contorno rotado con margen orientativo de sillas, solapamiento advertido y revisión obligatoria tras cambios. No es un plano arquitectónico ni un verificador de accesibilidad.

`accessibilityNeeds` admite `wheelchair_space`, `step_free_access`, `highchair`; silla alta y espacio de silla de ruedas son excluyentes y requieren plaza. `shareDietaryRestriction` es false por defecto; sólo su autorización permite incluir la restricción en catering. Las notas privadas no se entregan a invitados ni se sobrescriben por un RSVP legado.

`acquisitionSource` sólo acepta `direct`/`guest_attribution`; se guarda al crear, no se edita ni se restaura desde backups, y no se entrega a pareja/invitados. Es fuente declarada, no atribución causal. La comprobación de POST/start y sus cinco intentos se hace en almacenamiento local aislado durante QA.


## Admisión y recuperación de la beta pública

Producción continúa cerrada por defecto. Para admitir altas hacen falta **todas** estas condiciones de servidor: `NODE_ENV=production`, `BODA_STUDIO_SELF_SERVE_ENABLED=true`, `BODA_STUDIO_PILOT_MAX_EVENTS` entero explícito entre 1 y 1000 y Blob privado configurado. La cohorte de salida propuesta por Manuel es **10 eventos**; este código no modifica variables ni habilita producción. Desarrollo conserva pruebas locales (máximo 100 si no se configura otro techo). Un valor explícito `BODA_STUDIO_SELF_SERVE_ENABLED=false` pausa nuevas altas en cualquier entorno. Pausar no bloquea paneles, RSVP, recuperación ni eliminación de bodas existentes.

La cohorte se reserva con CAS antes de persistir un evento. Fallos inciertos no liberan cupos automáticamente: pueden corresponder a una creación confirmada en almacenamiento cuya respuesta se perdió. Los borrados conservan una reserva mínima marcada eliminada (ID opaco y fecha, sin nombres, fotos o credenciales); no reabren el cupo y el requestId antiguo no recrea datos eliminados. Para ampliar cupos o reconciliar una reserva abandonada hace falta revisar evidencia operativa, sin borrar contadores a ciegas. Los espacios asistidos por operador no consumen el cupo de autoservicio. Preview/QA debe usar su propio prefijo y cuota, sin modificar reservas del piloto real.

El cliente público envía `requestId` UUID v4 estable, que puede conservar en sessionStorage: no es una credencial. El servidor lo asocia a un evento opaco y una reserva. Con el mismo requestId y contraseña correcta, un reintento devuelve ese evento sin reinicializar contenido ni gastar otro cupo; genera otra sesión y clave, invalidando las anteriores. El cliente debe conservar el comprobante de la última respuesta exitosa. La compatibilidad sin requestId existe para clientes anteriores, pero **no ofrece idempotencia**. Con cohorte llena o altas explícitamente pausadas puede recuperarse un intento ya persistido mediante el mismo requestId y la contraseña correcta; no se crea un evento ni una reserva nueva. Un requestId nuevo sigue cerrado durante la pausa. Sin almacenamiento configurado, incluso la recuperación del intento falla sin fallback.

La clave de recuperación tiene 32 bytes aleatorios (base64url de 43 caracteres), sólo SHA-256 persistido, y se devuelve exclusivamente en alta/reintento, recuperación o `recovery_rotate`. El comprobante contiene enlace del panel, ID y clave. Clave y contraseña no van en URL, logs, sessionStorage/localStorage, GET del evento ni backup operativo. La UI debe permitir descargar/imprimir antes de abandonar el resultado; una persona con ese comprobante puede tomar control del evento. Recuperar exige clave y nueva contraseña, rota la clave y revoca sesiones. Los backups operativos no restauran claves antiguas. Si se pierden contraseña **y** clave no existe recuperación automática por email en esta versión; no prometerla.

`activation.firstPublishedAt` y `activation.firstRsvpAt` se escriben una sola vez en el evento servidor. No forman parte del DTO de pareja/invitación ni del business snapshot, y se conservan en restore/rollback. El listado de operador y el reporte agregado del piloto pueden leerlas. La segunda marca significa primera respuesta RSVP guardada; no implica pago ni asistencia confirmada. Eventos anteriores sin marcas son historia desconocida, no cero actividad verificado.

El borrado elimina el objeto del evento y con él personas, fotos, publicación, instantáneas y credenciales. Requiere sesión autorizada, contraseña actual y revisión vigente. No elimina archivos que la pareja haya descargado, ni declara borradas copias internas retenidas por el proveedor. No hay eliminación programada por fecha; la política/continuidad del piloto se comunica en la página de privacidad. Las instantáneas y el backup manual no constituyen recuperación de infraestructura ante pérdida completa del proveedor.

Verificación nueva: `node --no-warnings --experimental-strip-types scripts/check-boda-launch.mjs`, **15 casos funcionales sintéticos**, evidencia `artifacts/bodas-launch-2026-09-08/backend-tests.json`: configuración cerrada, namespaces, almacenamiento fallido, alta con sesión, reintentos/concurrencia/cupo, recuperación positiva/negativa, rotación legado, cardinalidad de ratekeys, historial, activación y borrado CAS. Sumados a 38 regresiones y ESLint. La prueba propia usa sólo almacenamiento temporal local; el integrador realiza el recorrido HTTP/navegador y el ensayo de nube antes de liberar.
