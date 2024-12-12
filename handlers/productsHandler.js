const admin = require('firebase-admin');
const firebase = require('firebase/app');
const { uploadFileToLocal, deleteFileFromLocal } = require('../services/uploadFileToLokal');  // Mengimpor fungsi upload

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

// const normalizePrice = (price) => {
//   while (price >= 1000000) {
//     price = price / 10; // Membagi harga dengan 10 hingga di bawah 1 juta
//   }
//   return price;
// };

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

      // try {
      //   // Mendapatkan semua koleksi di Firestore
      //   const collections = await db.listCollections();
    
      //   for (const collection of collections) {
      //     console.log(`Memproses koleksi: ${collection.id}`);
    
      //     // Mendapatkan semua dokumen di koleksi
      //     const snapshot = await collection.get();
    
      //     // Iterasi melalui setiap dokumen
      //     const updatePromises = snapshot.docs.map(async (doc) => {
      //       const data = doc.data();
    
      //       // Cek apakah field price ada dan perlu dinormalisasi
      //       if (data.price && typeof data.price === 'number' && data.price > 1000000) {
      //         const normalizedPrice = normalizePrice(data.price);
      //         console.log(`Updating document ${doc.id} in ${collection.id} with price ${normalizedPrice}`);
    
      //         // Update field price
      //         await collection.doc(doc.id).update({ price: normalizedPrice });
      //       }
      //     });
    
      //     // Tunggu semua update selesai untuk koleksi ini
      //     await Promise.all(updatePromises);
      //   }
    
      //   console.log('Semua dokumen berhasil diperbarui.');
      // } catch (error) {
      //   console.error('Terjadi kesalahan saat memperbarui harga:', error);
      // }
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
        .where("sellerId", "==", sellerId)
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
    const { q } = request.query; // Ambil parameter 'q' dari URL
  
    // Validasi parameter query
    if (!q) {
      return h.response({
        success: false,
        message: "Search keyword is required",
      }).code(400);
    }
  
    try {
      // Query ke koleksi produk untuk mencocokkan nama produk
      const productsSnapshot = await db.collection("products").where("name", "==", q).get();
  
      if (productsSnapshot.empty) {
        return h.response({
          success: false,
          message: "No products found matching the search keyword.",
          data: [],
        }).code(404);
      }
  
      // Mapping hasil query ke array
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
  
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
    const db = admin.firestore();
    const { image, price, product_name, product_desc, stock, seller_id, category} = request.payload;
  
    // Validasi field yang diperlukan
    if (!image || !price || !product_name || !product_desc || !stock || !seller_id) {
      return h.response({
        success: false,
        message: "All fields (image, price, product_name, product_desc, stock) are required",
      }).code(400);
    }

      const file = request.payload.image;
      imageUrl = await uploadFileToLocal(file, "product-images"); // Unggah gambar dan ambil URL
  
    try {
      // Data produk baru
      const newProduct = {
        category,
        image: imageUrl,
        price,
        product_name,
        product_desc,
        stock,
        rating: 0,
        seller_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Tambahkan timestamp
      };
  
      // Simpan produk baru ke Firestore
      const productRef = await db.collection("products").add(newProduct);
  
      // Kirimkan respons dengan data produk yang berhasil dibuat
      return h.response({
        success: true,
        message: "Product has been created successfully",
        data: { id: productRef.id, ...newProduct },
      }).code(201);
    } catch (error) {
      console.error("Error creating product:", error);
      return h.response({
        success: false,
        message: "Internal server error",
      }).code(500);
    }
  };
  
  
  
  
  //update product
  const updateProduct = async (request, h) => {
    const db = admin.firestore();
    const { productId } = request.params;
    const { image, price, product_name, product_desc, stock, seller_id, category} = request.payload;
  
    // Validasi field yang diperlukan
    if (!image || !price || !product_name || !product_desc || !stock || !seller_id) {
      return h.response({
        success: false,
        message: "All fields (image, price, product_name, product_desc, stock) are required",
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
  
       // Jika file gambar diupload
     let imageUrl = null;
     if (request.payload.image) {
      const productData = productSnapshot.data();
      const imagePath = productData.image;

      // Ekstrak path file dari URL
      // const urlParts = imagePath.split('/');
      // const fileName = urlParts[urlParts.length - 1]; // Ambil bagian terakhir dari URL sebagai nama file
      // const filePath = `product-images/${fileName}`; // Path relatif di dalam bucket
      if(!deleteFileFromLocal(imagePath)){
        console.log("Gagal Menghapus file!");
        return false;
        }
       const file = request.payload.image;
       imageUrl = await uploadFileToLocal(file, "product-images"); // Unggah gambar dan ambil URL
     }


      // Perbarui data produk
      const updatedProduct = {
        category,
        image: imageUrl,
        price,
        product_name,
        product_desc,
        stock,
        rating: 0,
        seller_id,
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

      const productData = productSnapshot.data();
      const imagePath = productData.image;

      // console.log(imagePath);
  
       // Ekstrak path file dari URL
      //  const urlParts = imagePath.split('/');
      //  const fileName = urlParts[urlParts.length - 1]; // Ambil bagian terakhir dari URL sebagai nama file
      //  const filePath = `images/product-images/${fileName}`; // Path relatif di dalam bucket
       if(!deleteFileFromLocal(imagePath)){
          console.log("Gagal Menghapus file!");
          return false;
        }
       
  
      // Hapus produk dari Firestore
      await productRef.delete();
  
      // Kirim respons sukses
      return h.response({
        success: true,
        message: "Product Data has been deleted successfully",
        data: { id: productId },
      }).code(200);
    } catch (error) {
      console.error("Error deleting product:", error);
      return h.response({
        success: false,
        message: "Internal server error",
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