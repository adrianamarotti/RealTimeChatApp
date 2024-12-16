import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from 'react-router';
import api from '../../services/api';
import './Cadastro.css';
import loaderGif from "../../images/loader.gif";


const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // funco para validar CPF
  const validateCPF = (cpf) => {
    const cpfRegex = /^\d{11}$/;
    return cpfRegex.test(cpf);
  };

  // funcao para validar telefone
  const validatePhone = (telefone) => {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(telefone);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePhone(telefone)) {
      setError('Telefone inválido. Deve conter exatamente 11 dígitos.');
      setSuccess('');
      setIsLoading(false);

      return;
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido. Deve conter exatamente 11 dígitos.');
      setSuccess('');
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true); 
      const response = await api.post('/register', { nome, sobrenome, telefone, cpf, senha });
      setSuccess('Usuário cadastrado com sucesso!');
      setError('');
      setTimeout(() => {
        setIsLoading(false); 
        navigate("/set-avatar");
      }, 1000);
    } catch (err) {
      setSuccess("");
      setError("Erro ao cadastrar o usuário. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
        {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img src={loaderGif} alt="Carregando..." style={{ width: "100px", height: "100px" }} />
            </div>
        ) : (
            <>
                <h1>Cadastrar Usuário</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Sobrenome"
                            value={sobrenome}
                            onChange={(e) => setSobrenome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit">Cadastrar</button>
                </form>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
                <p className="signup-link">
                    Já tem uma conta? <Link to="/login">Login</Link>
                </p>
            </>
        )}
    </div>
);
};

export default Cadastro;
