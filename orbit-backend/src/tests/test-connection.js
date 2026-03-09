const amqp = require('amqplib');

async function test() {
  const urls = [
    process.env.RABBITMQ_URL,
    'amqp://admin:admin123@localhost:5672',
    'amqp://guest:guest@localhost:5672'
  ];
  
  for (const url of urls) {
    if (!url) continue;
    console.log(`\nTrying: ${url.replace(/:[^:]*@/, ':****@')}`);
    try {
      const conn = await amqp.connect(url);
        console.log('✅ SUCCESS!');
      const channel = await conn.createChannel();
      console.log('✅ Channel created');
      await channel.close();
      await conn.close();
      console.log('✅ Connection closed');
      return url;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
  return null;
}

test().then(url => {
  if (url) {
    console.log(`\n✅ Working URL: ${url.replace(/:[^:]*@/, ':****@')}`);
    console.log('\nUpdate your .env file:');
    console.log(`RABBITMQ_URL=${url}`);
  } else {
    console.log('\n❌ All connection attempts failed');
  }
});