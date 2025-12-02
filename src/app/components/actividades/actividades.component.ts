import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Actividad } from '../../models/actividad';
import { ActividadService } from '../../services/actividad.service';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css'],
})
export class ActividadesComponent implements OnInit {
  actividades: Actividad[] = [];
  tipos: string[] = []; // para llenar el select de tipos
  tipoFiltro: string = ''; // valor seleccionado en el select
  @Input() limit?: number; // límite opcional de actividades

  constructor(
    private actividadService: ActividadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerActividades();
  }

  obtenerActividades(): void {
    this.actividadService.getActividades().subscribe(
      (data) => {
        // Crear lista de tipos
        let tiposTemp: string[] = [];
        data.forEach((actividad) => {
          let tipo = actividad.tipoActividadDTO.nombreTipoActividad;
          if (tiposTemp.indexOf(tipo) === -1) {
            tiposTemp.push(tipo);
          }
        });
        this.tipos = tiposTemp;

        // Filtrar por tipo
        let filtradas: Actividad[] = [];
        if (!this.tipoFiltro) {
          // si no hay filtro, todas las actividades
          filtradas = data;
        } else {
          data.forEach((actividad) => {
            if (
              actividad.tipoActividadDTO.nombreTipoActividad === this.tipoFiltro
            ) {
              filtradas.push(actividad);
            }
          });
        }

        // Aplicar límite si existe
        if (this.limit && this.limit > 0) {
          this.actividades = filtradas.slice(0, this.limit);
        } else {
          this.actividades = filtradas;
        }

        // Para cada actividad pedimos la URL SAS y la almacenamos en  'imagenUrl'
        this.actividades.forEach((act) => {
          // Siempre pedimos la SAS, incluso para default
          this.actividadService
            .obtenerFotoActividad(act.idActividad!)
            .subscribe({
              next: (sasUrl: string) => {
                act.imagenUrl = sasUrl; // esto ya puede ser la imagen real o la default con SAS
              },
              error: () => {
                // fallback local solo si realmente falla la petición
                act.imagenUrl = 'assets/actividades/default.jpg';
              },
            });
        });

        this.cdr.detectChanges();
      },
      (err) => console.error('Error al obtener actividades:', err)
    );
  }

  // Se llama al cambiar el select de tipo
  onTipoCambio(): void {
    this.obtenerActividades();
  }
}
