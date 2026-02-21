import { useState } from 'react';

const ClienteForm = () => {
  const [paciente, setPaciente] = useState({
    nombre: '',
    apellido: '',
    medico: '',
  });

  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false); // Nuevo estado

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const medicosDisponibles = [
    "Dra. Sonia Sladewski",
    "Dra. Sauro Virginia",
    "Dra. Pedrini Florencia",
    "Dra. Miller Romina",
    "Dra. Guadalupe Bengoa",
    "Dra. Lucila Monti",
    "Dra. Salazar Adriana",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const horaActual = new Date().toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    try {
      const response = await fetch(`${API_URL}/api/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: paciente.nombre.trim(),
          apellido: paciente.apellido.trim(),
          medico: paciente.medico,
          hora_turno: horaActual,
        }),
      });

      if (response.ok) {
        setMensajeExito(true); // Mostramos la pantalla de éxito
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

  // PANTALLA DE ÉXITO (Se muestra solo cuando mensajeExito es true)
  if (mensajeExito) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center animate-bounce-short">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-4">¡Todo listo!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Ya estás en la lista. Por favor, toma asiento y aguarda a ser llamado en la pantalla.
          </p>
          <button 
            onClick={() => setMensajeExito(false)}
            className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
          >
            VOLVER A INICIO
          </button>
        </div>
      </div>
    );
  }

  // FORMULARIO NORMAL
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800">¡Bienvenido!</h1>
          <p className="text-gray-500 mt-2 font-medium">Completá tus datos para anunciarte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tu Nombre</label>
            <input
              type="text"
              name="nombre"
              value={paciente.nombre}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
              placeholder="Ej: Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tu Apellido</label>
            <input
              type="text"
              name="apellido"
              value={paciente.apellido}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
              placeholder="Ej: Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">¿Con quién te atendés?</label>
            <select
              name="medico"
              value={paciente.medico}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg appearance-none"
            >
              <option value="" disabled>Seleccioná a tu médico</option>
              {medicosDisponibles.map((medico, index) => (
                <option key={index} value={medico}>{medico}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full font-black py-5 px-4 rounded-2xl transition-all shadow-lg active:scale-95 text-xl ${
              enviando ? "bg-gray-400 text-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {enviando ? "REGISTRANDO..." : "ANUNCIARME"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8 font-medium">
          DermatoClinic - Sistema de Autogestión
        </p>
      </div>
    </div>
  );
};

export default ClienteForm;