const admin = require('firebase-admin');
const firebase = require('firebase/app');
const { uploadFileToBucket } = require('../services/uploadFileToLokal');  // Mengimpor fungsi upload

// Firebase Client SDK Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlX1UJBrWoZ8_EOvqI5JcoRTzn3IvxWGw",
    authDomain: "agrease-capstone-cfb92.firebaseapp.com",
    projectId: "agrease-capstone-cfb92",
    storageBucket: "agrease-capstone-cfb92.firebasestorage.app",
    messagingSenderId: "60968150439",
    appId: "1:60968150439:web:2ce6eb424157fc3c4f4282"
};

if (!firebase.getApps().length) {
    firebase.initializeApp(firebaseConfig);
}



// Transaction

// Handler functions
const createTransaction = async (request, h) => {
  const db = admin.firestore();
  const { id_transaction, id_buyer, id_product, payment_method, quantity, total_payment, date } = request.payload;

  // Validasi input
  if (!id_transaction || !id_buyer || !id_product || !payment_method || !quantity || !total_payment || !date) {
    return h.response({ message: 'All fields are required' }).code(400);
  }

  // Membuat transaksi baru
  const newTransaction = {
    id_buyer,
    id_product,
    payment_method,
    quantity,
    total_payment,
    date
  };

  try {
    // Menyimpan transaksi ke Firestore
    await db.collection('transactions').doc(id_transaction).set(newTransaction);
    return h.response({ success: true, message: 'Transaction created successfully', data: newTransaction }).code(201);
  } catch (error) {
    return h.response({success: false, message: error.message }).code(500);
  }
};

const updateTransaction = async (request, h) => {
  const db = admin.firestore();
  const { id } = request.params;
  const { id_buyer, id_product, payment_method, quantity, total_payment, date } = request.payload;

  try {
    // Cari transaksi berdasarkan id
    const transactionRef = db.collection('transactions').doc(id);
    const doc = await transactionRef.get();

    if (!doc.exists) {
      return h.response({success: false, message: 'Transaction not found' }).code(404);
    }

    // Update transaksi
    const updatedTransaction = {
      id_buyer,
      id_product,
      payment_method,
      quantity,
      total_payment,
      date
    };

    await transactionRef.update(updatedTransaction);
    return h.response({ success: true, message: 'Transaction updated successfully', data: updatedTransaction }).code(200);
  } catch (error) {
    return h.response({ success: false, message: error.message }).code(500);
  }
};

const deleteTransaction = async (request, h) => {
  const db = admin.firestore();
  const { id } = request.params;

  try {
    // Cari dan hapus transaksi berdasarkan id
    const transactionRef = db.collection('transactions').doc(id);
    const doc = await transactionRef.get();

    if (!doc.exists) {
      return h.response({success: false, message: 'Transaction not found' }).code(404);
    }

    await transactionRef.delete();
    return h.response({ success: true, message: 'Transaction deleted successfully' }).code(200);
  } catch (error) {
    return h.response({success: false, message: error.message }).code(500);
  }
};

const getAllTransactions = async (request, h) => {
  const db = admin.firestore();
  try {
    // Ambil semua transaksi dari Firestore
    const snapshot = await db.collection('transactions').get();
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return h.response({success: true, message: "Successfully Get All Data", data: transactions }).code(200);
  } catch (error) {
    return h.response({success: false, message: error.message }).code(500);
  }
};

const getTransactionById = async (request, h) => {
  const db = admin.firestore();
  const { id } = request.params;

  try {
    // Cari transaksi berdasarkan id
    const transactionRef = db.collection('transactions').doc(id);
    const doc = await transactionRef.get();

    if (!doc.exists) {
      return h.response({ success: false, message: 'Transaction not found' }).code(404);
    }

    return h.response({ success: true, message: "Successfully get Data By Id",  data: doc.data() }).code(200);
  } catch (error) {
    return h.response({ success: false, message: error.message }).code(500);
  }
};


module.exports = 
{
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getAllTransactions,
    getTransactionById
}