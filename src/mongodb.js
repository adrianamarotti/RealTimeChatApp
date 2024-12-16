import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nome: String,
    sobrenome: String,
    telefone: String,
    cpf: String,
    senha: String,
    avatar: String
});

const Users = mongoose.model("Users", userSchema);

// conexao com o banco de dados
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://adridantas:peneninha5@users.cafvb.mongodb.net/?retryWrites=true&w=majority&appName=Users'); // Removido useNewUrlParser e useUnifiedTopology
        console.log("Conectado ao banco de dados MongoDB");
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados", error);
        process.exit(1);
    }
};

export { connectDB, Users }; 
