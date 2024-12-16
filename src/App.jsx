import './App.css';
import { Route, Routes, Navigate } from 'react-router';
import Login from './Components/Login/Login';
import Cadastro from './Components/Cadastro/Cadastro';
import Chat from './Components/Chat/Chat';
import SetAvatar from './Components/Login/SetAvatar';

const App = () => {
  return (
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
              <Route path="/set-avatar" element={<SetAvatar />} />
          </Routes>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

/*O React permite que você passe elementos filhos para componentes como propriedades. No caso desse componente,
'children' representa qualquer conteúdo que for passado para o ProtectedRoute. Por exemplo, uma página que você deseja
proteger com autenticação, como um chat ou um painel de controle. 
'replace' faz com que a navegação substitua a rota atual na história de navegação, ou seja, ao invés de o usuário
poder voltar para a página protegida ao clicar no botão de voltar do navegador, ele será redirecionado para o login. */

export default App;
