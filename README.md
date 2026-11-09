# Mi Ciudad · Grupo 84

Aplicación móvil de la guía turística de Colón, desarrollada con React Native, Expo y TypeScript. La app y la API del profesor se ejecutan en carpetas separadas.

## Qué necesitás

- Node.js 24 y npm.
- La API `api-mi-ciudad` del profesor y Corepack para ejecutarla con pnpm.
- Expo Go compatible con SDK 57 en tu teléfono.
- El teléfono y la computadora conectados a la misma Wi-Fi.

## Preparar el proyecto por primera vez

1. Prepará el backend siguiendo la [guía de la API local](docs/API-LOCAL.md#preparar-la-api-por-primera-vez).
2. En PowerShell, dentro de la carpeta del proyecto móvil, ejecutá:

   ```powershell
   npm ci
   if (-not (Test-Path .env.local)) {
       Copy-Item .env.example .env.local
   }
   ```

3. Consultá la IP Wi-Fi de tu computadora con `ipconfig` y escribila en `.env.local`:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

   Reemplazá la IP de ejemplo por la tuya. No agregues `/api` ni `/salud`. Desde el teléfono, `localhost` apunta al propio celular.

   `.env.local` no se sube al repositorio. Las variables `EXPO_PUBLIC_*` son públicas: no pongas contraseñas, secretos ni tokens.

## Iniciar la aplicación

Mantené abiertas dos terminales:

1. En la carpeta de la API:

   ```powershell
   corepack pnpm dev
   ```

2. En la carpeta del proyecto móvil:

   ```powershell
   npm start -- --go --lan
   ```

Escaneá el QR con Expo Go. Para detener los servidores, usá `Ctrl+C` en cada terminal. No necesitás reinstalar dependencias ni recrear la base en cada arranque.

## Comprobar la conexión

Abrí `http://TU_IP_WIFI:3000/salud` en el navegador del teléfono, reemplazando `TU_IP_WIFI` por la IP de tu computadora. Debe mostrar `datos.estado` igual a `"ok"`.

Después probá iniciar sesión en la app con una cuenta de demo del README del backend. Si cambia tu IP, actualizá `.env.local`, reiniciá Expo y recargá la app.

## Más información

- [Preparación de la API y problemas frecuentes](docs/API-LOCAL.md).
- [Swagger: endpoints y datos que recibe la API](http://localhost:3000/docs), disponible con el backend encendido. Desde el teléfono, reemplazá `localhost` por la IP de la computadora.
