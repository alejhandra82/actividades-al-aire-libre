import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocalizacionService } from '../../services/localizaciones.service';
import { Localizacion } from '../../models/localizaciones';

@Component({
  selector: 'app-localizacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './localizacion.component.html',
  styleUrls: ['./localizacion.component.css']
})
export class LocalizacionComponent implements OnInit {

  @Input() idActividad!: number; // Recibimos el id de la actividad desde actividad-detalle
  localizaciones: Localizacion[] = [];
  mapSafeUrl: SafeResourceUrl | null = null;


constructor(
    private localizacionService: LocalizacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.idActividad) {
      this.cargarLocalizacion();
  }
}

  // Método sencillo para cargar la localización desde el backend
  cargarLocalizacion(): void {
    this.localizacionService.getByActividad(this.idActividad)
      .subscribe((data) => {
        this.localizaciones = data;
        if (this.localizaciones.length > 0) {
          const loc = this.localizaciones[0];
          const url = `https://maps.google.com/maps?q=${loc.latitud},${loc.longitud}&z=15&output=embed`;
          // marcamos la URL como segura
          this.mapSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      });
  }

  abrirEnGoogleMaps(): void {
    if (this.localizaciones.length > 0) {
      const loc = this.localizaciones[0];
      const url = `https://www.google.com/maps?q=${loc.latitud},${loc.longitud}`;
      window.open(url, '_blank');
    }
  }
}
