import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Servicio
import { TelemetryService, Telemetry } from '../../services/telemetry.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    TableModule,
    ButtonModule,
    ChartModule,
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  telemetry: Telemetry[] = [];
  count: number | null = null;
  loading = true;

  chartData: any;
  chartOptions: any;
  lastUpdated: Date | null = null;

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.telemetryService.getLatest(20).subscribe({
      next: (data) => {
        // ordenamos ascendente por tiempo, se ve más bonito en la gráfica
        this.telemetry = [...data].sort(
          (a, b) => new Date(a.ts_esp).getTime() - new Date(b.ts_esp).getTime()
        );
        this.lastUpdated = this.telemetry.length
          ? new Date(this.telemetry[this.telemetry.length - 1].ts_esp)
          : null;

        this.buildChart(this.telemetry);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando latest:', err);
        this.loading = false;
      }
    });

    this.telemetryService.getCount().subscribe({
      next: ({ count }) => (this.count = count),
      error: (err) => console.error('Error cargando count:', err)
    });
  }

  private buildChart(data: Telemetry[]): void {
    const labels = data.map(d =>
      new Date(d.ts_esp || d.ts_server).toLocaleTimeString()
    );
    const temps = data.map(d => d.temperature);
    const hums = data.map(d => d.humidity);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temps,
          fill: false,
          borderColor: '#f97316', // naranja
          backgroundColor: '#fed7aa',
          tension: 0.3,
          pointRadius: 3
        },
        {
          label: 'Humedad (%)',
          data: hums,
          fill: false,
          borderColor: '#3b82f6', // azul
          backgroundColor: '#bfdbfe',
          tension: 0.3,
          pointRadius: 3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, minRotation: 0 },
          grid: { display: false }
        },
        y: {
          beginAtZero: true
        }
      }
    };
  }
}
