/**
 * @overview Main code file for the application.
 * @file This file contains the primary functions and logic for the application.
 * @author Slimane LATRECHE ⟨slimane.latreche@gmail.com⟩
 * @version 1.0.0
 */

/**
 * Adds menu items and displays a message box when the user opens the summary Spreadsheet.
 * If necessary, prompts the user to set the invoice settings and mailing parameters from the "Payment Reminder" menu.
 */
function onOpen() {
  addItems();

  // Display a message box if invoice settings and mailing parameters are not set.
  if (!PropertiesService.getDocumentProperties().getKeys().length) {
    Browser.msgBox('Please go to "Payment Reminder" menu and set the invoice settings and mailing parameters.');
  }
}

/**
 * Adds custom menu items to the Google Sheets UI.
 * The menu includes options for configuring invoice settings and mailing settings.
 */
function addItems() {
  // Create a custom menu titled "Payment reminder."
  SpreadsheetApp.getUi()
    .createMenu('Payment reminder')
    .addItem('Invoice settings', 'showInvoiceSettings') // Opens the dialog for configuring invoice settings.
    .addItem('Mailing settings', 'showMailingSettings') // Opens the dialog for configuring mailing settings.
    .addToUi();
}

/**
 * Includes external HTML content in the Google Apps Script project using HtmlService.
 * @param {string} fileName - The name of the external HTML file to include.
 * @returns {string} The content of the specified HTML file.
 */
function includeExternalFile(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}

//_____________________________________________________________________________________________________
//invoiceSettings UI
/**
 * Displays a modeless dialog for configuring invoice settings.
 * Retrieves invoice settings values and passes them to the HTML template.
 * @returns {void} The function doesn't return a value.
 */
function showInvoiceSettings() {
  // Create an HTML template for the invoice settings dialog
  let userInterface = HtmlService.createTemplateFromFile('invoiceSettings');
  
  // Retrieve invoice settings values
  userInterface.invoiceSettingsValues = getInvoiceSettingsValues();
  
  // Evaluate the HTML template
  userInterface = userInterface.evaluate();
  
  // Show the modeless dialog with the HTML content and a title
  SpreadsheetApp.getUi().showModelessDialog(userInterface, 'Invoice settings');
}


/**
 * Retrieves invoice settings values stored in document properties.
 * If no values are found, default values are provided.
 * @returns {object} An object containing invoice settings values.
 */
function getInvoiceSettingsValues() {
  // Check if invoice settings values are stored in document properties
  if (PropertiesService.getDocumentProperties().getKeys().includes("cName")) {
    var invoiceObject = PropertiesService.getDocumentProperties().getProperties();
  } else {
    // Default values if no settings are found
    var invoiceObject = {
      cName: "A1",
      cEmail: "A1",
      invoiceId: "A1",
      invoiceDate: "A1",
      total: "A1",
      dDate: "A1",
      paid: "A1"
    };
  }
  return invoiceObject;
}

/**
 * Saves the provided invoice settings object to document properties.
 * @param {object} invoiceObject - An object containing invoice settings values.
 */
function saveInvoiceSettings(invoiceObject) {
  // Save the provided invoice settings to document properties
  PropertiesService.getDocumentProperties().setProperties(invoiceObject);
}

//_____________________________________________________________________________________________________
//mailingSettings UI

/**
 * Displays a modeless dialog for the mailing settings using an HTML template.
 * Retrieves the current mailing settings values and passes them to the template.
 */
function showMailingSettings() {
  // Create an HTML template for the mailing settings
  let userInterface = HtmlService.createTemplateFromFile('mailingSettings');
  
  // Get the current mailing settings values
  userInterface.mailingSettingsValues = getMailingSettingsValues();
  
  // Evaluate the template
  userInterface = userInterface.evaluate();
  
  // Show the modeless dialog with the mailing settings
  SpreadsheetApp.getUi().showModelessDialog(userInterface, 'Mailing settings');
}

/**
 * Retrieves the current mailing settings values stored in document properties.
 * If no settings are found, default values are provided.
 *
 * @return {object} An object containing mailing settings properties.
 */
function getMailingSettingsValues() {
  // Check if mailing settings exist in document properties
  if (PropertiesService.getDocumentProperties().getKeys().includes('frequency')) {
    // Retrieve and return the existing mailing settings
    var mailingObject = PropertiesService.getDocumentProperties().getProperties();
  } else {
    // Use default values if no mailing settings are found
    var mailingObject = {
      frequency: 0,
      dayMonth: 0,
      dayWeek: 0,
      hour: 0,
      interval: 0,
      enablerState: false,
      object: "Payment Reminder",
      template: ""
    };
  }

  return mailingObject;
}


/**
 * Saves the provided mailing settings to document properties.
 * Additionally, it manages triggers based on the 'enablerState' property.
 *
 * @param {object} mailingObject - An object containing mailing settings properties.
 */
function saveMailingSettings(mailingObject) {
  // Save mailing settings to document properties
  PropertiesService.getDocumentProperties().setProperties(mailingObject);

  // Delete existing trigger
  deleteTriggers();

  // Create a new trigger if mailing is enabled
  if (mailingObject.enablerState) {
    newTrigger(mailingObject);
  }
}

/**
 * Deletes all existing project triggers.
 * This function is used to remove any previous triggers associated with the project.
 */
function deleteTriggers() {
  // Get all existing project triggers
  let allTriggers = ScriptApp.getProjectTriggers();

  // Delete each trigger
  if (allTriggers.length) {
    for (let i = 0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }
}

/**
 * Creates a new time-based trigger for the "reminder" function based on the mailing settings.
 *
 * @param {object} mailingObject - Mailing settings object.
 * @param {number} mailingObject.frequency - Mailing frequency: 1 for daily, 2 for weekly, 3 for monthly.
 * @param {number} mailingObject.dayMonth - Day of the month for monthly frequency.
 * @param {number} mailingObject.dayWeek - Day of the week for weekly frequency (1 to 7, where 1 is Monday).
 * @param {number} mailingObject.hour - Mailing hour.
 */
function newTrigger(mailingObject) {
  var frequency = mailingObject.frequency
  var dayMonth = mailingObject.dayMonth;
  var weekdays = [ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY, ScriptApp.WeekDay.SUNDAY];
  var dayWeek = weekdays[mailingObject.dayWeek - 1];
  var hour = mailingObject.hour;

  // Create triggers based on mailing frequency
  if (frequency == 1) { // Daily
    ScriptApp.newTrigger("reminder")
      .timeBased()
      .everyDays(1)
      .atHour(hour - 1)
      .create();
  } else if (frequency == 2) { // Weekly
    ScriptApp.newTrigger("reminder")
      .timeBased()
      .onWeekDay(dayWeek)
      .atHour(hour - 1)
      .create();
  } else if (frequency == 3) { // Monthly
    ScriptApp.newTrigger("reminder")
      .timeBased()
      .onMonthDay(dayMonth)
      .atHour(hour - 1)
      .create();
  }
}


//_____________________________________________________________________________________________________
//Mailing

/**
 * Returns a list of file IDs for all spreadsheets in the current directory (assumed to be invoices),
 * excluding the ID of the active spreadsheet (summary).
 *
 * @return {string[]} An array of file IDs.
 */
function getInvoicesFilesIds() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var spreadsheetId = spreadsheet.getId();
  var activeFile = DriveApp.getFileById(spreadsheetId);
  var filesIds = [];
  var iterator = activeFile.getParents().next().getFiles();

  while (iterator.hasNext()) {
    var file = iterator.next();
    if (file.getId() !== spreadsheetId && file.getMimeType() == "application/vnd.google-apps.spreadsheet") {
      filesIds.push(file.getId());
    }
  }
  return filesIds;
}


/**
 * Reads invoice details from a spreadsheet based on the provided ID and object locations.
 *
 * @param {string} Id - The ID of the spreadsheet to be read.
 * @param {object} invoiceObject - The location of different details within the spreadsheet.
 * @return {object} An object containing the client name, client email, and other invoice details.
 */
function readInvoice(Id, invoiceObject) {

  var ss = SpreadsheetApp.openById(Id);
  var sheet = ss.getSheets()[0];
  var invoiceDetails = {
    cName: sheet.getRange(invoiceObject.cName).getValue(),
    cEmail: sheet.getRange(invoiceObject.cEmail).getValue(),
    invoiceId: sheet.getRange(invoiceObject.invoiceId).getValue(),
    invoiceDate: new Date(sheet.getRange(invoiceObject.invoiceDate).getValue()),
    total: sheet.getRange(invoiceObject.total).getValue(),
    dDate: sheet.getRange(invoiceObject.dDate).getValue(),
    paid: sheet.getRange(invoiceObject.paid).getValue()
  }
  return invoiceDetails;
}

/**
 * Sends an email to the specified client with details from an invoice.
 *
 * @param {string} cEmail - The client's email address.
 * @param {string} cName - The client's name.
 * @param {string} invoiceId - The invoice ID.
 * @param {Date} invoiceDate - The invoice date.
 * @param {number} total - The total amount of the invoice.
 * @param {string} dDate - The due date of the invoice.
 * @param {number} paid - The amount paid in the invoice.
 * @param {string} object - The subject of the email.
 * @param {string} template - The email template with placeholders for details.
 */
function sendEmail(cEmail, cName, invoiceId, invoiceDate, total, dDate, paid, object, template) {
  // Format total and paid amounts
  total = " $" + new Intl.NumberFormat().format(total);
  paid = " $" + new Intl.NumberFormat().format(paid);

  // Replace placeholders in the template
  template = template.replace(/{Client name}/gi, cName);
  template = template.replace(/{Invoice ID}/gi, invoiceId);
  template = template.replace(/{Invoice date}/gi, invoiceDate);
  template = template.replace(/{Total amount}/gi, total);
  template = template.replace(/{Due date}/gi, dDate);
  template = template.replace(/{Paid amount}/gi, paid);

  // Send email
  MailApp.sendEmail({ to: cEmail, subject: object, htmlBody: template });
}


/**
 * Formats the active sheet by setting column headers, formatting cells, and creating a filter.
 */
function sheetFormatting() {
  // Get active sheet
  let sheet = SpreadsheetApp.getActiveSheet();

  // Set column headers
  let header = sheet.getRange("A1:G1");
  header.setValues([["Invoice ID", "Client name", "Invoice date", "Total amount", "Due date", "Paid", "Last email date"]]);
  header.setBackgroundRGB(190, 190, 190);
  header.setFontWeight("bold");
  header.setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID);

  // Set number format for specific columns
  let lastRow = sheet.getLastRow();
  sheet.getRange('D2:D' + lastRow).setNumberFormat('$###,###,###,###,##0.00');
  sheet.getRange("F2:F" + lastRow).setNumberFormat('$###,###,###,###,##0.00');

  // Auto-resize columns
  sheet.autoResizeColumns(1, 7);

  // Create a filter
  try {
    let filter = sheet.getFilter();
    filter.remove();
  } catch (error) {
    // Handle any errors during filter removal
    Logger.log("Error removing filter: " + error);
  }

  // Create a new filter
  sheet.getRange("A1:G" + lastRow).createFilter();

  // Set the table font to normal
  sheet.getRange("A2:G" + lastRow).setFontWeight('normal') 

  //set the borders of the table
  sheet.getRange("A2:G" + lastRow).setBorder(true, true, true, true, true,false, 'black', SpreadsheetApp.BorderStyle.SOLID)
}

/**
 * Sends reminders for unpaid invoices based on configured settings.
 */
function reminder() {
  // Get invoice and mailing settings
  var invoiceObject = getInvoiceSettingsValues();
  var mailingObject = getMailingSettingsValues();
  var interval = [604800000, 1209600000, 1814400000, 2628000000, 5256000000, 7884000000][mailingObject.interval - 1];
  var template = mailingObject.template;
  var object = mailingObject.object;

  // Get all invoice IDs in the directory
  var ids = getInvoicesFilesIds();

  // Get the active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();

  // Initialize actual invoice IDs
  var actualInvoiceIds = (lastRow > 1) ? sheet.getRange(2, 1, lastRow - 1).getValues().flat().map(String) : [];

  // Clear background color in the active sheet
  sheet.getRange("A:G").setBackground(null);

  // Process each invoice
  for (let i = 0; i < ids.length; i++) {
    var invoiceDetails = readInvoice(ids[i], invoiceObject);
    var cName = invoiceDetails.cName;
    var cEmail = invoiceDetails.cEmail;
    var invoiceId = String(invoiceDetails.invoiceId);
    var invoiceDate = invoiceDetails.invoiceDate;
    var total = invoiceDetails.total;
    var dDate = invoiceDetails.dDate;
    var paid = invoiceDetails.paid;

    // Find the row number for the current invoice
    var rowNumber = actualInvoiceIds.indexOf(invoiceId);
    if (rowNumber == -1) {
      rowNumber = lastRow - 1;
      lastRow++;
    }

    // Check if the invoice is paid
    if (paid >= total) {
      // Set values and highlight paid invoices
      sheet.getRange(rowNumber + 2, 1, 1, 6).setValues([[invoiceId, cName, invoiceDate, total, dDate, paid]]);
      sheet.getRange(rowNumber + 2, 6).setBackgroundRGB(0, 255, 0);
    } else {
      // Check if a reminder should be sent
      var lastEmailDate = sheet.getRange(rowNumber + 2, 7).getValue();
      if (lastEmailDate == "") {
        lastEmailDate = invoiceDate;
      }
      if (((new Date()) - lastEmailDate) >= interval) {
        // Send email reminder and update last email date
        sendEmail(cEmail, cName, invoiceId, invoiceDate.toLocaleDateString(), total, dDate.toLocaleDateString(), paid, object, template);
        sheet.getRange(rowNumber + 2, 7).setValue(new Date(new Date().setHours(0, 0, 0, 0)));
      }

      // Set values for the current invoice
      sheet.getRange(rowNumber + 2, 1, 1, 6).setValues([[invoiceId, cName, invoiceDate, total, dDate, paid]]);

      // Ensure that the "paid" cell is not coloured
      sheet.getRange(rowNumber + 2, 6).setBackground(null);
    }
  }

  // Apply sheet formatting
  sheetFormatting();
}

/**
 * Logs the document properties to the logger.
 * Use this function for debugging and checking the current state of document properties.
 */
function logDocumentProperties() {
  // Log the document properties as a JSON string to the Apps Script logger.
  Logger.log(JSON.stringify(PropertiesService.getDocumentProperties().getProperties()));
}

/**
 * Deletes all document properties.
 * Use this function when you need to clear or reset document properties.
 */
function deleteDocumentProperties() {
  // Delete all properties from the document properties.
  PropertiesService.getDocumentProperties().deleteAllProperties();
}