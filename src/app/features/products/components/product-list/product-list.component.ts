import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { PAGINATION_OPTIONS } from '../../../../core/constants/api.constants';
import { ProductItemComponent } from '../product-item/product-item.component';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    ProductItemComponent,
    DeleteModalComponent,
    SuccessModalComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Estado reactivo
  private readonly _searchTerm = signal<string>('');
  private readonly _pageSize = signal<number>(5);
  private readonly _currentPage = signal<number>(1);

  // Getters computados
  readonly products = this.productService.products;
  readonly loading = this.productService.loading;
  readonly error = this.productService.error;
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly paginationOptions = PAGINATION_OPTIONS;

  // Productos filtrados y paginados
  readonly filteredProducts = computed(() => {
    const allProducts = this.products();
    const search = this._searchTerm().toLowerCase().trim();

    if (!search) {
      return allProducts;
    }

    return allProducts.filter(
      (product) =>
        product.id.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
    );
  });

  readonly paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const size = this._pageSize();
    const page = this._currentPage();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return filtered.slice(startIndex, endIndex);
  });

  readonly totalProducts = computed(() => this.filteredProducts().length);

  readonly totalPages = computed(() => {
    const total = this.totalProducts();
    const size = this._pageSize();
    return Math.ceil(total / size);
  });

  readonly showingFrom = computed(() => {
    const total = this.totalProducts();
    if (total === 0) return 0;
    const size = this._pageSize();
    const page = this._currentPage();
    return (page - 1) * size + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.totalProducts();
    const size = this._pageSize();
    const page = this._currentPage();
    const end = page * size;
    return end > total ? total : end;
  });

  readonly canGoPrevious = computed(() => this._currentPage() > 1);
  readonly canGoNext = computed(() => this._currentPage() < this.totalPages());

  // Genera un array con los números de página a mostrar
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this._currentPage();
    const pages: number[] = [];
    
    // Mostrar máximo 5 páginas a la vez
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    // Ajustar el inicio si estamos cerca del final
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  });

  // Estado del modal de eliminación
  readonly showDeleteModal = signal<boolean>(false);
  readonly productToDelete = signal<Product | null>(null);

  // Estado del modal de éxito
  readonly showSuccessModal = signal<boolean>(false);
  readonly successMessage = signal<string>('');

  ngOnInit(): void {
    // Cargar productos al inicializar el componente
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.loadProducts().subscribe({
      next: () => {
        // Productos cargados exitosamente
      },
      error: () => {
        // El error ya se maneja en el servicio y se muestra en el template
      },
    });
  }

  onSearchChange(searchTerm: string): void {
    this._searchTerm.set(searchTerm);
    this._currentPage.set(1); // Resetear a la primera página al buscar
  }

  onPageSizeChange(size: number): void {
    this._pageSize.set(size);
    this._currentPage.set(1); // Resetear a la primera página al cambiar el tamaño
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }

  goToPreviousPage(): void {
    if (this.canGoPrevious()) {
      this._currentPage.update((page) => page - 1);
    }
  }

  goToNextPage(): void {
    if (this.canGoNext()) {
      this._currentPage.update((page) => page + 1);
    }
  }

  goToAddProduct(): void {
    this.router.navigate(['/products/add']);
  }

  goToEditProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  onDeleteProduct(id: string): void {
    const product = this.products().find((p) => p.id === id);
    if (product) {
      this.productToDelete.set(product);
      this.showDeleteModal.set(true);
    }
  }

  confirmDelete(): void {
    const product = this.productToDelete();
    if (product) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          // Cerrar el modal de confirmación
          this.showDeleteModal.set(false);
          
          // Mostrar el modal de éxito con el nombre del producto
          this.successMessage.set(`El registro "${product.name}" ha sido eliminado`);
          this.showSuccessModal.set(true);
          
          // Limpiar el producto a eliminar
          this.productToDelete.set(null);
        },
        error: () => {
          // Cerrar el modal de confirmación en caso de error
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
  }
}
