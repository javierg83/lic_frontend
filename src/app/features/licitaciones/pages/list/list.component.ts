import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LicitacionService } from '../../services/licitacion.service';

@Component({
  selector: 'app-licitacion-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list.component.html',
  styles: [`
    .table-container {
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header-row h2 {
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      text-align: left;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: #def7ec;
      color: #03543f;
    }
    .btn-show {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    .btn-show:hover {
      background-color: #2563eb;
    }
    .btn-new {
      padding: 0.6rem 1.25rem;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn-new:hover {
      background-color: #059669;
    }
  `]
})
export class LicitacionListComponent implements OnInit {
  public licitacionService = inject(LicitacionService);
  private router = inject(Router);

  ngOnInit(): void {
    this.licitacionService.getLicitaciones().subscribe();
  }

  onShow(id: string): void {
    this.router.navigate(['/licitaciones', id]);
  }
}
