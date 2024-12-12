const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const admin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
require('dotenv').config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-service-account.json')),
});



const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: 'localhost',
  });

  await server.register(Inert);
  const routesInert = [
    {
      method: 'GET',
        path: '/images/{param*}', // Route untuk folder images
        handler: {
            directory: {
                path: 'images', // Lokasi folder
                index: false    // Jangan load file index.html secara otomatis
            }
        }
    }
  ]

  // Register routes
  server.route([...authRoutes, ...productsRoutes, ...transactionsRoutes, ...routesInert]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
