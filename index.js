const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

// Conexión a la base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Crear la tabla de suscriptores si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('Error creando tabla:', err));

// Ruta para recibir suscriptores desde la web
app.post('/subscribe', async (req, res) => {
  const subscription = req.body;
  try {
    await pool.query('INSERT INTO push_subscriptions (subscription) VALUES ($1)', [subscription]);
    console.log('✅ Nuevo suscriptor guardado.');
    res.status(201).json({ mensaje: 'Suscrito' });
  } catch (err) {
    console.error('Error al guardar suscriptor:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Panel de Control Protegido con Contraseña
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM push_subscriptions');
  const count = result.rows[0].count;
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel de Monbá QR</title>
      <style>
        body { font-family: sans-serif; padding: 20px; background: #f0f2f5; }
        .card { background: white; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        input, textarea, button { width: 100%; margin-bottom: 10px; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 5px; }
        button { background: #0077b6; color: white; border: none; font-weight: bold; cursor: pointer; }
        button:hover { background: #005f92; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Enviar Notificación</h2>
        <form action="/send-custom" method="POST">
          <input type="text" name="title" placeholder="Título (Ej: Nueva Playa)" required>
          <textarea name="body" placeholder="Mensaje (Ej: Descubre Caracolito)" required></textarea>
          <input type="url" name="url" placeholder="Enlace al hacer clic (opcional)" value="https://ashchar-1.github.io/monba-qr/">
          <input type="password" name="adminPassword" placeholder="Contraseña de administrador" required>
          <button type="submit">Enviar a todos</button>
        </form>
        <p style="text-align:center; font-size:12px; color:#666;">Suscriptores actuales: ${count}</p>
      </div>
    </body>
    </html>
  `);
});

// Procesar el envío de la notificación
app.post('/send-custom', async (req, res) => {
  const { title, body, url, adminPassword } = req.body;

  // Verificar la contraseña
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send('<h3 style="color:red; text-align:center;">Contraseña incorrecta. <a href="/">Volver</a></h3>');
  }

  const payload = JSON.stringify({ title, body, url: url || 'https://ashchar-1.github.io/monba-qr/' });

  try {
    const result = await pool.query('SELECT subscription FROM push_subscriptions');
    const subscriptions = result.rows.map(row => row.subscription);

    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
    });

    res.send(`
      <script>
        alert('¡Notificación enviada a ${subscriptions.length} dispositivos!');
        window.location.href = '/';
      </script>
    `);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error al enviar');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
