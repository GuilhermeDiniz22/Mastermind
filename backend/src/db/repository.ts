import { db } from "./index";
import { eq } from "drizzle-orm";
import {
  users,
  comentarios,
  livros,
  type NewLivro,
  type NewUser,
  type NewComentario,
} from "./schema";

export const criarUser = async (dados: NewUser) => {
  const [user] = await db.insert(users).values(dados).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, dados: Partial<NewUser>) => {
  const [user] = await db
    .update(users)
    .set(dados)
    .where(eq(users.id, id))
    .returning();
  return user;
};

export const upsertUser = async (dados: NewUser) => {
  const userExistente = await getUserById(dados.id);

  if (userExistente) {
    return updateUser(dados.id, dados);
  }

  return criarUser(dados);
};

//repositorio dos livros

export const criarLivro = async (dados: NewLivro) => {
  const [livro] = await db.insert(livros).values(dados).returning();
  return livro;
};