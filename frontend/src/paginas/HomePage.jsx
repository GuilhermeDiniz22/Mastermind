import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { BookOpen, Plus, Search } from "lucide-react";
import { getAllLivros } from "../lib/api";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function HomePage() {
  const { isSignedIn } = useAuth();
  const [search, setSearch] = useState("");
  const { data: livros = [], isLoading, isError, error } = useQuery({
    queryKey: ["livros"],
    queryFn: getAllLivros,
  });

  const livrosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return livros;
    return livros.filter((livro) => {
      const titulo = livro.titulo?.toLowerCase() ?? "";
      const descricao = livro.descricao?.toLowerCase() ?? "";
      const autor = livro.user?.nome?.toLowerCase() ?? livro.user?.name?.toLowerCase() ?? "";
      return titulo.includes(term) || descricao.includes(term) || autor.includes(term);
    });
  }, [livros, search]);

  return (
    <section className="space-y-8">
      <header className="hero-panel reveal-up">
        <div className="space-y-5">
          <span className="chip-soft">Descubra novas leituras</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Comunidade de livros com reviews, comentários e coleções pessoais.
          </h1>
          <p className="text-base-content/75 max-w-2xl">
            Explore as publicações da comunidade, salve seus favoritos e compartilhe suas próprias
            descobertas em um layout rápido, elegante e responsivo.
          </p>
          <div className="flex flex-wrap gap-3">
            {isSignedIn ? (
              <Link to="/novo" className="btn btn-primary btn-md gap-2">
                <Plus size={18} />
                Publicar livro
              </Link>
            ) : (
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-md">Entrar para publicar</button>
                </SignInButton>
              </SignedOut>
            )}
            <Link to="/profile" className="btn btn-outline btn-md">
              Ver meu perfil
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-base-300/70 bg-base-100/70 p-3 backdrop-blur">
        <Search size={18} className="text-base-content/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, descrição ou autor..."
          className="input input-ghost w-full focus:outline-none"
        />
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
          <span>{error?.response?.data?.error || "Falha ao carregar livros."}</span>
        </div>
      )}

      {!isLoading && !isError && livrosFiltrados.length === 0 && (
        <div className="empty-state">
          <BookOpen size={32} />
          <h2 className="text-xl font-bold">Nenhum livro encontrado</h2>
          <p className="text-base-content/70">
            Tente ajustar a busca ou publique o primeiro livro da coleção.
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {livrosFiltrados.map((livro, index) => (
          <article
            key={livro.id}
            className="book-card reveal-up"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            {livro.imagemUrl ? (
              <img
                src={livro.imagemUrl}
                alt={livro.titulo}
                className="h-44 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
            )}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold leading-tight">{livro.titulo}</h3>
                <p className="line-clamp-3 text-sm text-base-content/75">{livro.descricao}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-base-content/60">
                <span>{livro.user?.nome || livro.user?.name || "Autor"}</span>
                <span>
                  {livro.createdAt ? dateFormatter.format(new Date(livro.createdAt)) : "Recente"}
                </span>
              </div>
              <Link to={`/livros/${livro.id}`} className="btn btn-sm btn-outline w-full">
                Ver detalhes
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
