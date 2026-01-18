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
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load products', () => {
    const mockProducts: Product[] = [mockProduct];

    service.loadProducts().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
    );
    req.flush(mockProducts);
  });

  it('should create product', () => {
    service.createProduct(mockProduct).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`
    );
    expect(req.request.method).toBe('POST');
    req.flush({ data: mockProduct });
  });

  it('should update product', () => {
    const updateData = { name: 'Updated' } as any;
    service.updateProduct('1', updateData).subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
    );
    expect(req.request.method).toBe('PUT');
    req.flush({ data: mockProduct });
  });

  it('should delete product', () => {
    service.deleteProduct('1').subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });

  it('should get product by id from state', () => {
    (service as any)._products.set([mockProduct]);
    const product = service.getProductById('1');
    expect(product).toEqual(mockProduct);
  });

  it('should load product by id', () => {
    service.loadProductById('1').subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID('1')}`
    );
    req.flush({ data: mockProduct });
  });
});
