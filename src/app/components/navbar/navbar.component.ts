// Importaciones necesarias desde Angular.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa el Router y RouterModule para navegación y uso de directivas de enrutamiento en la plantilla.
import { Router, RouterModule } from '@angular/router';

// Importa el servicio de sesión, que gestiona el estado de autenticación (usuario logueado o no).
import { SessionService } from '../../services/session.service';

/**
 * @Component define las propiedades básicas de un componente en Angular.
 * - selector: el nombre de la etiqueta para usar este componente en plantillas.
 * - standalone: true indica que este componente no depende de un NgModule tradicional,
 *   sino que se puede usar directamente.
 * - imports: módulos que se necesitan para que este componente funcione (directivas,
 *   pipes, etc. en su template).
 * - templateUrl y styleUrls apuntan al HTML y el CSS respectivos.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  /**
   * Propiedad booleana que indica si existe un usuario logueado.
   * Se inicializa como false.
   */
  usuarioLogueado = false;

  /**
   * Objeto para almacenar la información del usuario.
   * Puede ser de cualquier tipo (por eso any), pero se podría mejorar definiendo
   * una interfaz para el usuario.
   */
  usuario: any = null;
  rol: string | null = null;

  /**
   * Inyecta:
   * - sessionService: para gestionar la sesión (login, logout, usuario actual).
   * - router: para navegar de forma programática a distintas rutas.
   */
  constructor(private sessionService: SessionService, private router: Router) {}

  /**
   * El ciclo de vida ngOnInit se ejecuta al inicializar el componente.
   * Aquí se suscribe a los cambios de usuario (usuario$) emitidos por SessionService,
   * y así actualiza usuarioLogueado y usuario en tiempo real.
   *
   * Además, llama a "obtenerUsuario()" para cargar el estado inicial del usuario
   * guardado en localStorage, si existiera.
   */
  ngOnInit(): void {
    // Se suscribe al BehaviorSubject "usuario$" para reaccionar a cualquier cambio de sesión.
    this.sessionService.usuario$.subscribe((usuario) => {
      // !!usuario convierte el objeto a boolean (true si existe, false si es null/undefined).
      this.usuarioLogueado = !!usuario;
      this.usuario = usuario;
     // this.rol = usuario?.rol || null;
    });

    // Recupera el usuario guardado en localStorage en caso de que exista,
    // y actualiza el estado interno del servicio (y, por ende, del componente).
    this.sessionService.obtenerUsuario();
  }

  /**
   * Método que cierra la sesión del usuario.
   * - Llama a cerrarSesion() en el SessionService (elimina datos de localStorage).
   * - Luego navega a la ruta '/login'.
   */
  logout(): void {
    this.sessionService.cerrarSesion();
    this.router.navigate(['/home']);
  }
}
