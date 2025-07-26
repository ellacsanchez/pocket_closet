// fix-userids.js
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function fixUserIds() {
  try {
    const result = await db.wardrobeItem.updateMany({
      where: { userId: null },
      data: { userId: 'user_30NJXKV4GA4yzB39dY8ekNdgncZ' }
    });
    
    console.log(`✅ Updated ${result.count} items with correct user ID`);
    
    const items = await db.wardrobeItem.findMany({
      select: { id: true, title: true, userId: true }
    });
    
    console.log('📋 All items after update:');
    items.forEach(item => {
      console.log(`  ${item.title}: ${item.userId}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

fixUserIds();