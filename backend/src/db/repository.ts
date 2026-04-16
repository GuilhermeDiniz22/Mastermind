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

export const getAllLivros = async () => {
  const [livros] = await db.query.livros.findMany({
    with: {
      user: true,
    },
    orderBy: (livros, { desc }) => [desc(livros.createdAt)],
  });
  return livros;
};

export const getLivroById = async (id: string) => {
  return db.query.livros.findFirst({
    where: eq(users.id, id),
    with: {
      user: true,
      comentarios: {
        with: { user: true },
        orderBy: (comentarios, { desc }) => [desc(comentarios.createdAt)],
      },
    },
  });
};
