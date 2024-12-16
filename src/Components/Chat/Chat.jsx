import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import './Chat.css';
import LogoutIcon from "../../images/log-out.svg";
import Send from "../../images/send.svg";
import Robot from "../../images/robot.gif";

const Chat = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [socket, setSocket] = useState(null);
  const [userAvatar, setUserAvatar] = useState('');

  // funcao para deslogar
  const handleLogout = () => {

    localStorage.removeItem('authToken');
    localStorage.removeItem('nome');
    localStorage.removeItem('avatar');

    if (socket) {
      socket.disconnect();
    }


    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('nome');
    const avatar = localStorage.getItem('avatar');

    if (!token || !name) {
      navigate('/login');
      return;
    }
    setUserName(name);
    setUserAvatar(avatar);

    console.log("Avatar do usuário:", avatar);

    const socketConnection = io('http://localhost:3000', {
      auth: { token },
    });

    setSocket(socketConnection);
    socketConnection.on('connect_error', (err) => {
      if (err.message === "Token inválido ou expirado.") {
        // se o token expirar, redireciona para a tela de login
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        navigate('/login');
      }
    });

    socketConnection.emit('register-user', name);

    socketConnection.on('update-user-list', (onlineUsers) => {
      setUsers(onlineUsers.filter((user) => user !== name));
    });

    socketConnection.on('receive-message', ({ sender, message }) => {
      console.log('Mensagem recebida no frontend:', sender, message);

      setMessages((prev) => { // copia o estado anterior (prev), adiciona a nova mensagem e retorna o estado atualizado
        const updatedMessages = { ...prev };
        if (!updatedMessages[sender]) {
          updatedMessages[sender] = [];
        }

        const messageExists = updatedMessages[sender].some(
          (msg) => msg.message === message && msg.sender === sender
        );

        if (!messageExists) {
          updatedMessages[sender].push({ sender, message });
        }

        return updatedMessages;
      });
    });

    return () => {
      socketConnection.off('update-user-list');
      socketConnection.off('receive-message');
      socketConnection.disconnect();
    };

  }, [navigate, userName]); // [dependencia], sera executado dnv apenas se navigate ou userName mudar

  const sendMessage = () => {
    if (selectedUser && message.trim()) {
      console.log('Enviando mensagem para:', selectedUser);

      socket.emit('private-message', {
        sender: userName,
        recipient: selectedUser,
        message,
      });

      setMessages((prev) => {
        const updatedMessages = { ...prev };
        if (!updatedMessages[selectedUser]) {
          updatedMessages[selectedUser] = [];
        }

        updatedMessages[selectedUser].push({ sender: 'Você', message });
        return updatedMessages;
      });

      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="user-list">
        <h3>Usuários Online</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user}
              onClick={() => setSelectedUser(user)}
              className={user === selectedUser ? 'selected' : ''}
            >
              <img src={userAvatar} alt="Avatar" style={{
                width: '30px', height: '30px', borderRadius: '50%',
                marginRight: '10px',
              }} />
              {user}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-area">
        <div className="chat-header" style={{ position: 'relative' }}>
          <h3>
            {selectedUser && (
              <img
                src={userAvatar} // exibe o avatar do usuario selecionado
                alt="Avatar"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  marginRight: '10px',
                }}
              />
            )}
            {selectedUser}
          </h3>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '30px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <img src={LogoutIcon} alt="Logout" style={{ width: '20px', height: '20px' }} />
          </button>

        </div>
        {selectedUser ? (
          <div className="chat-messages">
            {(messages[selectedUser] || []).map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === 'Você' ? 'sent' : 'received'}`}
              >
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="welcome">
            <h2>Bem-vindo ao Chat!</h2>
            <p>Selecione um usuário na lista para começar a conversar.</p>
            <img src={Robot} alt="Welcome" style={{ width: '150px', marginTop: '20px', marginLeft: '100px' }} />
          </div>
        )}
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
            }}
          >
            <img
              src={Send}
              alt="Enviar"
              style={{
                width: '24px',
                height: '24px',
              }}
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
