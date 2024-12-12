const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const csv = require('csv-parser');
const loadModel = require('./loadModel');

const data = [];

fs.createReadStream('./product_data.csv') // Path file CSV
  .pipe(csv()) // Parsing file CSV
  .on('data', (row) => {
    data.push(row); // Tambahkan setiap baris ke array
  })
  .on('end', () => {
    // console.log('CSV berhasil diimpor:', data); // Tampilkan data
    // Lakukan pengolahan data di sini
  });
(async () => {
    const model = await loadModel();
    const tensor = tf.tensor2d([
        [19155],
        [10],
        [4.8],
        [0.0],
        [3.0],
        [0.0],
        [5.0],
        [5.0],
        [2.0],
        [5.0],
        [4.0],
        [3.8]
    ]);
    
    const prediction = model.predict([tensor, data]);
    const final = await prediction.data();
    console.log(final);
})();
  

//   console.log(data);
 
// async function predictClassification(model, image) {

    
//     try {
//         // const tensor = tf.node
//         //     .decodeJpeg(image)
//         //     .resizeNearestNeighbor([224, 224])
//         //     .expandDims()
//         //     .toFloat()
//         const tensor = tf.tensor2d([
//             [19155],
//             [10],
//             [4.8],
//             [0.0],
//             [3.0],
//             [0.0],
//             [5.0],
//             [5.0],
//             [2.0],
//             [5.0],
//             [4.0],
//             [3.8]
//         ]);
 
//         const prediction = model.predict([tensor, data]);
//         const final = await prediction.data();
//         // const confidenceScore = Math.max(...score) * 100;
 
//         // const classResult = tf.argMax(prediction, 1).dataSync()[0];
//         // const label = classes[classResult];
 
//         // let explanation, suggestion;
 
//         // return { confidenceScore, label, explanation, suggestion };
//     } catch (error) {
//         throw new InputError(`Terjadi kesalahan input: ${error.message}`)
//     }
// }
 
// module.exports = predictClassification;