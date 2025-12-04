import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participacion } from '../models/participacion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParticipacionService {
  private apiUrl = `${environment.apiUrl}/participaciones`; 


  constructor(private http: HttpClient) {}

  //Todas participaciones
  getParticipaciones(): Observable<Participacion[]> {
      return this.http.get<Participacion[]>(this.apiUrl);
    }

  // Crear participación
  crearParticipacion(participacion: Participacion): Observable<Participacion> {
    return this.http.post<Participacion>(this.apiUrl, participacion);
  }

  // Cancelar participación
  cancelarParticipacion(id: number): Observable<Participacion> {
    return this.http.put<Participacion>(`${this.apiUrl}/cancelar/${id}`, {});
  }

  // Confirmar participación
  confirmarParticipacion(id: number): Observable<Participacion> {
    return this.http.put<Participacion>(`${this.apiUrl}/confirmar/${id}`, {});
  }

  // Comprobar si ya existe participación activa
  existeParticipacion(idEvento: number, idFamilia: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/existe/${idEvento}/${idFamilia}`);
  }

  // Listar participaciones por familia
  getParticipacionesPorFamilia(idFamilia: number): Observable<Participacion[]> {
    return this.http.get<Participacion[]>(`${this.apiUrl}/familias/${idFamilia}`);
  }

  // Listar participaciones por evento
  getParticipacionesPorEvento(idEvento: number): Observable<Participacion[]> {
    return this.http.get<Participacion[]>(`${this.apiUrl}/eventos/${idEvento}`);
  }
  
  }
