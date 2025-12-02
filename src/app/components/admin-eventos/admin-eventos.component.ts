import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Evento } from '../../models/evento';
import { EventoService } from '../../services/eventos.service';
import { ActividadService } from '../../services/actividad.service';
import { Actividad } from '../../models/actividad';
import { AlertService } from '../../services/alerts.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, DatePipe ],
  templateUrl: './admin-eventos.component.html',
  styleUrls: ['./admin-eventos.component.css']
})
export class AdminEventosComponent implements OnInit {
  eventos: Evento[] = [];
  actividades: Actividad[] = [];
  eventosFiltrados: Evento[] = [];
  eventoForm!: FormGroup;
  cargando = false;
  editando = false;
  modal!: any;

  //  VARIABLES PARA FILTROS 
  modoVista: 'todas' | 'actividad' | 'nombre' = 'todas';
  filtroActividad: number | null = null;
  filtroNombre: string = '';

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private actividadService: ActividadService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEventos();
    this.cargarActividades();
  }

  inicializarFormulario() {
    this.eventoForm = this.fb.group({
      idEvento: [null],
      nombreEvento: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      descripcionEvento: ['', [Validators.required, Validators.minLength(10)]],
      fechaEvento: ['', [Validators.required, this.fechaFuturaValidator()]],
      actividadDTO: this.fb.group({
        idActividad: [null, Validators.required]
      })
    });
  }

  cargarEventos() {
    this.cargando = true;
    this.eventoService.getEventos().subscribe({
      next: (data) => {
        console.log(data);
        this.eventos = data;
        this.eventosFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar los eventos');
      }
    });
  }

  cargarActividades() {
    this.actividadService.getActividades().subscribe({
      next: (data) => this.actividades = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las actividades')
    });
  }

  // FILTRO
  cambiarModo(modo: 'todas' | 'actividad' | 'nombre'): void {
    this.modoVista = modo;
    this.filtroActividad = null;
    this.filtroNombre = '';
    this.aplicarFiltros();
  }

  onActividadSeleccionada(idTipo: string): void {
    this.filtroActividad = idTipo ? Number(idTipo) : null;
    this.aplicarFiltros();
  }

  onNombreIngresado(texto: string): void {
    this.filtroNombre = texto.trim().toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (this.modoVista === 'todas') {
      this.eventosFiltrados = [...this.eventos];
    } 
    else if (this.modoVista === 'actividad' && this.filtroActividad) {
      this.eventosFiltrados = this.eventos.filter(
        e => e.actividadDTO?.idActividad === this.filtroActividad
      );
    } 
    else if (this.modoVista === 'nombre' && this.filtroNombre) {
      this.eventosFiltrados = this.eventos.filter(
        e => e.nombreEvento.toLowerCase().includes(this.filtroNombre)
      );
    } 
    else {
      this.eventosFiltrados = [];
    }
  }
  abrirModalCrear() {
    this.editando = false;
    this.eventoForm.reset();
    this.eventoForm.get('actividadDTO.idActividad')?.setValue(null);
    const modal = document.getElementById('eventoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal, { focus: true });
      bootstrapModal.show();
    }
  }

  abrirModalEditar(evento: Evento): void {
  this.editando = true;

  // Formatear fecha para el input datetime-local
  const fechaFormateada = evento.fechaEvento
    ? new Date(evento.fechaEvento).toISOString().substring(0, 16)
    : '';

  // Ajustar patchValue con el nombre correcto
  this.eventoForm.patchValue({
    idEvento: evento.idEvento,
    nombreEvento: evento.nombreEvento,
    descripcionEvento: evento.descripcionEvento,
    fechaEvento: fechaFormateada,
    actividadDTO: {
      idActividad: evento.actividadDTO?.idActividad || null
    }
  });

  const modalEl = document.getElementById('eventoModal');
  if (modalEl) {
    this.modal = new bootstrap.Modal(modalEl);
    this.modal.show();
  }
}

  cerrarModal(): void {
  const modalEl = document.getElementById('eventoModal');
  if (modalEl) {
    const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalEl);
    bootstrapModal.hide();
  }
  // Quitar el foco del elemento activo (el botón del modal) al cerrarlo
  (document.activeElement as HTMLElement)?.blur();
}

  guardarEvento() {
    if (this.eventoForm.invalid) {
      this.alertService.info('Formulario incompleto', 'Por favor completa todos los campos obligatorios.');
      this.eventoForm.markAllAsTouched();
      return;
    }

    const eventoData = this.eventoForm.value;

    if (this.editando) {
      this.eventoService.actualizarEvento(eventoData.idEvento, eventoData).subscribe({
        next: () => {
          this.alertService.success('Actualizado', 'El evento se actualizó correctamente');
          this.cerrarModal();
          this.cargarEventos();
        },
        error: () => this.alertService.error('Error', 'No se pudo actualizar el evento')
      });
    } else {
      this.eventoService.crearEvento(eventoData).subscribe({
        next: () => {
          this.alertService.success('Creado', 'El evento se creó correctamente');
          this.cerrarModal();
          this.cargarEventos();
        },
        error: () => this.alertService.error('Error', 'No se pudo crear el evento')
      });
    }
  }

  eliminarEvento(idEvento: number) {
    this.alertService
      .confirm('¿Eliminar evento?', 'Esta acción no se puede deshacer.', 'Sí, eliminar', 'Cancelar')
      .then((confirmed) => {
        if (confirmed) {
          this.eventoService.eliminarEvento(idEvento).subscribe({
            next: () => {
              this.alertService.success('Eliminado', 'El evento se eliminó correctamente');
              this.cargarEventos();
            },
            error: () => this.alertService.error('Error', 'No se pudo eliminar el evento')
          });
        }
      });
  }

  fechaFuturaValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null; // si está vacío, lo deja pasar (el required se encarga)
    const fechaSeleccionada = new Date(control.value);
    const ahora = new Date();
    return fechaSeleccionada < ahora ? { fechaPasada: true } : null;
  };
}
}
