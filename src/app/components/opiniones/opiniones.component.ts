import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Opiniones } from '../../models/opiniones';
import { OpinionService } from '../../services/opiniones.service';
import { AlertService } from '../../services/alerts.service';
import { ParticipacionService } from '../../services/participacion.service'; // ✅ nuevo servicio

@Component({
  selector: 'app-opiniones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './opiniones.component.html',
  styleUrls: ['./opiniones.component.css']
})
export class OpinionesComponent implements OnInit {

  @Input() idActividad?: number;
  @Input() familiaLogueada?: any; 
  opinionesDestacadas: Opiniones[] = [];
  opiniones: Opiniones[] = [];
  formularioOpinion!: FormGroup;
  participoEnEvento: boolean = false;

  constructor(
    private fb: FormBuilder,
    private opinionService: OpinionService,
    private participacionService: ParticipacionService, // ✅ inyectamos
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.formularioOpinion = this.fb.group({
      comentario: ['', [Validators.required, Validators.minLength(5)]],
      puntuacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    if (this.idActividad) {
      this.cargarOpinionesYValidar();
    } else {
      this.cargarOpinionesDestacadas();
    }
  }

  // ✅ Carga opiniones de la actividad y valida participación
  private cargarOpinionesYValidar(): void {
    this.opinionService.getOpinionesPorActividad(this.idActividad!).subscribe({
      next: (opiniones) => {
        this.opiniones = opiniones;
        const idFamilia = this.familiaLogueada?.idFamilia;

        // 🔸 Verificar si ya opinó
        if (opiniones.some(o => o.familiaDTO?.idFamilia === idFamilia)) {
          this.formularioOpinion.disable();
          console.log('⚠️ La familia ya opinó en esta actividad');
          return;
        }

        // 🔸 Verificar si ha participado en algún evento de la actividad
        this.validarParticipacionEnEventos(this.idActividad!, idFamilia);
      },
      error: (err) => console.error('Error al obtener opiniones:', err)
    });
  }

  // ✅ Carga opiniones destacadas (para Home)
  private cargarOpinionesDestacadas(): void {
    this.opinionService.getDestacadas().subscribe({
      next: (data) => this.opinionesDestacadas = data,
      error: (err) => console.error('Error al obtener destacadas:', err)
    });
  }

  // ✅ Verifica si la familia participó en algún evento asociado a la actividad
  private validarParticipacionEnEventos(idActividad: number, idFamilia: number): void {
    this.opinionService.getEventosPorActividad(idActividad).subscribe({
      next: (eventos) => {
        if (!eventos || eventos.length === 0) {
          console.log('⚠️ No hay eventos para esta actividad');
          this.formularioOpinion.disable();
          this.participoEnEvento = false;
          return;
        }

        let participo = false;
        let pendientes = eventos.length;

        eventos.forEach((evento: any) => {
          this.participacionService.existeParticipacion(evento.idEvento, idFamilia).subscribe({
            next: (existe) => {
              if (existe) participo = true;
            },
            complete: () => {
              pendientes--;
              if (pendientes === 0) {
              this.participoEnEvento = participo; // ← asignamos aquí
              if (!participo) this.formularioOpinion.disable();
                console.log('La familia no participó en ningún evento de esta actividad');
              }
            }
          });
        });
      },
      error: (err) => console.error('Error al obtener eventos por actividad:', err)
    });
  }

  crearOpinion(): void {
    if (this.formularioOpinion.invalid) {
      this.alertService.error('Error', 'Por favor completa el formulario correctamente');
      return;
    }

    const nuevaOpinion: Opiniones = {
      comentario: this.formularioOpinion.value.comentario,
      puntuacion: this.formularioOpinion.value.puntuacion,
      actividadDTO: { idActividad: this.idActividad } as any,
      familiaDTO: this.familiaLogueada
    };

    this.opinionService.crearOpinion(nuevaOpinion).subscribe({
      next: (opinionCreada) => {
        this.opiniones.unshift(opinionCreada);
        this.alertService.success('Éxito', 'Opinión creada correctamente');
        this.formularioOpinion.reset({ puntuacion: 5, comentario: '' });
        this.formularioOpinion.disable();
      },
      error: (err) => {
        console.error('Error al crear opinión:', err);
        this.alertService.error('Error', 'No se pudo crear la opinión');
      }
    });
  }

  seleccionarPuntuacion(valor: number): void {
    this.formularioOpinion.get('puntuacion')?.setValue(valor);
  }
}
