import { useState, useEffect, useRef } from 'react';

const Tele = () => {
  const [turnoActual, setTurnoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [hora, setHora] = useState('');
  const [audioActivado, setAudioActivado] = useState(false);
  const audioActivadoRef = useRef(false);
  const ultimoIdLlamado = useRef(null);
  const audioRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Reloj
  useEffect(() => {
    const tick = () => {
      const ar = new Date(Date.now() - 3 * 60 * 60 * 1000);
      setHora(ar.toISOString().slice(11, 16));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Polling
  useEffect(() => {
    const buscarDatos = async () => {
      try {
        const resTv = await fetch(`${API_URL}/api/turnos/tv`);
        const dataTv = await resTv.json();

        if (dataTv && dataTv.length > 0) {
          const entrante = dataTv[0];
          if (ultimoIdLlamado.current !== null && ultimoIdLlamado.current !== entrante._id) {
            if (audioRef.current && audioActivadoRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          }
          ultimoIdLlamado.current = entrante._id;
          setTurnoActual(entrante);
          setHistorial(dataTv.slice(1));
        }
      } catch (error) {
        console.error('Error buscando turnos:', error);
      }
    };

    buscarDatos();
    const intervalo = setInterval(buscarDatos, 2000);
    return () => clearInterval(intervalo);
  }, [API_URL]);

  const activarAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {});
    }
    audioActivadoRef.current = true;
    setAudioActivado(true);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans select-none">

      {!audioActivado && (
        <div
          onClick={activarAudio}
          className="absolute inset-0 z-50 flex items-center justify-center bg-blue-600 cursor-pointer"
        >
          <p className="text-white text-5xl font-bold">Toque para activar</p>
        </div>
      )}

      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg?hl=es-419"
        preload="auto"
      />

      {/* Header */}
      <div className="flex justify-between items-center px-10 py-4 border-b-2 border-slate-100 shrink-0">
        <span className="text-blue-600 font-black text-2xl tracking-tight">DermatoMaipu</span>
        <span className="text-slate-400 font-mono font-bold text-3xl tabular-nums">{hora}</span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel izquierdo — Llamado actual */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 border-r-2 border-slate-100">
          {turnoActual ? (
            <div className="text-center w-full" key={turnoActual._id}>
              <p className="text-slate-400 text-xl font-black uppercase tracking-widest mb-8">
                LLAMADO ACTUAL
              </p>
              <h1
                className="font-black leading-none uppercase text-slate-900 mb-10"
                style={{ fontSize: 'clamp(5rem, 12vw, 10rem)' }}
              >
                {turnoActual.nombre}
                <br />
                {turnoActual.apellido}
              </h1>
              <div
                key={turnoActual._id + '-c'}
                className="inline-block bg-blue-600 text-white font-black rounded-3xl animate-pulse px-16 py-6"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                {turnoActual.consultorio}
              </div>
            </div>
          ) : (
            <p className="text-slate-300 font-bold text-4xl">Aguardando llamados...</p>
          )}
        </div>

        {/* Panel derecho — Historial */}
        <div className="flex flex-col bg-slate-50" style={{ width: '30%', minWidth: '18rem' }}>

          <div className="px-8 py-5 border-b-2 border-slate-200 shrink-0">
            <h2 className="text-slate-500 font-black uppercase tracking-widest text-lg">
              Últimos llamados
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {historial.length > 0 ? (
              historial.map((t, idx) => (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm"
                >
                  <p
                    className="font-black text-slate-800 uppercase leading-tight"
                    style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
                  >
                    {t.nombre} {t.apellido}
                  </p>
                  <p
                    className="text-blue-600 font-bold mt-1"
                    style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)' }}
                  >
                    {t.consultorio}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-300 text-xl font-medium text-center mt-10">
                Sin historial aún
              </p>
            )}
          </div>

          <div className="px-8 py-4 border-t-2 border-slate-100 text-center shrink-0">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              DermatoMaipu
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tele;
