import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Localizacion } from '../models/localizaciones';

@Injectable({
  providedIn: 'root'
})
export class LocalizacionService {

  // URL base del backend -> ajustar si tu backend usa otro puerto o path
  private apiUrl = 'http://localhost:8888/api/localizaciones';

  constructor(private http: HttpClient) { }

  /**
   * Listar todas las localizaciones
   * GET /api/localizaciones
   */
  getAll(): Observable<Localizacion[]> {
    return this.http.get<Localizacion[]>(this.apiUrl);
  }

  /**
   * Obtener una localización por ID
   * GET /api/localizaciones/{id}
   */
  getById(id: number): Observable<Localizacion> {
    return this.http.get<Localizacion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener localizaciones por actividad
   * GET /api/localizaciones/actividad/{idActividad}
   */
  getByActividad(idActividad: number): Observable<Localizacion[]> {
    return this.http.get<Localizacion[]>(`${this.apiUrl}/actividad/${idActividad}`);
  }

  /**
   * Crear nueva localización
   * POST /api/localizaciones
   * Body: Localizacion (sin idLocalizacion)
   * Ejemplo de actividad: { actividadDTO: { idActividad: 2 } }
   */
  create(localizacion: Localizacion): Observable<Localizacion> {
    return this.http.post<Localizacion>(this.apiUrl, localizacion);
  }

  /**
   * Actualizar localización existente
   * PUT /api/localizaciones/{id}
   */
  update(id: number, localizacion: Localizacion): Observable<Localizacion> {
    return this.http.put<Localizacion>(`${this.apiUrl}/${id}`, localizacion);
  }

  /**
   * Eliminar por ID
   * DELETE /api/localizaciones/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
