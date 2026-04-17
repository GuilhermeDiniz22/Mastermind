import express from "express";
import { ENV } from "./config/config";
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors';
import userRoutes from './routes/userRoutes'
import comentarioRoutes from './routes/comentarioRoutes'
import livroRoutes from './routes/livroRoutes'


const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL }))
app.use(clerkMiddleware())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Bem vindo a MasterMind API - PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/usuarios",
      products: "/api/livros",
      comments: "/api/comentarios",
    },
  });
});

app.use('/api/usuarios', userRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/livros', livroRoutes);

app.listen(ENV.PORT, () => {
  console.log("Servidor ativo 👍.");
});
