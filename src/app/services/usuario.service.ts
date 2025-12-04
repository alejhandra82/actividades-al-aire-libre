import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { environment } from '../../environments/environment';

export interface LoginDTO {
  correo: string;
  contrasena: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}`; 

  constructor(private http: HttpClient) { }

  /**
   * Llama al endpoint de login en Spring Boot
   * Devuelve un Usuario con todos los campos
   
  iniciarSesion(credenciales: { correo: string; contrasena: string }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, credenciales );
}*/
iniciarSesion(credenciales: { correo: string; contrasena: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credenciales, { observe: 'response', responseType: 'text' as 'json' });
}
  //Obtener todos los usuarios (ejemplo)   
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<Usuario> {
  return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
}
  
   // Crear nuevo usuario   
  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  /**
 * Actualiza un usuario existente
 * @param id Id del usuario a actualizar
 * @param usuario Datos del usuario actualizados
 */
actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
  return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${id}`, usuario);
}

eliminarUsuario(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
}

getFamilias(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/familias`);
}

subirFoto(idUsuario: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/usuarios/${idUsuario}/foto`, formData, { responseType: 'text' });
}

getFotoUsuario(idUsuario: number) {
  return this.http.get(`${this.apiUrl}/usuarios/${idUsuario}/foto`, { responseType: 'text' });
}

 //Foto Default
obtenerFotoDefault(): Observable<string> {
  return this.http.get(`${this.apiUrl}/usuarios/foto/default`, { responseType: 'text' });
}
asignarFamilia(idUsuario: number, idFamilia: number) {
  return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${idUsuario}/asignar-familia/${idFamilia}`, null);
}

}
