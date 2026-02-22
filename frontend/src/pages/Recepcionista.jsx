import { useState } from 'react';

const ClienteForm = () => {
  const [paciente, setPaciente] = useState({ nombre: '', apellido: '', medico: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const medicosDisponibles = [
    "Dra. Sonia Sladewski", "Dra. Sauro Virginia", "Dra. Pedrini Florencia",
    "Dra. Miller Romina", "Dra. Guadalupe Bengoa", "Dra. Lucila Monti", "Dra. Salazar Adriana",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/api/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: paciente.nombre.trim(),
          apellido: paciente.apellido.trim(),
          medico: paciente.medico,
        }),
      });
      if (response.ok) {
        setMensajeExito(true);
        setPaciente({ nombre: '', apellido: '', medico: '' });
      } else {
        alert('Hubo un error al registrarte. Por favor, avisale a la recepcionista.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión. Verificá que tengas internet.');
    } finally {
      setEnviando(false);
    }
  };

  // ── PANTALLA DE ÉXITO ────────────────────────────────────────────────────
  if (mensajeExito) {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-3">¡Listo!</h1>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Ya estás registrado. Por favor tomá asiento y aguardá a ser llamado en la pantalla.
          </p>
          <button
            onClick={() => setMensajeExito(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all active:scale-95"
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  // ── FORMULARIO ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 px-8 pt-8 pb-6 text-center">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-3">DermatoMaipu</p>
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white">¡Bienvenido!</h1>
          <p className="text-blue-200 text-sm mt-1">Completá tus datos para anunciarte</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={paciente.nombre}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium"
              placeholder="Ej: Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={paciente.apellido}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium"
              placeholder="Ej: Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">¿Con quién te atendés?</label>
            <select
              name="medico"
              value={paciente.medico}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium appearance-none"
            >
              <option value="" disabled>Seleccioná tu médico</option>
              {medicosDisponibles.map((medico, index) => (
                <option key={index} value={medico}>{medico}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95 text-lg mt-2
              ${enviando
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {enviando ? 'REGISTRANDO...' : 'ANUNCIARME'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
