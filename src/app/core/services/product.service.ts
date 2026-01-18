import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductApiService } from './product-api.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productApiService = inject(ProductApiService);
  
  // Estado reactivo
  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Getters públicos
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Carga todos los productos desde la API
   */
  loadProducts(): Observable<Product[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.productApiService.getProducts().pipe(
      tap({
        next: (products) => {
          this._products.set(products);
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set(error.message || 'Error al cargar productos');
          this._loading.set(false);
        },
      })
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: Omit<Product, 'id'> & { id: string }): Observable<Product> {
    this._loading.set(true);
    this._error.set(null);

    return this.productApiService.createProduct(product).pipe(
      tap({
        next: (newProduct) => {
          this._products.update((products) => [...products, newProduct]);
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set(error.message || 'Error al crear producto');
          this._loading.set(false);
        },
      })
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    this._loading.set(true);
    this._error.set(null);

    return this.productApiService.updateProduct(id, product).pipe(
      tap({
        next: (updatedProduct) => {
          this._products.update((products) =>
            products.map((p) => (p.id === id ? updatedProduct : p))
          );
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set(error.message || 'Error al actualizar producto');
          this._loading.set(false);
        },
      })
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.productApiService.deleteProduct(id).pipe(
      tap({
        next: () => {
          this._products.update((products) =>
            products.filter((p) => p.id !== id)
          );
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set(error.message || 'Error al eliminar producto');
          this._loading.set(false);
        },
      })
    );
  }

  /**
   * Obtiene un producto por ID desde el estado local
   */
  getProductById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  /**
   * Obtiene un producto por ID desde la API
   */
  loadProductById(id: string): Observable<Product> {
    this._loading.set(true);
    this._error.set(null);

    return this.productApiService.getProductById(id).pipe(
      tap({
        next: (product) => {
          // Actualizar el producto en el estado si ya existe, o agregarlo
          this._products.update((products) => {
            const index = products.findIndex((p) => p.id === id);
            if (index >= 0) {
              products[index] = product;
              return [...products];
            } else {
              return [...products, product];
            }
          });
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set(error.message || 'Error al cargar el producto');
          this._loading.set(false);
        },
      })
    );
  }

}
