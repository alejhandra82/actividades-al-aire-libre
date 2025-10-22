import { Usuario } from './usuario';

export interface Familia {
  idFamilia: number;
  nombreFamilia: string;
  correoElectronico: string;
  descripcion?: string;
  fotoFamilia?: string;
  miembros?: Usuario[];
  // listaOpinionesActividadesDTO?: any[]; // Podemos implementarlo más adelante si lo necesitamos
}
