import { requireAuth } from "@clerk/express";
import { Router } from "express";
import * as comentarioController from '../controllers/comentarioController';

const router = Router();

router.post('/:livroId', requireAuth(), comentarioController.criarComentario);
router.delete('/:id', requireAuth(), comentarioController.deletarComentario);

export default router;
