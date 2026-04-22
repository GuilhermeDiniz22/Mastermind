import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLivros } from "../lib/api";

function Novo() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    imagemUrl: "",
  });
  const [submitError, setSubmitError] = useState("");

  const { mutate: criarLivro, isPending } = useMutation({
    mutationFn: createLivros,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      navigate(`/livros/${data.id}`);
    },
    onError: (err) => {
      setSubmitError(err?.response?.data?.error || "Não foi possível criar o livro.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!form.titulo.trim() || !form.descricao.trim()) {
      setSubmitError("TÃ­tulo e Descrição são obrigatórios.");
      return;
    }

    criarLivro({
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      imagemUrl: form.imagemUrl.trim() || undefined,
    });
  };

  if (!isSignedIn) {
    return (
      <section className="empty-state">
        <h1 className="text-2xl font-black">Você precisa estar logado para publicar</h1>
        <p className="text-base-content/70">Entre com sua conta para criar um novo livro.</p>
        <SignInButton mode="modal">
          <button className="btn btn-primary">Entrar</button>
        </SignInButton>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="reveal-up">
        <h1 className="text-3xl md:text-4xl font-black">Novo Livro</h1>
        <p className="text-base-content/70 mt-2">
          Compartilhe uma recomendação com capa, descrição e contexto para a comunidade.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="hero-panel reveal-up space-y-6">
        <label className="form-control w-full">
          <span className="label-text mb-2 font-semibold">Tí­tulo</span>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Ex: A Biblioteca da Meia-Noite"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-2 font-semibold">URL da capa (opcional)</span>
          <input
            name="imagemUrl"
            value={form.imagemUrl}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="https://..."
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-3 block font-semibold">Descrição</span>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="textarea textarea-bordered w-full min-h-56 md:min-h-72"
            placeholder="Conte por que esse livro vale a leitura..."
          />
        </label>

        {submitError && <div className="alert alert-error"><span>{submitError}</span></div>}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Publicando..." : "Publicar livro"}
          </button>
          <Link to="/" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </section>
  );
}

export default Novo;



