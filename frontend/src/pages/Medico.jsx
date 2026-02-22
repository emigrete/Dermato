import { useState, useEffect } from 'react';

const Medico = () => {
  const [pacientes, setPacientes] = useState([]);
  const [llamandoId, setLlamandoId] = useState(null);

  const [medicoSesion, setMedicoSesion] = useState(null);
  const [formSesion, setFormSesion] = useState({ nombre: '', consultorio: 'Consultorio 1' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const listaMedicos = [
    "Dra. Sonia Sladewski", "Dra. Sauro Virginia", "Dra. Pedrini Florencia",
    "Dra. Miller Romina", "Dra. Guadalupe Bengoa", "Dra. Lucila Monti", "Dra. Salazar Adriana"
  ];

  const listaConsultorios = ["Consultorio 1", "Consultorio 2"];

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesionMedico');
    if (sesionGuardada) setMedicoSesion(JSON.parse(sesionGuardada));
    cargarPacientes();
    const intervalo = setInterval(cargarPacientes, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarPacientes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/turnos/espera`);
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar pacientes", error);
    }
  };

  const iniciarSesion = (e) => {
    e.preventDefault();
    if (!formSesion.nombre) return alert("Por favor seleccioná tu nombre");
    localStorage.setItem('sesionMedico', JSON.stringify(formSesion));
    setMedicoSesion(formSesion);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sesionMedico');
    setMedicoSesion(null);
  };

  const llamarPaciente = async (mongoId) => {
    setLlamandoId(mongoId);
    try {
      const response = await fetch(`${API_URL}/api/turnos/${mongoId}/llamar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultorio: medicoSesion.consultorio })
      });
      if (response.ok) cargarPacientes();
    } catch (error) {
      console.error("Error al llamar paciente", error);
    } finally {
      setLlamandoId(null);
    }
  };

  const pacientesFiltrados = medicoSesion
    ? pacientes.filter(p => p.medico.toLowerCase().includes(medicoSesion.nombre.split(' ').pop().toLowerCase()))
    : [];

  // ── PANTALLA DE LOGIN ──────────────────────────────────────────────────────
  if (!medicoSesion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-white">
            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">DermatoMaipu</p>
            <h1 className="text-2xl font-black">Panel Médico</h1>
            <p className="text-blue-200 text-sm mt-1">Accedé con tu nombre y consultorio</p>
          </div>
          <form onSubmit={iniciarSesion} className="px-8 py-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">¿Quién sos?</label>
              <select
                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-slate-700 font-semibold bg-slate-50 transition-colors"
                value={formSesion.nombre}
                onChange={(e) => setFormSesion({ ...formSesion, nombre: e.target.value })}
              >
                <option value="">Seleccioná tu nombre...</option>
                {listaMedicos.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Consultorio</label>
              <select
                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-slate-700 font-semibold bg-slate-50 transition-colors"
                value={formSesion.consultorio}
                onChange={(e) => setFormSesion({ ...formSesion, consultorio: e.target.value })}
              >
                {listaConsultorios.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-3.5 rounded-xl transition-all shadow-md"
            >
              INGRESAR
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── PANEL PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            {medicoSesion.nombre.split(' ').slice(-1)[0].charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-800 text-base leading-tight">{medicoSesion.nombre}</p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {medicoSesion.consultorio}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-black text-slate-800">{pacientesFiltrados.length}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">En espera</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Cambiar / Salir"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto p-6 space-y-4">

        {pacientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 font-bold text-lg">Sin pacientes en espera</p>
            <p className="text-slate-300 text-sm mt-1">Se actualizará automáticamente</p>
          </div>
        ) : (
          pacientesFiltrados.map((paciente, idx) => (
            <div
              key={paciente._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 flex items-center gap-4"
            >
              {/* Número */}
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 font-black text-sm flex items-center justify-center shrink-0">
                {idx + 1}
              </div>

              {/* Avatar + datos */}
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-black text-lg flex items-center justify-center uppercase shrink-0">
                {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-lg leading-tight">
                  {paciente.nombre} {paciente.apellido}
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                  Llegada: {paciente.hora_llegada}
                </p>
              </div>

              {/* Botón llamar */}
              <button
                onClick={() => llamarPaciente(paciente._id)}
                disabled={llamandoId === paciente._id}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 shrink-0 flex items-center gap-2
                  ${llamandoId === paciente._id
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-95'
                  }`}
              >
                {llamandoId === paciente._id ? (
                  'Llamando...'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    LLAMAR
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Medico;
