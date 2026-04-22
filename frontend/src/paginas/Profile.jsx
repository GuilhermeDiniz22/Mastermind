import { Link } from "react-router";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, MessageCircle, PencilLine, Trash2 } from "lucide-react";
import { deleteLivro, getLivrosByUser } from "../lib/api";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function Profile() {
  const queryClient = useQueryClient();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const { data: livros = [], isLoading, isError, error } = useQuery({
    queryKey: ["livros-user", userId],
    queryFn: () => getLivrosByUser(userId),
    enabled: Boolean(isSignedIn && userId),
  });

  const { mutate: removerLivro, isPending: isExcluindo } = useMutation({
    mutationFn: deleteLivro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      queryClient.invalidateQueries({ queryKey: ["livros-user", userId] });
    },
  });

  const stats = useMemo(() => {
    const totalComentarios = livros.reduce(
      (acc, livro) => acc + (livro.comentarios?.length ?? 0),
      0,
    );
    const comCapa = livros.filter((livro) => Boolean(livro.imagemUrl)).length;
    return {
      totalLivros: livros.length,
      totalComentarios,
      comCapa,
    };
  }, [livros]);

  if (!isSignedIn) {
    return (
      <section className="empty-state reveal-up">
        <h1 className="text-2xl font-black">Faca login para acessar seu perfil</h1>
        <p className="text-base-content/70">
          Entre para ver seus livros publicados e editar seu catalogo.
        </p>
        <SignInButton mode="modal">
          <button className="btn btn-primary">Entrar</button>
        </SignInButton>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="hero-panel reveal-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || "Perfil"}
              className="h-16 w-16 rounded-2xl border border-base-300 object-cover"
            />
            <div>
              <p className="chip-soft mb-2">Painel do autor</p>
              <h1 className="text-2xl md:text-3xl font-black">
                {user?.fullName || "Minha biblioteca"}
              </h1>
              <p className="text-sm text-base-content/70">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <Link to="/novo" className="btn btn-primary">
            Publicar novo livro
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="soft-tile">
          <BookOpen size={18} />
          <span className="text-sm text-base-content/70">Livros</span>
          <strong className="text-2xl">{stats.totalLivros}</strong>
        </div>
        <div className="soft-tile">
          <MessageCircle size={18} />
          <span className="text-sm text-base-content/70">Comentarios recebidos</span>
          <strong className="text-2xl">{stats.totalComentarios}</strong>
        </div>
        <div className="soft-tile">
          <BookOpen size={18} />
          <span className="text-sm text-base-content/70">Com capa</span>
          <strong className="text-2xl">{stats.comCapa}</strong>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-base-300/70 bg-base-200/40 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="alert alert-error">
          <span>{error?.response?.data?.error || "Falha ao carregar seu perfil."}</span>
        </div>
      )}

      {!isLoading && !isError && livros.length === 0 && (
        <div className="empty-state">
          <h2 className="text-xl font-bold">Voce ainda nao publicou livros</h2>
          <p className="text-base-content/70">
            Comece sua colecao publicando a primeira recomendacao.
          </p>
          <Link to="/novo" className="btn btn-primary">
            Criar meu primeiro livro
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {livros.map((livro, index) => (
          <article key={livro.id} className="book-card reveal-up" style={{ animationDelay: `${index * 60}ms` }}>
            {livro.imagemUrl ? (
              <img
                src={livro.imagemUrl}
                alt={livro.titulo}
                className="h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-40 w-full rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
            )}
            <div className="space-y-3">
              <h3 className="text-xl font-bold">{livro.titulo}</h3>
              <p className="line-clamp-3 text-sm text-base-content/75">{livro.descricao}</p>
              <div className="flex items-center justify-between text-xs text-base-content/60">
                <span>{livro.comentarios?.length ?? 0} comentarios</span>
                <span>
                  {livro.createdAt ? dateFormatter.format(new Date(livro.createdAt)) : "Recente"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link to={`/livros/${livro.id}`} className="btn btn-outline btn-sm">
                  Ver
                </Link>
                <Link to={`/editar/${livro.id}`} className="btn btn-outline btn-sm gap-1">
                  <PencilLine size={14} />
                  Editar
                </Link>
                <button
                  className="btn btn-error btn-outline btn-sm gap-1"
                  onClick={() => removerLivro(livro.id)}
                  disabled={isExcluindo}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Profile;
