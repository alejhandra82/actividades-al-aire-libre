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
  const id = +this.route.snapshot.params['id']; // + convierte a número

  if (id) {
    this.actividadService.getActividadById(id).subscribe({
      next: (data) => {
        this.actividad = data;

        // 🔹 Pedir URL SAS de la imagen de la actividad
        this.actividadService.obtenerFotoActividad(id).subscribe({
          next: (sasUrl) => {
            console.log("SAS DETALLE:", sasUrl);
            this.imagenPrincipalSeleccionada = sasUrl;
          },
          error: () => {
            this.imagenPrincipalSeleccionada = "assets/actividades/default.jpg";
          }
        });
      },
      error: (err) => {
        console.error("Error al obtener actividad:", err);
      }
    });
  }

  // Obtener familia logueada
  this.familiaLogueada = this.sessionService.obtenerFamilia();
}


cambiarImagenPrincipal(url: string) {
  this.imagenPrincipalSeleccionada = url;
}

 volverAActividades() {
    this.router.navigate(['/actividades']);
  }

}
