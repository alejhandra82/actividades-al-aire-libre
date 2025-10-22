import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alerts.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})
export class PerfilUsuarioComponent implements OnInit {

  perfilForm: FormGroup;
  usuarioId: number | null = null; // ID del usuario logueado
  usuario!: Usuario;
  nombreFamilia: string = 'Sin familia';
  imagenPreview: SafeUrl | string = 'https://airelibrestorage.blob.core.windows.net/imagenes/usuarios/default.png';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private alertService: AlertService,
    private sessionService: SessionService
  ) {
    this.perfilForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ ]{2,20}$/)]],
      apellidoUsuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ ]{2,20}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: [''], // opcional modificar
      repitePassword: [''],
      fotoPerfil: [null],
      idFamilia: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    const usuario = this.sessionService.obtenerUsuario();
    this.usuarioId = usuario ? usuario.idUsuario : null;

    if (usuario && usuario.idUsuario) {
      this.usuario = usuario;
      this.cargarDatosUsuario(this.usuarioId!);
    } else {
      this.alertService.error('Error', 'Debes iniciar sesión para modificar tu perfil.');
    }
  }

  previsualizarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.perfilForm.patchValue({ fotoPerfil: file }); 
      const objectUrl = URL.createObjectURL(file);
      this.imagenPreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }
  }

cargarDatosUsuario(id: number): void {
  this.usuarioService.getUsuarioById(id).subscribe({
    next: (data) => {
      console.log('Datos del usuario cargados:', data);
      this.usuario = data;
      this.nombreFamilia = this.usuario.familiaDTO?.nombreFamilia || 'Sin familia';

      // Rellenamos el formulario
      this.perfilForm.patchValue({
        nombreUsuario: data.nombreUsuario,
        apellidoUsuario: data.apellidoUsuario,
        correo: data.correo,
        contrasena: '', // no devolvemos contraseña real
        repitePassword: '',
        idFamilia: data.familiaDTO?.nombreFamilia || 'Sin familia',
      });

      // 🔹 Cargamos la foto mediante SAS si existe
      if (data.fotoPerfil) {
        this.usuarioService.getFotoUsuario(data.idUsuario).subscribe({
          next: (sasUrl) => {
            console.log('URL SAS recibida del backend:', sasUrl);
            this.imagenPreview = sasUrl;
          },
          error: (err) => {
            console.error('Error al obtener la URL SAS de la foto:', err);
            this.imagenPreview = 'https://airelibrestorage.blob.core.windows.net/imagenes/usuarios/default.png';
          }
        });
      } else {
        // Si no tiene foto, usamos la imagen por defecto
        this.imagenPreview = 'https://airelibrestorage.blob.core.windows.net/imagenes/usuarios/default.png';
      }

    },
    error: (err) => {
      console.error('Error al cargar datos del usuario:', err);
      this.alertService.error('Error', 'No se pudieron cargar los datos del usuario');
    }
  });
}


  guardarCambios(): void {
  if (this.perfilForm.invalid) {
    Object.keys(this.perfilForm.controls).forEach((field) => {
      const control = this.perfilForm.get(field);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
    this.alertService.error('Error', 'Por favor, completa todos los campos correctamente.');
    return;
  }

  if (!this.usuarioId || !this.usuario) {
    this.alertService.error('Error', 'El usuario no está cargado correctamente.');
    return;
  }

  // Construimos un Usuario completo
  const usuarioActualizado: Usuario = {
    idUsuario: this.usuarioId,
    nombreUsuario: this.perfilForm.value.nombreUsuario,
    apellidoUsuario: this.perfilForm.value.apellidoUsuario,
    correo: this.perfilForm.value.correo,
    contrasena: this.perfilForm.value.contrasena || this.usuario.contrasena,
    rol: this.usuario.rol,
    fotoPerfil: this.usuario.fotoPerfil,
    familiaDTO: this.usuario.familiaDTO
  };

  // 🔹 Actualizamos los datos del usuario (JSON)
  this.usuarioService.actualizarUsuario(this.usuarioId, usuarioActualizado).subscribe({
    next: () => {
      // 🔹 Si hay un archivo nuevo en el formulario, lo subimos
      const file = this.perfilForm.value.fotoPerfil as File | null;
      if (file) {
        this.usuarioService.subirFoto(this.usuarioId!, file).subscribe({
          next: () => {
            this.usuarioService.getFotoUsuario(this.usuarioId!).subscribe({
              next: (sasUrl) => {
                this.imagenPreview = sasUrl;
                this.alertService.success('Éxito', 'Usuario actualizado correctamente con nueva foto.');
              },
              error: () => {
                this.alertService.error('Error', 'Foto subida pero no se pudo obtener la URL.');
              }
            });
          },
          error: () => this.alertService.error('Error', 'Datos guardados pero la foto no se pudo subir.')
        });
      } else {
        this.alertService.success('Éxito', 'Usuario actualizado correctamente.');
      }
    },
    error: () => this.alertService.error('Error', 'No se pudieron guardar los cambios.')
  });
}



  mostrarError(controlName: string, errorName: string): boolean {
    const control = this.perfilForm.get(controlName);
    return control!.hasError(errorName) && control!.touched;
  }
}
