import { db } from '../src/config/firebase';

const seed = async () => {
  const subdomain = 'fitness';
  
  // 5 random days in June 2026
  const days = ['2026-06-05', '2026-06-12', '2026-06-18', '2026-06-25', '2026-06-29'];
  
  let totalRevenue = 0;
  let totalClicks = 0;
  let totalImpressions = 0;

  for (const date of days) {
    const revenue = Math.floor(Math.random() * 50) + 10; // $10 to $59
    const clicks = Math.floor(Math.random() * 100) + 20;
    const impressions = Math.floor(Math.random() * 1000) + 200;

    totalRevenue += revenue;
    totalClicks += clicks;
    totalImpressions += impressions;

    await db.collection('stats').doc(subdomain).collection('daily').doc(date).set({
      revenue,
      clicks,
      impressions,
      date
    }, { merge: true });
    
    console.log(`Added stats for ${date}: $${revenue}`);
  }

  // Update subdomain totals
  const subDoc = db.collection('subdomains').doc(subdomain);
  const data = (await subDoc.get()).data() || {};
  
  await subDoc.set({
    totalRevenue: (data.totalRevenue || 0) + totalRevenue,
    totalClicks: (data.totalClicks || 0) + totalClicks,
    totalImpressions: (data.totalImpressions || 0) + totalImpressions
  }, { merge: true });

  console.log(`Successfully seeded June data for '${subdomain}'. Total Revenue Added: $${totalRevenue}`);
  process.exit(0);
};

seed().catch(console.error);
