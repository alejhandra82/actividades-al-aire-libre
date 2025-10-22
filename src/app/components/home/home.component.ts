import { Component } from '@angular/core';
import { ActividadesComponent } from '../../components/actividades/actividades.component';
import { EventosComponent } from '../eventos/eventos.component';
import { OpinionesComponent } from '../opiniones/opiniones.component';

@Component({
  selector: 'app-home',
  imports: [ActividadesComponent, OpinionesComponent, EventosComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
