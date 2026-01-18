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

  it('should return default image when logo is null', () => {
    component.product = { ...mockProduct, logo: null as any };
    const image = component.getProductImage();
    expect(image).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it('should handle image error and set default image', () => {
    const img = document.createElement('img');
    img.src = 'invalid-url.png';
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img, enumerable: true });

    component.onImageError(event);
    expect(img.src).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it('should not change image if already default', () => {
    const img = document.createElement('img');
    img.src = DEFAULT_PRODUCT_IMAGE;
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img, enumerable: true });

    component.onImageError(event);
    expect(img.src).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it('should emit edit event', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalledWith('1');
    expect(component.showMenu).toBe(false);
  });

  it('should emit delete event', () => {
    spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalledWith('1');
    expect(component.showMenu).toBe(false);
  });

  it('should toggle menu', () => {
    expect(component.showMenu).toBe(false);
    component.toggleMenu();
    expect(component.showMenu).toBe(true);
    component.toggleMenu();
    expect(component.showMenu).toBe(false);
  });

  it('should close menu', () => {
    component.showMenu = true;
    component.closeMenu();
    expect(component.showMenu).toBe(false);
  });

  describe('getInitials', () => {
    it('should return initials from two words', () => {
      component.product = { ...mockProduct, name: 'Product Test' };
      const initials = component.getInitials();
      expect(initials).toBe('PT');
    });

    it('should return first two characters for single word', () => {
      component.product = { ...mockProduct, name: 'Product' };
      const initials = component.getInitials();
      expect(initials).toBe('PR');
    });

    it('should return ? for empty name', () => {
      component.product = { ...mockProduct, name: '' };
      const initials = component.getInitials();
      expect(initials).toBe('?');
    });

    it('should handle name with multiple words', () => {
      component.product = { ...mockProduct, name: 'Product Test Name' };
      const initials = component.getInitials();
      expect(initials).toBe('PT');
    });
  });
});
