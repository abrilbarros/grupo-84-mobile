import { setAudioModeAsync } from "expo-audio";

export async function permitirReproduccionEnSegundoPlano(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
  });
}
