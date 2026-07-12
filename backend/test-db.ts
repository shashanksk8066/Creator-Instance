import { db } from './src/config/firebase';

async function checkDb() {
  const users = await db.collection('users').get();
  users.forEach((doc: any) => {
    console.log("User:", doc.id);
    console.log("Data:", JSON.stringify(doc.data(), null, 2));
  });
}
checkDb();
