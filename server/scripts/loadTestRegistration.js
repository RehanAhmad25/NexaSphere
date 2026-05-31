import 'dotenv/config';
import { supabaseRequest } from '../storage/supabaseClient.js';
import { capacityLockingService } from '../services/capacityLockingService.js';

async function main() {
  const eventId = 'test-event-race-condition';

  console.log('--- Setting up test event ---');
  // Upsert the test event directly in DB
  await supabaseRequest('events', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: [
      {
        id: eventId,
        name: 'Test Race Condition Event',
        date_text: '2026-06-01',
        description: 'Test Event',
        capacity: 1, // Only 1 slot available!
      },
    ],
  });

  // Clear any existing registrations for the test event
  await supabaseRequest(`event_registrations?event_id=eq.${eventId}`, {
    method: 'DELETE',
  });

  console.log('--- Test event setup complete ---');
  console.log('Simulating 5 concurrent registration requests for an event with capacity = 1...');

  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(
      capacityLockingService
        .registerForEvent(eventId, `User ${i}`, `user${i}@example.com`)
        .then((res) => ({ status: 'success', data: res }))
        .catch((err) => ({ status: 'error', error: err.message }))
    );
  }

  const results = await Promise.all(requests);

  let successCount = 0;
  let conflictCount = 0;

  results.forEach((res, index) => {
    console.log(
      `Request ${index}:`,
      res.status === 'success' ? 'SUCCESS' : `FAILED - ${res.error}`
    );
    if (res.status === 'success') successCount++;
    if (res.error === 'Event capacity has been reached.') conflictCount++;
  });

  console.log('\n--- Summary ---');
  console.log(`Successful Registrations: ${successCount} (Expected: 1)`);
  console.log(`Capacity Rejections: ${conflictCount} (Expected: 4)`);

  if (successCount === 1 && conflictCount === 4) {
    console.log('✅ Race condition correctly prevented!');
  } else {
    console.log('❌ Failed: Race condition occurred or unexpected errors.');
  }

  // Cleanup
  await supabaseRequest(`events?id=eq.${eventId}`, {
    method: 'DELETE',
  });
}

main().catch(console.error);
