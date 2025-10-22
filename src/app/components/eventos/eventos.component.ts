import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventoService } from '../../services/eventos.service';
import { ParticipacionService } from '../../services/participacion.service';
import { Evento } from '../../models/evento';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alerts.service';
import { ParticipacionComponent } from '../participacion/participacion.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, ParticipacionComponent],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit, OnChanges {
  @Input() actividadId?: number;
  @Input() estilo: 'lista' | 'catalogo' = 'catalogo';  // por defecto catálogo
  
  familia: any = null;
  eventos: Evento[] = [];
  participacionesFamilia: { [eventoId: number]: string } = {};

  constructor(
    private eventosService: EventoService,
    private participacionService: ParticipacionService,
    private alertService: AlertService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.familia = this.sessionService.obtenerFamilia();

    // 👇 caso inicial: si ya tenemos id, carga por actividad
    if (this.actividadId) {
      this.cargarEventosPorActividad();
    } else {
      this.cargarTodosEventos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actividadId']) {
      if (this.actividadId) {
        this.cargarEventosPorActividad();
      } else {
        this.cargarTodosEventos();
      }
    }
  }

  private cargarEventosPorActividad(): void {
    console.log('Cargando eventos por actividadId=', this.actividadId);

    this.eventosService.getEventosByActividad(this.actividadId!).subscribe({
      next: (data) => {
        this.eventos = data;
        if (this.eventos.length === 0) {
          this.alertService.info('Eventos', 'No hay eventos disponibles para esta actividad.');
        }
      },
      error: (err) => {
        console.error('Error al cargar eventos por actividad:', err);
        this.alertService.error('Error', 'No se pudieron cargar los eventos.');
      },
    });
  }

  private cargarTodosEventos(): void {
    console.log('Cargando todos los eventos...');

    this.eventosService.getEventos().subscribe({
      next: (data) => {
        this.eventos = data;
        if (this.eventos.length === 0) {
          this.alertService.info('Eventos', 'No hay eventos disponibles en este momento.');
        }
      },
      error: (err) => {
        console.error('Error al cargar todos los eventos:', err);
        this.alertService.error('Error', 'No se pudieron cargar los eventos.');
      },
    });
  }
}
