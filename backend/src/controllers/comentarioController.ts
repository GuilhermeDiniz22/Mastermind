import { getAuth } from "@clerk/express";
import { type Request, type Response } from "express";
import * as repositorio from "../db/repository";

export const criarComentario = async (req: Request, res: Response) => {
  const { livroId } = req.params;
  if (typeof livroId !== "string") {
    return res.status(400).json({ error: "ID de livro invalido." });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    const { descricao } = req.body;
    if (!descricao) {
      return res.status(400).json({ error: "Descricao e obrigatoria." });
    }

    const livro = await repositorio.getLivroById(livroId);
    if (!livro) {
      return res.status(404).json({ error: "Livro nao encontrado." });
    }

    const comentario = await repositorio.criarComentario({
      descricao,
      userId,
      livroId,
    });

    return res.status(201).json(comentario);
  } catch (error) {
    console.error("Erro ao criar novo comentario:", error);

    if (error instanceof Error && error.message.includes("UUID")) {
      return res.status(400).json({ error: "ID de livro invalido." });
    }

    return res.status(500).json({ error: "Erro ao criar novo comentario." });
  }
};

export const deletarComentario = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID de comentario invalido." });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    const comentarioExistente = await repositorio.getComentarioById(id);
    if (!comentarioExistente) {
      return res.status(404).json({ error: "Comentario nao encontrado." });
    }

    if (comentarioExistente.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Sem permissao para deletar este comentario." });
    }

    const comentarioDeletado = await repositorio.deleteComentario(id);
    return res.status(200).json(comentarioDeletado);
  } catch (error) {
    console.error("Erro ao deletar comentario:", error);

    if (error instanceof Error && error.message.includes("UUID")) {
      return res.status(400).json({ error: "ID de comentario invalido." });
    }

    return res.status(500).json({ error: "Erro ao deletar comentario." });
  }
};
