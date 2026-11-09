# API Mi Ciudad: entorno local

Guía para que cada integrante ejecute la API del profesor y conecte la app desde su teléfono. Los comandos están escritos para PowerShell en Windows. El backend y el proyecto móvil son carpetas independientes.

Esta guía adapta el registro local del 8 de noviembre de 2026. La configuración y las referencias de código se revisaron el 9 de noviembre de 2026; las pruebas históricas se detallan al final.

## Preparar la API por primera vez

1. Obtené `api-mi-ciudad` desde el repositorio o archivo que compartió el profesor. Este repositorio móvil no incluye el backend. Extraelo o clonalo en una carpeta propia y abrí una terminal allí:

   ```powershell
   cd C:\ruta\a\api-mi-ciudad
   node --version
   corepack --version
   corepack pnpm --version
   ```

   Reemplazá la ruta por la ubicación real. La API declara Node `>=24`; el entorno original se preparó con Node 24.21.0. Su `package.json` fija pnpm 10.33.0. Usamos `corepack pnpm` para respetar esa versión: en el entorno original, `pnpm` a secas resolvía a otra versión. Si `corepack` no se reconoce, instalalo antes de continuar y volvé a abrir la terminal.

2. Instalá las dependencias sin cambiar el lockfile:

   ```powershell
   corepack pnpm install --frozen-lockfile
   ```

3. Si todavía no existe `.env`, copiá el ejemplo **del backend**:

   ```powershell
   Copy-Item .env.example .env
   ```

   Si ya existe, revisalo sin sobrescribir tu configuración. Para reproducir el entorno local, conservá los valores de desarrollo del ejemplo y cambiá `SEMBRAR_SI_VACIA` a `true`. Los valores relevantes son:

   ```dotenv
   ENTORNO=desarrollo
   PUERTO=3000
   DB_MOTOR=better-sqlite3
   DB_ARCHIVO=datos/api.sqlite
   DB_SINCRONIZAR=true
   SEMBRAR_SI_VACIA=true
   ARCHIVOS_PROVEEDOR=local
   DIRECTORIO_ARCHIVOS=archivos
   URL_PUBLICA=
   ```

   Conservá también las demás variables del ejemplo, incluido su secreto JWT de desarrollo. Ese secreto se usa solamente para desarrollo y queda en el backend.

4. Arrancá la API:

   ```powershell
   corepack pnpm dev
   ```

   `DB_SINCRONIZAR=true` genera las tablas desde las entidades. `SEMBRAR_SI_VACIA=true` usa el mecanismo existente para cargar datos de demo cuando la base está vacía; si ya tiene datos, no los reinicia.

5. Abrí [salud](http://localhost:3000/salud) en la computadora y verificá `datos.estado: "ok"`.

Este modo usa SQLite y archivos locales: no requiere Docker, XAMPP, MySQL, PostgreSQL, importar SQL ni ejecutar migraciones. Para otros motores o Docker, consultá el README original de la API.

El backend usa NestJS, TypeORM, better-sqlite3, JWT, class-validator y Swagger. En el entorno original se registraron NestJS 12.1.1, TypeORM 1.1.1 y better-sqlite3 12.11.1; las dependencias reproducibles están en el lockfile del backend.

## Arranques posteriores

En la carpeta de la API:

```powershell
corepack pnpm dev
```

Alternativa sin vigilancia de cambios:

```powershell
corepack pnpm build
corepack pnpm start
```

Detené el proceso con `Ctrl+C`. La base queda en `datos/api.sqlite` y los archivos en `archivos/` entre arranques.

**No uses `corepack pnpm db:reiniciar` como paso habitual:** borra los datos y vuelve a cargar la demo. No fue necesario para la preparación documentada.

Documentación mientras la API está ejecutándose:

- [Swagger](http://localhost:3000/docs).
- [OpenAPI en JSON](http://localhost:3000/docs-json).

## Conectar Android y Expo Go

La API revisada escucha en `0.0.0.0` y habilita CORS.

1. Conectá el teléfono y la computadora a la misma Wi-Fi y mantené la API ejecutándose.
2. Ejecutá `ipconfig` y buscá la dirección IPv4 del adaptador Wi-Fi conectado. Evitá las IP de adaptadores virtuales o desconectados.
3. Abrí en el navegador **del teléfono** `http://TU_IP_WIFI:3000/salud`. Debe devolver `datos.estado: "ok"`. Probarlo desde la propia computadora no confirma acceso desde el celular.
4. En la carpeta del proyecto móvil, instalá las dependencias y copiá su ejemplo de entorno si todavía no tenés `.env.local`:

   ```powershell
   npm ci
   Copy-Item .env.example .env.local
   ```

5. Editá `.env.local` del móvil:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

   Reemplazá la IP de ejemplo por la de tu computadora. La URL base no lleva `/api`: los endpoints no tienen ese prefijo.

6. En esa misma carpeta, arrancá Expo en otra terminal:

   ```powershell
   npm start -- --go --lan
   ```

   Escaneá el QR con Expo Go compatible con el SDK 57 del proyecto. Si cambiás `.env.local`, reiniciá Expo y recargá la app.

En un teléfono físico no uses `localhost`, `127.0.0.1` ni `10.0.2.2`: esta última dirección corresponde al acceso al host desde el emulador Android estándar. El túnel de Expo sirve a Metro; no publica automáticamente el backend del puerto 3000.

Con `URL_PUBLICA` vacía, la API arma las URLs de fotos y audios a partir del origen de la petición. Usar la IP accesible desde el teléfono permite que esos recursos apunten a la computadora.

### Archivos de entorno y estado de la integración

- **Backend:** `.env` contiene la configuración de la API. Su `.gitignore` excluye `.env`, datos, archivos, `dist` y `node_modules`.
- **Móvil:** `.env.example` es compartido; `.env.local` contiene la URL de cada integrante y está ignorado por Git.
- `EXPO_PUBLIC_*` es público. Incluí solamente la URL, nunca secretos del backend ni tokens de sesión.
- `src/servicios/api.ts` lee `process.env.EXPO_PUBLIC_API_URL`. `src/servicios/cuenta.ts` ya consume `/auth/ingreso`, `/auth/registro` y `/yo`; el contexto de sesión recupera al usuario con `/yo`. No todas las pantallas están necesariamente integradas.
- Los contratos originales están en `contract/types.ts` y `contract/api.ts` del backend. La app ya tiene tipos propios en `src/tipos/`; contrastalos con el contrato al agregar servicios.

## Endpoints y contrato

Las rutas no tienen prefijo `/api`. Respuestas habituales:

```json
{ "datos": {}, "meta": null }
```

Las listas incluyen `datos` y `meta` con paginación (`total`, `pagina`, `porPagina`). Los parámetros de consulta son `pagina` y `porPagina`. Los errores tienen esta forma:

```json
{
  "error": {
    "codigo": "NO_AUTENTICADO",
    "mensaje": "Tenés que ingresar con tu cuenta para hacer esto."
  }
}
```

Un DELETE exitoso devuelve `204` sin cuerpo: el consumidor no debe intentar leer JSON de esa respuesta. Consultá Swagger para los campos, filtros, validaciones y errores completos de cada operación.

| Método      | Ruta                                              | Sesión / propósito                                                              |
| ----------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| POST        | `/auth/registro`                                  | Público. JSON: `nombre`, `email`, `contrasena` (8 a 200 caracteres).            |
| POST        | `/auth/ingreso`                                   | Público. JSON: `email`, `contrasena`. Devuelve `datos.token` y `datos.usuario`. |
| GET, PATCH  | `/yo`                                             | Bearer. Consultar o editar el usuario propio.                                   |
| GET         | `/yo/favoritos`                                   | Bearer. Lista de `Favorito` con `lugarId`, sin detalles completos del lugar.    |
| PUT, DELETE | `/yo/favoritos/:lugarId`                          | Bearer. Marcar (201/200) o quitar (204).                                        |
| GET         | `/categorias`                                     | Público.                                                                        |
| GET         | `/lugares`, `/lugares/:id`, `/lugares/qr/:codigo` | Público. Catálogo, detalle y QR.                                                |
| GET         | `/eventos`, `/eventos/:id`                        | Público. Agenda y detalle.                                                      |
| PATCH       | `/eventos/:id/estado`                             | Bearer, administrador.                                                          |
| GET         | `/yo/eventos-guardados`                           | Bearer.                                                                         |
| PUT, DELETE | `/yo/eventos-guardados/:eventoId`                 | Bearer.                                                                         |
| GET, POST   | `/yo/visitas`                                     | Bearer. Recorrido.                                                              |
| PATCH       | `/yo/visitas/:id`                                 | Bearer.                                                                         |
| POST        | `/archivos`                                       | Bearer, `multipart/form-data`, campo `archivo`.                                 |
| GET         | `/archivos/:clave`                                | Público. La clave puede tener subdirectorios.                                   |
| POST        | `/dispositivos`, `/dispositivos/prueba`           | Bearer. Pendiente de implementar en la API del profesor revisada.               |
| DELETE      | `/dispositivos/:tokenExpo`                        | Bearer. Pendiente de implementar.                                               |
| GET         | `/salud`                                          | Público.                                                                        |

La sesión se envía con `Authorization: Bearer <token>` y dura 30 días. No se encontró endpoint de refresh, cierre de sesión ni listado público de usuarios en la versión revisada. El cierre de sesión de la app elimina la sesión local.

Para ingresar con datos de demo, consultá la sección **Usuarios de demo** del README del backend; las cuentas existen después de la siembra.

Los endpoints de dispositivos responden `501 NO_IMPLEMENTADO` con una sesión válida. `docs/NOTIFICATIONS.md` y `src/student-notifications` del backend explican el ejercicio pendiente. Arrancar la API no implementa esas funciones.

## Problemas frecuentes

| Problema                                               | Qué revisar                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| El celular no abre `/salud`                            | Misma Wi-Fi, API encendida, IP actual, puerto correcto y ausencia de aislamiento de clientes en el router.                |
| Bloqueo del firewall                                   | Permitir Node.js en redes privadas desde el firewall de Windows. No hace falta desactivar el firewall.                    |
| Cambió la IP                                           | Consultar `ipconfig`, actualizar `.env.local`, reiniciar Expo y recargar la app.                                          |
| `EADDRINUSE` / puerto 3000 ocupado                     | Detener la instancia anterior. Si usás otro `PUERTO` en el backend, actualizar también la URL móvil y las URLs de prueba. |
| `corepack` no se reconoce                              | Instalar Corepack para la instalación de Node utilizada y volver a abrir la terminal.                                     |
| `pnpm` usa otra versión                                | Ejecutar `corepack pnpm` desde la carpeta de la API, cuyo `package.json` fija la versión.                                 |
| Falla el binario de SQLite                             | Confirmar Node 24 y reinstalar las dependencias del backend con el lockfile original.                                     |
| La API pide una variable de entorno                    | Revisar el `.env` del backend contra su `.env.example`.                                                                   |
| La app no conecta pero `/salud` funciona en el celular | Revisar `EXPO_PUBLIC_API_URL`, incluido `http://`, IP y puerto; reiniciar Expo tras cambiarla.                            |
| Expo funciona por túnel pero la API no                 | El túnel de Expo no expone la API; verificar acceso directo a la IP de la computadora.                                    |
| Respuesta `401`                                        | Revisar credenciales o token Bearer; si venció, ingresar de nuevo.                                                        |
| Dispositivos devuelve `501`                            | Es la funcionalidad pendiente del backend revisado, no un problema de instalación.                                        |

## Verificaciones conocidas y límites

Las siguientes pruebas corresponden al **8 de noviembre de 2026 en un entorno de un integrante**; no son comprobaciones ejecutadas en la computadora de cada compañero:

- Instalación de dependencias con pnpm 10.33.0, compilación y arranque real correctos; binario SQLite instalado. No se modificó el código ni el lockfile del backend.
- SQLite nueva con 3 usuarios, 8 categorías, 27 lugares (26 activos) y 8 eventos de demo.
- HTTP 200 en `/salud`, `/categorias`, `/lugares`, `/eventos` y `/docs-json` desde la computadora.
- Ingreso de demo correcto; `/yo` devolvió `usr-201` y `/yo/favoritos`, 3 favoritos. Sin token, `/yo` devolvió 401. Imagen de demo descargada por la IP Wi-Fi con HTTP 200.
- El usuario confirmó `/salud` con estado `ok` desde el navegador de su Android en la misma Wi-Fi. No se cambió automáticamente el firewall.
- No se probaron escrituras, registro de cuentas nuevas, todos los endpoints, otros motores, Docker, nube ni push. No se ejecutaron resets de base de datos.
- En esa verificación todavía no había peticiones desde las pantallas de la app. Esa descripción quedó desactualizada: al revisar el código el 9 de noviembre ya existen los servicios de cuenta mencionados arriba. En esta actualización de documentación no se volvió a probar el flujo completo en Expo Go ni se implementaron funcionalidades.

Para validar tu propia instalación: comprobá `/salud` desde la computadora y desde el teléfono, y después probá el ingreso en la app con una cuenta de demo. Que funcione en una computadora no verifica automáticamente otra instalación.
