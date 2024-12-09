const productsHandler = require('../handlers/productsHandler');

const productsRoutes = [
    {
        method: 'GET',
        path: '/product',
        handler: productsHandler.getAllProducts,
      },
      {
        method: 'GET',
        path: '/product/{productId}',
        handler: productsHandler.getProductById,
      },
      {
      
        method: 'GET',
        path: '/product/category/{category}',
        handler: productsHandler.getProductsByCategory,
      
      },
      {
        method: 'GET',
        path: '/product/seller/{sellerId}',
        handler: productsHandler.getProductsBySeller,
      },
      {
        method: 'GET',
        path: '/product/search/{keyword}', 
        handler: productsHandler.searchProducts,
      },
      {
        method: 'POST',
        path: '/product',
        options: {
          payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            multipart: true,
          },
        },
        handler: productsHandler.addProduct,
      },
      {
        method: 'PUT',
        path: '/product/{productId}',
        handler: productsHandler.updateProduct,
      },
      {
        method: 'DELETE',
        path: '/product/{productId}',
        handler: productsHandler.deleteProduct,
      }
];

module.exports = productsRoutes;