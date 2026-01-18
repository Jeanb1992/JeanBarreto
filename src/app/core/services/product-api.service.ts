import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import {
  Product,
  ProductsResponse,
  ProductResponse,
  ProductFormData,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  /**
   * Obtiene todos los productos financieros
   */
  getProducts(): Observable<Product[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PRODUCTS}`;
    
    return this.http
      .get<any>(url, { 
        responseType: 'json',
        observe: 'body'
      })
      .pipe(
        map((response) => {
          // Si la respuesta es null o undefined
          if (response == null) {
            return [] as Product[];
          }
          
          // Si la respuesta es directamente un array
          if (Array.isArray(response)) {
            return response as Product[];
          }
          
          // Si la respuesta tiene la estructura { data: [...] }
          if (response && response.data && Array.isArray(response.data)) {
            return response.data as Product[];
          }
          
          // Si la respuesta tiene otra estructura, intentar extraer los datos
          if (response && typeof response === 'object') {
            // Intentar encontrar un array en la respuesta
            const keys = Object.keys(response);
            for (const key of keys) {
              if (Array.isArray(response[key])) {
                return response[key] as Product[];
              }
            }
          }
          
          throw new Error(`La estructura de la respuesta no es la esperada. Respuesta recibida: ${JSON.stringify(response)}`);
        }),
        catchError((error) => {
          // Si es un error de parsing (status 200 pero error al parsear JSON)
          if (error.status === 200 && error.message?.includes('parsing')) {
            return throwError(() => new Error('Error al parsear la respuesta del servidor. Verifica que el backend esté devolviendo JSON válido.'));
          }
          
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtiene un producto financiero por ID
   */
  getProductById(id: string): Observable<Product> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PRODUCT_BY_ID(id)}`;
    
    return this.http
      .get<ProductResponse>(url)
      .pipe(
        map((response) => {
          // La respuesta puede tener estructura { data: {...} } o ser directamente el producto
          if (response && response.data) {
            return response.data;
          }
          // Si la respuesta es directamente el producto
          return response as unknown as Product;
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  /**
   * Crea un nuevo producto financiero
   */
  createProduct(product: ProductFormData): Observable<Product> {
    return this.http
      .post<ProductResponse>(
        `${this.baseUrl}${API_ENDPOINTS.PRODUCTS}`,
        product
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un producto financiero existente
   */
  updateProduct(id: string, product: Omit<ProductFormData, 'id'>): Observable<Product> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PRODUCT_BY_ID(id)}`;
    
    return this.http
      .put<ProductResponse>(url, product)
      .pipe(
        map((response) => {
          // La respuesta puede tener estructura { message: "...", data: {...} }
          if (response && response.data) {
            return response.data;
          }
          // Si la respuesta es directamente el producto
          return response as unknown as Product;
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  /**
   * Elimina un producto financiero
   */
  deleteProduct(id: string): Observable<void> {
    return this.http
      .delete<{ message: string }>(
        `${this.baseUrl}${API_ENDPOINTS.PRODUCT_BY_ID(id)}`
      )
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un ID de producto ya existe
   */
  verifyProductId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${this.baseUrl}${API_ENDPOINTS.VERIFY_PRODUCT_ID(id)}`
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Maneja errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ocurrió un error desconocido';

    // Error de conexión (status 0) - el servidor no está disponible
    if (error.status === 0) {
      errorMessage = `No se puede conectar al servidor en ${this.baseUrl}. 
      Por favor, verifica que el backend esté corriendo en el puerto 3002. 
      Asegúrate de ejecutar: npm run start:dev en el proyecto backend.`;
      return throwError(() => new Error(errorMessage));
    }

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          // Si el backend envía detalles de validación en la propiedad 'errors'
          if (error.error?.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            const validationErrors = error.error.errors
              .map((err: any) => {
                if (typeof err === 'string') return err;
                if (err.property && err.constraints) {
                  return `${err.property}: ${Object.values(err.constraints).join(', ')}`;
                }
                return JSON.stringify(err);
              })
              .join('; ');
            errorMessage = `Error de validación: ${validationErrors}`;
          } else {
            errorMessage =
              error.error?.message ||
              'Solicitud inválida. Por favor, verifica los datos ingresados.';
          }
          break;
        case 404:
          errorMessage =
            error.error?.message || 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}
