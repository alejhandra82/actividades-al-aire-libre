import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActividadesComponent } from '../../components/actividades/actividades.component';
import { EventosComponent } from '../eventos/eventos.component';
import { OpinionesComponent } from '../opiniones/opiniones.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ActividadesComponent, OpinionesComponent, EventosComponent, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

}
