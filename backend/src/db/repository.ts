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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertNonEmptyString(
  value: unknown,
  fieldName: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} deve ser uma string nao vazia.`);
  }
}

function assertUuid(value: unknown, fieldName: string): asserts value is string {
  assertNonEmptyString(value, fieldName);
  if (!UUID_REGEX.test(value)) {
    throw new Error(`${fieldName} deve ser um UUID valido.`);
  }
}

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new Error("Valor opcional deve ser string.");
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

function assertEmail(email: unknown): asserts email is string {
  assertNonEmptyString(email, "email");
  if (!EMAIL_REGEX.test(email)) {
    throw new Error("email invalido.");
  }
}

const assertHasUpdatableFields = (
  payload: object,
  entityName: "user" | "livro",
) => {
  if (Object.keys(payload).length === 0) {
    throw new Error(`Nenhum campo valido para atualizar ${entityName}.`);
  }
};

const normalizeNewUser = (dados: NewUser): NewUser => {
  assertNonEmptyString(dados.id, "id");
  assertNonEmptyString(dados.nome, "nome");
  assertEmail(dados.email);

  return {
    ...dados,
    id: dados.id.trim(),
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    imagemUrl: normalizeOptionalString(dados.imagemUrl),
  };
};

const normalizeUserUpdate = (dados: Partial<NewUser>) => {
  const payload: Partial<NewUser> = {};

  if (dados.nome !== undefined) {
    assertNonEmptyString(dados.nome, "nome");
    payload.nome = dados.nome.trim();
  }
  if (dados.email !== undefined) {
    assertEmail(dados.email);
    payload.email = dados.email.trim().toLowerCase();
  }
  if (dados.imagemUrl !== undefined) {
    payload.imagemUrl = normalizeOptionalString(dados.imagemUrl);
  }

  assertHasUpdatableFields(payload, "user");
  return payload;
};

const normalizeNewLivro = (dados: NewLivro): NewLivro => {
  assertNonEmptyString(dados.titulo, "titulo");
  assertNonEmptyString(dados.descricao, "descricao");
  assertNonEmptyString(dados.userId, "userId");

  return {
    ...dados,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    userId: dados.userId.trim(),
    imagemUrl: normalizeOptionalString(dados.imagemUrl),
  };
};

const normalizeLivroUpdate = (dados: Partial<NewLivro>) => {
  const payload: Partial<NewLivro> = {};

  if (dados.titulo !== undefined) {
    assertNonEmptyString(dados.titulo, "titulo");
    payload.titulo = dados.titulo.trim();
  }
  if (dados.descricao !== undefined) {
    assertNonEmptyString(dados.descricao, "descricao");
    payload.descricao = dados.descricao.trim();
  }
  if (dados.imagemUrl !== undefined) {
    payload.imagemUrl = normalizeOptionalString(dados.imagemUrl);
  }

  assertHasUpdatableFields(payload, "livro");
  return payload;
};

const normalizeNewComentario = (dados: NewComentario): NewComentario => {
  assertNonEmptyString(dados.descricao, "descricao");
  assertNonEmptyString(dados.userId, "userId");
  assertUuid(dados.livroId, "livroId");

  return {
    ...dados,
    descricao: dados.descricao.trim(),
    userId: dados.userId.trim(),
  };
};

export const criarUser = async (dados: NewUser) => {
  const payload = normalizeNewUser(dados);
  const [user] = await db.insert(users).values(payload).returning();
  return user;
};

export const getUserById = async (id: string) => {
  assertNonEmptyString(id, "id");
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, dados: Partial<NewUser>) => {
  assertNonEmptyString(id, "id");
  const payload = normalizeUserUpdate(dados);
  const [user] = await db
    .update(users)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
};

export const upsertUser = async (dados: NewUser) => {
  const payload = normalizeNewUser(dados);
  const [user] = await db
    .insert(users)
    .values(payload)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        nome: payload.nome,
        email: payload.email,
        imagemUrl: payload.imagemUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (user) return user;
  return criarUser(payload);
};

//repositorio dos livros

export const criarLivro = async (dados: NewLivro) => {
  const payload = normalizeNewLivro(dados);
  const [livro] = await db.insert(livros).values(payload).returning();
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
  assertUuid(id, "id");
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
  assertNonEmptyString(id, "id");
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
  assertUuid(id, "id");
  const payload = normalizeLivroUpdate(dados);
  const [livro] = await db
    .update(livros)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(livros.id, id))
    .returning();
  return livro;
};

export const deleteLivro = async (id: string) => {
  assertUuid(id, "id");
  const [livro] = await db.delete(livros).where(eq(livros.id, id)).returning();
  return livro;
};

//comentarios

export const criarComentario = async (dados: NewComentario) => {
  const payload = normalizeNewComentario(dados);
  const [comentario] = await db.insert(comentarios).values(payload).returning();
  return comentario;
};

export const getComentarioById = async (id: string) => {
  assertUuid(id, "id");
  return db.query.comentarios.findFirst({
    where: eq(comentarios.id, id),
    with: { user: true },
  });
};

export const deleteComentario = async (id: string) => {
  assertUuid(id, "id");
  const [comentario] = await db
    .delete(comentarios)
    .where(eq(comentarios.id, id))
    .returning();
  return comentario;
};
