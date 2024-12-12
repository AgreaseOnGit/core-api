const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();
async function loadModel() {
    return tf.loadGraphModel('file://model/model.json');
}
module.exports = loadModel;