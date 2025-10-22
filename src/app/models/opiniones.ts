import { Actividad } from './actividad';
import { Familia } from './familia';

export interface Opiniones {
  idOpinion?: number;
  comentario: string;
  puntuacion: number;       
  fechaOpinion?: string;     
  actividadDTO?: Actividad;  
  familiaDTO?: Familia;        
}