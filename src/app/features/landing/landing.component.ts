import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements AfterViewInit {

  // ── Calculadora ROI ──────────────────────────────────────────────────────
  // Valores iniciales configurados para mostrar una comparación cercana a:
  // Costo manual: $20.833 vs Plan Básico: $19.990
  licWeek = 5;
  minPerLic = 10;
  itemsPerLic = 5;
  salario = 800000;
  missPerc = 40;

  get licMes() {
    return this.licWeek * 4;
  }

  get costoHora() {
    return this.salario / 160;
  }

  // Tiempo total: base fija + 0.5 min por cada ítem
  get minTotalPorLic() {
    return this.minPerLic + (this.itemsPerLic * 0.5);
  }

  get ahorroMes() {
    return this.licMes * (this.minTotalPorLic / 60) * this.costoHora;
  }

  get licExtra() {
    return Math.round(this.licMes * (this.missPerc / 100));
  }

  get planCost() {
    return this.licWeek <= 25 ? 19990 : this.licWeek <= 125 ? 39990 : 79990;
  }

  get ahorroNeto() {
    return Math.max(0, this.ahorroMes - this.planCost);
  }

  get roi() {
    return this.ahorroMes > 0 ? this.ahorroMes / this.planCost : 0;
  }

  get planBarPct() {
    return this.ahorroMes > 0
      ? Math.max(4, Math.min(100, Math.round((this.planCost / this.ahorroMes) * 100)))
      : 5;
  }

  // Porcentaje de menor costo de IM Licitaciones versus trabajo manual.
  get savingPct() {
    if (this.ahorroMes <= 0) {
      return 0;
    }

    const pct = 100 - ((this.planCost / this.ahorroMes) * 100);

    return Math.max(0, Math.round(pct));
  }

  // Subtítulo contextual para la métrica "Ahorro neto"
  get ahorroNetoSubtitle(): string {
    return `${this.fmtClp(this.ahorroMes)} en horas — ${this.fmtClp(this.planCost)} plan`;
  }

  // Subtítulo contextual para "Licitaciones adicionales"
  get licExtraSubtitle(): string {
    return `${this.missPerc}% del total que no alcanzan a revisar`;
  }

  // Subtítulo contextual para "ROI"
  get roiSubtitle(): string {
    return `por cada peso invertido en el plan`;
  }

  get planName(): string {
    if (this.licWeek <= 25) {
      return 'Básico — $19.990/mes';
    }

    if (this.licWeek <= 125) {
      return 'Profesional — $39.990/mes';
    }

    return 'Empresa — $79.990/mes';
  }

  // Tooltip dinámico según cantidad de ítems
  get itemsTooltip(): string {
    if (this.itemsPerLic <= 10) {
      return 'Complejidad baja: fácil de revisar manualmente.';
    }

    if (this.itemsPerLic <= 40) {
      return 'Complejidad media: toma bastante tiempo revisar ítem a ítem.';
    }

    if (this.itemsPerLic <= 80) {
      return 'Complejidad alta: la mayoría de los analistas omiten estas licitaciones.';
    }

    return '⚠️ Complejidad muy alta: prácticamente imposible revisar manualmente. IM Licitaciones las analiza en segundos.';
  }

  fmtClp(n: number): string {
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  // ── FAQ ──────────────────────────────────────────────────────────────────
  faqs = [
    {
      q: '¿IM Licitaciones postula automáticamente a las licitaciones?',
      a: 'No. IM Licitaciones detecta oportunidades de negocio y te avisa cuándo el Estado compra lo que tú vendes. La decisión de postular y la preparación de la cotización siguen siendo tuyas. Nosotros te ahorramos la búsqueda.',
      open: false
    },
    {
      q: '¿Qué necesito para empezar?',
      a: 'Dos cosas: (1) Un archivo CSV con tu catálogo de productos (SKU, descripción, unidad de medida). (2) Configurar tu perfil comercial: rubros del Mercado Público que te interesan, tipos de compra y criterios de búsqueda. El onboarding asistido de 30 minutos, incluido en todos los planes, te guía en ambos pasos.',
      open: false
    },
    {
      q: '¿Cómo defino qué licitaciones quiero recibir?',
      a: 'En tu panel configuras tu perfil de búsqueda: puedes seleccionar rubros específicos (ej. insumos médicos, tecnología, construcción), tipos de compra (licitación pública, compra ágil, trato directo), montos y regiones. El sistema solo analizará lo que calce con esos criterios, reduciendo el ruido al mínimo.',
      open: false
    },
    {
      q: '¿Cómo es mejor que buscar directamente en ChileCompra?',
      a: 'ChileCompra requiere que tú busques activamente y conozcas los códigos correctos. IM Licitaciones monitorea de forma continua y usa IA semántica para detectar coincidencias aunque el Estado use sinónimos, códigos UNSPSC o nombres técnicos distintos a los de tu catálogo.',
      open: false
    },
    {
      q: '¿Mi catálogo y perfil comercial son visibles para otros usuarios?',
      a: 'No. Toda tu configuración —catálogo, nichos y preferencias— es privada y completamente aislada. La arquitectura multi-tenant del sistema garantiza que ningún otro proveedor tenga acceso a tu información.',
      open: false
    },
    {
      q: '¿Puedo cambiar de plan o cancelar?',
      a: 'Sí. Puedes cambiar de plan o cancelar en cualquier momento desde tu panel de control, sin cobros adicionales ni multas. Los precios son referenciales y pueden ajustarse durante el período de lanzamiento.',
      open: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs = this.faqs.map((f, i) => ({
      ...f,
      open: i === index ? !f.open : false
    }));
  }

  ngAfterViewInit(): void {
    // Smooth scroll para anclas del nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = (anchor as HTMLAnchorElement).getAttribute('href');

        if (href && href.startsWith('#')) {
          e.preventDefault();

          const target = document.querySelector(href);

          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}