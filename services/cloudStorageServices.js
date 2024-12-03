const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto'); // Import pustaka crypto untuk generate random string

// Membuat Client
const storage = new Storage({
    projectId: "agrease-capstone-cfb92"
});
 
const bucketName = 'agrease-capstone-17';  // Ganti dengan nama bucket yang sesuai

// Fungsi untuk mengunggah file ke Google Cloud Storage
async function uploadFileToBucket(file) {
  const bucket = storage.bucket(bucketName);

  // Generate nama file unik menggunakan timestamp dan random string
  const randomString = crypto.randomBytes(8).toString('hex'); // 16 karakter acak
  const fileExtension = file.hapi.filename.split('.').pop(); // Mendapatkan ekstensi file
  const fileName = `user-profile-images/${Date.now()}-${randomString}.${fileExtension}`;

  // Membuat stream untuk mengunggah file ke bucket
  const fileStream = bucket.file(fileName).createWriteStream({
    metadata: {
      contentType: file.mime,  // Jenis konten (tipe file)
    },
  });

  return new Promise((resolve, reject) => {
    fileStream.on('finish', () => {
      // File berhasil diupload, kembalikan URL file
      resolve(`https://storage.googleapis.com/${bucketName}/${fileName}`);
    });

    fileStream.on('error', (error) => {
      reject(error);  // Jika terjadi error saat upload
    });

    // Mengirim data file ke stream
    fileStream.end(file._data);
  });
}

async function deleteFileToBucket(imagePath) {
  if (!imagePath) {
    throw new Error("No image path provided");
  }

  try {
    // const bucketName = 'your-bucket-name'; // Ganti dengan nama bucket Anda
    const file = storage.bucket(bucketName).file(imagePath);

    // Hapus file gambar
    await file.delete();

    console.log(`File ${imagePath} has been successfully deleted.`);
    return true;
  } catch (error) {
    console.error("Error deleting file from bucket:", error);
    // return { success: false, message: `Failed to delete file: ${error.message}` };
  }
}

module.exports = { uploadFileToBucket, deleteFileToBucket  };
