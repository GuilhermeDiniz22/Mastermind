import { getAuth } from "@clerk/express";
import { type Request, type Response } from "express";
import * as repositorio from "../db/repository";

export const getAllLivros = async (req: Request, res: Response) => {
  try {
    const livros = await repositorio.getAllLivros();
    return res.status(200).json(livros);
  } catch (error) {
    console.error("Erro ao obter livros:", error);
    return res.status(500).json({ error: "Erro ao obter livros." });
  }
};

export const getLivroById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID de livro invalido." });
  }

  try {
    const livro = await repositorio.getLivroById(id);

    if (!livro) {
      return res.status(404).json({ error: "Livro nao encontrado." });
    }

    return res.status(200).json(livro);
  } catch (error) {
    console.error("Erro ao pesquisar livro:", error);

    if (error instanceof Error && error.message.includes("UUID")) {
      return res.status(400).json({ error: "ID de livro invalido." });
    }

    return res.status(500).json({ error: "Erro ao pesquisar livro." });
  }
};

export const getLivrosByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (typeof userId !== "string" || userId.trim().length === 0) {
    return res.status(400).json({ error: "ID de usuario invalido." });
  }

  try {
    const livros = await repositorio.getLivrosByUserId(userId);
    return res.status(200).json(livros);
  } catch (error) {
    console.error("Erro ao pesquisar livros:", error);

    if (error instanceof Error && error.message.includes("string nao vazia")) {
      return res.status(400).json({ error: "ID de usuario invalido." });
    }

    return res.status(500).json({ error: "Erro ao pesquisar livros." });
  }
};

export const criarLivro = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    const { titulo, descricao, imagemUrl } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({
        error: "Titulo e descricao sao obrigatorios.",
      });
    }

    const livro = await repositorio.criarLivro({
      userId,
      titulo,
      descricao,
      imagemUrl,
    });

    return res.status(201).json(livro);
  } catch (error) {
    console.error("Erro ao criar novo livro:", error);
    return res.status(500).json({ error: "Erro ao criar novo livro." });
  }
};

export const atualizarLivro = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID de livro invalido." });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    const livroExistente = await repositorio.getLivroById(id);
    if (!livroExistente) {
      return res.status(404).json({ error: "Livro nao encontrado." });
    }

    if (livroExistente.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Sem permissao para editar este livro." });
    }

    const { titulo, descricao, imagemUrl } = req.body;
    if (titulo === undefined && descricao === undefined && imagemUrl === undefined) {
      return res.status(400).json({
        error: "Informe ao menos um campo para atualizar.",
      });
    }

    const livroAtualizado = await repositorio.updateLivro(id, {
      titulo,
      descricao,
      imagemUrl,
    });

    return res.status(200).json(livroAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);

    if (
      error instanceof Error &&
      (error.message.includes("UUID") ||
        error.message.includes("Nenhum campo valido") ||
        error.message.includes("string nao vazia"))
    ) {
      return res
        .status(400)
        .json({ error: "Dados invalidos para atualizar livro." });
    }

    return res.status(500).json({ error: "Erro ao atualizar livro." });
  }
};

export const deletarLivro = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID de livro invalido." });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    const livroExistente = await repositorio.getLivroById(id);
    if (!livroExistente) {
      return res.status(404).json({ error: "Livro nao encontrado." });
    }

    if (livroExistente.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Sem permissao para deletar este livro." });
    }

    const livroDeletado = await repositorio.deleteLivro(id);
    return res.status(200).json(livroDeletado);
  } catch (error) {
    console.error("Erro ao deletar livro:", error);

    if (error instanceof Error && error.message.includes("UUID")) {
      return res.status(400).json({ error: "ID de livro invalido." });
    }

    return res.status(500).json({ error: "Erro ao deletar livro." });
  }
};
