import { Component } from '@angular/core';
import { Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

// Angular
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  loading = false;

  constructor(private router: Router) {}

  goDashboard(): void {
    this.errorMessage = null;
    this.loading = true;

    const USERS = [
      { email: 'jacob@gmail.com', password: '123456' },
      { email: 'emma@gmail.com', password: '123456' }
    ];

    const isValid = USERS.some(
      user =>
        user.email === this.email.trim() &&
        user.password === this.password.trim()
    );

    // Simula un pequeño tiempo de “cargando”
    setTimeout(() => {
      this.loading = false;

      if (isValid) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    }, 800);
  }
}
