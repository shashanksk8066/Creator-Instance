import { db } from './src/config/firebase';

async function run() {
  const usersSnap = await db.collection('users').where('subdomain', '==', 'fitness').get();
  if (usersSnap.empty) return console.log("No fitness user");
  const uid = usersSnap.docs[0].id;
  
  const blogs = await db.collection('blogs').where('authorId', '==', uid).get();
  console.log('fitness blogs:', blogs.size);
  
  const subs = await db.collection('subdomains').doc('fitness').get();
  console.log('fitness sub:', subs.data());
}

run();
