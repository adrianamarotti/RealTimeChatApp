import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')).render(
    <BrowserRouter > 
     <App />
    </BrowserRouter >
); 
/*     <BrowserRouter > 
é responsável por gerenciar as rotas. 
Ele usa a API de histórico do navegador (com base em URL) para controlar a navegação entre diferentes
 páginas do aplicativo, sem precisar recarregar a página inteira.*/