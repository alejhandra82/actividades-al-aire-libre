import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Familia } from '../models/familia';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class FamiliaService {

  private apiUrl = 'http://localhost:8888/api'; 


  constructor(private http: HttpClient) {}

  getFamilias(): Observable<Familia[]> {
      return this.http.get<Familia[]>(`${this.apiUrl}/familias`);
    }

  getFamiliaById(id: number): Observable<Familia> {
    return this.http.get<Familia>(`${this.apiUrl}/familias/${id}`);
  }

  crearFamilia(familia: Familia): Observable<Familia> {
      return this.http.post<Familia>(`${this.apiUrl}/familias`, familia);
    }

  actualizarFamilia(id: number, familia: Familia): Observable<Familia> {
    return this.http.put<Familia>(`${this.apiUrl}/familias/${id}`, familia);
  }

  eliminarFamilia(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/familias/${id}`);
}

//  subirFotoFamilia(idFamilia: number, file: File) {
//    const formData = new FormData();
   // formData.append('file', file);
  //  return this.http.post<void>(`${this.apiUrl}/familias/${idFamilia}/foto`, formData);
//  }

subirFotoFamilia(idFamilia: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post(
    `${this.apiUrl}/familias/${idFamilia}/foto`,
    formData,
    { responseType: 'text' } 
  );
}



  getFotoFamilia(idFamilia: number) {
    return this.http.get(`${this.apiUrl}/familias/${idFamilia}/foto`, { responseType: 'text' });
  }

  getMiembros(idFamilia: number) {
  return this.http.get<Usuario[]>(`${this.apiUrl}/familias/${idFamilia}/miembros`);
}

}
