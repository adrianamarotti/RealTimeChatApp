import express from "express";
import { getUserByCpf, loginUser, createUser, getUsers, getUser, updateUsers, deleteUsers, updateAvatar } from '../controllers/user.controller.js';


const router = express.Router();

router.post("/register", createUser);

router.post("/login", loginUser);

router.get('/search', getUserByCpf);
router.get('/', getUsers);
router.get("/:cpf", getUser);
router.post("/", createUser);
router.put("/:cpf", updateUsers); 
router.delete("/:cpf", deleteUsers); 
router.put("/users/:cpf/avatar", updateAvatar);
export default router;
