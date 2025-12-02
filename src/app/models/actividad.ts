export interface TipoActividad {
  idTipoActividad: number;
  nombreTipoActividad: string;
}

export interface Actividad {
  idActividad: number;
  nombreActividad: string;
  descripcion: string;
  ubicacion: string;
  tipoActividadDTO: TipoActividad;
  duracion: number;              // Duración en minutos
  dificultad: string;            // Fácil, Media, Difícil
  precio: string;                // Ej: "Gratuito" o "10€"
  materialRecomendado: string;   // Texto libre
  imagenPrincipal?: string;        // URL de la imagen principal
  imagenUrl?: string;
  }
