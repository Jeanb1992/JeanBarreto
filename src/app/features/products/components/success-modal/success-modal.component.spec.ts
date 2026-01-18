import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessModalComponent } from './success-modal.component';

describe('SuccessModalComponent', () => {
  let component: SuccessModalComponent;
  let fixture: ComponentFixture<SuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModalComponent);
    component = fixture.componentInstance;
    component.visible = true;
    component.message = 'Test message';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should call close on backdrop click', () => {
    spyOn(component, 'onClose');
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: backdrop, enumerable: true });

    component.onBackdropClick(event);
    expect(component.onClose).toHaveBeenCalled();
  });

  it('should not call close if not backdrop click', () => {
    spyOn(component, 'onClose');
    const otherElement = document.createElement('div');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: otherElement, enumerable: true });

    component.onBackdropClick(event);
    expect(component.onClose).not.toHaveBeenCalled();
  });
});
