# Mi Ciudad · Grupo 84

Aplicación móvil de la guía turística de Colón, desarrollada con React Native, Expo y TypeScript. El código de la app está en `src/`; el backend del profesor se obtiene y ejecuta por separado.

## Requisitos

- Node.js 24 y npm para la app.
- API `api-mi-ciudad` del profesor y pnpm 10.33.0 mediante Corepack para el backend.
- Para probar en un teléfono: Expo Go compatible con el SDK 57 del proyecto y la misma Wi-Fi que la computadora.

## Primera configuración

1. Obtené la API del profesor desde el material de la materia y seguí la [preparación de la API local](docs/API-LOCAL.md#preparar-la-api-por-primera-vez). La guía explica cómo instalar dependencias, configurar SQLite y cargar los datos de demo sin reiniciar una base existente.
2. En la carpeta de este proyecto, ejecutá en PowerShell:

   ```powershell
   npm ci
   Copy-Item .env.example .env.local
   ```

   Copiá el archivo de entorno solamente si todavía no tenés `.env.local`.

3. Editá `.env.local` con la IP Wi-Fi de tu computadora (consultala con `ipconfig`):

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

   La IP es un ejemplo: reemplazala por la tuya. No agregues `/api` ni `/salud` a la URL base. En un teléfono físico, `localhost` apunta al propio teléfono. `.env.local` está ignorado por Git; las variables `EXPO_PUBLIC_*` son públicas y no deben contener secretos.

## Arrancar para trabajar

Mantené abiertas dos terminales:

1. **En la carpeta de la API:**

   ```powershell
   corepack pnpm dev
   ```

2. Abrí `http://TU_IP_WIFI:3000/salud` en el navegador del teléfono. Debe mostrar `datos.estado` igual a `"ok"`.
3. **En la carpeta del proyecto móvil:**

   ```powershell
   npm start -- --go --lan
   ```

   Escaneá el QR con Expo Go. Si cambiás la IP en `.env.local`, reiniciá Expo y recargá la app.

Detené cada proceso con `Ctrl+C`. Para volver a arrancar no hace falta reinstalar dependencias ni recrear la base.

## Documentación

- [API local: instalación, conexión, endpoints y solución de problemas](docs/API-LOCAL.md).
- [Swagger de la API](http://localhost:3000/docs) y [contrato OpenAPI](http://localhost:3000/docs-json), disponibles mientras el backend está ejecutándose. Desde el teléfono, reemplazá `localhost` por la IP de la computadora.
- El README y los archivos `contract/types.ts` y `contract/api.ts` del backend son las referencias originales del profesor.
