import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ProductApiService } from './product-api.service';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let apiService: ProductApiService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    logo: 'logo1.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, ProductApiService],
    });
    service = TestBed.inject(ProductService);
    apiService = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should load products and update state', () => {
      const mockProducts: Product[] = [mockProduct];

      service.loadProducts().subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(service.products()).toEqual(mockProducts);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.flush(mockProducts);

      expect(service.loading()).toBe(false);
    });

    it('should handle error when loading products', () => {
      service.loadProducts().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.error()).toBeTruthy();
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createProduct', () => {
    it('should create product and add to state', () => {
      const newProduct = { ...mockProduct, id: '2' };

      service.createProduct(newProduct).subscribe((product) => {
        expect(product).toEqual(newProduct);
        expect(service.products().length).toBe(1);
        expect(service.products()[0]).toEqual(newProduct);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      expect(req.request.method).toBe('POST');
      req.flush({ data: newProduct });
    });

    it('should handle error when creating product', () => {
      const newProduct = { ...mockProduct, id: '2' };

      service.createProduct(newProduct).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.error()).toBeTruthy();
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.error(new ErrorEvent('Validation error'));
    });
  });

  describe('updateProduct', () => {
    it('should update product in state', () => {
      // First add a product
      service['_products'].set([mockProduct]);

      const updateData = {
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'logo.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      const updatedProduct = { ...mockProduct, ...updateData };

      service.updateProduct('1', updateData).subscribe((product) => {
        expect(product).toEqual(updatedProduct);
        expect(service.products()[0].name).toBe('Updated Product');
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ data: updatedProduct });
    });

    it('should handle error when updating product', () => {
      service['_products'].set([mockProduct]);

      service.updateProduct('1', { name: 'Updated' } as any).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.error()).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      req.error(new ErrorEvent('Not found'));
    });
  });

  describe('deleteProduct', () => {
    it('should delete product from state', () => {
      service['_products'].set([mockProduct]);

      service.deleteProduct('1').subscribe(() => {
        expect(service.products().length).toBe(0);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Deleted' });
    });

    it('should handle error when deleting product', () => {
      service['_products'].set([mockProduct]);

      service.deleteProduct('1').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.error()).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      req.error(new ErrorEvent('Not found'));
    });
  });

  describe('getProductById', () => {
    it('should return product from state', () => {
      service['_products'].set([mockProduct]);
      const product = service.getProductById('1');
      expect(product).toEqual(mockProduct);
    });

    it('should return undefined if product not found', () => {
      service['_products'].set([]);
      const product = service.getProductById('999');
      expect(product).toBeUndefined();
    });
  });

  describe('loadProductById', () => {
    it('should load product by id and update state if exists', () => {
      service['_products'].set([mockProduct]);

      service.loadProductById('1').subscribe((product) => {
        expect(product).toEqual(mockProduct);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      req.flush({ data: mockProduct });
    });

    it('should load product by id and add to state if not exists', () => {
      service['_products'].set([]);

      service.loadProductById('1').subscribe((product) => {
        expect(product).toEqual(mockProduct);
        expect(service.products().length).toBe(1);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      req.flush({ data: mockProduct });
    });

    it('should handle error when loading product by id', () => {
      service.loadProductById('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.error()).toBeTruthy();
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('999')}`
      );
      req.error(new ErrorEvent('Not found'));
    });
  });
});
