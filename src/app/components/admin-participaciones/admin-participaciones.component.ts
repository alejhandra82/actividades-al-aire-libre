import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ParticipacionService } from '../../services/participacion.service';
import { AlertService } from '../../services/alerts.service';
import { Participacion } from '../../models/participacion';
import { EventoService } from '../../services/eventos.service';
import { FamiliaService } from '../../services/familia.service';

@Component({
  selector: 'app-admin-participaciones',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './admin-participaciones.component.html',
  styleUrls: ['./admin-participaciones.component.css']
})
export class AdminParticipacionesComponent implements OnInit {
  participaciones: Participacion[] = [];
  eventos: any[] = [];
  familias: any[] = [];
  cargando = false;

  modoVista: 'todas' | 'evento' | 'familia' = 'todas';

  constructor(
    private participacionService: ParticipacionService,
    private eventoService: EventoService,
    private familiaService: FamiliaService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarParticipaciones();
    this.cargarEventos();
    this.cargarFamilias();
  }

  cambiarModo(modo: 'todas' | 'evento' | 'familia'): void {
    this.modoVista = modo;
    this.participaciones = [];
    if (modo === 'todas') this.cargarParticipaciones();
  }

  onEventoSeleccionado(idEvento: number): void {
    if (!idEvento) {
      this.participaciones = [];
      return;
    }
    this.cargarParticipacionesPorEvento(+idEvento);
  }

  onFamiliaSeleccionada(idFamilia: number): void {
    if (!idFamilia) {
      this.participaciones = [];
      return;
    }
    this.cargarParticipacionesPorFamilia(+idFamilia);
  }

  cargarParticipaciones(): void {
    this.cargando = true;
    this.participacionService.getParticipaciones().subscribe({
      next: data => {
        this.participaciones = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las participaciones.');
      }
    });
  }

  cargarParticipacionesPorEvento(idEvento: number): void {
    this.cargando = true;
    this.participacionService.getParticipacionesPorEvento(idEvento).subscribe({
      next: data => {
        this.participaciones = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las participaciones del evento.');
      }
    });
  }

  cargarParticipacionesPorFamilia(idFamilia: number): void {
    this.cargando = true;
    this.participacionService.getParticipacionesPorFamilia(idFamilia).subscribe({
      next: data => {
        this.participaciones = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.alertService.error('Error', 'No se pudieron cargar las participaciones de la familia.');
      }
    });
  }

  cargarEventos(): void {
    this.eventoService.getEventos().subscribe({
      next: data => this.eventos = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar los eventos.')
    });
  }

  cargarFamilias(): void {
    this.familiaService.getFamilias().subscribe({
      next: data => this.familias = data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las familias.')
    });
  }

  cancelarParticipacion(p: Participacion): void {
    if (p.estado === 'Cancelada') return;
    this.alertService.confirm(
      'Cancelar participación',
      '¿Desea cancelar esta participación?'
    ).then(confirmado => {
      if (confirmado) {
        this.participacionService.cancelarParticipacion(p.idParticipacion!).subscribe({
          next: () => {
            this.alertService.success('Cancelada', 'La participación se canceló correctamente.');
            // Refrescar la vista actual
            if (this.modoVista === 'evento' && p.eventoDTO.idEvento) {
              this.cargarParticipacionesPorEvento(p.eventoDTO.idEvento);
            } else if (this.modoVista === 'familia' && p.familiaDTO.idFamilia) {
              this.cargarParticipacionesPorFamilia(p.familiaDTO.idFamilia);
            } else {
              this.cargarParticipaciones();
            }
          },
          error: () => this.alertService.error('Error', 'No se pudo cancelar la participación.')
        });
      }
    });
  }
}
