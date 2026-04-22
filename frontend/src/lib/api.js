import api from "./axios";

// USERS API
export const syncUser = async (userData) => {
  const { data } = await api.post("/usuarios/sync", userData);
  return data;
};

// Products API
export const getAllLivros = async () => {
  const { data } = await api.get("/livros");
  return data;
};

export const getLivrosById = async (id) => {
  const { data } = await api.get(`/livros/${id}`);
  return data;
};

export const getLivrosByUser = async (userId) => {
  const { data } = await api.get(`/livros/user/${userId}`);
  return data;
};

export const createLivros = async (livroData) => {
  const { data } = await api.post("/livros", livroData);
  return data;
};

export const updateLivro = async ({ id, ...livroData }) => {
  const { data } = await api.put(`/livros/${id}`, livroData);
  return data;
};

export const deleteLivro = async (id) => {
  const { data } = await api.delete(`/livros/${id}`);
  return data;
};

// Comments API
export const createComentario = async ({ livroId, descricao }) => {
  const { data } = await api.post(`/comentarios/${livroId}`, { descricao });
  return data;
};

export const deleteComentario = async ({ comentarioId }) => {
  const { data } = await api.delete(`/comentarios/${comentarioId}`);
  return data;
};
