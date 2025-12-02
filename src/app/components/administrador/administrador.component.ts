import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {
  sidebarOpen = true;

  ngOnInit() {
    // Al cargar el componente, si estamos en desktop, abrir sidebar
    if (window.innerWidth > 768) {
      this.sidebarOpen = true;
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('collapsed');
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', !this.sidebarOpen);
    }

    // Lógica simple: si estamos en desktop, forzar abierto
    if (window.innerWidth > 768) {
      this.sidebarOpen = true;
      if (sidebar) sidebar.classList.remove('collapsed');
    }
  }
}
