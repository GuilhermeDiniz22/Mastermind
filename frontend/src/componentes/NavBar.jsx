import { Link } from "react-router";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { BookOpen, PlusIcon, UserCircle2 } from "lucide-react";
import Logo from "./logo3.png";
import Seletor from "./Seletor";

function NavBar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-base-content/10 bg-base-100/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="btn btn-ghost gap-2 normal-case text-lg font-semibold"
          >
            <span>
              <img
                src={Logo}
                alt="Mastermind"
                className="size-16 object-contain md:size-20"
              />
            </span>
            <span className="text-lg font-mono uppercase tracking-widest">
              Mastermind
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className="btn btn-ghost btn-sm gap-1">
              <BookOpen size={15} />
              Explore
            </Link>
            <Link to="/profile" className="btn btn-ghost btn-sm gap-1">
              <UserCircle2 size={15} />
              Perfil
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Seletor />
          {isSignedIn ? (
            <>
              <span className="badge badge-outline">Logado</span>
              <Link to="/novo" className="btn btn-sm btn-primary gap-2">
                <PlusIcon size={16} />
                Novo Livro
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <span className="hidden badge badge-outline sm:inline-flex">Visitante</span>
              <SignInButton mode="modal">
                <button className="btn btn-sm btn-ghost">Entrar</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-sm btn-outline">Criar conta</button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
