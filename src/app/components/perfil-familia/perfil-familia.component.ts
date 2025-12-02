import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Familia } from '../../models/familia';
import { Usuario } from '../../models/usuario';
import { FamiliaService } from '../../services/familia.service';
import { UsuarioService } from '../../services/usuario.service';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alerts.service';


@Component({
  selector: 'app-perfil-familia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-familia.component.html',
  styleUrls: ['./perfil-familia.component.css']
})
export class PerfilFamiliaComponent implements OnInit {

  // Formularios
  crearForm: FormGroup;
  editarForm: FormGroup;

  // Estado
  mostrarCrearFamilia = false;
  familia!: Familia;
  familiaId: number | null = null;
  miembros: Usuario[] = [];
  imagenPreview: SafeUrl | string = 'https://airelibrestorage.blob.core.windows.net/imagenes/familias/default.png';

  constructor(
    private fb: FormBuilder,
    private familiaService: FamiliaService,
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.crearForm = this.fb.group({
      nombreFamilia: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      correo: ['', [Validators.required, Validators.email]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      fotoFamilia: [null]
    });

    this.editarForm = this.fb.group({
      nombreFamilia: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      correo: ['', [Validators.required, Validators.email]],
      descripcion: ['', [Validators.maxLength(200)]],
      fotoFamilia: [null]
    });
  }

  ngOnInit(): void {
    const usuarioSesion = this.sessionService.obtenerUsuario();
    if (!usuarioSesion) {
      this.alertService.error('Error', 'Debes iniciar sesión para ver el perfil de familia.');
      return;
    }

    const idUsuario = usuarioSesion.idUsuario;
    this.usuarioService.getUsuarioById(idUsuario).subscribe({
      next: (usuarioBackend) => {
        // refrescamos la sesión
        this.sessionService.iniciarSesion(usuarioBackend);

        if (usuarioBackend.familiaDTO && usuarioBackend.familiaDTO.idFamilia) {
          this.cargarDatosFamilia(usuarioBackend.familiaDTO.idFamilia);
        } else {
          this.mostrarCrearFamilia = true;
        }
      },
      error: () => this.alertService.error('Error', 'No se pudo cargar el usuario desde backend.')
    });
  }

  // Cargar datos generales de la familia
 cargarDatosFamilia(id: number): void {
  
  this.familiaService.getFamiliaById(id).subscribe({
    next: (data) => {
      this.familia = data;

      // Patch del formulario
      this.editarForm.patchValue({
        nombreFamilia: data.nombreFamilia,
        correo: data.correoElectronico,
        descripcion: data.descripcion
      });

      // Cargar foto
      if (data.fotoFamilia) {
        this.familiaService.getFotoFamilia(data.idFamilia).subscribe({
          next: (sasUrl) => this.imagenPreview = sasUrl,
          error: () => this.imagenPreview = 'https://airelibrestorage.blob.core.windows.net/imagenes/familias/default.png'
        });
      }

      // 🔹 Nuevo: cargar miembros de la familia desde endpoint REST
      this.familiaService.getMiembros(id).subscribe({
        next: (usuarios) => this.miembros = usuarios,
        error: () => this.alertService.error('Error', 'No se pudieron cargar los miembros de la familia.')
      });
    },
    error: () => this.alertService.error('Error', 'No se pudieron cargar los datos de la familia.')
  });
}

  // Crear nueva familia
crearFamilia(): void {
  if (this.crearForm.invalid) {
    this.alertService.error('Error', 'Completa correctamente los campos.');
    return;
  }

  // Construimos el objeto sin idFamilia (el backend lo asigna)
  const nuevaFamilia: Omit<Familia, 'idFamilia'> = {
    nombreFamilia: this.crearForm.value.nombreFamilia,
    correoElectronico: this.crearForm.value.correo,
    descripcion: this.crearForm.value.descripcion
  };

  this.familiaService.crearFamilia(nuevaFamilia as Familia).subscribe({
    next: (familiaCreada) => {

      //Guardar la familia creada en localStorage
    this.sessionService.guardarFamilia(familiaCreada);
      const file: File | null = this.crearForm.value.fotoFamilia;

      const continuarAsignacion = () => {
        const idUsuario = this.sessionService.obtenerUsuario().idUsuario;
        this.usuarioService.asignarFamilia(idUsuario, familiaCreada.idFamilia).subscribe({
          next: (usuarioActualizado) => {
            this.sessionService.iniciarSesion(usuarioActualizado);
            this.sessionService.guardarFamilia(familiaCreada);
            
            this.cargarDatosFamilia(familiaCreada.idFamilia);
            this.mostrarCrearFamilia = false;
            this.alertService.success('Éxito', 'Familia creada y asignada correctamente.');
          },
          error: () => this.alertService.error('Error', 'No se pudo asignar la familia al usuario.')
        });
      };

      if (file) {
        this.familiaService.subirFotoFamilia(familiaCreada.idFamilia, file).subscribe({
          next: () => continuarAsignacion(),
          error: () => {
            this.alertService.error('Aviso', 'Familia creada, pero la foto no se pudo subir.');
            continuarAsignacion();
          }
        });
      } else {
        continuarAsignacion();
      }
    },
    error: () => this.alertService.error('Error', 'No se pudo crear la familia.')
  });
}


  // Guardar cambios en familia existente
guardarCambios(): void {
  if (this.editarForm.invalid || !this.familia) {
    this.alertService.error('Error', 'Revisa los campos del formulario.');
    return;
  }

  const familiaActualizada: Familia = {
    idFamilia: this.familia.idFamilia, // mantiene el id existente
    nombreFamilia: this.editarForm.value.nombreFamilia,
    correoElectronico: this.editarForm.value.correo,
    descripcion: this.editarForm.value.descripcion,
    fotoFamilia: this.familia.fotoFamilia,
    miembros: this.familia.miembros
  };

  this.familiaService.actualizarFamilia(familiaActualizada.idFamilia, familiaActualizada).subscribe({
    next: () => {
      const file = this.editarForm.value.fotoFamilia as File | null;
      if (file) {
        this.familiaService.subirFotoFamilia(familiaActualizada.idFamilia, file).subscribe({
          next: () => this.alertService.success('Éxito', 'Datos actualizados correctamente.'),
          error: () => this.alertService.error('Aviso', 'Familia actualizada, pero la foto no se pudo subir.')
        });
      } else {
        this.alertService.success('Éxito', 'Familia actualizada correctamente.');
      }
    },
    error: () => this.alertService.error('Error', 'No se pudieron guardar los cambios de la familia.')
  });
}

  // Previsualizar imagen
  previsualizarImagen(event: Event, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      form.patchValue({ fotoFamilia: file });
      const objectUrl = URL.createObjectURL(file);
      this.imagenPreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }
  }

  getAvatarColor(miembro: any): string {
  const str = miembro.nombreUsuario + (miembro.apellidoUsuario || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Convertimos el hash en un color HSL (más armónico que hex random)
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}
}


 
