import { Router } from "express";
import { requireAuth } from "@clerk/express";
import * as livroController from '../controllers/livroController';

const router = Router();

router.post('/api/livros', requireAuth(), livroController.criarLivro);
router.put('/api/livros/:id', requireAuth(), livroController.atualizarLivro);
router.delete('/api/livros/:id', requireAuth(), livroController.deletarLivro);
router.get('/api/livros', livroController.getAllLivros);
router.get('/api/livros/user/:userId', requireAuth(), livroController.getLivrosByUserId);
router.get('/api/livros/:id', livroController.getLivroById);

export default router;
