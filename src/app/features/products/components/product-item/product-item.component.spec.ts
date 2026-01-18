import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItemComponent } from './product-item.component';
import { Product } from '../../../../core/models/product.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../../../core/constants/api.constants';

describe('ProductItemComponent', () => {
  let component: ProductItemComponent;
  let fixture: ComponentFixture<ProductItemComponent>;

  const mockProduct: Product = {
    id: '1',
    name: 'Product Test',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductItemComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get product image from logo', () => {
    const image = component.getProductImage();
    expect(image).toBe('test-logo.png');
  });

  it('should return default image when logo is empty', () => {
    component.product = { ...mockProduct, logo: '' };
    const image = component.getProductImage();
    expect(image).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it('should emit edit event', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalledWith('1');
  });

  it('should emit delete event', () => {
    spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalledWith('1');
  });

  it('should toggle menu', () => {
    expect(component.showMenu).toBe(false);
    component.toggleMenu();
    expect(component.showMenu).toBe(true);
  });

  it('should get initials from name', () => {
    component.product = { ...mockProduct, name: 'Product Test' };
    const initials = component.getInitials();
    expect(initials).toBe('PT');
  });
});
