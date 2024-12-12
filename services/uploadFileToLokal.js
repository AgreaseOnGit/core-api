// const { Storage } = require('@google-cloud/storage');
// const crypto = require('crypto'); // Import pustaka crypto untuk generate random string

// // Membuat Client
// const storage = new Storage({
//     projectId: "agrease-capstone-cfb92"
// });
 
// const bucketName = 'agrease-capstone-17';  // Ganti dengan nama bucket yang sesuai

// // Fungsi untuk mengunggah file ke Google Cloud Storage
// async function uploadFileToBucket(file, folder) {
//   const bucket = storage.bucket(bucketName);

//   // Generate nama file unik menggunakan timestamp dan random string
//   const randomString = crypto.randomBytes(8).toString('hex'); // 16 karakter acak
//   const fileExtension = file.hapi.filename.split('.').pop(); // Mendapatkan ekstensi file
//   const fileName = `${folder}/${Date.now()}-${randomString}.${fileExtension}`;

//   // Membuat stream untuk mengunggah file ke bucket
//   const fileStream = bucket.file(fileName).createWriteStream({
//     metadata: {
//       contentType: file.mime,  // Jenis konten (tipe file)
//     },
//   });

//   return new Promise((resolve, reject) => {
//     fileStream.on('finish', () => {
//       // File berhasil diupload, kembalikan URL file
//       resolve(`https://storage.cloud.google.com/${bucketName}/${fileName}`);
//     });

//     fileStream.on('error', (error) => {
//       reject(error);  // Jika terjadi error saat upload
//     });

//     // Mengirim data file ke stream
//     fileStream.end(file._data);
//   });
// }

// async function deleteFileToBucket(imagePath) {
//   if (!imagePath) {
//     throw new Error("No image path provided");
//   }

//   try {
//     // const bucketName = 'your-bucket-name'; // Ganti dengan nama bucket Anda
//     const file = storage.bucket(bucketName).file(imagePath);

//     // Hapus file gambar
//     await file.delete();

//     console.log(`File ${imagePath} has been successfully deleted.`);
//     return true;
//   } catch (error) {
//     console.error("Error deleting file from bucket:", error);
//     // return { success: false, message: `Failed to delete file: ${error.message}` };
//   }
// }

// module.exports = { uploadFileToBucket, deleteFileToBucket  };


const fs = require('fs'); // Import pustaka File System
const path = require('path'); // Import pustaka Path
const crypto = require('crypto'); // Import pustaka crypto untuk generate random string

// Fungsi untuk mengunggah file ke folder lokal di proyek
async function uploadFileToLocal(file, folder) {
  try {
    // Generate nama file unik menggunakan timestamp dan random string
    const randomString = crypto.randomBytes(8).toString('hex'); // 16 karakter acak
    const fileExtension = file.hapi.filename.split('.').pop(); // Mendapatkan ekstensi file
    const fileName = `${Date.now()}-${randomString}.${fileExtension}`;

    // Tentukan folder induk "images"
    const baseFolder = path.join(__dirname, '..', 'images');

    // Buat subfolder di dalam "images"
    const uploadFolder = path.join(baseFolder, folder);
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const rightPath = `/images/${folder}/${fileName}`;

    // Tentukan path lengkap untuk menyimpan file
    const filePath = path.join(uploadFolder, fileName);

    // Tulis data file ke disk
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);

      fileStream.on('finish', () => {
        // Kembalikan path file lokal
        resolve(rightPath);
      });

      fileStream.on('error', (error) => {
        reject(error);
      });

      fileStream.end(file._data); // Mengirim data file ke stream
    });
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Fungsi untuk menghapus file dari folder lokal di proyek
async function deleteFileFromLocal(filePath) {

  if (!filePath) {
    throw new Error("No file path provided");
  }

  try {
    // const newPath = process.env.BASE_URL + filePath
    const newPath = path.join(__dirname, '..', filePath);
    // console.log(newPath);
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath); // Hapus file dari disk
      console.log(`File ${newPath} has been successfully deleted.`);
      return true;
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

module.exports = { uploadFileToLocal, deleteFileFromLocal };

