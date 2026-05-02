import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService, SystemHealth } from '../../services/monitoring.service';

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring-dashboard.component.html',
  styleUrls: ['./monitoring-dashboard.component.css']
})
export class MonitoringDashboardComponent implements OnInit {
  healthData?: SystemHealth;
  loading = true;
  errorMessage: string | null = null;

  // Supabase Free Tier: 500MB
  public DB_LIMIT = 500 * 1024 * 1024; 

  constructor(
    private monitoringService: MonitoringService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;
    this.monitoringService.getSystemHealth().subscribe({
      next: (data) => {
        this.healthData = data;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => {
        console.error('Error loading health data:', err);
        this.errorMessage = 'No se pudieron cargar las métricas. Por favor, intenta de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get dbPercent(): number {
    if (!this.healthData) return 0;
    return (this.healthData.database.total_bytes / this.DB_LIMIT) * 100;
  }

  get redisPercent(): number {
    if (!this.healthData || !this.healthData.redis.maxmemory) return 0;
    return (this.healthData.redis.used_memory / this.healthData.redis.maxmemory) * 100;
  }

  get totalAiRequests(): number {
    if (!this.healthData || !this.healthData.ai_usage) return 0;
    return this.healthData.ai_usage.reduce((sum, ai) => sum + ai.request_count, 0);
  }

  getDbByName(name: string) {
    if (!this.healthData) return null;
    const search = name.toLowerCase();
    
    // Si buscamos licitaciones y no hay, pero hay 'postgres', asumimos que es esa (caso Supabase default)
    if (search === 'licitaciones') {
      const prodDb = this.healthData.database.databases.find(db => 
        db.name.toLowerCase() === 'licitaciones' || db.name.toLowerCase() === 'postgres'
      );
      if (prodDb) return prodDb;
    }

    return this.healthData.database.databases.find(db => 
      db.name.toLowerCase() === search || db.name.toLowerCase().includes(search)
    ) || null;
  }

  getDbStatusClass(): string {
    const p = this.dbPercent;
    if (p > 90) return 'bg-danger';
    if (p > 70) return 'bg-warning text-dark';
    return 'bg-success';
  }

  getDbProgressClass(): string {
    const p = this.dbPercent;
    if (p > 90) return 'bg-danger';
    if (p > 70) return 'bg-warning';
    return 'bg-success';
  }
}
