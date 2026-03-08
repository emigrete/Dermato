import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Recepcionista from './pages/Recepcionista.jsx';
import Medico from './pages/Medico.jsx';
import Tele from './pages/Tele.jsx';
import Secretarias from './pages/Secretarias.jsx';
import NavbarSecretaria from './components/NavbarSecretaria.jsx';

const LayoutSecretaria = ({ children }) => (
  <>
    <NavbarSecretaria />
    {children}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutSecretaria><Recepcionista /></LayoutSecretaria>} />
        <Route path="/secretarias" element={<LayoutSecretaria><Secretarias /></LayoutSecretaria>} />
        <Route path="/medico" element={<Medico />} />
        <Route path="/tv" element={<Tele />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;