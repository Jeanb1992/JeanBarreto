import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ProductApiService } from '../../../../core/services/product-api.service';
import { ProductValidators } from '../../../../core/validators/product.validators';
import { Product, ProductFormData } from '../../../../core/models/product.model';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuccessModalComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly productApiService = inject(ProductApiService);

  readonly isEditMode = signal<boolean>(false);
  readonly currentProductId = signal<string | null>(null);
  readonly loading = this.productService.loading;
  readonly error = this.productService.error;

  // Estado del modal de éxito
  readonly showSuccessModal = signal<boolean>(false);
  readonly successMessage = signal<string>('');

  productForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          ProductValidators.idLength(3, 10),
        ],
        [
          ProductValidators.uniqueProductId(
            this.productApiService,
            this.currentProductId() || undefined
          ),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          ProductValidators.nameLength(5, 100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          ProductValidators.descriptionLength(10, 200),
        ],
      ],
      logo: ['', [Validators.required]],
      date_release: [
        '',
        [
          Validators.required,
          ProductValidators.dateReleaseMinToday(),
        ],
      ],
      date_revision: [
        { value: '', disabled: true },
        [Validators.required],
      ],
    });

    // Configurar validador de date_revision después de crear el formulario
    const releaseControl = this.productForm.get('date_release');
    const revisionControl = this.productForm.get('date_revision');
    
    if (revisionControl && releaseControl) {
      revisionControl.setValidators([
        Validators.required,
        ProductValidators.dateRevisionOneYearAfter(releaseControl),
      ]);
    }

    // Actualizar validador de date_revision cuando cambia date_release
    this.productForm.get('date_release')?.valueChanges.subscribe(() => {
      const revisionCtrl = this.productForm.get('date_revision');
      const releaseCtrl = this.productForm.get('date_release');
      
      if (revisionCtrl && releaseCtrl) {
        const releaseDate = releaseCtrl.value;
        
        // Actualizar fecha de revisión automáticamente cuando hay fecha de liberación
        if (releaseDate) {
          const release = new Date(releaseDate);
          const revision = new Date(release);
          revision.setFullYear(revision.getFullYear() + 1);
          
          // Actualizar el valor incluso si está disabled
          revisionCtrl.setValue(revision.toISOString().split('T')[0], {
            emitEvent: false,
          });
          
          // Mantener el campo deshabilitado
          if (revisionCtrl.enabled) {
            revisionCtrl.disable();
          }
        } else {
          // Si no hay fecha de liberación, limpiar y mantener deshabilitado
          revisionCtrl.setValue('', { emitEvent: false });
          if (revisionCtrl.enabled) {
            revisionCtrl.disable();
          }
        }
        
        // Revalidar
        revisionCtrl.clearValidators();
        revisionCtrl.setValidators([
          Validators.required,
          ProductValidators.dateRevisionOneYearAfter(releaseCtrl),
        ]);
        revisionCtrl.updateValueAndValidity();
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentProductId.set(id);
      // Aplicar validador específico para actualización
      this.applyUpdateValidators();
      this.loadProductForEdit(id);
    }
  }

  private applyUpdateValidators(): void {
    const releaseControl = this.productForm.get('date_release');
    if (releaseControl) {
      // Reemplazar el validador normal por el específico de actualización
      releaseControl.clearValidators();
      releaseControl.setValidators([
        Validators.required,
        ProductValidators.dateReleaseMinTodayForUpdate(),
      ]);
      releaseControl.updateValueAndValidity();
    }
  }

  private loadProductForEdit(id: string): void {
    const product = this.productService.getProductById(id);
    
    if (product) {
      // Asegurar que el validador esté aplicado antes de llenar el formulario
      this.applyUpdateValidators();
      this.populateForm(product);
      // Deshabilitar el campo ID en modo edición
      this.productForm.get('id')?.disable();
    } else {
      // Si no está en el servicio, cargar desde la API directamente por ID
      this.productService.loadProductById(id).subscribe({
        next: (loadedProduct) => {
          if (loadedProduct) {
            // Asegurar que el validador esté aplicado antes de llenar el formulario
            this.applyUpdateValidators();
            this.populateForm(loadedProduct);
            this.productForm.get('id')?.disable();
          } else {
            this.router.navigate(['/products']);
          }
        },
        error: () => {
          this.router.navigate(['/products']);
        },
      });
    }
  }

  private populateForm(product: Product): void {
    // Llenar todos los campos excepto date_release primero
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_revision: product.date_revision,
    });
    
    // Si estamos en modo edición, validar la fecha de liberación antes de asignarla
    if (this.isEditMode()) {
      const releaseControl = this.productForm.get('date_release');
      const revisionControl = this.productForm.get('date_revision');
      
      if (releaseControl) {
        // Asignar el valor de la fecha
        releaseControl.setValue(product.date_release, { emitEvent: true });
        // Forzar la validación
        releaseControl.updateValueAndValidity({ emitEvent: false });
        
        // Si la fecha es inválida (menor a la actual), marcar como touched para mostrar el error
        if (releaseControl.invalid) {
          releaseControl.markAsTouched();
          releaseControl.markAsDirty();
        }
      }
      
      // Mantener date_revision deshabilitado siempre
      if (revisionControl) {
        if (revisionControl.enabled) {
          revisionControl.disable();
        }
        // Si hay fecha de liberación, actualizar la fecha de revisión automáticamente
        if (product.date_release) {
          const release = new Date(product.date_release);
          const revision = new Date(release);
          revision.setFullYear(revision.getFullYear() + 1);
          revisionControl.setValue(revision.toISOString().split('T')[0], {
            emitEvent: false,
          });
        }
      }
    } else {
      // En modo creación, simplemente asignar la fecha
      this.productForm.patchValue({
        date_release: product.date_release,
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue() as ProductFormData;

    if (this.isEditMode()) {
      const id = this.currentProductId()!;
      // En modo edición, no se envía el campo ID (según la documentación de la API)
      const { id: _, ...updateData } = formValue;
      
      this.productService.updateProduct(id, updateData).subscribe({
        next: (updatedProduct) => {
          // Obtener el nombre del producto actualizado para el mensaje
          const productName = updatedProduct.name || formValue.name;
          // Mostrar el modal de éxito
          this.successMessage.set(`El registro "${productName}" ha sido actualizado correctamente`);
          this.showSuccessModal.set(true);
        },
        error: (error) => {
          // El error ya se maneja en el servicio y se muestra en el template
        },
      });
    } else {
      this.productService.createProduct(formValue).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: () => {
          // El error ya se maneja en el servicio y se muestra en el template
        },
      });
    }
  }

  onReset(): void {
    if (this.isEditMode()) {
      const id = this.currentProductId()!;
      const product = this.productService.getProductById(id);
      if (product) {
        this.populateForm(product);
      }
    } else {
      this.productForm.reset();
      // Asegurar que date_revision esté deshabilitado después del reset
      const revisionCtrl = this.productForm.get('date_revision');
      if (revisionCtrl && revisionCtrl.enabled) {
        revisionCtrl.disable();
      }
    }
    this.productForm.markAsUntouched();
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.productForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    const errors = control.errors;

    if (errors['required']) {
      return 'Este campo es requerido';
    }

    if (errors['idLength']) {
      return errors['idLength'].message;
    }

    if (errors['nameLength']) {
      return errors['nameLength'].message;
    }

    if (errors['descriptionLength']) {
      return errors['descriptionLength'].message;
    }

    if (errors['dateReleaseMinToday']) {
      return errors['dateReleaseMinToday'].message;
    }

    if (errors['dateReleaseMinTodayForUpdate']) {
      return errors['dateReleaseMinTodayForUpdate'].message;
    }

    if (errors['dateRevisionOneYearAfter']) {
      return errors['dateRevisionOneYearAfter'].message;
    }

    if (errors['uniqueProductId']) {
      return errors['uniqueProductId'].message;
    }

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  get submitButtonText(): string {
    return this.isEditMode() ? 'Actualizar' : 'Agregar';
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
    // Redirigir a la lista de productos después de cerrar el modal
    this.router.navigate(['/products']);
  }
}
