import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventoService } from '../../services/eventos.service';
import { ParticipacionService } from '../../services/participacion.service';
import { Evento } from '../../models/evento';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alerts.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit, OnChanges {
  @Input() actividadId?: number;
  @Input() estilo: 'lista' | 'catalogo' = 'catalogo';  // por defecto catálogo
  @Input() limit?: number;
  @Input() mostrarParticipacion: boolean = true;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

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

    // Caso inicial: si ya tenemos id, carga por actividad
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

  private filtrarFuturos(eventos: Evento[]): Evento[] {
    const hoy = new Date();
    return eventos.filter(e => new Date(e.fechaEvento) >= hoy);
  }
  private cargarEventosPorActividad(): void {
    this.eventosService.getEventosByActividad(this.actividadId!).subscribe({
      next: (data) => {
        this.eventos = this.filtrarFuturos(data)
                          .sort((a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime());
        if (this.limit) {
          this.eventos = this.eventos.slice(0, this.limit);
        }
        if (this.eventos.length === 0) {
          this.alertService.info('Eventos', 'No hay eventos futuros para esta actividad.');
        }
      },
      error: (err) => {
        console.error('Error al cargar eventos por actividad:', err);
        this.alertService.error('Error', 'No se pudieron cargar los eventos.');
      },
    });
  }

  private cargarTodosEventos(): void {
    this.eventosService.getEventos().subscribe({
      next: (data) => {
        let futuros = this.filtrarFuturos(data)
                         .sort((a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime());
        this.eventos = this.limit ? futuros.slice(0, this.limit) : futuros;
        if (this.eventos.length === 0) {
          this.alertService.info('Eventos', 'No hay eventos futuros disponibles.');
        }
      },
      error: (err) => {
        console.error('Error al cargar todos los eventos:', err);
        this.alertService.error('Error', 'No se pudieron cargar los eventos.');
      },
    });
  }

 moverDerecha() {
  const container = this.scrollContainer.nativeElement;
  const cardWidth = 300 + 16; // ancho + margen horizontal (mx-2)
  container.scrollBy({ left: cardWidth, behavior: 'smooth' });
}

moverIzquierda() {
  const container = this.scrollContainer.nativeElement;
  const cardWidth = 300 + 16;
  container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
}
}
