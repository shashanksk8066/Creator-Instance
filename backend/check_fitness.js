const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function check() {
  const users = await db.collection('users').where('subdomain', '==', 'fitness').get();
  if (users.empty) {
    console.log("no fitness user");
    return;
  }
  const uid = users.docs[0].id;
  console.log("UID:", uid);

  const blogs = await db.collection('blogs').where('authorId', '==', uid).get();
  console.log("Blogs count:", blogs.size);
  if (!blogs.empty) {
    console.log("Blog 1 authorId:", blogs.docs[0].data().authorId);
  }

  const sub = await db.collection('subdomains').doc('fitness').get();
  console.log("Subdomain data:", sub.data());
  
  process.exit();
}
check();
