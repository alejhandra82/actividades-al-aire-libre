import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Localizacion } from '../models/localizaciones';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocalizacionService {
  private apiUrl = `${environment.apiUrl}/localizaciones`; 

  constructor(private http: HttpClient) {}

  //Listar todas las localizaciones
  getAll(): Observable<Localizacion[]> {
    return this.http.get<Localizacion[]>(this.apiUrl);
  }

  //Obtener una localización por ID
  getById(id: number): Observable<Localizacion> {
    return this.http.get<Localizacion>(`${this.apiUrl}/${id}`);
  }

  //Obtener localizaciones por actividad
  getByActividad(idActividad: number): Observable<Localizacion[]> {
    return this.http.get<Localizacion[]>(
      `${this.apiUrl}/actividad/${idActividad}`
    );
  }

  //Crear nueva localización
  create(localizacion: Localizacion): Observable<Localizacion> {
    return this.http.post<Localizacion>(this.apiUrl, localizacion);
  }

   //Actualizar localización    
  update(id: number, localizacion: Localizacion): Observable<Localizacion> {
    return this.http.put<Localizacion>(`${this.apiUrl}/${id}`, localizacion);
  }

   //Eliminar por ID   
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
