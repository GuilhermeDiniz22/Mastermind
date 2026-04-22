import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, MessageCircle, Send, Trash2 } from "lucide-react";
import { createComentario, deleteComentario, deleteLivro, getLivrosById } from "../lib/api";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function Livro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn, userId } = useAuth();
  const [descricao, setDescricao] = useState("");

  const { data: livro, isLoading, isError, error } = useQuery({
    queryKey: ["livro", id],
    queryFn: () => getLivrosById(id),
    enabled: Boolean(id),
  });

  const { mutate: comentar, isPending: isComentando } = useMutation({
    mutationFn: createComentario,
    onSuccess: () => {
      setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["livro", id] });
    },
  });

  const { mutate: removerComentario, isPending: isExcluindoComentario } = useMutation({
    mutationFn: deleteComentario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livro", id] });
    },
  });

  const { mutate: removerLivro, isPending: isExcluindoLivro } = useMutation({
    mutationFn: deleteLivro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      navigate("/");
    },
  });

  const handleSubmitComentario = (e) => {
    e.preventDefault();
    if (!descricao.trim() || !id) return;
    comentar({ livroId: id, descricao });
  };

  const isOwner = Boolean(livro && userId && livro.userId === userId);

  if (isLoading) {
    return <div className="h-56 rounded-3xl bg-base-200/50 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>{error?.response?.data?.error || "Falha ao carregar o livro."}</span>
      </div>
    );
  }

  if (!livro) {
    return (
      <div className="empty-state">
        <h2 className="text-xl font-bold">Livro não encontrado</h2>
        <Link to="/" className="btn btn-primary">
          Voltar para início
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <article className="hero-panel reveal-up grid gap-6 lg:grid-cols-[300px_1fr]">
        {livro.imagemUrl ? (
          <img
            src={livro.imagemUrl}
            alt={livro.titulo}
            className="h-80 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="h-80 w-full rounded-2xl bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30" />
        )}

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{livro.titulo}</h1>
          <p className="text-base-content/80 leading-relaxed">{livro.descricao}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge badge-outline">
              Autor: {livro.user?.nome || livro.user?.name || "Desconhecido"}
            </span>
            <span className="badge badge-outline">
              Publicado em {livro.createdAt ? dateFormatter.format(new Date(livro.createdAt)) : "agora"}
            </span>
          </div>
          {isOwner && (
            <div className="flex flex-wrap gap-2 pt-3">
              <Link to={`/editar/${livro.id}`} className="btn btn-sm btn-outline gap-2">
                <Edit3 size={15} />
                Editar
              </Link>
              <button
                className="btn btn-sm btn-error btn-outline gap-2"
                onClick={() => removerLivro(livro.id)}
                disabled={isExcluindoLivro}
              >
                <Trash2 size={15} />
                {isExcluindoLivro ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          )}
        </div>
      </article>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <h2 className="text-xl font-bold">Comentários</h2>
        </div>

        {isSignedIn ? (
          <form className="space-y-3 rounded-2xl border border-base-300/70 bg-base-100/70 p-4" onSubmit={handleSubmitComentario}>
            <textarea
              className="textarea textarea-bordered min-h-24 w-full"
              placeholder="Compartilhe sua opinião sobre este livro..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <button className="btn btn-primary gap-2" disabled={isComentando || !descricao.trim()}>
              <Send size={15} />
              {isComentando ? "Enviando..." : "Comentar"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-base-300/70 bg-base-100/70 p-4">
            <p className="mb-3 text-sm text-base-content/80">Faça login para comentar.</p>
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-sm">Entrar</button>
            </SignInButton>
          </div>
        )}

        <div className="space-y-3">
          {(livro.comentarios ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-base-content/70">
              Ainda não há comentários.
            </div>
          )}

          {(livro.comentarios ?? []).map((comentario) => {
            const comentarioOwner = comentario.userId === userId;
            return (
              <article key={comentario.id} className="rounded-2xl border border-base-300/70 bg-base-100/75 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-base-content/60">
                  <span>{comentario.user?.nome || comentario.user?.name || "Leitor"}</span>
                  <span>
                    {comentario.createdAt
                      ? dateFormatter.format(new Date(comentario.createdAt))
                      : "Agora"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comentario.descricao}</p>
                {comentarioOwner && (
                  <div className="mt-3">
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={() => removerComentario({ comentarioId: comentario.id })}
                      disabled={isExcluindoComentario}
                    >
                      Excluir comentário
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default Livro;
