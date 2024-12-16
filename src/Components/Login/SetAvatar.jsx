import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import avatar1 from "../../images/avatar-svgrepo-com (7).svg";
import avatar2 from "../../images/avatar-svgrepo-com (8).svg";
import avatar3 from "../../images/avatar-svgrepo-com (10).svg";
import avatar4 from "../../images/avatar-svgrepo-com (9).svg";
import loaderGif from "../../images/loader.gif";

const SetAvatar = () => {
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [cpf, setCpf] = useState(() => localStorage.getItem("cpf") || "");
    const [isLoading, setIsLoading] = useState(false); 
    const avatars = [avatar1, avatar2, avatar3, avatar4];
    const navigate = useNavigate();

    useEffect(() => {
        console.log("CPF carregado:", cpf); 
    }, [cpf]);

    const handleSelect = (avatar) => {
        setSelectedAvatar(avatar);
    };

    const handleSubmit = async () => {
        console.log("CPF:", cpf);
        console.log("Avatar selecionado:", selectedAvatar);

        if (!cpf || !selectedAvatar) {
            alert("Selecione um avatar ou faça login novamente.");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");

            setIsLoading(true);

            const response = await axios.put(
                `http://localhost:3000/users/${cpf}/avatar`,
                { avatar: selectedAvatar },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            localStorage.setItem('avatar', selectedAvatar);

            setTimeout(() => {
                setIsLoading(false); // ocultar o loader
                navigate('/chat');
            }, 1000);
        } catch (error) {
            console.error("Erro ao atualizar avatar:", error);
            alert("Erro ao atualizar avatar. Tente novamente.");
            setIsLoading(false);
        }
    };

    return (
        <div>
        
            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={loaderGif} alt="Carregando..." style={{ width: "100px", height: "100px" }} />
                </div>
            ) : (
                <>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {avatars.map((avatar) => (
                            <img
                                key={avatar}
                                src={avatar}
                                alt="Avatar"
                                style={{
                                    border: selectedAvatar === avatar ? "3px solid blue" : "none",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleSelect(avatar)}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <h1>Escolha seu Avatar</h1>

                        <button onClick={handleSubmit} disabled={!selectedAvatar}>
                            Atualizar Avatar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SetAvatar;
