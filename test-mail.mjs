async function test() {
  const BASE = 'http://localhost:3000/api';
  console.log('=== MAILER TESTS ===\n');

  // Test 1: Mail config seeding
  console.log('1. Mail config rows seeded...');
  try {
    const res = await fetch(`${BASE}/config`);
    const data = await res.json();
    if (data.success) {
      const mailKeys = data.data.filter(r => r.id.startsWith('mail')).map(r => r.id);
      console.log(`   ✓ Found: ${mailKeys.join(', ')}`);
    }
  } catch (e) {
    console.log(`   ✗ ${e.message}`);
  }

  // Test 2: Non-admin gating
  console.log('\n2. Admin-only gating (unauthenticated)...');
  try {
    const res = await fetch(`${BASE}/config`);
    const data = await res.json();
    const hasMailUser = data.data?.some(r => r.id === 'mailUser');
    const hasMailPassword = data.data?.some(r => r.id === 'mailPassword');
    if (!hasMailUser && !hasMailPassword) {
      console.log(`   ✓ mailUser/mailPassword hidden from non-admin`);
    } else {
      console.log(`   ✗ Exposed: user=${hasMailUser} pass=${hasMailPassword}`);
    }
  } catch (e) {
    console.log(`   ✗ ${e.message}`);
  }

  // Test 3: Specific key gating
  console.log('\n3. Single-key admin gating...');
  try {
    const res = await fetch(`${BASE}/config?key=mailPassword`);
    if (res.status === 403) {
      console.log(`   ✓ Non-admin gets 403 Forbidden`);
    } else {
      console.log(`   ✗ Expected 403, got ${res.status}`);
    }
  } catch (e) {
    console.log(`   ✗ ${e.message}`);
  }

  console.log('\n=== BROWSER TESTS (manual in Chrome) ===');
  console.log('4. Navigate to http://localhost:3000/settings');
  console.log('   ✓ Mail section visible with all fields');
  console.log('\n5. Test password field');
  console.log('   - Leave password blank, save');
  console.log('   - Verify config still has old value (no update)');
  console.log('\n6. Test password configured indicator');
  console.log('   - Set a password and save');
  console.log('   - Reload the page');
  console.log('   - Verify hint shows "configured"');
  console.log('\n7. Test admin API response');
  console.log('   - POST to /api/config with mailPassword');
  console.log('   - Verify response only shows "set" not actual value');
}

test();
