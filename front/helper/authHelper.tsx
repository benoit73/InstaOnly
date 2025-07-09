// Fonction helper pour récupérer le token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Fonction helper pour créer les headers avec le token
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  console.log(token);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Fonction helper pour les requêtes avec fichiers (FormData)
export const getAuthHeadersForFormData = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};