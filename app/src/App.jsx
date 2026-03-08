import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PsicotecnicoMenu from './pages/PsicotecnicoMenu';
import Exam from './pages/Exam';
import CategorySelect from './pages/CategorySelect';
import History from './pages/History';
import Analysis from './pages/Analysis';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/psicotecnico" element={<PsicotecnicoMenu />} />
        <Route path="/psicotecnico/examen" element={<Exam />} />
        <Route path="/psicotecnico/examen-errores" element={<Exam />} />
        <Route path="/psicotecnico/temas" element={<CategorySelect />} />
        <Route path="/psicotecnico/factor/:factor" element={<Exam />} />
        <Route path="/psicotecnico/historial" element={<History />} />
        <Route path="/psicotecnico/analisis" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  );
}
