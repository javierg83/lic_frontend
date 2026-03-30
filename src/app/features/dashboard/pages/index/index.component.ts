import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class DashboardIndexComponent implements OnInit {
  public dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  public data: DashboardResponse | null = null;
  public loading = true;
  public error = false;
  public errorMessage: string = '';

  ngOnInit(): void {
    console.log('Fetching dashboard data...');
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        console.log('Dashboard data received:', res);
        this.data = res;
        this.loading = false;

        // FORZAMOS LA ACTUALIZACIÓN EN CASO DE QUE ZONE.JS FALLE
        this.cdr.detectChanges();

        if (!res) {
          this.error = true;
          this.errorMessage = 'Data is null or undefined! Full response: ' + JSON.stringify(res);
          console.error('Data is null or undefined! Full response:', res);
        } else {
          setTimeout(() => {
            try {
              this.renderCharts();
            } catch (e: any) {
              this.error = true;
              this.errorMessage = 'Chart Rendering Error: ' + e.message;
              this.cdr.detectChanges();
            }
          }, 150);
        }
      },
      error: (err) => {
        console.error('HTTP Error fetching dashboard data:', err);
        this.error = true;
        this.errorMessage = err.message || JSON.stringify(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  renderCharts(): void {
    if (!this.data) return;

    // 1. Gráfico Funnel Integral Operativo
    const pipelineCanvas = document.getElementById('pipelineChart') as HTMLCanvasElement;
    if (pipelineCanvas) {
      const d = this.data.distribucion_estados;
      const fase1 = (d['PENDIENTE']||0) + (d['EXTRACCION_SEMANTICA_EN_PROCESO']||0) + (d['EXTRACCION_SEMANTICA_COMPLETADA']||0) + (d['HOMOLOGACION_EN_PROCESO']||0) + (d['PROCESANDO_DOCUMENTOS']||0) + (d['DOCUMENTOS_PROCESADOS']||0);
      const fase2 = (d['HOMOLOGACION_COMPLETADA']||0) + (d['EN_ANALISIS']||0);
      const fase3 = (d['EN_PREPARACION_OFERTA']||0);
      const fase4 = (d['POSTULACION_ENVIADA']||0) + (d['OFERTA_PRESENTADA']||0) + (d['EN_EVALUACION']||0);
      const fase5 = (d['ADJUDICADA']||0);
      const fase6 = (d['NO_ADJUDICADA']||0) + (d['DECLINADA']||0) + (d['CERRADA']||0);

      new Chart(pipelineCanvas, {
        type: 'bar',
        data: {
          labels: ['1. Procesamiento Máquina', '2. Por Analizar', '3. Prep. Oferta', '4. Postuladas / Eval', '5. Adjudicadas (Win)', '6. Perdidas/Cerradas (Loss)'],
          datasets: [{
            label: 'Nº Licitaciones',
            data: [fase1, fase2, fase3, fase4, fase5, fase6],
            backgroundColor: ['#9ca3af', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ef4444']
          }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
      });
    }

    // 1-B. Gráfico Donut Financiero
    const financialCanvas = document.getElementById('financialDoughnutChart') as HTMLCanvasElement;
    if (financialCanvas) {
      new Chart(financialCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Adjudicado (Win)', 'En Evaluación', 'Perdido (Loss)'],
          datasets: [{
            data: [
              this.data.metricas_financieras.monto_adjudicado,
              this.data.metricas_financieras.monto_en_evaluacion,
              this.data.metricas_financieras.monto_perdido
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Uso Mensual (Línea)
    const usoMensualCanvas = document.getElementById('usoMensualChart') as HTMLCanvasElement;
    if (usoMensualCanvas) {
      const labels = Object.keys(this.data.uso_mensual);
      const values = Object.values(this.data.uso_mensual);
      new Chart(usoMensualCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Cargas por Mes',
            data: values,
            borderColor: '#8b5cf6',
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(139, 92, 246, 0.2)'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 3. User Performance (Bar Chart Vertical combinada)
    const userPerformanceCanvas = document.getElementById('userPerformanceChart') as HTMLCanvasElement;
    if (userPerformanceCanvas) {
      const labels = Object.keys(this.data.por_usuario);
      const cargadas = labels.map(l => this.data!.por_usuario[l].cargadas);
      const adjudicadas = labels.map(l => this.data!.por_usuario[l].adjudicadas);

      new Chart(userPerformanceCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Cargadas', data: cargadas, backgroundColor: '#cbd5e1' },
            { label: 'Adjudicadas', data: adjudicadas, backgroundColor: '#10b981' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  // Helpers UI para KPIs formatting
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  }
}
