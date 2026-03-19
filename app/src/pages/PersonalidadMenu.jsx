import { useNavigate } from 'react-router-dom';
import Starfield from '../components/Starfield';

export default function PersonalidadMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'TEST COMPLETO',
      description: '100 afirmaciones',
      path: '/personalidad/test/completo',
    },
    {
      title: 'TEST RAPIDO',
      description: '40 afirmaciones',
      path: '/personalidad/test/rapido',
    },
    {
      title: 'HISTORIAL',
      description: 'Intentos anteriores',
      path: '/personalidad/historial',
    },
    {
      title: 'ANALISIS',
      description: 'Perfil y evolucion',
      path: '/personalidad/analisis',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <Starfield />

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <button
          onClick={() => navigate('/')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          &larr;
        </button>

        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-16 anim-fade-down">
          PERSONALIDAD
        </h1>

        <div className="space-y-4">
          {menuItems.map((item, i) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`card-dark w-full rounded-lg px-8 py-6 text-left cursor-pointer anim-fade-up anim-delay-${Math.min(i + 1, 3)}`}
            >
              <h2 className="text-bone/70 text-xs tracking-[0.2em] font-light">
                {item.title}
              </h2>
              <p className="text-bone/25 text-[11px] tracking-wider font-light mt-1">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
