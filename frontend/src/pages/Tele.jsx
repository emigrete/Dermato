import { useState, useEffect, useRef } from 'react';

const Tele = () => {
  const [turnoActual, setTurnoActual] = useState(null);
  const [ultimosTurnos, setUltimosTurnos] = useState([]);
  const [audioActivado, setAudioActivado] = useState(false);
  
  // Usamos _id para la referencia del último llamado en MongoDB
  const ultimoIdLlamado = useRef(null);
  const audioRef = useRef(null);

  // Variable de entorno para la URL de producción
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const buscarTurnosTv = async () => {
      try {
        const response = await fetch(`${API_URL}/api/turnos/tv`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const turnoEntrante = data[0];

          // Comparamos usando _id para activar el sonido si es un paciente nuevo
          if (ultimoIdLlamado.current !== null && ultimoIdLlamado.current !== turnoEntrante._id) {
            if (audioRef.current && audioActivado) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e =>
                console.log("Error al reproducir audio:", e)
              );
            }
          }

          ultimoIdLlamado.current = turnoEntrante._id;
          setTurnoActual(turnoEntrante);
          setUltimosTurnos(data.slice(1));
        }
      } catch (error) {
        console.error("Error buscando los turnos:", error);
      }
    };

    buscarTurnosTv();
    const intervalo = setInterval(buscarTurnosTv, 2000);
    return () => clearInterval(intervalo);
  }, [API_URL]); // Agregamos API_URL como dependencia por seguridad

  const activarAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {});
    }
    setAudioActivado(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden font-sans text-gray-800">

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

      {/* Panel Principal - Turno Actual */}
      <div className="w-2/3 lg:w-3/4 flex flex-col justify-center items-center p-12">
        {turnoActual ? (
          <div className="text-center w-full max-w-4xl">
            <h2 className="text-3xl font-semibold text-gray-400 mb-6 uppercase tracking-widest">
              Llamado Actual
            </h2>
            
            <h1 className="text-[6rem] lg:text-[8rem] font-black text-blue-600 leading-tight uppercase tracking-tighter truncate mb-12">
              {turnoActual.nombre} <br /> 
              <span className="text-gray-800">{turnoActual.apellido}</span>
            </h1>
            
            {/* Animación re-activada por el cambio de _id */}
            <div 
              key={turnoActual._id} 
              className="inline-block bg-white text-blue-600 border-4 border-blue-600 text-6xl font-bold py-6 px-16 rounded-3xl shadow-xl animate-pulse"
            >
              {turnoActual.consultorio}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <h1 className="text-5xl font-medium">Aguardando llamados...</h1>
          </div>
        )}
      </div>

      {/* Panel Lateral - Historial */}
      <div className="w-1/3 lg:w-1/4 bg-white border-l border-gray-200 flex flex-col shadow-lg z-10">
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <h3 className="text-3xl font-bold text-gray-800">
            Historial
          </h3>
        </div>
        
        <div className="flex flex-col flex-grow p-6 overflow-y-auto">
          <div className="space-y-4">
            {ultimosTurnos.length > 0 ? (
              ultimosTurnos.map((turno) => (
                <div key={turno._id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-2xl font-bold text-gray-700 uppercase mb-1 truncate">
                    {turno.nombre} {turno.apellido}
                  </p>
                  <p className="text-xl text-blue-600 font-semibold">
                    {turno.consultorio}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 italic mt-10 text-lg">
                No hay historial todavía
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-blue-600 text-center">
          <p className="text-xl font-bold text-white tracking-widest uppercase">
            DermatoClinic
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default Tele;