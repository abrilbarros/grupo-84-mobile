import * as Network from "expo-network";

// Comprueba si el dispositivo tiene conexión a internet.
export async function hayConexion(): Promise<boolean> {
  const estado = await Network.getNetworkStateAsync();

  return (
    estado.isConnected === true &&
    estado.isInternetReachable !== false
  );
}

