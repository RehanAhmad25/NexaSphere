import { sendWelcomeVerificationEmail, sendPasswordResetEmail, sendRSVPConfirmationEmail } from './services/emailService.js';

async function runTest() {
  console.log('Testing Email Service...\n');

  console.log('--- Testing Welcome Email ---');
  await sendWelcomeVerificationEmail('test@example.com', 'Alice', 'https://nexasphere.com/verify?token=123');

  console.log('\n--- Testing Password Reset Email ---');
  await sendPasswordResetEmail('test@example.com', 'Bob', 'https://nexasphere.com/reset?token=abc');

  console.log('\n--- Testing RSVP Confirmation Email ---');
  await sendRSVPConfirmationEmail('test@example.com', 'Charlie', {
    eventName: 'NexaSphere Tech Talk',
    eventDate: 'May 20, 2026',
    eventLocation: 'Main Auditorium',
    eventTime: '10:00 AM',
    eventUrl: 'https://nexasphere.com/events/tech-talk'
  });

  console.log('\nAll tests completed.');
}

runTest();
