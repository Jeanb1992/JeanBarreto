import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { ProductApiService } from '../../../../core/services/product-api.service';
import { Product, ProductFormData } from '../../../../core/models/product.model';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let productApiService: jasmine.SpyObj<ProductApiService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockProduct: Product = {
    id: '1',
    name: 'Product Test',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2025-12-31',
    date_revision: '2026-12-31',
  };

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProductById',
      'loadProductById',
      'createProduct',
      'updateProduct',
    ], {
      loading: signal(false),
      error: signal(null),
    });

    const productApiServiceSpy = jasmine.createSpyObj('ProductApiService', [
      'verifyProductId',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ProductApiService, useValue: productApiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    productApiService = TestBed.inject(ProductApiService) as jasmine.SpyObj<ProductApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form in create mode', () => {
      component.ngOnInit();
      expect(component.productForm).toBeDefined();
      expect(component.isEditMode()).toBe(false);
    });

    it('should initialize form in edit mode', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('1');
      productService.getProductById.and.returnValue(mockProduct);
      component.ngOnInit();
      expect(component.isEditMode()).toBe(true);
      expect(component.currentProductId()).toBe('1');
    });

    it('should load product from API if not in service', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('1');
      productService.getProductById.and.returnValue(undefined);
      productService.loadProductById.and.returnValue(of(mockProduct));
      component.ngOnInit();
      expect(productService.loadProductById).toHaveBeenCalledWith('1');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate required fields', () => {
      expect(component.productForm.invalid).toBe(true);
      expect(component.productForm.get('id')?.hasError('required')).toBe(true);
      expect(component.productForm.get('name')?.hasError('required')).toBe(true);
    });

    it('should validate id length', () => {
      component.productForm.patchValue({ id: 'ab' });
      component.productForm.get('id')?.markAsTouched();
      expect(component.productForm.get('id')?.hasError('idLength')).toBe(true);
    });

    it('should validate name length', () => {
      component.productForm.patchValue({ name: 'abcd' });
      component.productForm.get('name')?.markAsTouched();
      expect(component.productForm.get('name')?.hasError('nameLength')).toBe(true);
    });

    it('should validate description length', () => {
      component.productForm.patchValue({ description: 'short' });
      component.productForm.get('description')?.markAsTouched();
      expect(component.productForm.get('description')?.hasError('descriptionLength')).toBe(true);
    });

    it('should validate date release is not in past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      component.productForm.patchValue({ date_release: pastDate.toISOString().split('T')[0] });
      component.productForm.get('date_release')?.markAsTouched();
      expect(component.productForm.get('date_release')?.hasError('dateReleaseMinToday')).toBe(true);
    });
  });

  describe('date_revision auto-update', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should auto-update date_revision when date_release changes', fakeAsync(() => {
      const releaseDate = futureDateStr;
      component.productForm.get('date_release')?.setValue(releaseDate);
      tick(100);
      
      const revisionControl = component.productForm.get('date_revision');
      expect(revisionControl?.value).toBeTruthy();
      expect(revisionControl?.disabled).toBe(true);
    }));
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit if form is invalid', () => {
      spyOn(component as any, 'markAllFieldsAsTouched');
      component.onSubmit();
      expect((component as any).markAllFieldsAsTouched).toHaveBeenCalled();
      expect(productService.createProduct).not.toHaveBeenCalled();
    });

    it('should create product in create mode', () => {
      const formData: ProductFormData = {
        id: 'test123',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'logo.png',
        date_release: futureDateStr,
        date_revision: '',
      };

      component.productForm.patchValue(formData);
      const revisionDate = new Date(futureDateStr);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      component.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);

      productService.createProduct.and.returnValue(of({ ...mockProduct, ...formData }));
      component.onSubmit();

      expect(productService.createProduct).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should update product in edit mode', () => {
      (component as any).isEditMode.set(true);
      (component as any).currentProductId.set('1');

      const formData: ProductFormData = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'logo.png',
        date_release: futureDateStr,
        date_revision: '',
      };

      component.productForm.patchValue(formData);
      const revisionDate = new Date(futureDateStr);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      component.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);
      component.productForm.get('id')?.disable();

      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      productService.updateProduct.and.returnValue(of(updatedProduct));
      component.onSubmit();

      expect(productService.updateProduct).toHaveBeenCalled();
      expect(component.showSuccessModal()).toBe(true);
    });

    it('should handle error when creating product', () => {
      const formData: ProductFormData = {
        id: 'test123',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'logo.png',
        date_release: futureDateStr,
        date_revision: '',
      };

      component.productForm.patchValue(formData);
      const revisionDate = new Date(futureDateStr);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      component.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);

      productService.createProduct.and.returnValue(throwError(() => new Error('Error')));
      component.onSubmit();

      expect(productService.createProduct).toHaveBeenCalled();
    });
  });

  describe('onReset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form in create mode', () => {
      component.productForm.patchValue({ name: 'Test' });
      component.onReset();
      expect(component.productForm.get('name')?.value).toBe('');
    });

    it('should reload product in edit mode', () => {
      (component as any).isEditMode.set(true);
      (component as any).currentProductId.set('1');
      productService.getProductById.and.returnValue(mockProduct);
      component.onReset();
      expect(productService.getProductById).toHaveBeenCalledWith('1');
    });
  });

  describe('onCancel', () => {
    it('should navigate to products list', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('getFieldError', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return null if field is not touched', () => {
      const error = component.getFieldError('name');
      expect(error).toBeNull();
    });

    it('should return required error message', () => {
      component.productForm.get('name')?.markAsTouched();
      const error = component.getFieldError('name');
      expect(error).toBe('Este campo es requerido');
    });

    it('should return idLength error message', () => {
      component.productForm.patchValue({ id: 'ab' });
      component.productForm.get('id')?.markAsTouched();
      const error = component.getFieldError('id');
      expect(error).toBeTruthy();
    });
  });

  describe('isFieldInvalid', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return false for untouched field', () => {
      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('should return true for invalid touched field', () => {
      component.productForm.get('name')?.markAsTouched();
      expect(component.isFieldInvalid('name')).toBe(true);
    });
  });

  describe('submitButtonText', () => {
    it('should return "Agregar" in create mode', () => {
      (component as any).isEditMode.set(false);
      expect(component.submitButtonText).toBe('Agregar');
    });

    it('should return "Actualizar" in edit mode', () => {
      (component as any).isEditMode.set(true);
      expect(component.submitButtonText).toBe('Actualizar');
    });
  });

  describe('closeSuccessModal', () => {
    it('should close modal and navigate', () => {
      (component as any).showSuccessModal.set(true);
      (component as any).successMessage.set('Test message');
      component.closeSuccessModal();
      expect(component.showSuccessModal()).toBe(false);
      expect(component.successMessage()).toBe('');
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });
  });
});
