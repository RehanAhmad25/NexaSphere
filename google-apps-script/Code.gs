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
 *   5.  Set the secret token:
 *         File → Project properties → Script properties
 *         Add key: MEMBERSHIP_SECRET  value: <your-strong-secret>
 *   6.  Click  Deploy → New deployment → Web App
 *           Execute as  : Me
 *           Who can access : Anyone
 *   7.  Click  Authorise  when prompted (allow Spreadsheet access).
 *   8.  Copy the Web App URL that appears after deployment.
 *   9.  Add to your SERVER .env file (NOT client-side):
 *         MEMBERSHIP_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
 *         MEMBERSHIP_SECRET=<your-strong-secret>
 *
 * SHEET STRUCTURE:
 *   The script will automatically create a tab called "Membership" inside
 *   your spreadsheet with a styled, frozen header row the first time it runs.
 *   You do NOT need to create the tab manually.
 *
 * SECURITY:
 *   The secret token is stored in Script Properties (server-side only).
 *   Admin requests must include the token in the POST body with action: 'getResponses'.
 *   The secret is never exposed to client-side code.
 *
 * The spreadsheet is the one this script is bound to (opened from Extensions → Apps Script).
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Leave SPREADSHEET_ID empty ('') to use the spreadsheet this script is bound to.
// If you want to write to a DIFFERENT spreadsheet, paste its ID here.
var SPREADSHEET_ID = '';          // e.g. '1bUtbaHwA7_ooqE4pNn3B74uE3hRQi1e7...'

var SHEET_TAB_NAME = 'Membership'; // Tab name inside the sheet
const TURNSTILE_SECRET_KEY = 'your_cloudflare_secret_key_here';

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

// ── GET/POST handler — Fetch data for Admin Dashboard or health check ────────────────
function doGet(e) {
  return _respond({
    ok: true,
    service: 'NexaSphere Membership API',
    version: '1.1',
    sheet: SHEET_TAB_NAME,
    status: 'Ready'
  });
}

function doPost(e) {
  try {
    var raw = '';
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    }

    if (!raw) {
      return _respond({ ok: false, error: 'Empty request body' });
    }

    var data = JSON.parse(raw);
    
    // Handle admin requests (getResponses) with token verification
    if (data.action === 'getResponses') {
      var token = data.token;
      var SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('MEMBERSHIP_SECRET');

      if (!SECRET_TOKEN || token !== SECRET_TOKEN) {
        return _respond({ ok: false, error: 'Unauthorized' });
      }

      try {
        var sheet = getOrCreateSheet();
        var rows = sheet.getDataRange().getValues();
        var headers = rows[0];
        var responses = [];

        for (var i = 1; i < rows.length; i++) {
          var obj = {};
          for (var j = 0; j < headers.length; j++) {
            var key = headers[j].toString().toLowerCase()
              .replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
              .replace(/[^a-z0-9]/gi, '');
            obj[key] = rows[i][j];
          }
          responses.push(obj);
        }

        return _respond({
          ok: true,
          count: responses.length,
          responses: responses
        });
      } catch (err) {
        return _respond({ ok: false, error: err.message });
      }
    }

    // CAPTCHA validation only for public submissions
    if (!verifyTurnstileToken(data.turnstileToken)) {
      return _respond({
        ok: false,
        error: 'CAPTCHA verification failed'
      });
    }

    // Handle form submissions (original behavior)
    var now  = new Date().toISOString();
    var sheet = getOrCreateSheet();

    var row = [
      now,
      data.fullName    || '',
      data.collegeEmail|| '',
      data.rollNumber  || '',
      data.course      || '',
      data.branch      || '',
      data.section     || '',
      data.semester    || '',
      data.whatsapp    || '',
      Array.isArray(data.groups)
        ? data.groups.join(', ')
        : (data.groups || ''),
      data.whyJoin     || '',
      data.submittedAt || now,
      data.userAgent   || '',
    ];

    sheet.appendRow(row);

    return _respond({ ok: true, message: 'Membership response recorded.' });

  } catch (err) {
    return _respond({ ok: false, error: err.message });
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function _respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function verifyTurnstileToken(token) {
  if (!token) return false;

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const payload = {
    "secret": TURNSTILE_SECRET_KEY,
    "response": token
  };

  const options = {
    "method": "post",
    "payload": payload
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    return json.success === true;
  } catch (e) {
    console.error("Turnstile verification failed: " + e.toString());
    return false;
  }
}