import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private router: Router) {}

  goDashboard(): void {
    // Navegación mínima: solo UI/UX (sin lógica real de auth)
    this.router.navigate(['/dashboard']);
  }

}
