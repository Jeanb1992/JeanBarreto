import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

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
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      logo: 'logo2.png',
      date_release: '2025-02-01',
      date_revision: '2026-02-01',
    },
    {
      id: '3',
      name: 'Product 3',
      description: 'Description 3',
      logo: 'logo3.png',
      date_release: '2025-03-01',
      date_revision: '2026-03-01',
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

  describe('ngOnInit', () => {
    it('should load products on init', () => {
      productService.loadProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();
      expect(productService.loadProducts).toHaveBeenCalled();
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', () => {
      productService.loadProducts.and.returnValue(of(mockProducts));
      component.loadProducts();
      expect(productService.loadProducts).toHaveBeenCalled();
    });

    it('should handle error when loading products', () => {
      productService.loadProducts.and.returnValue(throwError(() => new Error('Error')));
      component.loadProducts();
      expect(productService.loadProducts).toHaveBeenCalled();
    });
  });

  describe('onSearchChange', () => {
    it('should update search term and reset page', () => {
      component['_currentPage'].set(3);
      component.onSearchChange('test');
      expect(component.searchTerm()).toBe('test');
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('onPageSizeChange', () => {
    it('should update page size and reset page', () => {
      component['_currentPage'].set(3);
      component.onPageSizeChange(10);
      expect(component.pageSize()).toBe(10);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('goToPage', () => {
    it('should navigate to valid page', () => {
      component['_currentPage'].set(1);
      component.goToPage(2);
      expect(component.currentPage()).toBe(2);
    });

    it('should not navigate to invalid page', () => {
      component['_currentPage'].set(1);
      component.goToPage(0);
      expect(component.currentPage()).toBe(1);
      component.goToPage(100);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('goToPreviousPage', () => {
    it('should go to previous page if possible', () => {
      component['_currentPage'].set(2);
      component.goToPreviousPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should not go to previous page if on first page', () => {
      component['_currentPage'].set(1);
      component.goToPreviousPage();
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('goToNextPage', () => {
    it('should go to next page if possible', () => {
      component['_currentPage'].set(1);
      component['_pageSize'].set(1);
      component.goToNextPage();
      expect(component.currentPage()).toBe(2);
    });

    it('should not go to next page if on last page', () => {
      component['_currentPage'].set(3);
      component['_pageSize'].set(1);
      component.goToNextPage();
      expect(component.currentPage()).toBe(3);
    });
  });

  describe('goToAddProduct', () => {
    it('should navigate to add product', () => {
      component.goToAddProduct();
      expect(router.navigate).toHaveBeenCalledWith(['/products/add']);
    });
  });

  describe('goToEditProduct', () => {
    it('should navigate to edit product', () => {
      component.goToEditProduct('1');
      expect(router.navigate).toHaveBeenCalledWith(['/products/edit', '1']);
    });
  });

  describe('onDeleteProduct', () => {
    it('should set product to delete and show modal', () => {
      component.onDeleteProduct('1');
      expect(component.productToDelete()).toEqual(mockProducts[0]);
      expect(component.showDeleteModal()).toBe(true);
    });

    it('should not set product if not found', () => {
      component.onDeleteProduct('999');
      expect(component.productToDelete()).toBeNull();
      expect(component.showDeleteModal()).toBe(false);
    });
  });

  describe('confirmDelete', () => {
    it('should delete product and show success modal', () => {
      (component as any).productToDelete.set(mockProducts[0]);
      productService.deleteProduct.and.returnValue(of(undefined));

      component.confirmDelete();

      expect(productService.deleteProduct).toHaveBeenCalledWith('1');
      expect(component.showDeleteModal()).toBe(false);
      expect(component.showSuccessModal()).toBe(true);
      expect(component.successMessage()).toContain('Product 1');
    });

    it('should handle error when deleting', () => {
      (component as any).productToDelete.set(mockProducts[0]);
      productService.deleteProduct.and.returnValue(throwError(() => new Error('Error')));

      component.confirmDelete();

      expect(component.showDeleteModal()).toBe(false);
      expect(component.productToDelete()).toBeNull();
    });

    it('should not delete if no product selected', () => {
      (component as any).productToDelete.set(null);
      component.confirmDelete();
      expect(productService.deleteProduct).not.toHaveBeenCalled();
    });
  });

  describe('cancelDelete', () => {
    it('should close delete modal and clear product', () => {
      (component as any).showDeleteModal.set(true);
      (component as any).productToDelete.set(mockProducts[0]);
      component.cancelDelete();
      expect(component.showDeleteModal()).toBe(false);
      expect(component.productToDelete()).toBeNull();
    });
  });

  describe('closeSuccessModal', () => {
    it('should close success modal and clear message', () => {
      (component as any).showSuccessModal.set(true);
      (component as any).successMessage.set('Test message');
      component.closeSuccessModal();
      expect(component.showSuccessModal()).toBe(false);
      expect(component.successMessage()).toBe('');
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      productService.loadProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should filter products by search term', () => {
      component['_searchTerm'].set('Product 1');
      fixture.detectChanges();
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].id).toBe('1');
    });

    it('should return all products when search is empty', () => {
      component['_searchTerm'].set('');
      fixture.detectChanges();
      expect(component.filteredProducts().length).toBe(3);
    });

    it('should paginate products correctly', () => {
      component['_pageSize'].set(2);
      component['_currentPage'].set(1);
      fixture.detectChanges();
      expect(component.paginatedProducts().length).toBe(2);
    });

    it('should calculate total pages correctly', () => {
      component['_pageSize'].set(2);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(2);
    });

    it('should calculate showing from/to correctly', () => {
      component['_pageSize'].set(2);
      component['_currentPage'].set(1);
      fixture.detectChanges();
      expect(component.showingFrom()).toBe(1);
      expect(component.showingTo()).toBe(2);
    });

    it('should return 0 for showingFrom when no products', () => {
      (productService as any).products = signal([]);
      fixture.detectChanges();
      expect(component.showingFrom()).toBe(0);
    });
  });
});
