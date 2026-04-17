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
    .set({ ...dados, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
};

export const upsertUser = async (dados: NewUser) => {
  const [user] = await db
    .insert(users)
    .values(dados)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        nome: dados.nome,
        email: dados.email,
        imagemUrl: dados.imagemUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (user) return user;
  return criarUser(dados);
};

//repositorio dos livros

export const criarLivro = async (dados: NewLivro) => {
  const [livro] = await db.insert(livros).values(dados).returning();
  return livro;
};

export const getAllLivros = async () => {
  return db.query.livros.findMany({
    with: {
      user: true,
    },
    orderBy: (livros, { desc }) => [desc(livros.createdAt)],
  });
};

export const getLivroById = async (id: string) => {
  return db.query.livros.findFirst({
    where: eq(livros.id, id),
    with: {
      user: true,
      comentarios: {
        with: { user: true },
        orderBy: (comentarios, { desc }) => [desc(comentarios.createdAt)],
      },
    },
  });
};

export const getLivrosByUserId = async (id: string) => {
  return db.query.livros.findMany({
    where: eq(livros.userId, id),
    with: {
      user: true,
      comentarios: {
        with: { user: true },
        orderBy: (comentarios, { desc }) => [desc(comentarios.createdAt)],
      },
    },
    orderBy: (livros, { desc }) => [desc(livros.createdAt)],
  });
};

export const getLivroByUserId = getLivrosByUserId;

export const updateLivro = async (id: string, dados: Partial<NewLivro>) => {
  const [livro] = await db
    .update(livros)
    .set({ ...dados, updatedAt: new Date() })
    .where(eq(livros.id, id))
    .returning();
  return livro;
};

export const deleteLivro = async (id: string) => {
  const [livro] = await db.delete(livros).where(eq(livros.id, id)).returning();
  return livro;
};

//comentarios

export const criarComentario = async (dados: NewComentario) => {
  const [comentario] = await db.insert(comentarios).values(dados).returning();
  return comentario;
};

export const getComentarioById = async (id: string) => {
  return db.query.comentarios.findFirst({
    where: eq(comentarios.id, id),
    with: { user: true },
  });
};
