import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;

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

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'loadProducts',
      'deleteProduct',
    ], {
      products: signal(mockProducts),
      loading: signal(false),
      error: signal(null),
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    productService.loadProducts.and.returnValue(of(mockProducts));
    component.ngOnInit();
    expect(productService.loadProducts).toHaveBeenCalled();
  });

  it('should navigate to add product', () => {
    component.goToAddProduct();
    expect(router.navigate).toHaveBeenCalledWith(['/products/add']);
  });

  it('should navigate to edit product', () => {
    component.goToEditProduct('1');
    expect(router.navigate).toHaveBeenCalledWith(['/products/edit', '1']);
  });

  it('should handle search change', () => {
    component.onSearchChange('test');
    expect(component.searchTerm()).toBe('test');
  });

  it('should handle page size change', () => {
    component.onPageSizeChange(10);
    expect(component.pageSize()).toBe(10);
  });

  it('should cancel delete', () => {
    component.cancelDelete();
    expect(component.showDeleteModal()).toBe(false);
  });

  it('should close success modal', () => {
    component.closeSuccessModal();
    expect(component.showSuccessModal()).toBe(false);
  });
});
