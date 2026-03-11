import { useState, useEffect } from 'react';

const Secretarias = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [editando, setEditando] = useState(null); // { id, nombre, apellido }
  const [confirmEliminar, setConfirmEliminar] = useState(null); // id del turno a eliminar

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const API_KEY = import.meta.env.VITE_API_KEY;

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
      const headers = { 'x-api-key': API_KEY };
      const [resEspera, resLlamados] = await Promise.all([
        fetch(`${API_URL}/api/turnos/espera`, { headers }),
        fetch(`${API_URL}/api/turnos/tv`, { headers })
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

  const guardarEdicion = async () => {
    if (!editando) return;
    try {
      await fetch(`${API_URL}/api/turnos/${editando.id}`, {
        method: 'PUT',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editando.nombre, apellido: editando.apellido })
      });
      setEditando(null);
      cargarPacientes();
    } catch (error) {
      console.error("Error al editar paciente", error);
    }
  };

  const eliminarPaciente = async (id) => {
    try {
      await fetch(`${API_URL}/api/turnos/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY }
      });
      setConfirmEliminar(null);
      cargarPacientes();
    } catch (error) {
      console.error("Error al eliminar paciente", error);
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
                  <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
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
                        {editando?.id === paciente._id ? (
                          <div className="flex flex-col gap-1.5">
                            <input
                              className="border border-blue-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 w-36"
                              value={editando.nombre}
                              onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                              placeholder="Nombre"
                              maxLength={100}
                            />
                            <input
                              className="border border-blue-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 w-36"
                              value={editando.apellido}
                              onChange={e => setEditando({ ...editando, apellido: e.target.value })}
                              placeholder="Apellido"
                              maxLength={100}
                            />
                          </div>
                        ) : (
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
                        )}
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editando?.id === paciente._id ? (
                            <>
                              <button
                                onClick={guardarEdicion}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-colors"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditando(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditando({ id: paciente._id, nombre: paciente.nombre, apellido: paciente.apellido })}
                                title="Editar nombre"
                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmEliminar(paciente._id)}
                                title="Eliminar turno"
                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
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

      {/* Modal de confirmación de eliminación */}
      {confirmEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-1">¿Eliminar turno?</h2>
            <p className="text-sm text-slate-500 mb-5">Esta acción no se puede deshacer. El paciente será removido de la lista.</p>
            <div className="flex gap-3">
              <button
                onClick={() => eliminarPaciente(confirmEliminar)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secretarias;
