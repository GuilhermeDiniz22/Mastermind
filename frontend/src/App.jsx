import { Route, Routes } from "react-router";
import NavBar from "./componentes/NavBar";
import HomePage from "./paginas/HomePage";
import Livro from "./paginas/Livro";
import Profile from "./paginas/Profile";
import EditarLivro from "./paginas/EditarLivro";
import Novo from "./paginas/Novo";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";


function App() {
  const { isClerkLoaded } = useAuthReq();
  useUserSync();

  if (!isClerkLoaded) return null;
  return (
    <div className="app-shell min-h-screen">
      <div className="bg-orb bg-orb-primary" aria-hidden="true" />
      <div className="bg-orb bg-orb-secondary" aria-hidden="true" />
      <NavBar />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/livros/:id" element={<Livro />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/editar/:id" element={<EditarLivro />}></Route>
          <Route path="/novo" element={<Novo />}></Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
