require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================

// CORS restrictivo
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

// Rate limiting en rutas de turnos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes, intentá más tarde.' }
});
app.use('/api/turnos', limiter);

// Middleware API Key
const verificarApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};
app.use('/api', verificarApiKey);

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Helpers Argentina (UTC-3, sin DST)
const fechaHoyAR = () => {
  const ar = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return ar.toISOString().slice(0, 10); // "YYYY-MM-DD"
};
const horaActualAR = () => {
  const ar = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return ar.toISOString().slice(11, 16); // "HH:MM"
};

// Definición del Modelo de Turnos
const turnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  medico: { type: String, required: true },
  hora_llegada: { type: String, required: true },
  fecha: { type: String, required: true },
  consultorio: { type: String, default: null },
  estado: {
    type: String,
    enum: ['esperando', 'llamado', 'finalizado'],
    default: 'esperando'
  },
  fecha_llamado: { type: Date, default: null }
});

const Turno = mongoose.models.Turno || mongoose.model('Turno', turnoSchema);

const medicosValidos = [
  "Dra. Sonia Sladewski", "Dra. Sauro Virginia", "Dra. Pedrini Florencia",
  "Dra. Miller Romina", "Dra. Guadalupe Bengoa", "Dra. Lucila Monti", "Dra. Salazar Adriana"
];

// ==========================================
// RUTAS (ENDPOINTS)
// ==========================================

// 1. RECEPCIÓN: Crear un nuevo turno
app.post('/api/turnos', async (req, res) => {
  try {
    const { nombre, apellido, medico } = req.body;

    if (!nombre || !apellido || !medico) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    if (nombre.length > 100 || apellido.length > 100) {
      return res.status(400).json({ error: 'Campo demasiado largo' });
    }
    if (!medicosValidos.includes(medico)) {
      return res.status(400).json({ error: 'Médico no válido' });
    }

    const hora_llegada = horaActualAR();

    const nuevoTurno = new Turno({
      nombre,
      apellido,
      medico,
      hora_llegada,
      fecha: fechaHoyAR()
    });

    await nuevoTurno.save();

    res.json({
      id: nuevoTurno._id,
      mensaje: 'Turno registrado en la nube',
      hora_llegada: hora_llegada
    });
  } catch (error) {
    console.error('Error al registrar turno:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. MÉDICO: Ver pacientes en espera de hoy (Ordenados por llegada)
app.get('/api/turnos/espera', async (req, res) => {
  try {
    const turnos = await Turno.find({ estado: 'esperando', fecha: fechaHoyAR() }).sort({ hora_llegada: 1 });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

// 3. MÉDICO: Llamar a un paciente a un consultorio
app.put('/api/turnos/:id/llamar', async (req, res) => {
  try {
    const { consultorio } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await Turno.findByIdAndUpdate(id, {
      estado: 'llamado',
      consultorio: consultorio,
      fecha_llamado: new Date()
    });

    res.json({ mensaje: `Paciente llamado al ${consultorio}` });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. TELE: Obtener los últimos llamados de hoy para la pantalla
app.get('/api/turnos/tv', async (req, res) => {
  try {
    const turnos = await Turno.find({ estado: 'llamado', fecha: fechaHoyAR() })
      .sort({ fecha_llamado: -1 })
      .limit(8);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos para la TV' });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});
