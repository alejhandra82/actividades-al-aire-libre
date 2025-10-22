import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OpinionService } from '../../services/opiniones.service';
import { AlertService } from '../../services/alerts.service';
import { Opiniones } from '../../models/opiniones';
import { Actividad } from '../../models/actividad';
import { ActividadService } from '../../services/actividad.service';
import { FamiliaService } from '../../services/familia.service';

@Component({
  selector: 'app-admin-opiniones',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './admin-opiniones.component.html',
  styleUrls: ['./admin-opiniones.component.css']
})
export class AdminOpinionesComponent implements OnInit {

  opiniones: Opiniones[] = [];
  actividades: any[] = [];
  familias: any[] = [];
  cargando = false;

  modoVista: 'todas' | 'actividad' | 'familia' = 'todas';

  constructor(
    private opinionService: OpinionService,
    private actividadService: ActividadService,
    private familiaService: FamiliaService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarOpiniones();
    this.cargarActividades();
    this.cargarFamilias();
  }

  cambiarModo(modo: 'todas' | 'actividad' | 'familia'): void {
    this.modoVista = modo;
    this.opiniones = [];
    if (modo === 'todas') this.cargarOpiniones();
  }

  onActividadSeleccionada(idActividad: number): void {
    console.log('🎯 Actividad seleccionada:', idActividad);
    if (!idActividad) {
      this.opiniones = [];
      return;
    }
    this.cargarOpinionesPorActividad(+idActividad);
  }

  onFamiliaSeleccionada(idFamilia: number): void {
     console.log('👨‍👩‍👧 Familia seleccionada:', idFamilia);
    if (!idFamilia) {
      this.opiniones = [];
      return;
    }
    this.cargarOpinionesPorFamilia(+idFamilia);
  }

  cargarOpiniones(): void {
    console.log('📡 Cargando todas las opiniones...');
    this.cargando = true;
    this.opinionService.getOpiniones().subscribe({
      next: data => {
         console.log('✅ Opiniones recibidas:', data);
        this.opiniones = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar opiniones:', error);
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las opiniones.');
      }
    });
  }

  cargarOpinionesPorActividad(idActividad: number): void {
    console.log('📡 Cargando opiniones por actividad ID:', idActividad);
    this.cargando = true;
    this.opinionService.getOpinionesPorActividad(idActividad).subscribe({
      next: data => {
        console.log('✅ Opiniones por actividad:', data);
        this.opiniones = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar opiniones por actividad:', error);
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las opiniones de la actividad.');
      }
    });
  }

  cargarOpinionesPorFamilia(idFamilia: number): void {
    console.log('📡 Cargando opiniones por Familia ID:', idFamilia);
    this.cargando = true;
    this.opinionService.getOpinionesPorFamilia(idFamilia).subscribe({
      next: data => {
        console.log('✅ Opiniones por familia:', data);
        this.opiniones = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar opiniones por familia:', error);
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las opiniones de la familia.');
      }
    });
  }

  cargarActividades(): void {
    console.log('📡 Cargando actividades...');
    this.actividadService.getActividades().subscribe({
      next: data => this.actividades = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las actividades.')
    });
  }

  cargarFamilias(): void {
    console.log('📡 Cargando familias...');
    this.familiaService.getFamilias().subscribe({
      next: data => this.familias = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las familias.')
    });
  }

 eliminarOpinion(idOpinion: number): void {
  if (!idOpinion) return;

  this.alertService.confirm(
    'Eliminar opinión',
    '¿Desea eliminar esta opinión?'
  ).then(confirmado => {
    if (confirmado) {
      this.opinionService.eliminarOpinion(idOpinion).subscribe({
        next: () => {
          this.alertService.success('Eliminada', 'La opinión se eliminó correctamente.');
          // Refrescar la vista actual según el modo
          if (this.modoVista === 'actividad') {
            // si estás filtrando por actividad, recarga las de esa actividad
            const actividadSeleccionada = this.actividades.find(a => a.idActividad === idOpinion);
            if (actividadSeleccionada) {
              this.cargarOpinionesPorActividad(actividadSeleccionada.idActividad);
            } else {
              this.cargarOpiniones();
            }
          } else {
            this.cargarOpiniones();
          }
        },
        error: () => this.alertService.error('Error', 'No se pudo eliminar la opinión.')
      });
    }
  });
}

}
