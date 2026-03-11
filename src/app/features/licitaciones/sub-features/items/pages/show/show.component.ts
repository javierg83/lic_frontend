import { Component, OnInit, inject, signal, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../services/items.service';
import { ItemLicitacion } from '../../models/items.model';

@Component({
    selector: 'app-items-show',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css']
})
export class ItemsShowComponent implements OnInit {
    @Input() licitacionId!: string;

    private itemsService = inject(ItemsService);

    public items = signal<ItemLicitacion[]>([]);
    public loading = signal<boolean>(true);
    public error = signal<string | null>(null);

    // Pagination
    public pageSize = signal<number>(20);
    public currentPage = signal<number>(1);

    public totalPages = computed(() => {
        return Math.ceil(this.items().length / this.pageSize()) || 1;
    });

    public paginatedItems = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + Number(this.pageSize());
        return this.items().slice(start, end);
    });

    // Editing state
    public editingId = signal<string | null>(null);
    public editForm = signal<Partial<ItemLicitacion>>({});
    public saving = signal<boolean>(false);

    // Notifications
    public notification = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    ngOnInit(): void {
        if (this.licitacionId) {
            this.fetchItems();
        } else {
            this.error.set('ID de licitación no proporcionado');
            this.loading.set(false);
        }
    }

    fetchItems(): void {
        this.loading.set(true);
        this.itemsService.getItems(this.licitacionId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.items.set(res.data.items);
                } else {
                    this.error.set(res.message);
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Error al cargar los ítems');
                this.loading.set(false);
            }
        });
    }

    startEdit(item: ItemLicitacion): void {
        this.editingId.set(item.id);
        this.editForm.set({ ...item });
    }

    cancelEdit(): void {
        this.editingId.set(null);
        this.editForm.set({});
    }

    saveEdit(): void {
        const id = this.editingId();
        const data = this.editForm();
        if (!id) return;

        this.saving.set(true);
        this.itemsService.updateItem(id, data).subscribe({
            next: (res) => {
                if (res.success) {
                    // Update local items list
                    this.items.update(prev => prev.map(item => item.id === id ? { ...item, ...res.data } : item));
                    this.showNotification('Ítem actualizado correctamente', 'success');
                    this.cancelEdit();
                } else {
                    this.showNotification(res.message || 'Error al actualizar', 'error');
                }
                this.saving.set(false);
            },
            error: (err) => {
                this.showNotification('Error de conexión', 'error');
                this.saving.set(false);
            }
        });
    }

    private showNotification(message: string, type: 'success' | 'error'): void {
        this.notification.set({ message, type });
        setTimeout(() => {
            this.notification.set({ message: '', type: null });
        }, 3000);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    onChangePageSize(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.pageSize.set(Number(target.value));
        this.currentPage.set(1);
    }
}
