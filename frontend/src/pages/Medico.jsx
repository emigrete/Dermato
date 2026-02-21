import { useState, useEffect } from 'react';

const Medico = () => {
  const [pacientes, setPacientes] = useState([]);
  const [llamandoId, setLlamandoId] = useState(null);
  
  // Estados para la "sesión" del médico
  const [medicoSesion, setMedicoSesion] = useState(null); // { nombre: '', consultorio: '' }
  const [formSesion, setFormSesion] = useState({ nombre: '', consultorio: 'Consultorio 1' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const listaMedicos = [
    "Dra. Sonia Sladewski", "Dra. Sauro Virginia", "Dra. Pedrini Florencia",
    "Dra. Miller Romina", "Dra. Guadalupe Bengoa", "Dra. Lucila Monti", "Dra. Salazar Adriana"
  ];

  const listaConsultorios = [
    "Consultorio 1", "Consultorio 2", "Consultorio 3", "Consultorio 4", "Consultorio 5"
  ];

  // Al cargar, verificamos si hay una sesión guardada en el navegador
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesionMedico');
    if (sesionGuardada) {
      setMedicoSesion(JSON.parse(sesionGuardada));
    }
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
    if (!formSesion.nombre) return alert("Por favor selecciona tu nombre");
    
    localStorage.setItem('sesionMedico', JSON.stringify(formSesion));
    setMedicoSesion(formSesion);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sesionMedico');
    setMedicoSesion(null);
  };

  const llamarPaciente = async (mongoId) => {
    setLlamandoId(mongoId);
    // Usamos el consultorio de la sesión activa
    const consultorio = medicoSesion.consultorio;

    try {
      const response = await fetch(`${API_URL}/api/turnos/${mongoId}/llamar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultorio })
      });
      
      if (response.ok) {
        cargarPacientes();
      }
    } catch (error) {
      console.error("Error al llamar paciente", error);
    } finally {
      setLlamandoId(null);
    }
  };

  // Filtrado automático basado en el médico logueado
  const pacientesFiltrados = medicoSesion 
    ? pacientes.filter(p => p.medico.toLowerCase().includes(medicoSesion.nombre.split(' ').pop().toLowerCase()))
    : [];

  // PANTALLA DE LOGUEO (Si no hay sesión)
  if (!medicoSesion) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <h1 className="text-2xl font-black text-slate-800 mb-6 text-center italic">Acceso Panel Médico</h1>
          <form onSubmit={iniciarSesion} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">¿Quién eres?</label>
              <select 
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formSesion.nombre}
                onChange={(e) => setFormSesion({...formSesion, nombre: e.target.value})}
              >
                <option value="">Selecciona tu nombre...</option>
                {listaMedicos.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Consultorio Actual</label>
              <select 
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formSesion.consultorio}
                onChange={(e) => setFormSesion({...formSesion, consultorio: e.target.value})}
              >
                {listaConsultorios.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
              INGRESAR AL PANEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PANEL PRINCIPAL (Si ya está logueado)
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header con Info de Sesión */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hola, {medicoSesion.nombre}</h1>
            <p className="text-blue-600 font-bold uppercase text-sm tracking-widest">
              Estás en: <span className="bg-blue-100 px-2 py-1 rounded-md">{medicoSesion.consultorio}</span>
            </p>
          </div>
          <button 
            onClick={cerrarSesion}
            className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            CAMBIAR / SALIR
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-6">
            <h2 className="text-xl font-bold text-slate-700">Pacientes esperando por ti</h2>
            <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-black">
              {pacientesFiltrados.length} EN ESPERA
            </div>
          </div>
          
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-lg">No tienes pacientes pendientes.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {pacientesFiltrados.map((paciente) => (
                <li key={paciente._id} className="flex flex-col md:flex-row justify-between md:items-center bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                  
                  <div className="mb-4 md:mb-0 flex gap-4 items-center">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase border border-blue-200">
                      {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xl text-slate-800">{paciente.nombre} {paciente.apellido}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">Llegada: {paciente.hora_llegada}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => llamarPaciente(paciente._id)}
                    disabled={llamandoId === paciente._id}
                    className={`px-10 py-3 rounded-xl font-black transition-all duration-200 shadow-md flex items-center gap-2
                      ${llamandoId === paciente._id 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
                      }`}
                  >
                    {llamandoId === paciente._id ? 'LLAMANDO...' : 'LLAMAR AHORA'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medico;