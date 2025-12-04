import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opiniones } from '../models/opiniones';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpinionService {

 private apiUrl = `${environment.apiUrl}/opiniones`; 

  constructor(private http: HttpClient) { }

  // Obtener todas las opiniones
  getOpiniones(): Observable<Opiniones[]> {
    return this.http.get<Opiniones[]>(this.apiUrl);
  }

  // Obtener opiniones por actividad
  getOpinionesPorActividad(idActividad: number): Observable<Opiniones[]> {
    return this.http.get<Opiniones[]>(`${this.apiUrl}/actividad/${idActividad}`);
  }

  // Obtener opiniones destacadas (para home)
  getDestacadas(): Observable<Opiniones[]> {
    return this.http.get<Opiniones[]>(`${this.apiUrl}/destacadas`);
  }

  //Crear una nueva opinión
  crearOpinion(opinion: Opiniones): Observable<Opiniones> {
    return this.http.post<Opiniones>(this.apiUrl, opinion);
  }

  //Actualizar una opinión existente
  actualizarOpinion(idOpinion: number, opinion: Opiniones): Observable<Opiniones> {
    return this.http.put<Opiniones>(`${this.apiUrl}/${idOpinion}`, opinion);
  }

  // Eliminar una opinión por ID
  eliminarOpinion(idOpinion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idOpinion}`);
  }

  //Eventos por Actividad
  getEventosPorActividad(idActividad: number) {
  return this.http.get<any[]>(`${environment.apiUrl}/eventos/actividad/${idActividad}`);
}
 // Obtener opiniones por familia
  getOpinionesPorFamilia(idFamilia: number): Observable<Opiniones[]> {
    return this.http.get<Opiniones[]>(`${this.apiUrl}/familias/${idFamilia}`);
  }
}
