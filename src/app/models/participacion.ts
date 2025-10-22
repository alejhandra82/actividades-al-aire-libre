export interface Participacion {
  idParticipacion?: number; // opcional al crear
  estado?: string;
  fechaParticipacion?: Date;
  familiaDTO: {
    idFamilia: number;
    nombreFamilia?: string;
  };
  eventoDTO: {
    idEvento: number;
    nombreEvento?: string;
  };
}
