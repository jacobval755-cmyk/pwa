import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// Servicio
import { TelemetryService, Telemetry } from '../../services/telemetry.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    ChartModule,
    ProgressSpinnerModule,
    TooltipModule,
    TagModule
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

  // métricas de intervalo (en segundos)
  avgIntervalSec: number | null = null;
  currentIntervalSec: number | null = null;
  minIntervalSec: number | null = null;
  maxIntervalSec: number | null = null;

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.telemetryService.getLatest(20).subscribe({
      next: (data) => {
        // Ordenamos ascendente por tiempo, se ve más bonito en la gráfica
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.ts_esp || a.ts_server).getTime() -
            new Date(b.ts_esp || b.ts_server).getTime()
        );

        this.telemetry = sorted;
        this.lastUpdated = this.telemetry.length
          ? new Date(
              this.telemetry[this.telemetry.length - 1].ts_esp ||
              this.telemetry[this.telemetry.length - 1].ts_server
            )
          : null;

        this.computeIntervals(this.telemetry);
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

  /**
   * Calcula métricas de intervalo (en segundos) entre lecturas consecutivas.
   */
  private computeIntervals(data: Telemetry[]): void {
    if (!data || data.length < 2) {
      this.avgIntervalSec = null;
      this.currentIntervalSec = null;
      this.minIntervalSec = null;
      this.maxIntervalSec = null;
      return;
    }

    const deltas: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const prev = new Date(data[i - 1].ts_esp || data[i - 1].ts_server).getTime();
      const curr = new Date(data[i].ts_esp || data[i].ts_server).getTime();
      const deltaSec = Math.round((curr - prev) / 1000);
      if (!Number.isNaN(deltaSec) && deltaSec >= 0) {
        deltas.push(deltaSec);
      }
    }

    if (!deltas.length) {
      this.avgIntervalSec = null;
      this.currentIntervalSec = null;
      this.minIntervalSec = null;
      this.maxIntervalSec = null;
      return;
    }

    const sum = deltas.reduce((acc, v) => acc + v, 0);
    this.avgIntervalSec = Math.round(sum / deltas.length);
    this.currentIntervalSec = deltas[deltas.length - 1];
    this.minIntervalSec = Math.min(...deltas);
    this.maxIntervalSec = Math.max(...deltas);
  }

  /**
   * Diferencia en segundos con respecto a la lectura anterior.
   * Se usa en la tabla.
   */
  getDeltaSeconds(index: number): number | null {
    if (index === 0 || index >= this.telemetry.length) return null;

    const prev = this.telemetry[index - 1];
    const curr = this.telemetry[index];

    const tPrev = new Date(prev.ts_esp || prev.ts_server).getTime();
    const tCurr = new Date(curr.ts_esp || curr.ts_server).getTime();

    const deltaSec = Math.round((tCurr - tPrev) / 1000);
    return Number.isNaN(deltaSec) ? null : deltaSec;
  }

  /**
   * Última lectura (atajo para el template)
   */
  get lastTelemetry(): Telemetry | null {
    if (!this.telemetry.length) return null;
    return this.telemetry[this.telemetry.length - 1];
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
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
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
