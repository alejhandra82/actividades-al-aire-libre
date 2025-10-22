import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ParticipacionService } from '../../services/participacion.service';
import { AlertService } from '../../services/alerts.service';
import { SessionService } from '../../services/session.service';
import { Participacion } from '../../models/participacion';

@Component({
  selector: 'app-participacion',
  standalone: true,
  imports: [CommonModule, UpperCasePipe],
  templateUrl: './participacion.component.html',
  styleUrls: ['./participacion.component.css']
})
export class ParticipacionComponent implements OnInit {
  @Input() eventoId!: number;

  familia: any = null;
  participacion?: Participacion; // guardamos la participación de la familia en este evento

  constructor(
    private participacionService: ParticipacionService,
    private alertService: AlertService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.familia = this.sessionService.obtenerFamilia();
    if (this.familia) {
      this.cargarParticipacion();
    }
  }

  // Cargar participación existente de la familia en este evento
  private cargarParticipacion(): void {
    this.participacionService.getParticipacionesPorEvento(this.eventoId).subscribe({
      next: (participaciones) => {
        // Buscamos si la familia ya tiene participación en este evento
        this.participacion = participaciones.find(
          (p) => p.familiaDTO.idFamilia === this.familia.idFamilia
        );
      },
      error: (err) => {
        console.error('Error cargando participaciones:', err);
        this.alertService.error('Error', 'No se pudieron cargar las participaciones.');
      }
    });
  }

  // Inscribirse en el evento
  participar(): void {
  if (!this.familia) {
    this.alertService.infoRedirige('Inicia sesión', 'Debes iniciar sesión para participar.')
      .then(() => this.router.navigate(['/login']));
    return;
  }

   this.alertService.confirm('¿Quieres participar?', 'Confirma tu participación en este evento')
      .then(confirmed => {
        if (!confirmed) return;

        const nuevaParticipacion: Participacion = {
          eventoDTO: { idEvento: this.eventoId },
          familiaDTO: { idFamilia: this.familia.idFamilia },
        
        };

        this.participacionService.crearParticipacion(nuevaParticipacion).subscribe({
          next: (p) => {
            this.participacion = p; // guardamos la participación generada con id del backend
            this.alertService.success('¡Éxito!', 'Te has inscrito en el evento.');
          },
          error: (err) => {
            console.error('Error creando participación:', err);
            this.alertService.error('Error', 'No se pudo registrar tu participación.')
          }
        });
        });
  }
  
 cancelarParticipacion(): void {
    if (!this.participacion?.idParticipacion) {
      this.alertService.info('Información', 'No hay participación para cancelar.');
      return;
    }

    this.alertService.confirm('Cancelar participación', '¿Deseas cancelar tu participación?')
      .then(confirmed => {
        if (!confirmed) return;

        this.participacionService.cancelarParticipacion(this.participacion!.idParticipacion!).subscribe({
          next: (p) => {
            this.participacion = p; // la entidad regresa con estado = "cancelado"
            this.alertService.success('Éxito', 'Tu participación ha sido cancelada.');
          },
          error: (err) => {
            console.error('Error cancelando participación:', err);
            this.alertService.error('Error', 'No se pudo cancelar la participación.');
          }
        });
      });
  }
}

