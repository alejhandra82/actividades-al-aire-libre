import { Actividad } from './actividad';


export interface Localizacion {
  idLocalizacion?: number;
  latitud: number;
  longitud: number;
  direccion: string;
  actividadDTO: Actividad;
}