import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DBTableStatus {
  table_name: string;
  size_bytes: number;
  size_pretty: string;
}

export interface DatabaseInfo {
  name: string;
  size_bytes: number;
  size_pretty: string;
}

export interface DBStatus {
  total_bytes: number;
  total_pretty: string;
  databases: DatabaseInfo[];
  current_db: string;
  top_tables: DBTableStatus[];
  error?: string;
}

export interface RedisStatus {
  used_memory_human: string;
  used_memory: number;
  maxmemory: number;
  maxmemory_human: string;
  queue_length: number;
  error?: string;
}

export interface AIStatus {
  provider: string;
  total_input: number;
  total_output: number;
  request_count: number;
}

export interface Alert {
  level: string;
  service: string;
  message: string;
}

export interface SystemHealth {
  database: DBStatus;
  redis: RedisStatus;
  ai_usage: AIStatus[];
  alerts: Alert[];
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private apiUrl = `${environment.apiUrl}/api/admin/monitoring/health-status`;

  constructor(private http: HttpClient) { }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }
}
