const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixPromoEnum() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const promosCollection = db.collection('promos');
    
    // Update all promos with type 'percent' to 'percentage'
    const result = await promosCollection.updateMany(
      { type: 'percent' },
      { $set: { type: 'percentage' } }
    );
    
    console.log(`Updated ${result.modifiedCount} promos from 'percent' to 'percentage'`);
    
    // Check for any remaining invalid enum values
    const invalidPromos = await promosCollection.find({
      type: { $nin: ['percentage', 'fixed'] }
    }).toArray();
    
    if (invalidPromos.length > 0) {
      console.log('Found promos with invalid type values:');
      invalidPromos.forEach(promo => {
        console.log(`- ${promo.title}: ${promo.type}`);
      });
    } else {
      console.log('All promos now have valid type values');
    }
    
  } catch (error) {
    console.error('Error fixing promo enum:', error);
  } finally {
    await client.close();
  }
}

fixPromoEnum();