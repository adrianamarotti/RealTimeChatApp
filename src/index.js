import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDB, Users } from "./mongodb.js";
import userRouter from "./routes/user.route.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

// JWT
const JWT_SECRET = "teste"; 
const JWT_EXPIRES_IN = "30min"; // tempo de expiracao do token

// middleware de autenticacao jwt
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }
        req.user = user;
        next();
    });
};

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// middlewares do express
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// conexao com mongo
connectDB();

// rota principal
app.get("/", (req, res) => {
    res.send("ProjetoBluelab conectado");
});

// rota de login
app.post("/login", async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        const user = await Users.findOne({ cpf });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // gerar token JWT
        const token = jwt.sign({ cpf: user.cpf, nome: user.nome }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(200).json({
            token,
            user: {
                nome: user.nome,
                cpf: user.cpf,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao realizar login.", error });
    }
});

// rotas protegidas podem usar o middleware
app.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Acesso autorizado.", user: req.user });
});

app.use(userRouter);

// configuracao do socket com autenticacao jwt
const users = {}; // mapeia nome do usuario para socket.id

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Acesso negado. Token não fornecido."));
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return next(new Error("Token inválido ou expirado."));
        }
        socket.user = user;
        next();
    });
});

io.on("connection", (socket) => {
    console.log("Novo cliente autenticado conectado:", socket.user.nome);

    socket.on("register-user", (userName) => {
        users[userName] = socket.id;
        io.emit("update-user-list", Object.keys(users));
        console.log("Usuários conectados:", users);
    });

    socket.on("private-message", ({ sender, recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive-message", { sender, message });
        } else {
            console.log(`Usuário ${recipient} não está online.`);
        }
    });

    socket.on("disconnect", () => {
        const disconnectedUser = Object.keys(users).find(
            (key) => users[key] === socket.id
        );
        if (disconnectedUser) {
            delete users[disconnectedUser];
            io.emit("update-user-list", Object.keys(users));
        }
        console.log("Usuário desconectado:", socket.id);
    });
});

// iniciar servidor
server.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
