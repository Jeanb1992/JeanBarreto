// En desarrollo, usar rutas relativas para que el proxy funcione
// El proxy redirige /bp/* a http://localhost:3002/bp/*
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  PRODUCTS: '/bp/products',
  PRODUCT_BY_ID: (id: string) => `/bp/products/${id}`,
  VERIFY_PRODUCT_ID: (id: string) => `/bp/products/verification/${id}`,
} as const;

export const PAGINATION_OPTIONS = [5, 10, 20] as const;

// Imagen por defecto para productos
export const DEFAULT_PRODUCT_IMAGE = 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg';
