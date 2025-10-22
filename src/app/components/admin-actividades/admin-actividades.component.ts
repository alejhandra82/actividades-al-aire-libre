import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // --- NUEVAS VARIABLES PARA FILTROS ---
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
        this.actividadesFiltradas = data;
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

  // --- NUEVAS FUNCIONES DE FILTRO ---
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

  // --- CRUD ---
  abrirModalCrear(): void {
    this.editando = false;
    this.actividadSeleccionadaId = undefined;
    this.actividadForm.reset();

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

    const actividadData = this.actividadForm.value;

    if (this.editando && this.actividadSeleccionadaId) {
      this.actividadService.actualizarActividad(this.actividadSeleccionadaId, actividadData).subscribe({
        next: () => {
          this.alertService.success('Actualizada', 'La actividad se actualizó correctamente.');
          this.obtenerActividades();
          this.cerrarModal();
        },
        error: () => this.alertService.error('Error', 'No se pudo actualizar la actividad.')
      });
    } else {
      this.actividadService.crearActividad(actividadData).subscribe({
        next: () => {
          this.alertService.success('Creada', 'La actividad se creó correctamente.');
          this.obtenerActividades();
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
}
