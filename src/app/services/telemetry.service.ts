import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backendConfig } from '../app.config.backend';
import { Observable } from 'rxjs';

export interface Telemetry {
  _id: string;
  device_id: string;
  ts_esp: string;
  ts_server: string;
  temperature: number;
  humidity: number;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {

  private baseUrl = backendConfig.apiUrl;

  constructor(private http: HttpClient) {}

  getLatest(limit: number = 20): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.baseUrl}/api/telemetry/latest?limit=${limit}`);
  }

  getCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/api/telemetry/count`);
  }
}
