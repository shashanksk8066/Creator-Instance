const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function checkDb() {
  const users = await db.collection('users').get();
  users.forEach(doc => {
    console.log("User:", doc.id);
    console.log("Data:", JSON.stringify(doc.data(), null, 2));
  });
}
checkDb();
