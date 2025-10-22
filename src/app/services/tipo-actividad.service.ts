import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoActividad } from '../models/tipo-actividad';


@Injectable({
  providedIn: 'root'
})
export class TipoActividadService {
  private apiUrl = 'http://localhost:8888/api/tipos-actividad';

  constructor(private http: HttpClient) {}

  getTiposActividad(): Observable<TipoActividad[]> {
    return this.http.get<TipoActividad[]>(this.apiUrl);
  }
}
