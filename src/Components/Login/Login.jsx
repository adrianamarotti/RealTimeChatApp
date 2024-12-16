import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import { Link } from 'react-router';
import './Login.css';
import loaderGif from "../../images/loader.gif";
import jwt_decode from 'jwt-decode';

const Login = () => {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setIsLoading(true);
            const response = await api.post('/login', { cpf, senha });
            console.log('Resposta da API:', response);

            if (response.data.token) {
                const token = response.data.token;
                console.log('Token recebido:', token);
                
                // decodifique o token JWT para verificar a expiracao
                const decodedToken = jwt_decode(token);
                
                const currentTime = Math.floor(Date.now() / 1000); // calcula o tempo atual em segundos para comparar com a expiracao do token
    
                // verificar se o token expirou
                if (decodedToken.exp < currentTime) {
                    setError('Token expirado. Faça login novamente.');
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('nome', response.data.user.nome);
                localStorage.setItem('cpf', response.data.user.cpf);
                localStorage.setItem('avatar', response.data.user.avatar); 
                
                setTimeout(() => {
                    setIsLoading(false); 
                    
                    if (!response.data.user.avatar || response.data.user.avatar === "") {
                        navigate('/set-avatar');
                    } else {
                        navigate('/chat');
                    }
                }, 1000); 
            } else {
                setError('Erro de autenticação. Verifique suas credenciais.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Erro ao tentar autenticar:', err);
            setError('Erro ao tentar autenticar. Tente novamente mais tarde.');
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                {isLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <img src={loaderGif} alt="Carregando..." style={{ width: "100px", height: "100px" }} />
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit}>
                            <h1>Acesse o sistema</h1>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="CPF"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Senha"
                                    required
                                />
                            </div>
                            {error && <p>{error}</p>}
                            <button type="submit">Entrar</button>
                        </form>
                        <p className="signup-link">
                            Não tem uma conta? <Link to="/cadastro">Registrar</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
