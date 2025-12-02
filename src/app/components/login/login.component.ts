import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario'; 
import { UsuarioService } from '../../services/usuario.service';
import { AlertService } from '../../services/alerts.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  correo = '';
  contrasena = '';
  error = '';
  errorCorreo = '';
  errorContrasena = '';
  verContrasena = false;

  constructor(
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private router: Router,
    private alertService: AlertService
  ) {}

login(): void {
  // Limpiar errores al iniciar
  this.limpiarErrores();
  // Campos vacíos
  if (this.correo.trim() === '' || this.contrasena.trim() === '') {
    this.error = 'Debe completar todos los campos';
    return;
  }
  // Validación email
  if (!this.validarEmail(this.correo)) {
    this.errorCorreo = 'Formato de email incorrecto';    
    return;
  }
  // Validación contraseña
  if (!this.validarPassword(this.contrasena)) {
    this.errorContrasena =
      'La contraseña debe tener al menos 6 caracteres y contener letras y números';
     return;
  }

  // Objeto con credenciales
  const credenciales = {
    correo: this.correo,
    contrasena: this.contrasena,
  };

  this.usuarioService.iniciarSesion(credenciales).subscribe({
   next: (resp) => {
  const usuario = JSON.parse(resp.body);
      console.log('Usuario logueado:', usuario);

      // Guardar sesión
      this.sessionService.iniciarSesion(usuario);

      // Guardar familia asociada si existe
      if (usuario.familiaDTO) {
        this.sessionService.guardarFamilia(usuario.familiaDTO);
        console.log('Familia guardada en sesión:', this.sessionService.obtenerFamilia());
      } else {
        this.sessionService.guardarFamilia(null);
        console.log('No hay familia asociada al usuario.');
      }

      // Alerta de éxito
      this.alertService.success(
        'Login correcto',
        `Bienvenido ${usuario.nombreUsuario}`);

   
      // Redirección según rol   
     if (usuario.rol?.toLowerCase() === 'admin') {
          this.router.navigate(['/administrador']);
        } else {
          this.router.navigate(['/home']);
        }
    },

    error: (err) => {
  console.log('Error en login:', err);

  if (err.status === 404) {
    
    this.alertService.error('Mi app', 'Usuario no registrado. Redirigiendo a registro.');
    this.router.navigate(['/registro']);
    return;
  }

  if (err.status === 401 && err.error === 'CONTRASENA_INCORRECTA') {
    this.errorContrasena = 'Contraseña incorrecta';
    return;
  }

  
  this.alertService.error('Error', 'No se pudo conectar con el servidor');
}
  });
}

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validarPassword(password: string): boolean {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return re.test(password);
  }

  // Método para limpiar errores
private limpiarErrores(): void {
  this.error = '';
  this.errorCorreo = '';
  this.errorContrasena = '';
}
}
