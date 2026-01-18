import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductValidators } from './product.validators';
import { ProductApiService } from '../services/product-api.service';
import { of, throwError, Observable } from 'rxjs';

describe('ProductValidators', () => {
  describe('idLength', () => {
    it('should return null for valid length', () => {
      const validator = ProductValidators.idLength(3, 10);
      const control = { value: 'abc123' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return error for too short', () => {
      const validator = ProductValidators.idLength(3, 10);
      const control = { value: 'ab' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['idLength']).toBeTruthy();
    });

    it('should return error for too long', () => {
      const validator = ProductValidators.idLength(3, 10);
      const control = { value: 'abcdefghijk' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['idLength']).toBeTruthy();
    });

    it('should return null for empty value', () => {
      const validator = ProductValidators.idLength(3, 10);
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should handle null value', () => {
      const validator = ProductValidators.idLength(3, 10);
      const control = { value: null } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('nameLength', () => {
    it('should return null for valid length', () => {
      const validator = ProductValidators.nameLength(5, 100);
      const control = { value: 'Valid Product Name' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return error for too short', () => {
      const validator = ProductValidators.nameLength(5, 100);
      const control = { value: 'abcd' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['nameLength']).toBeTruthy();
    });

    it('should return error for too long', () => {
      const validator = ProductValidators.nameLength(5, 10);
      const control = { value: 'This is a very long name' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['nameLength']).toBeTruthy();
    });

    it('should return null for empty value', () => {
      const validator = ProductValidators.nameLength(5, 100);
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('descriptionLength', () => {
    it('should return null for valid length', () => {
      const validator = ProductValidators.descriptionLength(10, 200);
      const control = {
        value: 'This is a valid description with enough characters',
      } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return error for too short', () => {
      const validator = ProductValidators.descriptionLength(10, 200);
      const control = { value: 'Short' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['descriptionLength']).toBeTruthy();
    });

    it('should return error for too long', () => {
      const validator = ProductValidators.descriptionLength(10, 20);
      const control = { value: 'This is a very long description that exceeds the limit' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['descriptionLength']).toBeTruthy();
    });

    it('should return null for empty value', () => {
      const validator = ProductValidators.descriptionLength(10, 200);
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('dateReleaseMinToday', () => {
    it('should return null for today', () => {
      const validator = ProductValidators.dateReleaseMinToday();
      const today = new Date().toISOString().split('T')[0];
      const control = { value: today } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return null for future date', () => {
      const validator = ProductValidators.dateReleaseMinToday();
      const future = new Date();
      future.setDate(future.getDate() + 1);
      const control = { value: future.toISOString().split('T')[0] } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return error for past date', () => {
      const validator = ProductValidators.dateReleaseMinToday();
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const control = { value: past.toISOString().split('T')[0] } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['dateReleaseMinToday']).toBeTruthy();
    });

    it('should return null for empty value', () => {
      const validator = ProductValidators.dateReleaseMinToday();
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('dateReleaseMinTodayForUpdate', () => {
    it('should return null for today', () => {
      const validator = ProductValidators.dateReleaseMinTodayForUpdate();
      const today = new Date().toISOString().split('T')[0];
      const control = { value: today } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return null for future date', () => {
      const validator = ProductValidators.dateReleaseMinTodayForUpdate();
      const future = new Date();
      future.setDate(future.getDate() + 1);
      const control = { value: future.toISOString().split('T')[0] } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return error for past date', () => {
      const validator = ProductValidators.dateReleaseMinTodayForUpdate();
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const control = { value: past.toISOString().split('T')[0] } as AbstractControl;
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['dateReleaseMinTodayForUpdate']).toBeTruthy();
    });

    it('should return null for empty value', () => {
      const validator = ProductValidators.dateReleaseMinTodayForUpdate();
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('dateRevisionOneYearAfter', () => {
    it('should return null for correct date', () => {
      const releaseDate = new Date('2025-01-01');
      const revisionDate = new Date('2026-01-01');
      const releaseControl = {
        value: releaseDate.toISOString().split('T')[0],
      } as AbstractControl;

      const validator =
        ProductValidators.dateRevisionOneYearAfter(releaseControl);
      const control = {
        value: revisionDate.toISOString().split('T')[0],
      } as AbstractControl;

      expect(validator(control)).toBeNull();
    });

    it('should return error for incorrect date', () => {
      const releaseDate = new Date('2025-01-01');
      const revisionDate = new Date('2026-01-02');
      const releaseControl = {
        value: releaseDate.toISOString().split('T')[0],
      } as AbstractControl;

      const validator =
        ProductValidators.dateRevisionOneYearAfter(releaseControl);
      const control = {
        value: revisionDate.toISOString().split('T')[0],
      } as AbstractControl;

      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['dateRevisionOneYearAfter']).toBeTruthy();
    });

    it('should return null for empty values', () => {
      const releaseControl = { value: '' } as AbstractControl;
      const validator = ProductValidators.dateRevisionOneYearAfter(releaseControl);
      const control = { value: '' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return null if release date is empty', () => {
      const releaseControl = { value: null } as AbstractControl;
      const validator = ProductValidators.dateRevisionOneYearAfter(releaseControl);
      const control = { value: '2026-01-01' } as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });

  describe('uniqueProductId', () => {
    let mockApiService: jasmine.SpyObj<ProductApiService>;

    beforeEach(() => {
      mockApiService = jasmine.createSpyObj('ProductApiService', [
        'verifyProductId',
      ]);
    });

    it('should return null if ID does not exist', (done) => {
      mockApiService.verifyProductId.and.returnValue(of(false));

      const validator = ProductValidators.uniqueProductId(mockApiService);
      const control = { value: 'new-id' } as AbstractControl;

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((validationResult) => {
        expect(validationResult).toBeNull();
        done();
      });
    });

    it('should return error if ID exists', (done) => {
      mockApiService.verifyProductId.and.returnValue(of(true));

      const validator = ProductValidators.uniqueProductId(mockApiService);
      const control = { value: 'existing-id' } as AbstractControl;

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((validationResult) => {
        expect(validationResult).toBeTruthy();
        expect(validationResult?.['uniqueProductId']).toBeTruthy();
        done();
      });
    });

    it('should return null if currentProductId matches', (done) => {
      const validator = ProductValidators.uniqueProductId(
        mockApiService,
        'current-id'
      );
      const control = { value: 'current-id' } as AbstractControl;

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((validationResult) => {
        expect(validationResult).toBeNull();
        expect(mockApiService.verifyProductId).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return null for empty value', (done) => {
      const validator = ProductValidators.uniqueProductId(mockApiService);
      const control = { value: '' } as AbstractControl;

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((validationResult) => {
        expect(validationResult).toBeNull();
        expect(mockApiService.verifyProductId).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error from API service', (done) => {
      mockApiService.verifyProductId.and.returnValue(throwError(() => new Error('API Error')));

      const validator = ProductValidators.uniqueProductId(mockApiService);
      const control = { value: 'test-id' } as AbstractControl;

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((validationResult) => {
        expect(validationResult).toBeNull();
        done();
      });
    });
  });
});
