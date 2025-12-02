import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActividadService } from '../../services/actividad.service';
import { Actividad } from '../../models/actividad';
import { TipoActividad } from '../../models/tipo-actividad';
import { AlertService } from '../../services/alerts.service';
import { TipoActividadService } from '../../services/tipo-actividad.service';
 
@Component({
  selector: 'app-admin-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-actividades.component.html',
  styleUrls: ['./admin-actividades.component.css']
})

 
export class AdminActividadesComponent implements OnInit {
  actividades: Actividad[] = [];
  actividadesFiltradas: Actividad[] = [];
  tiposActividad: TipoActividad[] = [];
  actividadForm!: FormGroup;
  editando = false;
  actividadSeleccionadaId?: number;
  cargando = true;
  fotoPreview: SafeUrl | string = 'https://airelibrestorage.blob.core.windows.net/imagenes/actividades/default.jpg';
  selectedFile?: File;
  defaultFotoUrl: string = '';
 

  //  VARIABLES PARA FILTROS 
  modoVista: 'todas' | 'tipo' | 'nombre' = 'todas';
  filtroTipoId: number | null = null;
  filtroNombre: string = '';

  constructor(
    private actividadService: ActividadService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private tipoActividadService: TipoActividadService
  ) {}

  ngOnInit(): void {
  this.actividadService.obtenerFotoDefault().subscribe({
    next: (url) => this.defaultFotoUrl = url,
    error: () => console.error('No se pudo obtener la foto default')
  });
  this.obtenerActividades();
  this.cargarTiposActividad();
  this.inicializarFormulario();
}

  inicializarFormulario(): void {
    this.actividadForm = this.fb.group({
      nombreActividad: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      ubicacion: ['', Validators.required],
      duracion: [0, [Validators.required, Validators.min(1)]],
      dificultad: ['', Validators.required],
      precio: ['', Validators.required],
      materialRecomendado: [''],
      tipoActividadDTO: this.fb.group({
        idTipoActividad: [null, Validators.required],
        nombreTipoActividad: ['']
      })
    });
  }

  obtenerActividades(): void {
  this.cargando = true;
  this.actividadService.getActividades().subscribe({
    next: (data) => {
      this.actividades = data;
      this.actividadesFiltradas = [...data]; // mantener filtradas igual al original

      // Para cada actividad pedimos la URL SAS y la almacenamos en 'imagenUrl'
      this.actividades.forEach(act => {
        if (act.imagenPrincipal) {
          this.actividadService.obtenerFotoActividad(act.idActividad!).subscribe({
            next: (sasUrl: string) => act.imagenUrl = sasUrl,
            error: () => act.imagenUrl = 'https://airelibrestorage.blob.core.windows.net/imagenes/actividades/default.jpg'
          });
        } else {
          act.imagenUrl = 'https://airelibrestorage.blob.core.windows.net/imagenes/actividades/default.jpg';
        }
      });

      this.cargando = false;
    },
    error: () => {
      this.alertService.error('Error', 'No se pudieron cargar las actividades.');
      this.cargando = false;
    }
  });
}

  cargarTiposActividad(): void {
    this.tipoActividadService.getTiposActividad().subscribe({
      next: (data) => this.tiposActividad = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar los tipos de actividad.')
    });
  }

  // FILTRO
  cambiarModo(modo: 'todas' | 'tipo' | 'nombre'): void {
    this.modoVista = modo;
    this.filtroTipoId = null;
    this.filtroNombre = '';
    this.aplicarFiltros();
  }

  onTipoSeleccionado(idTipo: string): void {
    this.filtroTipoId = idTipo ? Number(idTipo) : null;
    this.aplicarFiltros();
  }

  onNombreIngresado(texto: string): void {
    this.filtroNombre = texto.trim().toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (this.modoVista === 'todas') {
      this.actividadesFiltradas = [...this.actividades];
    } 
    else if (this.modoVista === 'tipo' && this.filtroTipoId) {
      this.actividadesFiltradas = this.actividades.filter(
        a => a.tipoActividadDTO?.idTipoActividad === this.filtroTipoId
      );
    } 
    else if (this.modoVista === 'nombre' && this.filtroNombre) {
      this.actividadesFiltradas = this.actividades.filter(
        a => a.nombreActividad.toLowerCase().includes(this.filtroNombre)
      );
    } 
    else {
      this.actividadesFiltradas = [];
    }
  }

  
  abrirModalCrear(): void {
  this.editando = false;
  this.actividadSeleccionadaId = undefined;
  this.actividadForm.reset();
  this.selectedFile = undefined;

  // Esperamos a que la URL SAS de la default llegue
  this.actividadService.obtenerFotoDefault().subscribe({
    next: (url) => this.fotoPreview = url,
    error: () => {
      console.error('No se pudo obtener la foto default');
      this.fotoPreview = ''; // opcional
    }
  });

  const modal = document.getElementById('actividadModal');
  if (modal) {
    const bootstrapModal = new (window as any).bootstrap.Modal(modal, { focus: true });
    bootstrapModal.show();
  }
}

  abrirModalEditar(actividad: Actividad): void {
  this.editando = true;
  this.actividadSeleccionadaId = actividad.idActividad;
  this.actividadForm.patchValue(actividad);

  // Si la actividad tiene imagen en Azure, usamos esa; si no, la default
  if (actividad.imagenPrincipal) {
    // Si la actividad tiene imagen, pedimos su SAS
    this.actividadService.obtenerFotoActividad(actividad.idActividad).subscribe({
      next: (sasUrl) => this.fotoPreview = sasUrl,
      error: () => {
        console.error('Error al obtener imagen de actividad, usando default');
        this.actividadService.obtenerFotoDefault().subscribe({
          next: (url) => this.fotoPreview = url,
          error: () => this.fotoPreview = ''
        });
      }
    });
  } else {
    // Si no tiene imagen, usamos la default
    this.actividadService.obtenerFotoDefault().subscribe({
      next: (url) => this.fotoPreview = url,
      error: () => {
        console.error('No se pudo obtener la foto default');
        this.fotoPreview = '';
      }
    });
  }
const modal = document.getElementById('actividadModal');
  if (modal) {
    const bootstrapModal = new (window as any).bootstrap.Modal(modal, { focus: true });
    bootstrapModal.show();
  }
}


  guardarActividad(): void {
  if (this.actividadForm.invalid) {
    this.alertService.info('Formulario incompleto', 'Por favor completa todos los campos obligatorios.');
    this.actividadForm.markAllAsTouched();
    return;
  }

  // Construimos el objeto Actividad sin la imagen
  const actividadData: any = {
    ...this.actividadForm.value,
    tipoActividadDTO: this.actividadForm.value.tipoActividadDTO
  };

  if (this.editando && this.actividadSeleccionadaId) {
    // Actualizamos actividad
    this.actividadService.actualizarActividad(this.actividadSeleccionadaId, actividadData).subscribe({
      next: (actividadActualizada) => {
        this.alertService.success('Actualizada', 'La actividad se actualizó correctamente.');

        const subirImagen = () => {
          if (this.selectedFile) {
            this.actividadService.subirFotoActividad(this.actividadSeleccionadaId!, this.selectedFile).subscribe({
              next: () => {
                // Obtenemos URL SAS del backend para mostrar la imagen
                this.actividadService.obtenerFotoActividad(this.actividadSeleccionadaId!).subscribe({
                  next: (sasUrl) => this.fotoPreview = sasUrl,
                  error: () => this.fotoPreview = 'https://airelibrestorage.blob.core.windows.net/imagenes/actividades/default.jpg'
                });
                this.obtenerActividades();
              },
              error: () => this.alertService.error('Error', 'No se pudo subir la imagen.')
            });
          } else {
            this.obtenerActividades();
          }
        };

        subirImagen();
        this.cerrarModal();
      },
      error: () => this.alertService.error('Error', 'No se pudo actualizar la actividad.')
    });

  } else {
    // Creamos nueva actividad
    this.actividadService.crearActividad(actividadData).subscribe({
      next: (nuevaActividad) => {
        this.alertService.success('Creada', 'La actividad se creó correctamente.');

        if (this.selectedFile) {
          this.actividadService.subirFotoActividad(nuevaActividad.idActividad, this.selectedFile).subscribe({
            next: () => {
              // Obtenemos URL SAS del backend para mostrar la imagen
              this.actividadService.obtenerFotoActividad(nuevaActividad.idActividad).subscribe({
                next: (sasUrl) => this.fotoPreview = sasUrl,
                error: () => this.fotoPreview = 'https://airelibrestorage.blob.core.windows.net/imagenes/actividades/default.jpg'
              });
              this.obtenerActividades();
            },
            error: () => this.alertService.error('Error', 'No se pudo subir la imagen.')
          });
        } else {
          this.obtenerActividades();
        }

        this.cerrarModal();
      },
      error: () => this.alertService.error('Error', 'No se pudo crear la actividad. Verifica los campos.')
    });
  }
}

  eliminarActividad(id: number): void {
    this.alertService.confirm('Eliminar actividad', '¿Seguro que deseas eliminar esta actividad?')
      .then(confirmado => {
        if (confirmado) {
          this.actividadService.eliminarActividad(id).subscribe({
            next: () => {
              this.alertService.success('Eliminada', 'Actividad eliminada correctamente.');
              this.obtenerActividades();
            },
            error: () => this.alertService.error('Error', 'No se pudo eliminar la actividad.')
          });
        }
      });
  }

  cerrarModal(): void {
    const modalEl = document.getElementById('actividadModal');
    if (modalEl) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bootstrapModal.hide();
    }
    (document.activeElement as HTMLElement)?.blur();
  }

  esNumero(valor: any): boolean {
    return !isNaN(Number(valor));
  }

  // Método para manejar la selección de archivo
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  this.selectedFile = input.files[0];

  // Previsualización
  const reader = new FileReader();
  reader.onload = () => this.fotoPreview = reader.result as string;
  reader.readAsDataURL(this.selectedFile);

  // Guardamos nombre en el form para compatibilidad
  this.actividadForm.patchValue({
    imagenPrincipal: this.selectedFile.name
  });
}

subirImagenActividad(idActividad: number, file: File): void {
  this.actividadService.subirFotoActividad(idActividad, file).subscribe({
    next: (rutaBlob: string) => {
      console.log('Imagen subida correctamente:', rutaBlob);
      // Ahora obtenemos la URL SAS del backend
      this.actividadService.obtenerFotoActividad(idActividad).subscribe({
        next: (url: string) => this.fotoPreview = url,
        error: (err) => console.error('Error al obtener URL de imagen:', err)
      });
    },
    error: (err) => console.error('Error al subir imagen:', err)
  });
}
}

