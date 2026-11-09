import type { Evento } from "@/tipos/evento";

export const eventosMock: Evento[] = [
  {
    id: "evt-017",
    titulo: "Peña en el anfiteatro",
    descripcion: "Noche de folclore con artistas de la región.",
    lugarId: "lug-009",
    direccionLibre: null,
    coordenadas: null,
    inicio: "2026-11-14T21:00:00-03:00",
    fin: "2026-11-15T02:00:00-03:00",
    imagenUrl: "https://ejemplo.com/img/pena.jpg",
    precio: 0,
    estado: "programado",
  },
  {
    id: "evt-018",
    titulo: "Feria de artesanos en la costanera",
    descripcion: "Puestos de artesanías locales.",
    lugarId: null,
    direccionLibre: "Costanera, frente a la playa Piedras Coloradas",
    coordenadas: { latitud: -32.2241, longitud: -58.1302 },
    inicio: "2026-11-14T17:00:00-03:00",
    fin: null,
    imagenUrl: null,
    precio: null,
    estado: "suspendido",
  },
  {
    id: "evt-019",
    titulo:
      "Visita guiada nocturna al Palacio San José con recorrido completo por las galerías, la capilla y los jardines históricos",
    descripcion: "Recorrido de dos horas con guía.",
    lugarId: "lug-003",
    direccionLibre: null,
    coordenadas: null,
    inicio: "2026-11-15T20:00:00-03:00",
    fin: "2026-11-15T22:00:00-03:00",
    imagenUrl: null,
    precio: 5000,
    estado: "cancelado",
  },
];
