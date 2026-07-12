import { db } from './src/config/firebase';

const migrateCollections = async () => {
  try {
    const creatorsSnapshot = await db.collection('creators').get();
    
    if (creatorsSnapshot.empty) {
      console.log('No documents in creators collection to migrate.');
      process.exit(0);
    }

    const batch = db.batch();
    let count = 0;

    creatorsSnapshot.forEach(doc => {
      const data = doc.data();
      // Add role if not exists
      if (!data.role) {
        data.role = 'creator';
      }
      
      const userRef = db.collection('users').doc(doc.id);
      batch.set(userRef, data);
      
      const oldCreatorRef = db.collection('creators').doc(doc.id);
      batch.delete(oldCreatorRef);
      count++;
    });

    await batch.commit();
    console.log(`Successfully migrated ${count} documents from creators to users collection!`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCollections();
