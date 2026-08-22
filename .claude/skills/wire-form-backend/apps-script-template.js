/**
 * Apps Script web app backend for the Lumenical site's two forms
 * (newsletter signup + contact form). Deploy from a Google Sheet:
 *
 *   Extensions -> Apps Script -> paste this file -> Deploy -> New deployment
 *   -> type "Web app" -> Execute as: Me -> Who has access: Anyone
 *
 * Copy the resulting /exec URL into:
 *   - NEXT_PUBLIC_NEWSLETTER_SCRIPT_URL  (for the homepage newsletter form)
 *   - NEXT_PUBLIC_CONTACT_FORM_ENDPOINT  (for the /contact page form)
 * Both env vars can point at this SAME deployment URL — doPost below
 * tells the two payload shapes apart automatically.
 *
 * This file is a template, not deployed from this repo (see .gitignore) —
 * it only exists in Google's Apps Script editor, tied to the destination Sheet.
 */

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ result: "error", message: "Invalid payload" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var timestamp = new Date();

  if (typeof data.message === "string") {
    // Contact form: { name, email, companySize, message }
    var contactSheet = ss.getSheetByName("Contact") || ss.insertSheet("Contact");
    if (contactSheet.getLastRow() === 0) {
      contactSheet.appendRow(["Timestamp", "Name", "Email", "Company size", "Message"]);
    }
    contactSheet.appendRow([
      timestamp,
      data.name || "",
      data.email || "",
      data.companySize || "",
      data.message || "",
    ]);
  } else if (typeof data.email === "string") {
    // Newsletter signup: { email }
    var newsletterSheet = ss.getSheetByName("Newsletter") || ss.insertSheet("Newsletter");
    if (newsletterSheet.getLastRow() === 0) {
      newsletterSheet.appendRow(["Timestamp", "Email"]);
    }
    newsletterSheet.appendRow([timestamp, data.email]);
  } else {
    return jsonResponse({ result: "error", message: "Unrecognized payload shape" });
  }

  return jsonResponse({ result: "success" });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
