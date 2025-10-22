import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../services/actividad.service';
import { Actividad } from '../../models/actividad';
import { EventosComponent } from '../eventos/eventos.component';
import { OpinionesComponent } from '../opiniones/opiniones.component';
import { SessionService } from '../../services/session.service';
import { LocalizacionComponent } from '../localizacion/localizacion.component'; 

@Component({
  selector: 'app-actividad-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, EventosComponent, OpinionesComponent, LocalizacionComponent],
  templateUrl: './actividad-detalle.component.html',
  styleUrls: ['./actividad-detalle.component.css']
})
export class ActividadDetalleComponent implements OnInit {

  actividad?: Actividad;
  familiaLogueada?: any;
  imagenPrincipalSeleccionada: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private actividadService: ActividadService
  ) {}

  ngOnInit(): void {
    // Forma sencilla de obtener el ID de la URL
    const id = +this.route.snapshot.params['id']; // + convierte a número

    if (id) {
      // Llamamos al servicio para obtener la actividad
      this.actividadService.getActividadById(id).subscribe(
        data => this.actividad = data,
        err => console.error('Error al obtener actividad:', err)
      );
    }

    // Obtener la familia logueada desde SessionService
  this.familiaLogueada = this.sessionService.obtenerFamilia();
  }

  imagenesSecundariasArray(): string[] {
  if (!this.actividad?.imagenesSecundarias) return [];
  try {
    return JSON.parse(this.actividad.imagenesSecundarias);
  } catch (e) {
    console.error('Error parseando imágenes secundarias:', e);
    return [];
  }
  
}
cambiarImagenPrincipal(url: string) {
  this.imagenPrincipalSeleccionada = url;
}

 volverAActividades() {
    this.router.navigate(['/actividades']);
  }

}
