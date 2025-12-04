import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoActividad } from '../models/tipo-actividad';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoActividadService {
  private apiUrl = `${environment.apiUrl}/tipos-actividad`; 

  constructor(private http: HttpClient) {}

  getTiposActividad(): Observable<TipoActividad[]> {
    return this.http.get<TipoActividad[]>(this.apiUrl);
  }
}
