const admin = require('firebase-admin');
const firebase = require('firebase/app');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const { uploadFileToBucket } = require('../services/cloudStorageServices');  // Mengimpor fungsi upload
const { deleteFileToBucket } = require('./path-to-upload-functions');

// Inisialisasi Firebase
admin.initializeApp({
  credential: admin.credential.cert(require('../permission.json')),
});
const firestore = admin.firestore();

// Inisialisasi Google Cloud Storage
const storage = new Storage({
  keyFilename: './service-account-key.json',
});
const bucket = storage.bucket('agrease-capstone-17'); // Ganti dengan nama bucket Anda


if (!firebase.getApps().length) {
    firebase.initializeApp(firebaseConfig);
}


//menampilkan product
const getAllProducts = async (request, h) => {
    const db = admin.firestore();
      try {
        const productsSnapshot = await db.collection("products").get();
    
        if (productsSnapshot.empty) {
          return h.response({
            success: false,
            message: "No products found",
            data: [],
          }).code(404);
        }
    
        const products = [];
        productsSnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
    
        return h.response({
          success: true,
          message: "Products Data has been fetched successfully",
          data: products,
        }).code(200);
      } catch (error) {
        console.error("Error fetching products:", error);
        return h.response({
          success: false,
          message: "Internal server error",
        }).code(500);
      }
  };
  
  
  
  //get produk by ID
  const getProductById = async (request, h) => {
    const db = admin.firestore();
    const { productId } = request.params;
  
    try {
      // Ambil data produk berdasarkan ID
      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();
  
      if (!productDoc.exists) {
        return h.response({
          success: false,
          message: `Product with ID ${productId} not found`,
        }).code(404);
      }
  
      const productData = { id: productDoc.id, ...productDoc.data() };
  
      return h.response({
        success: true,
        message: "Detail Product Data has been fetched successfully",
        data: productData,
      }).code(200);
    } catch (error) {
      console.error("Error fetching product:", error);
      return h.response({
        success: false,
        message: "Internal server error",
      }).code(500);
    }
  };
  
  
  //get product by category
  const getProductsByCategory = async (request, h) => {
    const db = admin.firestore();
    const { category } = request.params; // Ambil kategori dari path parameter
  
    try {
      if (!category) {
        return h.response({
          success: false,
          message: "Category is required",
        }).code(400);
      }
  
      // Query Firestore untuk produk berdasarkan kategori
      const productsSnapshot = await db
        .collection("products")
        .where("category", "==", category)
        .get();
  
      if (productsSnapshot.empty) {
        return h.response({
          success: false,
          message: `No products found in category ${category}`,
          data: [],
        }).code(404);
      }
  
      // Map data produk ke array
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
  
      return h.response({
        success: true,
        message: "Product Data by Category has been fetched successfully",
        data: products,
      }).code(200);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return h.response({
        success: false,
        message: "Internal server error",
      }).code(500);
    }
  };
  
  
  
  //menampilkan product by seller
  const getProductsBySeller = async (request, h) => {
    const db = admin.firestore();
    const { sellerId } = request.params;
  
    try {
      // Query produk berdasarkan sellerId
      const productsSnapshot = await db
        .collection("products")
        .where("seller_id", "==", sellerId)
        .get();
  
      if (productsSnapshot.empty) {
        return h.response({
          success: false,
          message: `No products found for seller with ID ${sellerId}`,
          data: [],
        }).code(404);
      }
  
      // Map hasil query ke array
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
  
      return h.response({
        success: true,
        message: "Product Data by Seller has been fetched successfully",
        data: products,
      }).code(200);
    } catch (error) {
      console.error("Error fetching products by seller:", error);
      return h.response({
        success: false,
        message: "Internal server error",
      }).code(500);
    }
  };
  


  
  
  //search product
  const searchProducts = async (request, h) => {
    const db = admin.firestore();
    const { keyword } = request.params; // Ambil parameter 'keyword' dari URL
  
    // Validasi parameter query
    if (!keyword || keyword.trim() === "") {
      return h.response({
        success: false,
        message: "Search keyword is required",
      }).code(400);
    }
  
    try {
      // Query Firestore untuk produk
      const productsSnapshot = await db.collection("products").get();
  
      if (productsSnapshot.empty) {
        return h.response({
          success: false,
          message: "No products found.",
          data: [],
        }).code(404);
      }
  
      // Filter produk berdasarkan keyword (case-insensitive)
      const products = [];
      productsSnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
  
        // Pastikan properti 'name' ada dan valid
        if (product.product_name && typeof product.product_name === "string") {
          if (product.product_name.toLowerCase().includes(keyword.toLowerCase())) {
            products.push(product);
          }
        }
      });
  
      if (products.length === 0) {
        return h.response({
          success: false,
          message: `No products found matching the search keyword '${keyword}'.`,
          data: [],
        }).code(404);
      }
  
      // Kirimkan hasil produk
      return h.response({
        success: true,
        message: "Product Data by Search has been fetched successfully",
        data: products,
      }).code(200);
    } catch (error) {
      console.error("Error fetching products:", error);
      return h.response({
        success: false,
        message: "Internal server error",
      }).code(500);
    }
  };
  
  
  
  



  //create product
const addProduct = async (request, h) => {
  try {
    const { payload } = request;

    // Validasi data secara manual
    const requiredFields = ['name', 'price', 'description', 'stock', 'category', 'image'];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      return h.response({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      }).code(400);
    }

    if (isNaN(Number(payload.price)) || Number(payload.price) <= 0) {
      return h.response({
        success: false,
        message: 'Price must be a positive number',
      }).code(400);
    }

    if (isNaN(Number(payload.stock)) || Number(payload.stock) <= 0) {
      return h.response({
        success: false,
        message: 'Stock must be a positive number',
      }).code(400);
    }

    // Upload file ke Google Cloud Storage
    const file = payload.image;
    const imageUrl = await uploadFileToBucket(file);

    // Simpan metadata produk di Firestore
    const productRef = firestore.collection('products').doc();
    await productRef.set({
      name: payload.name,
      price: Number(payload.price),
      description: payload.description,
      stock: Number(payload.stock),
      category: payload.category,
      image: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return h.response({
      success: true,
      message: 'Product added successfully!',
      data: { id: productRef.id, image: imageUrl },
    }).code(201);
  } catch (err) {
    console.error('Error adding product:', err);
    return h.response({
      success: false,
      message: 'Failed to add product',
      error: err.message,
    }).code(500);
  }
};

  
  
  
  
  //update product
  const { uploadFileToBucket, deleteFileToBucket } = require('./path-to-upload-functions');

  const updateProduct = async (request, h) => {
    const db = admin.firestore();
    const { productId } = request.params;
    const { image, price, name, description, stock } = request.payload;
  
    // Validasi field yang diperlukan
    if (!image || !price || !name || !description || !stock) {
      return h.response({
        success: false,
        message: "All fields (image, price, name, description, stock) are required",
      }).code(400);
    }
  
    try {
      // Ambil referensi produk berdasarkan productId
      const productRef = db.collection("products").doc(productId);
      const productSnapshot = await productRef.get();
  
      if (!productSnapshot.exists) {
        return h.response({
          success: false,
          message: `Product with ID ${productId} not found`,
        }).code(404);
      }
  
      const existingProduct = productSnapshot.data();
  
      // Upload gambar baru ke Google Cloud Storage
      const newImageUrl = await uploadFileToBucket(image);
  
      // Hapus gambar lama jika ada
      if (existingProduct.image) {
        const oldImagePath = existingProduct.image.split('/').pop(); // Ambil path file lama
        await deleteFileToBucket(`user-profile-images/${oldImagePath}`);
      }
  
      // Perbarui data produk
      const updatedProduct = {
        image: newImageUrl,
        price,
        name,
        description,
        stock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Tambahkan timestamp pembaruan
      };
  
      await productRef.update(updatedProduct);
  
      // Kirim respons sukses
      return h.response({
        success: true,
        message: "Product Data has been updated successfully",
        data: { id: productId, ...updatedProduct },
      }).code(200);
    } catch (error) {
      console.error("Error updating product:", error);
      return h.response({
        success: false,
        message: "Internal server error",
        error: error.message,
      }).code(500);
    }
  };
  
  
  
  
  
  //menghapus product
const deleteProduct = async (request, h) => {
  const db = admin.firestore();
  const { productId } = request.params;

  try {
    // Ambil referensi produk berdasarkan productId
    const productRef = db.collection("products").doc(productId);
    const productSnapshot = await productRef.get();

    if (!productSnapshot.exists) {
      return h.response({
        success: false,
        message: `Product with ID ${productId} not found`,
      }).code(404);
    }

    // Ambil data produk
    const productData = productSnapshot.data();

    // Hapus gambar dari Google Cloud Storage jika ada
    if (productData.image) {
      const imagePath = productData.image.split('/').pop(); // Ambil path file dari URL
      await deleteFileToBucket(`user-profile-images/${imagePath}`);
    }

    // Hapus produk dari Firestore
    await productRef.delete();

    // Kirim respons sukses
    return h.response({
      success: true,
      message: "Product data and image have been deleted successfully",
      data: { id: productId },
    }).code(200);
  } catch (error) {
    console.error("Error deleting product:", error);
    return h.response({
      success: false,
      message: "Internal server error",
      error: error.message,
    }).code(500);
  }
};


  
  module.exports = 
  {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getProductsBySeller,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }