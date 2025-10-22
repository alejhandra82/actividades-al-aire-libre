export interface Evento {
  idEvento: number;
  nombreEvento: string;
  descripcionEvento: string;
  fechaEvento: string;
  actividadDTO: {
    idActividad: number;
    nombreActividad: string;
  };
}
