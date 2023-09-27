const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore,  FieldValue ,Timestamp} = require('firebase-admin/firestore');
// const serviceAccount = require('./reverr-25fb3-firebase-adminsdk-g8tph-a9d7f58699.json');
const serviceAccount = require('./dsquare-242c3-firebase-adminsdk-dgcnn-eba5c18dc3.json');
const { getStorage } = require('firebase-admin/storage');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
  const Payment=db.collection("Payments");
  const Refund=db.collection("Refunds");
  const MessagesSend = db.collection("WhatsAppSend");
  const MessagesReceived = db.collection("WhatsAppReceived");
  const bucket = getStorage().bucket(`gs://reverr-25fb3.appspot.com`);
  
  module.exports = {Payment, Refund,MessagesSend,MessagesReceived,bucket,db,FieldValue,Timestamp};