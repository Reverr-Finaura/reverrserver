const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore,  FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./reverr-25fb3-firebase-adminsdk-g8tph-a9d7f58699.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
  const Payment=db.collection("Payments");
  const Refund=db.collection("Refunds");
  const MessagesSend = db.collection("WhatsAppSend");
  const MessagesReceived = db.collection("WhatsAppReceived");
  module.exports = {Payment, Refund,MessagesSend,MessagesReceived};