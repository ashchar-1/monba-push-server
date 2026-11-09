const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para leer el formulario

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

let subscriptions = [];

// 🛡️ MIDDLEWARE DE SEGURIDAD (Protege el panel con contraseña)
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    return res.status(401).send('Autenticación requerida');
  }
  const [type, credentials] = auth.split(' ');
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // El usuario siempre será "admin" y la contraseña la configuras en Render
  if (user === 'admin' && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    res.status(401).send('Contraseña incorrecta');
  }
};

// 1. Ruta PÚBLICA para recibir suscriptores desde tu página web
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  console.log('✅ Nuevo suscriptor. Total:', subscriptions.length);
  res.status(201).json({ mensaje: 'Suscrito' });
});

// 2. PANEL DE CONTROL (Protegido con contraseña)
app.get('/', basicAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel de Notificaciones - Monbá QR</title>
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
          <button type="submit">Enviar a todos los dispositivos</button>
        </form>
        <p style="text-align:center; font-size:12px; color:#666;">Suscriptores actuales: ${subscriptions.length}</p>
        <p style="text-align:center; font-size:12px; color:#666;"><a href="/" style="color:#0077b6;">Recargar contador</a></p>
      </div>
    </body>
    </html>
  `);
});

// 3. RUTA PARA PROCESAR EL FORMULARIO (Protegida con contraseña)
app.post('/send-custom', basicAuth, (req, res) => {
  const { title, body, url } = req.body;
  
  const payload = JSON.stringify({
    title: title,
    body: body,
    url: url || 'https://ashchar-1.github.io/monba-qr/' // Si no hay URL, usa la de la app
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
  });

  res.send(`
    <script>
      alert('¡Notificación enviada a ${subscriptions.length} dispositivos!');
      window.location.href = '/';
    </script>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para leer el formulario

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

let subscriptions = [];

// 🛡️ MIDDLEWARE DE SEGURIDAD (Protege el panel con contraseña)
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    return res.status(401).send('Autenticación requerida');
  }
  const [type, credentials] = auth.split(' ');
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // El usuario siempre será "admin" y la contraseña la configuras en Render
  if (user === 'admin' && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    res.status(401).send('Contraseña incorrecta');
  }
};

// 1. Ruta PÚBLICA para recibir suscriptores desde tu página web
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  console.log('✅ Nuevo suscriptor. Total:', subscriptions.length);
  res.status(201).json({ mensaje: 'Suscrito' });
});

// 2. PANEL DE CONTROL (Protegido con contraseña)
app.get('/', basicAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel de Notificaciones - Monbá QR</title>
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
          <button type="submit">Enviar a todos los dispositivos</button>
        </form>
        <p style="text-align:center; font-size:12px; color:#666;">Suscriptores actuales: ${subscriptions.length}</p>
        <p style="text-align:center; font-size:12px; color:#666;"><a href="/" style="color:#0077b6;">Recargar contador</a></p>
      </div>
    </body>
    </html>
  `);
});

// 3. RUTA PARA PROCESAR EL FORMULARIO (Protegida con contraseña)
app.post('/send-custom', basicAuth, (req, res) => {
  const { title, body, url } = req.body;
  
  const payload = JSON.stringify({
    title: title,
    body: body,
    url: url || 'https://ashchar-1.github.io/monba-qr/' // Si no hay URL, usa la de la app
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
  });

  res.send(`
    <script>
      alert('¡Notificación enviada a ${subscriptions.length} dispositivos!');
      window.location.href = '/';
    </script>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para leer el formulario

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

let subscriptions = [];

// 🛡️ MIDDLEWARE DE SEGURIDAD (Protege el panel con contraseña)
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    return res.status(401).send('Autenticación requerida');
  }
  const [type, credentials] = auth.split(' ');
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // El usuario siempre será "admin" y la contraseña la configuras en Render
  if (user === 'admin' && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    res.status(401).send('Contraseña incorrecta');
  }
};

// 1. Ruta PÚBLICA para recibir suscriptores desde tu página web
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  console.log('✅ Nuevo suscriptor. Total:', subscriptions.length);
  res.status(201).json({ mensaje: 'Suscrito' });
});

// 2. PANEL DE CONTROL (Protegido con contraseña)
app.get('/', basicAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel de Notificaciones - Monbá QR</title>
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
          <button type="submit">Enviar a todos los dispositivos</button>
        </form>
        <p style="text-align:center; font-size:12px; color:#666;">Suscriptores actuales: ${subscriptions.length}</p>
        <p style="text-align:center; font-size:12px; color:#666;"><a href="/" style="color:#0077b6;">Recargar contador</a></p>
      </div>
    </body>
    </html>
  `);
});

// 3. RUTA PARA PROCESAR EL FORMULARIO (Protegida con contraseña)
app.post('/send-custom', basicAuth, (req, res) => {
  const { title, body, url } = req.body;
  
  const payload = JSON.stringify({
    title: title,
    body: body,
    url: url || 'https://ashchar-1.github.io/monba-qr/' // Si no hay URL, usa la de la app
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
  });

  res.send(`
    <script>
      alert('¡Notificación enviada a ${subscriptions.length} dispositivos!');
      window.location.href = '/';
    </script>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para leer el formulario

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails('mailto:tacai2753@gmail.com', publicVapidKey, privateVapidKey);

let subscriptions = [];

// 🛡️ MIDDLEWARE DE SEGURIDAD (Protege el panel con contraseña)
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    return res.status(401).send('Autenticación requerida');
  }
  const [type, credentials] = auth.split(' ');
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // El usuario siempre será "admin" y la contraseña la configuras en Render
  if (user === 'admin' && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Panel Seguro"');
    res.status(401).send('Contraseña incorrecta');
  }
};

// 1. Ruta PÚBLICA para recibir suscriptores desde tu página web
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  console.log('✅ Nuevo suscriptor. Total:', subscriptions.length);
  res.status(201).json({ mensaje: 'Suscrito' });
});

// 2. PANEL DE CONTROL (Protegido con contraseña)
app.get('/', basicAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel de Notificaciones - Monbá QR</title>
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
          <button type="submit">Enviar a todos los dispositivos</button>
        </form>
        <p style="text-align:center; font-size:12px; color:#666;">Suscriptores actuales: ${subscriptions.length}</p>
        <p style="text-align:center; font-size:12px; color:#666;"><a href="/" style="color:#0077b6;">Recargar contador</a></p>
      </div>
    </body>
    </html>
  `);
});

// 3. RUTA PARA PROCESAR EL FORMULARIO (Protegida con contraseña)
app.post('/send-custom', basicAuth, (req, res) => {
  const { title, body, url } = req.body;
  
  const payload = JSON.stringify({
    title: title,
    body: body,
    url: url || 'https://ashchar-1.github.io/monba-qr/' // Si no hay URL, usa la de la app
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error('Error al enviar:', err));
  });

  res.send(`
    <script>
      alert('¡Notificación enviada a ${subscriptions.length} dispositivos!');
      window.location.href = '/';
    </script>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
