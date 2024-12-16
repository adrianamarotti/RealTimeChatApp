import { Users } from "../mongodb.js";
import bcrypt from "bcrypt"; // hash e validacao de senha

// funcoes de validacao
const isString = (value) => typeof value === 'string' && value.trim().length > 1;

const isPhoneValid = (telefone) => /^\d{11}$/.test(String(telefone));
const isCPFValid = (cpf) => /^\d{11}$/.test(String(cpf));


// criar usuario com senha
const createUser = async (req, res) => {
    const { nome, sobrenome, telefone, cpf, senha } = req.body;

    if (!isString(nome) || !isString(sobrenome)) {
        return res.status(400).json({ message: 'Nome e sobrenome devem ser strings válidas e preenchidas.' });
    }
    if (!isPhoneValid(telefone)) {
        return res.status(400).json({ message: 'Telefone inválido. Deve conter 11 dígitos numéricos.' });
    }
    if (!isCPFValid(cpf)) {
        return res.status(400).json({ message: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
    }
    if (!isString(senha) || senha.length < 6) {
        return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        // verificar se o cpf ja existe
        const userExists = await Users.findOne({ cpf }); 
        if (userExists) {
            return res.status(400).json({ message: 'CPF já registrado.' });
        }

        // hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        const user = await Users.create({ 
            nome, 
            sobrenome, 
            telefone, 
            cpf, 
            senha: hashedPassword 
        });

        res.status(201).json({ message: 'Usuário criado com sucesso!', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login com cpf e senha
const loginUser = async (req, res) => {
    const { cpf, senha } = req.body;

    try {

        // verificar se o cpf existe no banco
        const user = await Users.findOne({ cpf }); // busca o primeiro doc q atende pelo CPF

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        console.log("Usuário encontrado:", user); 

        // comparar senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        res.status(200).json({ message: 'Login bem-sucedido!', user: { nome: user.nome, cpf: user.cpf } });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error); 
        res.status(500).json({ message: 'Erro ao realizar login.', error: error.message });
    }
};


// buscar usuario pelo cpf
const getUserByCpf = async (req, res) => {
    const { cpf } = req.body;

    try {
        const user = await Users.findOne({ cpf }); 

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Informações de CPF não armazenadas.",
            });
        }

        // caso o usuario seja encontrado
        res.status(200).json({
            success: true,
            user: {
                name: user.nome,
                sobrenome: user.sobrenome,
                telefone: user.telefone,
                cpf: user.cpf,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// listar todos os usuarios
const getUsers = async (req, res) => {
    try {
        const users = await Users.find({}); //find busca todos
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// obter usuario pelo cpf
const getUser = async (req, res) => {
    try {
        const { cpf } = req.params;
        const user = await Users.findOne({ cpf });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// atualizar usuario
const updateUsers = async (req, res) => {
    try {
        const { cpf } = req.params;
        const user = await Users.findOneAndUpdate({ cpf }, req.body, { new: true }); //new: true retorna doc atualizado

        if (!user) {
            return res.status(404).json({ success: false, msg: "Usuário não encontrado." });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Erro ao atualizar usuário.", error: error.message });
    }
};

// deletar usuario
const deleteUsers = async (req, res) => {
    try {
        const { cpf } = req.params;
        const user = await Users.findOneAndDelete({ cpf });

        if (!user) {
            return res.status(404).json({ success: false, msg: "Usuário não encontrado." });
        }

        res.status(200).json({ success: true, msg: "Usuário deletado com sucesso." });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Erro ao deletar usuário.", error: error.message });
    }
};



// funcao para atualizar avatar
const updateAvatar = async (req, res) => {
    const cpf = req.params.cpf;
    const avatar = req.body.avatar;

    try {
        const user = await Users.findOne({ cpf });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // atualiza o avatar
        user.avatar = avatar;
        await user.save();

        res.status(200).json({ message: "Avatar atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

export { 
    getUsers, 
    getUser, 
    createUser, 
    updateUsers, 
    deleteUsers, 
    getUserByCpf, 
    loginUser, 
    updateAvatar
};
