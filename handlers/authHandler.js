const admin = require('firebase-admin');

// Import Firebase Client SDK (gunakan firebase-admin untuk token generation)
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const firebase = require('firebase/app');
const sendEmail = require('../services/emailService');
const { uploadFileToBucket, deleteFileToBucket } = require('../services/uploadFileToLokal');  // Mengimpor fungsi upload

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
// const auth = getAuth();
// console.log('Firebase initialized:', !!auth);
// const db = admin.firestore();










// Register User
const registerUser = async (request, h) => {
  const db = admin.firestore();
  const { email, password, name, phone, address, role } = request.payload;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Generate a random 6-digit code for verification
    const code = Math.floor(100000 + Math.random() * 900000);

    const link = `${process.env.BASE_URL}/verify/${user.uid}`;
    const imageUrl = '/images/user-profile-images/profile-image.jpg';
    
    // Send verification email
    await sendEmail({
      fromName: 'Agrease Admin',
      fromAddress: 'irpansyah810@gmail.com',
      toName: name,
      toAddress: email,
      subject: 'Email Verification',
      content: `Hello ${name},\n\nPlease verify your email using the code:\n\n${code}\n\nThank you!\nAgrease Team`,
    });

    // Save user data to Firestore
    const userRef = db.collection('users-profile').doc(user.uid);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      phone,
      address,
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      role: role ? role : "buyer",
      isVerified: code, // Indicating the email verification code
    });

    return h.response({ success: true, message: 'User registered successfully', uid: user.uid }).code(201);
  } catch (error) {
    console.error('Error registering user:', error);
    return h.response({ success: false, error: error.message }).code(400);
  }
};




// Login User
const loginUser = async (request, h) => {
  const db = admin.firestore();
  const { email, password } = request.payload;

  try {
    // Check if the user is registered
    const userRef = db.collection('users-profile');
    const doc = await userRef.where('email', '==', email).get();

    if (doc.empty) {
      return h.response({ success: false, error: "Email not registered." }).code(404);
    }

    // Extract user data
    let userData = null;
    doc.forEach(d => {
      userData = { ...d.data() }; // Combine document ID with data
    });

    if (userData.isVerified !== true) {
      return h.response({ success: false, error: "Email not verified." }).code(400);
    }

    // Authenticate user using Firebase Auth
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return h.response({ success: true, message: 'Login successful', data: userData }).code(200);
  } catch (error) {
    console.error('Error logging in:', error);
    return h.response({ success: false, error: error.message }).code(400);
  }
};


// Verify Token
const verifyToken = async (request, h) => {
  const db = admin.firestore();
  const { userId } = request.params;
  const { codeOTP } = request.payload;

  try {
    const userRef = db.collection('users-profile').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ success: false, error: "Data not found or invalid URL" }).code(404);
    }

    const userData = doc.data();
    if (userData.isVerified == codeOTP) {
      // Update verification status to true
      await userRef.update({ isVerified: true });

      return h.response({ success: true, message: "Verification successful!" }).code(200);
    } else {
      return h.response({ success: false, error: "Invalid OTP code" }).code(400);
    }
  } catch (error) {
    console.error('Error during verification:', error);
    return h.response({ success: false, error: 'Invalid token or internal error' }).code(400);
  }
};


  // Update data User Profile
const userUpdate = async (request, h) => {
  const db = admin.firestore();
  const userId = request.params.userId; // Penyesuaian params userId

  const { name, phone, address } = request.payload;

  // Validasi field yang diperlukan
  if (!name || !phone || !address) {
    return h.response({
      success: false,
      message: "All fields (name, phone, address) are required",
    }).code(400);
  }

  try {
    const dataUser = db.collection("users-profile").doc(userId);
    const dataUserDoc = await dataUser.get();

    // console.log(dataUserDoc);

    // Validasi jika user tidak ditemukan
    if (!dataUserDoc.exists) {
      return h.response({
        success: false,
        message: `User with ID ${userId} not found`,
      }).code(404);
    }

     // Jika file gambar diupload
     let imageUrl = null;
     if (request.payload.image) {
      const userData = dataUserDoc.data();
      const imagePath = userData.imageUrl;

      // Ekstrak path file dari URL
      const urlParts = imagePath.split('/');
      const fileName = urlParts[urlParts.length - 1]; // Ambil bagian terakhir dari URL sebagai nama file

      if(fileName !== "profile-image.jpg"){
        const filePath = `/images/user-profile-images/${fileName}`; // Path relatif di dalam bucket
        if(!deleteFileToBucket(filePath)){
          console.log("Gagal Menghapus file!");
          return false;
          }
      }
       const file = request.payload.image;
       imageUrl = await uploadFileToBucket(file, "user-profile-images"); // Unggah gambar dan ambil URL
     }

    // Data untuk memperbarui profil pengguna
    const updateUserData = {
      name,
      phone,
      address,
      imageUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update data pengguna di Firestore
    await dataUser.update(updateUserData);

    // Kirim respons sukses
    return h.response({
      success: true,
      message: "User profile has been updated successfully",
      data: { id: userId, ...updateUserData },
    }).code(200);

  } catch (error) {
    console.error("Error updating user profile:", error);
    return h.response({
      success: false,
      message: "Failed to update user profile. Please try again!",
    }).code(500);
  }
};


// Delete User Profile
const userDelete = async (request, h) => {
  const db = admin.firestore();
  const { userId } = request.params;

  try {
    // Ambil referensi user berdasarkan userId
    const userRef = db.collection("users-profile").doc(userId); // Penyesuaian nama koleksi
    const userSnapshot = await userRef.get(); // Penyesuaian nama variabel untuk snapshot

    if (!userSnapshot.exists) {
      return h.response({
        success: false,
        message: `User with ID ${userId} not found`,
      }).code(404);
    }
    const userData = userSnapshot.data();
    const imagePath = userData.imageUrl;

     // Ekstrak path file dari URL
     const urlParts = imagePath.split('/');
     const fileName = urlParts[urlParts.length - 1]; // Ambil bagian terakhir dari URL sebagai nama file

     if(fileName !== "profile-image.jpg"){
       const filePath = `user-profile-images/${fileName}`; // Path relatif di dalam bucket
      if(!deleteFileToBucket(filePath)){
        console.log("Gagal Menghapus file!");
        return false;
      }
     }

     
     // Hapus data user dari Firestore
     await userRef.delete();
     
     // Hapus pengguna dari Firebase Authentication
    await admin.auth().deleteUser(userId);
    // Kirim respons sukses
    return h.response({
      success: true,
      message: "User profile has been deleted successfully",
      data: { id: userId },
    }).code(200);
  } catch (error) {
    console.error("Error deleting user:", error);
    return h.response({
      success: false,
      message: "Internal server error. Please try again!",
    }).code(500);
  }
};







module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  userUpdate,
  userDelete
};
