import { Component } from '@angular/core';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  correo = '';
  contrasena = '';
  error = '';

  constructor(
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private router: Router,
    private alertService: AlertService
  ) {}

login(): void {
  // Validaciones frontend
  if (!this.validarEmail(this.correo)) {
    this.error = 'Formato de email incorrecto';
    return;
  }

  if (!this.validarPassword(this.contrasena)) {
    this.error =
      'La contraseña debe tener al menos 6 caracteres y contener letras y números';
    return;
  }

  // Objeto con credenciales
  const credenciales = {
    correo: this.correo,
    contrasena: this.contrasena,
  };

  this.usuarioService.iniciarSesion(credenciales).subscribe({
    next: (usuario: Usuario) => {
      console.log('Usuario logueado:', usuario);

      // Guardamos sesión usando SessionService
      this.sessionService.iniciarSesion(usuario);

      // Guardamos la familia si existe
      if (usuario.familiaDTO) {
        this.sessionService.guardarFamilia(usuario.familiaDTO);
        console.log('Familia guardada en sesión:', this.sessionService.obtenerFamilia());
      } else {
        this.sessionService.guardarFamilia(null);
        console.log('No hay familia asociada al usuario.');
      }

      // Alerta de éxito
      this.alertService.success('Login correcto', `Bienvenido ${usuario.nombreUsuario}`);

      // Redirigir según rol
      if (usuario.rol.toLowerCase() === 'admin') {
        this.router.navigate(['/administrador']);
      } else {
        this.router.navigate(['/home']);
      }
    },
    error: (err) => {
      console.log('Error en login:', err);

      if (err.status === 404 || err.error === 'USUARIO_NO_REGISTRADO') {
        this.error = 'Usuario no registrado';
        this.alertService.error('Mi app', 'Usuario no registrado. Redirigiendo a registro.');
        this.router.navigate(['/registrosocio']);
      } else {
        this.error = 'Error de conexión';
        this.alertService.error('Error', 'Error de conexión');
      }
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
}
