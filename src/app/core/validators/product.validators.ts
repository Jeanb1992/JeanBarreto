import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductApiService } from '../services/product-api.service';

export class ProductValidators {
  /**
   * Valida que el ID tenga entre 3 y 10 caracteres
   */
  static idLength(min: number = 3, max: number = 10): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();
      const length = value.length;

      if (length < min) {
        return {
          idLength: {
            requiredLength: min,
            actualLength: length,
            message: `El ID debe tener al menos ${min} caracteres`,
          },
        };
      }

      if (length > max) {
        return {
          idLength: {
            requiredLength: max,
            actualLength: length,
            message: `El ID no puede tener más de ${max} caracteres`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el nombre tenga entre 5 y 100 caracteres
   */
  static nameLength(min: number = 5, max: number = 100): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();
      const length = value.length;

      if (length < min) {
        return {
          nameLength: {
            requiredLength: min,
            actualLength: length,
            message: `El nombre debe tener al menos ${min} caracteres`,
          },
        };
      }

      if (length > max) {
        return {
          nameLength: {
            requiredLength: max,
            actualLength: length,
            message: `El nombre no puede tener más de ${max} caracteres`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la descripción tenga entre 10 y 200 caracteres
   */
  static descriptionLength(min: number = 10, max: number = 200): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();
      const length = value.length;

      if (length < min) {
        return {
          descriptionLength: {
            requiredLength: min,
            actualLength: length,
            message: `La descripción debe tener al menos ${min} caracteres`,
          },
        };
      }

      if (length > max) {
        return {
          descriptionLength: {
            requiredLength: max,
            actualLength: length,
            message: `La descripción no puede tener más de ${max} caracteres`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la fecha de liberación sea igual o mayor a la fecha actual
   */
  static dateReleaseMinToday(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Obtener la fecha actual sin hora (solo fecha)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parsear la fecha seleccionada (viene como string YYYY-MM-DD)
      const selectedDateStr = control.value;
      const selectedDate = new Date(selectedDateStr + 'T00:00:00');
      
      // Comparar usando getTime() para evitar problemas de zona horaria
      if (selectedDate.getTime() < today.getTime()) {
        return {
          dateReleaseMinToday: {
            message: 'La fecha de liberación debe ser igual o mayor a la fecha actual',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la fecha de liberación sea igual o mayor a la fecha actual
   * Específico para modo edición: obliga a actualizar la fecha si es menor a la actual
   */
  static dateReleaseMinTodayForUpdate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Obtener la fecha actual sin hora (solo fecha)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parsear la fecha seleccionada (viene como string YYYY-MM-DD)
      const selectedDateStr = control.value;
      const selectedDate = new Date(selectedDateStr + 'T00:00:00');
      
      // Comparar usando getTime() para evitar problemas de zona horaria
      // Solo marca error si es MENOR (no igual), permitiendo el mismo día
      if (selectedDate.getTime() < today.getTime()) {
        return {
          dateReleaseMinTodayForUpdate: {
            message: 'Debe actualizar la fecha de liberación. La fecha debe ser igual o mayor a la fecha actual',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la fecha de revisión sea exactamente un año posterior a la fecha de liberación
   */
  static dateRevisionOneYearAfter(dateReleaseControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !dateReleaseControl?.value) {
        return null;
      }

      const releaseDate = new Date(dateReleaseControl.value);
      const revisionDate = new Date(control.value);

      // Calcular la fecha esperada (un año después de la liberación)
      const expectedDate = new Date(releaseDate);
      expectedDate.setFullYear(expectedDate.getFullYear() + 1);

      // Comparar solo las fechas (sin horas)
      releaseDate.setHours(0, 0, 0, 0);
      revisionDate.setHours(0, 0, 0, 0);
      expectedDate.setHours(0, 0, 0, 0);

      if (revisionDate.getTime() !== expectedDate.getTime()) {
        return {
          dateRevisionOneYearAfter: {
            message: 'La fecha de revisión debe ser exactamente un año posterior a la fecha de liberación',
            expectedDate: expectedDate.toISOString().split('T')[0],
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida asíncronamente que el ID no exista
   */
  static uniqueProductId(
    productApiService: ProductApiService,
    currentProductId?: string
  ): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const id = control.value.toString().trim();

      // Si es el mismo ID (modo edición), no validar
      if (currentProductId && id === currentProductId) {
        return of(null);
      }

      return productApiService.verifyProductId(id).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((exists) => {
          if (exists) {
            return of({
              uniqueProductId: {
                message: 'Este ID ya existe. Por favor, elige otro.',
              },
            });
          }
          return of(null);
        }),
        catchError(() => of(null))
      );
    };
  }
}
