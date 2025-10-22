import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Actividad } from '../../models/actividad';
import { ActividadService } from '../../services/actividad.service';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, RouterModule ],
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent implements OnInit {
  actividades: Actividad[] = [];
  @Input() limit?: number; // límite opcional de actividades

  constructor(
    private actividadService: ActividadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerActividades();
  }

  obtenerActividades(): void {
    this.actividadService.getActividades().subscribe({
      next: (data) => {
        console.log('Datos recibidos desde el backend:', data);
        this.actividades = this.limit ? data.slice(0, this.limit) : data;

        // comprobación rápida
        console.log(this.actividades.map(a => ({ id: a.idActividad, tieneTipo: !!a.tipoActividadDTO })));

        // Forzamos detección de cambios en caso de que Angular no haya pintado todavía
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener actividades:', err);
      }
    });
  }
}
