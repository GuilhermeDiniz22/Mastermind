import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLivrosById, updateLivro } from "../lib/api";

function EditarLivro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn, userId } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    imagemUrl: "",
  });

  const { data: livro, isLoading, isError, error } = useQuery({
    queryKey: ["livro", id],
    queryFn: () => getLivrosById(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!livro) return;
    setForm({
      titulo: livro.titulo ?? "",
      descricao: livro.descricao ?? "",
      imagemUrl: livro.imagemUrl ?? "",
    });
  }, [livro]);

  const { mutate: atualizarLivro, isPending } = useMutation({
    mutationFn: updateLivro,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      queryClient.invalidateQueries({ queryKey: ["livro", id] });
      queryClient.invalidateQueries({ queryKey: ["livros-user", userId] });
      navigate(`/livros/${data.id}`);
    },
    onError: (err) => {
      setSubmitError(err?.response?.data?.error || "Nao foi possivel atualizar este livro.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    const titulo = form.titulo.trim();
    const descricao = form.descricao.trim();
    const imagemUrl = form.imagemUrl.trim();

    if (!titulo || !descricao) {
      setSubmitError("Titulo e descricao sao obrigatorios.");
      return;
    }

    atualizarLivro({
      id,
      titulo,
      descricao,
      imagemUrl,
    });
  };

  if (!isSignedIn) {
    return (
      <section className="empty-state reveal-up">
        <h1 className="text-2xl font-black">Faca login para editar um livro</h1>
        <p className="text-base-content/70">
          Apenas o autor autenticado pode alterar os dados da publicacao.
        </p>
        <SignInButton mode="modal">
          <button className="btn btn-primary">Entrar</button>
        </SignInButton>
      </section>
    );
  }

  if (isLoading) {
    return <div className="h-56 rounded-3xl bg-base-200/50 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>{error?.response?.data?.error || "Falha ao carregar o livro para edicao."}</span>
      </div>
    );
  }

  if (!livro) {
    return (
      <div className="empty-state">
        <h2 className="text-xl font-bold">Livro nao encontrado</h2>
        <Link to="/" className="btn btn-primary">
          Voltar para inicio
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(userId && livro.userId === userId);
  if (!isOwner) {
    return (
      <div className="empty-state">
        <h2 className="text-xl font-bold">Sem permissao para editar</h2>
        <p className="text-base-content/70">
          Este livro pertence a outro usuario. Abra um livro seu para editar.
        </p>
        <Link to={`/livros/${livro.id}`} className="btn btn-primary">
          Voltar para o livro
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="reveal-up">
        <h1 className="text-3xl md:text-4xl font-black">Editar Livro</h1>
        <p className="mt-2 text-base-content/70">
          Atualize titulo, descricao e capa para manter sua recomendacao sempre atual.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="hero-panel reveal-up space-y-4">
        <label className="form-control w-full">
          <span className="label-text mb-2 font-semibold">Titulo</span>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Titulo do livro"
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

        {form.imagemUrl && (
          <div className="rounded-2xl border border-base-300/70 p-2">
            <img
              src={form.imagemUrl}
              alt="Previa da capa"
              className="h-56 w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        )}

        <label className="form-control w-full">
          <span className="label-text mb-2 font-semibold">Descricao</span>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="textarea textarea-bordered min-h-36"
            placeholder="Explique por que este livro vale a leitura..."
          />
        </label>

        {submitError && (
          <div className="alert alert-error">
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alteracoes"}
          </button>
          <Link to={`/livros/${livro.id}`} className="btn btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

export default EditarLivro;
