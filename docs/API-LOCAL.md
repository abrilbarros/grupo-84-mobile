# Preparar la API local

Esta guía es para PowerShell en Windows. La API del profesor se obtiene por separado y se ejecuta en su propia carpeta.

## Preparar la API por primera vez

1. Obtené `api-mi-ciudad` desde el repositorio o archivo que compartió el profesor y abrí PowerShell en esa carpeta.
2. Comprobá que tengas Node.js 24 y Corepack:

   ```powershell
   node --version
   corepack --version
   ```

3. Instalá las dependencias:

   ```powershell
   corepack pnpm install --frozen-lockfile
   ```

   El proyecto del profesor selecciona pnpm 10.33.0. Este comando respeta su archivo de dependencias.

4. Copiá el ejemplo de configuración, sin sobrescribir uno existente:

   ```powershell
   if (-not (Test-Path .env)) {
       Copy-Item .env.example .env
   }
   ```

5. Para el entorno local con SQLite, revisá estos valores en `.env`. Conservá las demás variables del ejemplo del profesor:

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

   Esta configuración de desarrollo crea las tablas y carga la demo si todavía no hay usuarios. No hace falta instalar otro servidor de base de datos ni importar un archivo SQL.

   El secreto JWT del ejemplo es para desarrollo: queda en el backend y no se copia al móvil ni se publica.

6. Iniciá la API:

   ```powershell
   corepack pnpm dev
   ```

7. Abrí [http://localhost:3000/salud](http://localhost:3000/salud) en la computadora. Debe mostrar `datos.estado` igual a `"ok"`.

Para conectar la app y comprobar el acceso desde el teléfono, seguí el [README del proyecto móvil](../README.md#comprobar-la-conexión).

## Volver a iniciar otro día

En la carpeta de la API, ejecutá:

```powershell
corepack pnpm dev
```

Detenela con `Ctrl+C`. La base permanece en `datos/api.sqlite` y los archivos en `archivos/`.

**No uses `corepack pnpm db:reiniciar` para arrancar:** ese comando borra los datos y vuelve a cargar la demo.

## Problemas frecuentes

| Problema                                 | Qué revisar                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack` no se reconoce                | Necesitás instalar Corepack para tu instalación de Node y volver a abrir la terminal.                                                    |
| El puerto 3000 está ocupado              | Detené la otra instancia de la API antes de volver a iniciarla.                                                                          |
| El celular no abre `/salud`              | Comprobá misma Wi-Fi, IP actual y API encendida. Si el firewall bloquea Node.js, permitilo en redes privadas; no desactives el firewall. |
| Cambió la IP de la computadora           | Actualizá `.env.local` del móvil, reiniciá Expo y recargá la app.                                                                        |
| `/salud` funciona pero la app no conecta | Revisá que `EXPO_PUBLIC_API_URL` tenga `http://`, IP y puerto correctos, sin `/api`.                                                     |
| Expo funciona por túnel pero la API no   | El túnel de Expo no publica el backend. El teléfono necesita llegar a la IP de la computadora.                                           |
| Falla la instalación de SQLite           | Comprobá Node.js 24 y reinstalá las dependencias del backend con el comando de esta guía.                                                |
| La sesión venció o aparece un error 401  | Volvé a ingresar con correo y contraseña. La huella no renueva el token.                                                                 |

## Consultar la API

Con el backend encendido, abrí [Swagger](http://localhost:3000/docs). Ahí están los endpoints, campos y errores. Para las cuentas de demo y otras configuraciones, consultá el README original del backend.

Para integrar nuevos módulos: el servicio HTTP del móvil ya admite respuestas `204 No Content` sin intentar leer JSON y conserva el procesamiento de las respuestas JSON.
