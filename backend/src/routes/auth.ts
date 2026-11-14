import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;
const intentos = new Map<string, { n: number; hasta: number }>();

const hash = (texto: string) => crypto.createHash('sha256').update(texto).digest();
const iguales = (a: string, b: string) => crypto.timingSafeEqual(hash(a), hash(b));

router.post('/login', (req, res) => {
  const { APP_USER, APP_PASSWORD, JWT_SECRET } = process.env;

  if (!APP_USER || !APP_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'Acceso no configurado en el servidor.' });
  }

  const ip = req.ip || 'desconocida';
  const ahora = Date.now();
  const registro = intentos.get(ip);

  if (registro && registro.hasta > ahora && registro.n >= MAX_INTENTOS) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });
  }

  const { usuario, password } = req.body || {};
  const usuarioOk = typeof usuario === 'string' && iguales(usuario, APP_USER);
  const passwordOk = typeof password === 'string' && iguales(password, APP_PASSWORD);

  if (!usuarioOk || !passwordOk) {
    if (!registro || registro.hasta <= ahora) {
      intentos.set(ip, { n: 1, hasta: ahora + VENTANA_MS });
    } else {
      registro.n += 1;
    }
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  intentos.delete(ip);
  const token = jwt.sign({ sub: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export default router;