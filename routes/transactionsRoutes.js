const transactionsHandler = require('../handlers/transactionsHandler');

const transactionsRoutes = [
    {
        method: 'POST',
        path: '/transactions',
        handler: transactionsHandler.createTransaction,
      },
      {
        method: 'PUT',
        path: '/transactions/{id}',
        handler: transactionsHandler.updateTransaction,
      },
      {
        method: 'DELETE',
        path: '/transactions/{id}',
        handler: transactionsHandler.deleteTransaction,
      },
      {
        method: 'GET',
        path: '/transactions',
        handler: transactionsHandler.getAllTransactions,
      },
      {
        method: 'GET',
        path: '/transactions/{id}',
        handler: transactionsHandler.getTransactionById,
      },
      
];

module.exports = transactionsRoutes;