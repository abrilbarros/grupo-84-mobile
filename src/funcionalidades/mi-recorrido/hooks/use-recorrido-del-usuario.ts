import { useCallback, useEffect, useRef, useState } from "react";
import { useEstadoDeRed } from "@/hooks/use-estado-de-red";
import type { Visita } from "@/tipos/visita";
import { listarVisitasLocales } from "../servicios/repositorio-de-visitas";
import { sincronizarRecorrido } from "../servicios/sincronizacion-del-recorrido";

export function useRecorridoDelUsuario(
  token: string | null,
  identificadorDelUsuario: string | null,
) {
  const { hayInternet } = useEstadoDeRed();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const usuarioVigente = useRef<string | null>(identificadorDelUsuario);
  const teniaInternetAntes = useRef(hayInternet);

  const recargar = useCallback(async () => {
    if (token === null || identificadorDelUsuario === null) {
      setVisitas([]);
      setEstaCargando(false);
      return;
    }

    async function mostrarVisitasGuardadas(identificadorDelUsuarioActual: string) {
      const visitasGuardadas = await listarVisitasLocales(identificadorDelUsuarioActual);
      if (usuarioVigente.current === identificadorDelUsuarioActual) {
        setVisitas(visitasGuardadas);
      }
    }

    try {
      await mostrarVisitasGuardadas(identificadorDelUsuario);
    } finally {
      setEstaCargando(false);
    }

    try {
      await sincronizarRecorrido(token, identificadorDelUsuario);
      await mostrarVisitasGuardadas(identificadorDelUsuario);
    } catch {
      return;
    }
  }, [token, identificadorDelUsuario]);

  useEffect(() => {
    usuarioVigente.current = identificadorDelUsuario;
    setVisitas([]);
    setEstaCargando(true);
    recargar().catch(() => setEstaCargando(false));
  }, [identificadorDelUsuario, recargar]);

  useEffect(() => {
    if (hayInternet && !teniaInternetAntes.current) {
      recargar().catch(() => undefined);
    }
    teniaInternetAntes.current = hayInternet;
  }, [hayInternet, recargar]);

  return { visitas, estaCargando, recargar };
}
