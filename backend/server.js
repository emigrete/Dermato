require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Definición del Modelo de Turnos
const turnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  medico: { type: String, required: true },
  hora_turno: { type: String, required: true },
  hora_llegada: { type: String, required: true },
  consultorio: { type: String, default: null },
  estado: { 
    type: String, 
    enum: ['esperando', 'llamado', 'finalizado'], 
    default: 'esperando' 
  },
  fecha_llamado: { type: Date, default: null }
});

const Turno = mongoose.model('Turno', turnoSchema);

// ==========================================
// RUTAS (ENDPOINTS)
// ==========================================

// 1. RECEPCIÓN: Crear un nuevo turno
app.post('/api/turnos', async (req, res) => {
  try {
    const { nombre, apellido, medico, hora_turno } = req.body;
    
    const hora_llegada = new Date().toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    const nuevoTurno = new Turno({
      nombre,
      apellido,
      medico,
      hora_turno,
      hora_llegada
    });

    await nuevoTurno.save();
    
    res.json({ 
      id: nuevoTurno._id, 
      mensaje: 'Turno registrado en la nube',
      hora_llegada: hora_llegada 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el turno' });
  }
});

// 2. MÉDICO: Ver pacientes en espera (Ordenados por llegada)
app.get('/api/turnos/espera', async (req, res) => {
  try {
    const turnos = await Turno.find({ estado: 'esperando' }).sort({ hora_llegada: 1 });
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

    await Turno.findByIdAndUpdate(id, {
      estado: 'llamado',
      consultorio: consultorio,
      fecha_llamado: new Date()
    });

    res.json({ mensaje: `Paciente llamado al ${consultorio}` });
  } catch (error) {
    res.status(500).json({ error: 'Error al llamar al paciente' });
  }
});

// 4. TELE: Obtener los últimos llamados para la pantalla
app.get('/api/turnos/tv', async (req, res) => {
  try {
    const turnos = await Turno.find({ estado: 'llamado' })
      .sort({ fecha_llamado: -1 })
      .limit(4);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos para la TV' });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
});