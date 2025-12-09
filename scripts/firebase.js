  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC2BhKW-9VEe1QVl69SsBMM5tYHJFTwxL0",
    authDomain: "ecommerce-a19aa.firebaseapp.com",
    projectId: "ecommerce-a19aa",
    storageBucket: "ecommerce-a19aa.firebasestorage.app",
    messagingSenderId: "1096657126776",
    appId: "1:1096657126776:web:0e603b5a4cba26af42748d",
    measurementId: "G-EMRJFMPY3Q"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);