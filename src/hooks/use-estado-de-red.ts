import { useNetworkState } from "expo-network";

export function useEstadoDeRed() {
  const estadoDeLaRed = useNetworkState();
  const hayInternet =
    estadoDeLaRed.isConnected !== false &&
    estadoDeLaRed.isInternetReachable !== false;

  return { hayInternet };
}
