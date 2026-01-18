import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      // Error de conexión (status 0) - el servidor no está disponible o CORS
      if (error.status === 0) {
        const url = req.url;
        errorMessage = `No se puede conectar al servidor. 
        Esto puede ser un problema de CORS o el servidor no está disponible.
        Verifica que el backend esté corriendo en ${url}. 
        Si estás usando el backend local, ejecuta: npm run start:dev en el proyecto backend.
        Asegúrate de que el backend tenga configurado CORS para permitir peticiones desde http://localhost:4200`;
        return throwError(() => new Error(errorMessage));
      }

      // Error de parsing JSON (status 200 pero no se puede parsear)
      if (error.status === 200 && (error.message?.includes('parsing') || error.name === 'HttpErrorResponse')) {
        errorMessage = `Error al parsear la respuesta del servidor. 
        El servidor respondió con status 200, pero la respuesta no es JSON válido.
        Verifica que el backend esté devolviendo JSON válido con Content-Type: application/json.
        Respuesta recibida: ${typeof error.error === 'string' ? error.error : JSON.stringify(error.error)}`;
        return throwError(() => new Error(errorMessage));
      }

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            // Si el backend envía detalles de validación en la propiedad 'errors'
            if (error.error?.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
              const validationErrors = error.error.errors
                .map((err: any) => {
                  if (typeof err === 'string') return err;
                  if (err.property && err.constraints) {
                    return `${err.property}: ${Object.values(err.constraints).join(', ')}`;
                  }
                  return JSON.stringify(err);
                })
                .join('; ');
              errorMessage = `Error de validación: ${validationErrors}`;
            } else {
              errorMessage =
                error.error?.message ||
                'Solicitud inválida. Por favor, verifica los datos ingresados.';
            }
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage =
              'Error interno del servidor. Por favor, intenta más tarde.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
