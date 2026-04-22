import { Route, Routes } from "react-router";
import NavBar from "./componentes/NavBar";
import HomePage from "./paginas/HomePage";
import Livro from "./paginas/Livro";
import Profile from "./paginas/Profile";
import EditarLivro from "./paginas/EditarLivro";
import Novo from "./paginas/Novo";

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
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
