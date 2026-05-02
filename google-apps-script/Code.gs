/**
 * NexaSphere Membership Form — Google Apps Script
 * ─────────────────────────────────────────────────────────────────────────────
 * This is a STANDALONE script for the Membership Form ONLY.
 * The Core Team Recruitment form has its own separate script/sheet.
 *
 * HOW TO DEPLOY:
 *   1.  Open the Google Sheet you created for Membership responses.
 *   2.  Go to  Extensions → Apps Script
 *   3.  Your project should be named  "NexaSphere Membership"
 *   4.  Delete everything in Code.gs and paste THIS file.
 *   5.  Click  Deploy → New deployment → Web App
 *           Execute as  : Me
 *           Who can access : Anyone
 *   6.  Click  Authorise  when prompted (allow Spreadsheet access).
 *   7.  Copy the Web App URL that appears after deployment.
 *   8.  Paste that URL into  MembershipPage.jsx  at the top:
 *
 *           const MEMBERSHIP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec';
 *
 *       OR add it to your .env file:
 *           VITE_MEMBERSHIP_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
 *
 * SHEET STRUCTURE:
 *   The script will automatically create a tab called "Membership" inside
 *   your spreadsheet with a styled, frozen header row the first time it runs.
 *   You do NOT need to create the tab manually.
 *
 * The spreadsheet is the one this script is BOUND to (opened from Extensions → Apps Script).
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Leave SPREADSHEET_ID empty ('') to use the spreadsheet this script is bound to.
// If you want to write to a DIFFERENT spreadsheet, paste its ID here.
var SPREADSHEET_ID = '';          // e.g. '1bUtbaHwA7_ooqE4pNn3B74uE3hRQi1e7...'

var SHEET_TAB_NAME = 'Membership'; // Tab name inside the sheet

var HEADER_ROW = [
  'Timestamp',
  'Full Name',
  'College Email',
  'University Roll Number',
  'Course',
  'Branch',
  'Section',
  'Semester',
  'WhatsApp Number',
  'Groups Selected',
  'Why Join NexaSphere',
  'Submitted At',
  'User Agent',
];
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns (and auto-creates with styled header if absent) the Membership sheet tab.
 */
function getOrCreateSheet() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(SHEET_TAB_NAME);

  if (!sheet) {
    // Tab doesn't exist yet — create it and write the header
    sheet = ss.insertSheet(SHEET_TAB_NAME);
    sheet.appendRow(HEADER_ROW);
    _styleHeader(sheet);
  } else if (sheet.getLastRow() === 0) {
    // Tab exists but is completely empty
    sheet.appendRow(HEADER_ROW);
    _styleHeader(sheet);
  }

  return sheet;
}

/**
 * Applies dark-theme styling to the header row.
 */
function _styleHeader(sheet) {
  var range = sheet.getRange(1, 1, 1, HEADER_ROW.length);
  range.setFontWeight('bold');
  range.setBackground('#1a1a2e');
  range.setFontColor('#00d4ff');
  range.setFontSize(10);
  sheet.setFrozenRows(1);
  // Auto-resize columns for readability
  for (var i = 1; i <= HEADER_ROW.length; i++) {
    sheet.setColumnWidth(i, 160);
  }
}

// ── POST handler (receives form submission from the website) ──────────────────
function doPost(e) {
  try {
    // The website sends the payload as plain-text JSON (required for no-cors mode).
    var raw = '';
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    } else if (e && e.parameter) {
      // Fallback: form-encoded params
      raw = JSON.stringify(e.parameter);
    }

    if (!raw) {
      return _respond({ ok: false, error: 'Empty request body' });
    }

    var data = JSON.parse(raw);
    var now  = new Date().toISOString();

    var sheet = getOrCreateSheet();

    var row = [
      now,                                                              // Timestamp (server)
      data.fullName    || '',                                           // Full Name
      data.collegeEmail|| '',                                           // College Email
      data.rollNumber  || '',                                           // University Roll Number
      data.course      || '',                                           // Course
      data.branch      || '',                                           // Branch
      data.section     || '',                                           // Section
      data.semester    || '',                                           // Semester
      data.whatsapp    || '',                                           // WhatsApp Number
      // groups may be a pre-joined string from MembershipPage.jsx
      Array.isArray(data.groups)
        ? data.groups.join(', ')
        : (data.groups || ''),                                          // Groups Selected
      data.whyJoin     || '',                                           // Why Join NexaSphere
      data.submittedAt || now,                                          // Submitted At (client)
      data.userAgent   || '',                                           // User Agent
    ];

    sheet.appendRow(row);

    return _respond({ ok: true, message: 'Membership response recorded.' });

  } catch (err) {
    return _respond({ ok: false, error: err.message });
  }
}

// ── GET handler — health check / browser test ─────────────────────────────────
function doGet(e) {
  return _respond({
    ok: true,
    service: 'NexaSphere Membership API',
    version: '1.0',
    sheet: SHEET_TAB_NAME,
  });
}

// ── Helper ────────────────────────────────────────────────────────────────────
function _respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
