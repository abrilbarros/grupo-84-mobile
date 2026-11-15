import type { Visita } from "@/tipos/visita";
import type { DatosParaGuardarVisitaEnElTelefono } from "../modelos/datos-para-guardar-visita-en-el-telefono";
import { generarIdentificadorDeVisita } from "../utilidades/generar-identificador-de-visita";
import { guardarFotografiaEnElTelefono } from "./almacenamiento-de-fotografias";
import { guardarVisitaLocal } from "./repositorio-de-visitas";

export async function guardarVisitaEnElTelefono(
  datosDeLaVisita: DatosParaGuardarVisitaEnElTelefono,
): Promise<Visita> {
  const identificadorDeLaVisita = generarIdentificadorDeVisita();
  const direccionDeLaFotografia =
    datosDeLaVisita.direccionTemporalDeLaFotografia === null
      ? null
      : await guardarFotografiaEnElTelefono(
          datosDeLaVisita.direccionTemporalDeLaFotografia,
          identificadorDeLaVisita,
        );

  const visita: Visita = {
    id: identificadorDeLaVisita,
    usuarioId: datosDeLaVisita.usuarioId,
    lugarId: datosDeLaVisita.lugarId,
    fechaHora: new Date().toISOString(),
    origen: datosDeLaVisita.origen,
    fotoUri: direccionDeLaFotografia,
    nota: datosDeLaVisita.nota,
    sincronizada: false,
  };

  await guardarVisitaLocal(visita);
  return visita;
}
