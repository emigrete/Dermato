import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Recepcionista from './pages/Recepcionista.jsx';
import Medico from './pages/Medico.jsx';
import Tele from './pages/Tele.jsx';
import Secretarias from './pages/Secretarias.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar temporal para desarrollo - Facilita el testeo del front
      <nav className="bg-gray-800 p-4 text-white shadow-md">
        <ul className="flex justify-center space-x-8 font-medium">
          <li>
            <Link to="/" className="hover:text-blue-400 transition">Recepción</Link>
          </li>
          <li>
            <Link to="/medico" className="hover:text-blue-400 transition">Panel Médico</Link>
          </li>
          <li>
            <Link to="/tv" className="hover:text-blue-400 transition">Pantalla TV</Link>
          </li>
        </ul>
      </nav> */}

      {/* Contenedor principal de las rutas */}
      <main>
        <Routes>
          <Route path="/" element={<Recepcionista />} />
          <Route path="/medico" element={<Medico />} />
          <Route path="/tv" element={<Tele />} /> 
          <Route path="/secretarias" element={<Secretarias />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;