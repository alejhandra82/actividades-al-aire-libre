
export interface Familia {
  idFamilia: number;
  nombreFamilia: string;
 correoElectronico: string;
}

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  correo: string;
  contrasena: string; // Solo si se usa en login
  rol: string;         // "MIEMBRO" o "ADMIN"
  fotoPerfil?: string; 
  familiaDTO?: Familia | null; // opcional
}
