const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyDIdYx3mGLxxuZeXz8cXhMew44g-0kQkf8",
  authDomain: "agresia-8d511.firebaseapp.com",
  projectId: "agresia-8d511",
  storageBucket: "agresia-8d511.firebasestorage.app",
  messagingSenderId: "679556135453",
  appId: "1:679556135453:web:863ad9fc854077caece4f4"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyACYJ5Cm2Y-i7HJes2ET2QW67zvIgLrZeo",
//   authDomain: "tutorial-e06c1.firebaseapp.com",
//   projectId: "tutorial-e06c1",
//   storageBucket: "tutorial-e06c1.appspot.com",
//   messagingSenderId: "863505404334",
//   appId: "1:863505404334:web:132118b0d6acd7dfa3f83f",
//   measurementId: "G-SW2M0FYQG5",
// };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Item = db.collection("item");
module.exports = Item;
