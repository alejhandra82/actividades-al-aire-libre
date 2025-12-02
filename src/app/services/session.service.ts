import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio que gestiona la sesión del usuario (login/logout).
 * Usa BehaviorSubject para permitir que otros componentes
 * se suscriban y reaccionen a los cambios en el estado de la sesión.
 */
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  // BehaviorSubject guarda el estado actual del usuario; inicializa con null.
  private usuarioActual = new BehaviorSubject<any>(null);
  public usuario$ = this.usuarioActual.asObservable();

  private familiaActual = new BehaviorSubject<any>(null);
  public familia$ = this.familiaActual.asObservable();

  constructor() {
    // Al iniciar el servicio, revisamos si ya hay un usuario en localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual.next(JSON.parse(usuarioGuardado));
    }

    // Revisamos si ya hay una familia en localStorage
    const familiaGuardada = localStorage.getItem('familia');
    if (familiaGuardada) {
      this.familiaActual.next(JSON.parse(familiaGuardada));
    }
  }

  // ---------- USUARIO ----------
  /**
   * Inicia la sesión guardando el usuario en localStorage
   * y notificando a los suscriptores.
   * @param usuario Objeto que contiene los datos del usuario logueado.
   */
  iniciarSesion(usuario: any): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioActual.next(usuario);
  }

  /**
   * Cierra la sesión eliminando el usuario de localStorage
   * y emitiendo null a los suscriptores.
   */
  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('familia');
    this.usuarioActual.next(null);
    this.familiaActual.next(null);
  }

  /**
   * Devuelve el usuario actual.
   * Si el BehaviorSubject está en null, pero existe un usuario en localStorage,
   * se actualiza el BehaviorSubject para mantener coherencia.
   */
  obtenerUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.usuarioActual.next(JSON.parse(usuario));
    }
    return this.usuarioActual.value;
  }

  // ---------- FAMILIA ----------
  guardarFamilia(familia: any): void {
    localStorage.setItem('familia', JSON.stringify(familia));
    this.familiaActual.next(familia);
  }
  // obtenerFamilia(): any {
  //  const familia = localStorage.getItem('familia');
  // if (familia) {
  //    this.familiaActual.next(JSON.parse(familia));
  //   }
  //return this.familiaActual.value;
  // }

  obtenerFamilia(): any {
    const familiaStr = localStorage.getItem('familia');

    if (!familiaStr || familiaStr === 'null') {
      this.familiaActual.next(null);
      return null;
    }

    const familiaObj = JSON.parse(familiaStr);
    this.familiaActual.next(familiaObj);
    return familiaObj;
  }
  // Devuelve el id de la familia, o null si no hay
  obtenerFamiliaId(): number | null {
    const familia = this.obtenerFamilia();
    return familia ? familia.idFamilia : null;
  }

  //Comprobar usuario logeado
  isUserLoggedIn(): boolean {
    return (
      localStorage.getItem('usuario') !== null &&
      localStorage.getItem('usuario') !== 'null'
    );
  }
  // Comprobar si tiene familia
  hasFamily(): boolean {
    const familia = this.obtenerFamilia();
    const result = familia != null && familia.idFamilia != null;
    return result;
  }
}
