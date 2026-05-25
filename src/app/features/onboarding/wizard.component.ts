import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Subcategoria {
  codigo: string;
  nombre: string;
  ejemplo: string;
  selected?: string; // 'INTERESA', 'NO_INTERESA', 'QUIZAS'
}

interface Rubro {
  codigo: string;
  nombre: string;
  descripcion: string;
  subcategorias: Subcategoria[];
  selected?: boolean;
}

interface Region {
  codigo: string;
  nombre: string;
  selected?: boolean;
}

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss'
})
export class WizardComponent implements OnInit {
  pasoActual = signal(1);
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // Paso 1: Datos de Cuenta
  empresaNombre = '';
  empresaRut = '';
  contactoNombre = '';
  contactoEmail = '';
  contactoTelefono = '';
  password = '';
  planSeleccionado = 'profesional'; // 'basico', 'profesional', 'premium'

  // Paso 2: Rubros (se cargan de la API)
  rubros = signal<Rubro[]>([]);

  // Paso 3: Subcategorías (computado según rubros seleccionados)
  subcategoriasSeleccionadas = computed(() => {
    const list: Subcategoria[] = [];
    this.rubros().forEach(r => {
      if (r.selected) {
        r.subcategorias.forEach(s => {
          // Inicializar selección si no existe
          if (!s.selected) {
            s.selected = 'INTERESA';
          }
          list.push(s);
        });
      }
    });
    return list;
  });

  // Paso 4: Regiones
  regiones = signal<Region[]>([
    { codigo: 'RM', nombre: 'Región Metropolitana de Santiago', selected: true },
    { codigo: 'VA', nombre: 'Región de Valparaíso', selected: false },
    { codigo: 'BI', nombre: 'Región del Biobío', selected: false },
    { codigo: 'AR', nombre: 'Región de La Araucanía', selected: false },
    { codigo: 'LL', nombre: 'Región de Los Lagos', selected: false },
    { codigo: 'CO', nombre: 'Región de Coquimbo', selected: false },
    { codigo: 'OH', nombre: 'Región del Libertador Gral. Bernardo O’Higgins', selected: false },
    { codigo: 'MA', nombre: 'Región del Maule', selected: false },
    { codigo: 'TA', nombre: 'Región de Tarapacá', selected: false },
    { codigo: 'AN', nombre: 'Región de Antofagasta', selected: false },
    { codigo: 'AT', nombre: 'Región de Atacama', selected: false },
    { codigo: 'LR', nombre: 'Región de Los Ríos', selected: false },
    { codigo: 'AP', nombre: 'Región de Arica y Parinacota', selected: false },
    { codigo: 'NUB', nombre: 'Región de Ñuble', selected: false },
    { codigo: 'AY', nombre: 'Región de Aysén del Gral. Carlos Ibáñez del Campo', selected: false },
    { codigo: 'MG', nombre: 'Región de Magallanes y de la Antártica Chilena', selected: false }
  ]);

  todoChile = false;

  // Paso 5: Filtros y Keywords
  montoMinimo = 0;
  montoMaximo: number | null = null;
  palabrasClaveInput = ''; // ingresadas separadas por coma
  palabrasExcluidasInput = ''; // ingresadas separadas por coma
  terminosAceptados = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarRubros();
  }

  cargarRubros() {
    this.http.get<any>(`${environment.apiUrl}/onboarding/rubros`).subscribe({
      next: (res) => {
        if (res && res.data) {
          const rubrosApi = res.data.map((r: any) => ({
            ...r,
            selected: false,
            subcategorias: r.subcategorias.map((s: any) => ({
              ...s,
              selected: 'INTERESA'
            }))
          }));
          this.rubros.set(rubrosApi);
        }
      },
      error: (err) => {
        console.error('Error cargando rubros:', err);
        this.errorMsg.set('No se pudo cargar el catálogo de rubros. Por favor, recarga la página.');
      }
    });
  }

  toggleTodoChile() {
    this.todoChile = !this.todoChile;
    const current = this.regiones();
    current.forEach(r => r.selected = this.todoChile);
    this.regiones.set([...current]);
  }

  onRegionChange() {
    // Si alguna se desmarca, todoChile es false. Si todas se marcan, todoChile es true
    const allSelected = this.regiones().every(r => r.selected);
    this.todoChile = allSelected;
  }

  seleccionarPlan(plan: string) {
    this.planSeleccionado = plan;
  }

  seleccionarRubro(rubro: Rubro) {
    rubro.selected = !rubro.selected;
    this.rubros.set([...this.rubros()]);
  }

  siguientePaso() {
    this.errorMsg.set(null);
    const paso = this.pasoActual();
    
    if (paso === 1) {
      if (!this.empresaNombre || !this.empresaRut || !this.contactoNombre || !this.contactoEmail || !this.contactoTelefono || !this.password) {
        this.errorMsg.set('Por favor, completa todos los campos del paso 1.');
        return;
      }
      if (this.password.length < 6) {
        this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    } else if (paso === 2) {
      const algunRubroSelected = this.rubros().some(r => r.selected);
      if (!algunRubroSelected) {
        this.errorMsg.set('Debes seleccionar al menos un rubro amplio de interés.');
        return;
      }
    } else if (paso === 4) {
      const algunaRegionSelected = this.regiones().some(r => r.selected);
      if (!algunaRegionSelected) {
        this.errorMsg.set('Debes seleccionar al menos una región donde participas.');
        return;
      }
    }

    this.pasoActual.set(paso + 1);
  }

  anteriorPaso() {
    this.errorMsg.set(null);
    const paso = this.pasoActual();
    if (paso > 1) {
      this.pasoActual.set(paso - 1);
    }
  }

  enviarOnboarding() {
    this.errorMsg.set(null);
    
    if (!this.terminosAceptados) {
      this.errorMsg.set('Debes aceptar los términos y condiciones de servicio.');
      return;
    }

    this.loading.set(true);

    // Preparar listas
    const rubrosCodigos = this.rubros()
      .filter(r => r.selected)
      .map(r => r.codigo);

    const subcategoriasData = this.subcategoriasSeleccionadas().map(s => ({
      codigo: s.codigo,
      decision: s.selected || 'INTERESA'
    }));

    const regionesData = this.regiones()
      .filter(r => r.selected)
      .map(r => ({ codigo: r.codigo, nombre: r.nombre }));

    const palabrasClave = this.palabrasClaveInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const palabrasExcluidas = this.palabrasExcluidasInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const payload = {
      nombre_empresa: this.empresaNombre,
      rut_empresa: this.empresaRut,
      plan: this.planSeleccionado,
      nombre_contacto: this.contactoNombre,
      email_contacto: this.contactoEmail,
      telefono_contacto: this.contactoTelefono,
      password: this.password,
      rubros: rubrosCodigos,
      subcategorias: subcategoriasData,
      regiones: regionesData,
      monto_minimo: this.montoMinimo,
      monto_maximo: this.montoMaximo,
      palabras_clave: palabrasClave,
      palabras_excluidas: palabrasExcluidas
    };

    this.http.post<any>(`${environment.apiUrl}/onboarding/finalize`, payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMsg.set('¡Registro completado! Redirigiendo al Dashboard...');
        
        // Simular login con el token devuelto
        const payloadAuth = res?.data ?? res;
        if (payloadAuth?.access_token) {
          localStorage.setItem('token', payloadAuth.access_token);
          localStorage.setItem('nombre_usuario', payloadAuth.nombre_usuario || this.contactoNombre);
          localStorage.setItem('nombre_empresa', payloadAuth.nombre_empresa || this.empresaNombre);
          localStorage.setItem('rol', 'cliente');
          localStorage.setItem('cliente_id', payloadAuth.cliente_id);
        }

        // Redirigir al dashboard tras 1.5s
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err?.error?.detail || err?.error?.message || 'Ocurrió un error al procesar el onboarding. Revisa los datos e intenta nuevamente.';
        this.errorMsg.set(errMsg);
      }
    });
  }
}
