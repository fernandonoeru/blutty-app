import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import presentacionesRoutes from './routes/presentaciones';
import movimientosRoutes from './routes/movimientos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/presentaciones', presentacionesRoutes);
app.use('/api/movimientos', movimientosRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blutty API funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});