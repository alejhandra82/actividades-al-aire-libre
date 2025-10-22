import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { OpinionesComponent } from './components/opiniones/opiniones.component';
import { AdministradorComponent } from './components/administrador/administrador.component';
import { EventosComponent } from './components/eventos/eventos.component';
import { PerfilUsuarioComponent } from './components/perfil-usuario/perfil-usuario.component';
import { PerfilFamiliaComponent } from './components/perfil-familia/perfil-familia.component';
import { ActividadDetalleComponent } from './components/actividad-detalle/actividad-detalle.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },          // Página de inicio
  { path: 'actividades', component: ActividadesComponent },
  { path: 'perfil-usuario', component:PerfilUsuarioComponent },
  { path: 'perfil-familia', component:PerfilFamiliaComponent },  
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'opiniones', component: OpinionesComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'actividad/:id', component: ActividadDetalleComponent },
  {
    path: 'administrador',
    component: AdministradorComponent,
    children: [
      { path: '', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'actividades', loadComponent: () => import('./components/admin-actividades/admin-actividades.component').then(m => m.AdminActividadesComponent) },
      { path: 'eventos', loadComponent: () => import('./components/admin-eventos/admin-eventos.component').then(m => m.AdminEventosComponent) },
      { path: 'participaciones', loadComponent: () => import('./components/admin-participaciones/admin-participaciones.component').then(m => m.AdminParticipacionesComponent) },
      { path: 'opiniones', loadComponent: () => import('./components/admin-opiniones/admin-opiniones.component').then(m => m.AdminOpinionesComponent) }
    ]
  },
  
  
  
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirige rutas no existentes a inicio
];

