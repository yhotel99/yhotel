// Test script to debug Executive Balcony Suite availability
// Run with: node test_executive_suite_api.js

const BASE_URL = 'http://localhost:3000'; // Change to your dev server URL

const checkIn = '2026-02-27T14:00:00.000Z';
const checkOut = '2026-02-28T12:00:00.000Z';
const categoryCode = 'executive-balcony-suite';

async function testAPIs() {
  console.log('='.repeat(80));
  console.log('Testing Executive Balcony Suite APIs');
  console.log('Check-in:', checkIn);
  console.log('Check-out:', checkOut);
  console.log('='.repeat(80));
  console.log();

  // Test 1: categories-available API
  console.log('1. Testing /api/rooms/categories-available');
  console.log('-'.repeat(80));
  try {
    const url1 = `${BASE_URL}/api/rooms/categories-available?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}`;
    console.log('URL:', url1);
    
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    
    const executiveSuite = data1.find(cat => cat.category_code === categoryCode);
    
    if (executiveSuite) {
      console.log('✓ Found Executive Balcony Suite');
      console.log('  - Available count:', executiveSuite.available_count);
      console.log('  - Total count:', executiveSuite.total_count);
      console.log('  - Min price:', executiveSuite.min_price);
    } else {
      console.log('✗ Executive Balcony Suite NOT found in response');
      console.log('  Available categories:', data1.map(c => c.category_code).join(', '));
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
  console.log();

  // Test 2: available-by-category API
  console.log('2. Testing /api/rooms/available-by-category');
  console.log('-'.repeat(80));
  try {
    const url2 = `${BASE_URL}/api/rooms/available-by-category?category_code=${encodeURIComponent(categoryCode)}&check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}&quantity=10`;
    console.log('URL:', url2);
    
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    
    console.log('Response:', JSON.stringify(data2, null, 2));
    
    if (data2.available_rooms && data2.available_rooms.length > 0) {
      console.log('✓ Found available rooms:', data2.available_rooms.length);
      data2.available_rooms.forEach((room, idx) => {
        console.log(`  ${idx + 1}. ${room.name} (ID: ${room.id})`);
      });
    } else {
      console.log('✗ No available rooms found');
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
  console.log();

  console.log('='.repeat(80));
  console.log('Check server console logs for detailed debugging information');
  console.log('='.repeat(80));
}

testAPIs().catch(console.error);
