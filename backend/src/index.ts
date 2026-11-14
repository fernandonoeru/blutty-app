import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import presentacionesRoutes from './routes/presentaciones';
import movimientosRoutes from './routes/movimientos';
import vendedoresRoutes from './routes/vendedores';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/requireAuth';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Pública: solo el login
app.use('/api/auth', authRoutes);

// Todo lo demás de /api exige token
app.use('/api', requireAuth);

app.use('/api/presentaciones', presentacionesRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/vendedores', vendedoresRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Blutty API funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});