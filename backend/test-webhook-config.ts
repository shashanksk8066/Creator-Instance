import { db } from './src/config/firebase';

async function checkConfig() {
  const doc = await db.collection('platform_settings').doc('meta_config').get();
  console.log("Config:", JSON.stringify(doc.data(), null, 2));
}
checkConfig();
