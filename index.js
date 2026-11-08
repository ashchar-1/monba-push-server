const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ AQUÍ PON TUS CLAVES VAPID (Las del bloc de notas)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

// Aquí guardaremos las suscripciones en memoria
let subscriptions = [];

// Ruta para recibir las suscripciones desde tu web
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // Guardamos el pase VIP
  console.log('✅ Nuevo suscriptor guardado. Total:', subscriptions.length);
  res.status(201).json({ mensaje: 'Suscrito con éxito' });
});

// Ruta para enviar notificaciones a todos
app.get('/send', (req, res) => {
  const payload = JSON.stringify({
    title: '¡Hola desde mi servidor!',
    body: 'Esta es una notificación real enviada desde Node.js',
    url: 'https://ashchar-1.github.io/monba-qr/'
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
  });

  res.json({ mensaje: 'Notificaciones enviadas a ' + subscriptions.length + ' usuarios.' });
});

const PORT = process.env.PORT || 3000;;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});