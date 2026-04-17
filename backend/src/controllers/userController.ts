import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as repositorio from "../db/repository";

export async function syncUser(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario não autenticado" });
    }

    const { nome, email, imagemUrl } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatorios." });
    }

    const user = await repositorio.upsertUser({
      id: userId,
      nome,
      email,
      imagemUrl,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao sincronizar usuario:", error);
    return res.status(500).json({ error: "Erro ao sincronizar usuario" });
  }
}
