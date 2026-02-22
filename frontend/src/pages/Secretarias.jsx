import { useState, useEffect } from 'react';

const Secretarias = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const listaMedicos = [
    "Dra. Sonia Sladewski", "Dra. Sauro Virginia", "Dra. Pedrini Florencia",
    "Dra. Miller Romina", "Dra. Guadalupe Bengoa", "Dra. Lucila Monti", "Dra. Salazar Adriana"
  ];

  useEffect(() => {
    cargarPacientes();
    const intervalo = setInterval(cargarPacientes, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarPacientes = async () => {
    try {
      const [resEspera, resLlamados] = await Promise.all([
        fetch(`${API_URL}/api/turnos/espera`),
        fetch(`${API_URL}/api/turnos/tv`)
      ]);
      const [espera, llamados] = await Promise.all([
        resEspera.json(),
        resLlamados.json()
      ]);
      setPacientes([...espera, ...llamados]);
    } catch (error) {
      console.error("Error al cargar pacientes", error);
    }
  };

  const hoy = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const pacientesHoy = pacientes.filter(p => p.fecha === hoy);
  const totalEspera = pacientesHoy.filter(p => p.estado === 'esperando').length;
  const totalLlamados = pacientesHoy.filter(p => p.estado === 'llamado').length;

  const pacientesFiltrados = pacientesHoy
    .filter(p => {
      const coincideMedico = filtroMedico === "" || p.medico.toLowerCase().includes(filtroMedico.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || p.estado === filtroEstado;
      return coincideMedico && coincideEstado;
    })
    .sort((a, b) => (a.hora_llegada > b.hora_llegada ? 1 : -1));

  const fechaLegible = new Date(Date.now() - 3 * 60 * 60 * 1000)
    .toISOString().slice(0, 10)
    .split('-').reverse().join('/');

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Secretaría</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{fechaLegible}</p>
          </div>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
            Actualización automática
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{pacientesHoy.length}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total hoy</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-500">{totalEspera}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">En espera</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-green-600">{totalLlamados}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Llamados</p>
            </div>
          </div>
        </div>

        {/* Filtros + Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Filtros */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Médico</label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                value={filtroMedico}
                onChange={(e) => setFiltroMedico(e.target.value)}
              >
                <option value="">Todos los médicos</option>
                {listaMedicos.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Estado</label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="esperando">En espera</option>
                <option value="llamado">Llamados</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Médico</th>
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Consultorio</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <p className="text-slate-400 font-medium italic">No hay pacientes con estos filtros.</p>
                    </td>
                  </tr>
                ) : (
                  pacientesFiltrados.map((paciente, idx) => (
                    <tr
                      key={paciente._id}
                      className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${paciente.estado === 'llamado' ? 'bg-green-50/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-black text-sm">{idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                            ${paciente.estado === 'llamado'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'}`}>
                            {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">
                              {paciente.nombre} {paciente.apellido}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                              Llegada: {paciente.hora_llegada}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-600">{paciente.medico}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${paciente.estado === 'llamado'
                            ? 'bg-green-600 text-white'
                            : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                          {paciente.estado === 'llamado' ? 'Llamado' : 'Esperando'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {paciente.estado === 'llamado' ? (
                          <span className="font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-sm">
                            {paciente.consultorio}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {pacientesFiltrados.length} resultado{pacientesFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Secretarias;
