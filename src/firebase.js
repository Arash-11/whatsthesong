import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/functions';
import 'firebase/analytics';
import firebaseCreds from './firebaseCreds';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// replace `xxx: "xxx"` with your actual credentials
firebase.initializeApp({
  xxx: "xxx"
});

if (process.env.NODE_ENV === 'development') {
  firebase.functions().useEmulator("localhost", 5001);
}

firebase.analytics();

const db = firebase.database();
const functions = firebase.functions();

export { db, functions };
