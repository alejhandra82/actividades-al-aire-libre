import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../models/actividad';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})
export class ActividadService {

  private apiUrl = 'http://localhost:8888/api/actividades'; 
 
  constructor(private http: HttpClient) { }

  // Obtener todas las actividades
  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.apiUrl);
  }

  // Obtener una actividad por ID
  getActividadById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/${id}`);
  }
   
  // Crear una nueva actividad. Esta funcionaba sin imagen
  crearActividad(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(this.apiUrl, actividad); }

  // Actualizar una actividad existente
    actualizarActividad(id: number, actividad: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/${id}`, actividad); }

  // Eliminar una actividad
  eliminarActividad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

subirFotoActividad(id: number, file: File): Observable<string> {
  const formData = new FormData();
  formData.append("file", file);

  return this.http.post(`${this.apiUrl}/${id}/foto`, formData, { responseType: 'text' } );
}

obtenerFotoActividad(idActividad: number): Observable<string> {
  return this.http.get(`${this.apiUrl}/${idActividad}/foto`, { responseType: 'text' });
}

//Foto Default
obtenerFotoDefault(): Observable<string> {
  return this.http.get(`${this.apiUrl}/foto/default`, { responseType: 'text' });
}
}




