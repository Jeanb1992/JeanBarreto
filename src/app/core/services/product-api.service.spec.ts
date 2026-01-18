import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductApiService } from './product-api.service';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { Product } from '../models/product.model';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductApiService],
    });
    service = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return products array from data wrapper', () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          logo: 'logo1.png',
          date_release: '2025-01-01',
          date_revision: '2026-01-01',
        },
      ];

      service.getProducts().subscribe((products) => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProducts });
    });

    it('should return products array directly', () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          logo: 'logo1.png',
          date_release: '2025-01-01',
          date_revision: '2026-01-01',
        },
      ];

      service.getProducts().subscribe((products) => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.flush(mockProducts);
    });

    it('should return empty array for null response', () => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.flush(null);
    });

    it('should handle error', () => {
      service.getProducts().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createProduct', () => {
    it('should create a product', () => {
      const newProduct = {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        logo: 'logo2.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      service.createProduct(newProduct).subscribe((product) => {
        expect(product).toEqual(newProduct);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush({ message: 'Product added successfully', data: newProduct });
    });
  });

  describe('updateProduct', () => {
    it('should update a product', () => {
      const productId = '1';
      const updateData = {
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'logo.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      service.updateProduct(productId, updateData).subscribe((product) => {
        expect(product.name).toBe(updateData.name);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID(productId)}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({
        message: 'Product updated successfully',
        data: { id: productId, ...updateData },
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      const productId = '1';

      service.deleteProduct(productId).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID(productId)}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Product removed successfully' });
    });
  });

  describe('getProductById', () => {
    it('should return product by id', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        logo: 'logo1.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      service.getProductById('1').subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProduct });
    });

    it('should handle error when getting product by id', () => {
      service.getProductById('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('999')}`
      );
      req.error(new ErrorEvent('Not found'));
    });
  });

  describe('verifyProductId', () => {
    it('should return true if product exists', () => {
      const productId = '1';

      service.verifyProductId(productId).subscribe((exists) => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY_PRODUCT_ID(productId)}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if product does not exist', () => {
      const productId = '999';

      service.verifyProductId(productId).subscribe((exists) => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY_PRODUCT_ID(productId)}`
      );
      req.flush(false);
    });
  });
});
