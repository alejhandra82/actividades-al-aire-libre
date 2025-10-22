import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AlertService } from '../../services/alerts.service';
import { Familia } from '../../models/familia';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  familias: Familia[] = [];
  // Variable para mostrar la imagen seleccionada o la por defecto
imagenPreview: string = 'https://airelibrestorage.blob.core.windows.net/imagenes/usuarios/default.png';


  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]{2,20}$/)]],
      apellidoUsuario: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]{2,20}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)]],
      repitePassword: ['', Validators.required],
      idFamilia: [null],
      fotoPerfil: [null],
    });
  }

  ngOnInit(): void {
    this.cargarFamilias();
  }

  cargarFamilias(): void {
    this.usuarioService.getFamilias().subscribe({
      next: (data) => this.familias = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las familias')
    });
  }

  registrar(): void {
    if (this.registroForm.invalid) {
      this.alertService.error('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    const password = this.registroForm.value.contrasena;
    const repitePassword = this.registroForm.value.repitePassword;
    if (password !== repitePassword) {
      this.alertService.error('Error', 'Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      idUsuario: 0,
      nombreUsuario: this.registroForm.value.nombreUsuario,
      apellidoUsuario: this.registroForm.value.apellidoUsuario,
      correo: this.registroForm.value.correo,
      contrasena: password,
      rol: 'miembro',
      fotoPerfil: 'https://airelibrestorage.blob.core.windows.net/imagenes/usuarios/default.png',
      familiaDTO: this.registroForm.value.idFamilia
        ? { idFamilia: this.registroForm.value.idFamilia, nombreFamilia: '', correoElectronico: '' }
        : null,
    };

    // Guardamos primero el usuario
  this.usuarioService.crearUsuario(usuario).subscribe({
    next: (usuarioCreado) => {
      // Si el usuario seleccionó una imagen distinta de la default → subimos foto
      const file: File | null = this.registroForm.value.fotoPerfil || null;
      if (file) {
        this.usuarioService.subirFoto(usuarioCreado.idUsuario!, file).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Usuario registrado correctamente con su foto.');
            this.router.navigate(['/login']);
          },
          error: () => this.alertService.error('Error', 'Usuario creado pero no se pudo subir la foto.')
        });
      } else {
        // Si no seleccionó imagen → queda la por defecto
        this.alertService.success('Éxito', 'Usuario registrado correctamente con foto por defecto.');
        this.router.navigate(['/login']);
      }
    },
    error: () => this.alertService.error('Error', 'No se pudo registrar el usuario.')
  });
}


  mostrarError(controlName: string, errorName: string): boolean {
    const control = this.registroForm.get(controlName);
    return control!.hasError(errorName) && control!.touched;
  }

  // Método para actualizar la previsualización cuando el usuario selecciona un archivo
previsualizarImagen(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Crear URL temporal para previsualización
    this.imagenPreview = URL.createObjectURL(file);
    // Guardamos el archivo en el FormGroup para enviarlo luego al backend
    this.registroForm.patchValue({ fotoPerfil: file });
  }
}
}
