import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteModalComponent } from './delete-modal.component';
import { Product } from '../../../../core/models/product.model';

describe('DeleteModalComponent', () => {
  let component: DeleteModalComponent;
  let fixture: ComponentFixture<DeleteModalComponent>;

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
      imports: [DeleteModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModalComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    component.visible = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm event', () => {
    spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should call cancel on backdrop click', () => {
    spyOn(component, 'onCancel');
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: backdrop, enumerable: true });

    component.onBackdropClick(event);
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should not call cancel if not backdrop click', () => {
    spyOn(component, 'onCancel');
    const otherElement = document.createElement('div');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: otherElement, enumerable: true });

    component.onBackdropClick(event);
    expect(component.onCancel).not.toHaveBeenCalled();
  });
});
