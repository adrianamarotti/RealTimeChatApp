import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  
});

//  interceptor para incluir o token em todas as requisicoes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
