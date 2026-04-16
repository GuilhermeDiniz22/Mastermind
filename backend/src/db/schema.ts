import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = () => ({
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  imagemUrl: text("imagem_url"),
  ...timestamps(),
});

export const livros = pgTable("livros", {
  id: uuid("id").defaultRandom().primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao").notNull(),
  imagemUrl: text("imagem_url"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps(),
});

export const comentarios = pgTable("comentarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  descricao: text("descricao").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  livroId: uuid("livro_id")
    .notNull()
    .references(() => livros.id, { onDelete: "cascade" }),
  ...timestamps(),
});

export const usersRelations = relations(users, ({ many }) => ({
  livros: many(livros),
  comentarios: many(comentarios),
}));

export const livrosRelations = relations(livros, ({ one, many }) => ({
  user: one(users, {
    fields: [livros.userId],
    references: [users.id],
  }),
  comentarios: many(comentarios),
}));

export const comentariosRelations = relations(comentarios, ({ one }) => ({
  user: one(users, {
    fields: [comentarios.userId],
    references: [users.id],
  }),
  livro: one(livros, {
    fields: [comentarios.livroId],
    references: [livros.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Livro = typeof livros.$inferSelect;
export type NewLivro = typeof livros.$inferInsert;

export type Comentario = typeof comentarios.$inferSelect;
export type NewComentario = typeof comentarios.$inferInsert;