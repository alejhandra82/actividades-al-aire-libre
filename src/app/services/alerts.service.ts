import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  /**
   * Muestra un mensaje de éxito con ícono 'success'.
   * @param title Título de la alerta
   * @param text Texto descriptivo de la alerta
   */
  success(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
    });
  }

  /**
   * Muestra un mensaje de error con ícono 'error'.
   * @param title Título de la alerta
   * @param text Texto descriptivo del error
   */
  error(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
    });
  }

  /**
   * Muestra un mensaje de confirmación con opciones de Sí/No.
   * @param title Título de la alerta
   * @param text Texto descriptivo
   * @param confirmButtonText Texto del botón de confirmación
   * @param cancelButtonText Texto del botón de cancelación
   * @returns Promise<boolean> indicando si el usuario confirmó (true) o canceló (false)
   */
  confirm(
    title: string,
    text: string,
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
    }).then((result) => result.isConfirmed);
  }

  /**
   * Muestra un mensaje de información con ícono 'info'.
   * @param title Título de la alerta
   * @param text Texto descriptivo
   */
  info(title: string, text: string): void {
    Swal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
    });
  }

  infoRedirige(title: string, text: string): Promise<boolean> {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar',
  }).then((result) => result.isConfirmed);
}

}



