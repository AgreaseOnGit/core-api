const authHandler = require('../handlers/authHandler');

const authRoutes = [
  {
    method: 'POST',
    path: '/register',
    handler: authHandler.registerUser,
  },
  {
    method: 'POST',
    path: '/login',
    handler: authHandler.loginUser,
  },
  {
    method: 'POST',
    path: '/verify/{userId}',
    handler: authHandler.verifyToken,
  },
  {
    method: 'PUT',
    path: '/user/{userId}',
    handler: authHandler.userUpdate,
    options: {
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        multipart: true,
        parse: true,
        maxBytes: 1000000
      }
    }
  },
  {
    method: 'DELETE',
    path: '/user/{userId}',
    handler: authHandler.userDelete,
  }
];

module.exports = authRoutes;
