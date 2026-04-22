import { Link } from "react-router";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";
import Logo from "./logo3.png";
import Seletor from "./Seletor";

function NavBar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="navbar bg-base-300 border-b border-base-content/10">
      <div className="max-w-5xl mx-auto w-full px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="btn btn-ghost gap-2 normal-case text-lg font-semibold"
          >
            <span>
              <img
                src={Logo}
                alt="Mastermind"
                className="size-20 object-contain"
              />
            </span>
            <span className="text-lg font-mono uppercase tracking-widest">
              Mastermind
            </span>
          </Link>
        </div>

        <div className="flex gap-2 items-center">
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
              <span className="badge badge-outline">Visitante</span>
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
