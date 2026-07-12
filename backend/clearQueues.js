const { Queue } = require('bullmq');
const Redis = require('ioredis');

async function run() {
  const connection = new Redis('redis://127.0.0.1:6379');
  const q1 = new Queue('auto-dm-queue', { connection });
  const q2 = new Queue('evaluation-queue', { connection });
  
  await q1.obliterate({ force: true });
  await q2.obliterate({ force: true });
  
  console.log('Queues cleared!');
  process.exit(0);
}
run();
