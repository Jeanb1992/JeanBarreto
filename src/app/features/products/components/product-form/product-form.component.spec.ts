import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { ProductApiService } from '../../../../core/services/product-api.service';
import { Product } from '../../../../core/models/product.model';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: '1',
    name: 'Product Test',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2025-12-31',
    date_revision: '2026-12-31',
  };

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

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ProductApiService, useValue: productApiServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    component.ngOnInit();
    expect(component.productForm).toBeDefined();
  });

  it('should navigate on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should return submit button text', () => {
    expect(component.submitButtonText).toBe('Agregar');
  });

  it('should check if field is invalid', () => {
    component.ngOnInit();
    expect(component.isFieldInvalid('name')).toBe(false);
  });
});
