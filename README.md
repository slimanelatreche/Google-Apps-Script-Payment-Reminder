# Payment Reminder App

The Payment Reminder App, driven by Google Apps Script, serves as an invaluable tool for automating invoice management tasks. Its essential purpose lies in sending timely reminders to clients who have outstanding invoices. Ideal for freelancers, small businesses, or anyone managing invoices, this application excels in streamlining the payment tracking process.

## Features:

- **Automated Reminders:** The app regularly scans and reads invoices saved as Google Sheet files within the same Drive directory. Based on user preferences, it sends automated reminders to clients who haven't yet settled their invoices.

- **Directory Integration:** All invoices are conveniently stored as Google Sheet files in a unified Drive directory. This seamless integration allows the app to efficiently access and process invoice details.

- **Summary Updates:** As reminders are dispatched, the app dynamically updates a summary file. Users can easily track and review the status of all existing invoices in one centralized location.

## How to Use:

1. **Invoice Settings:**
   - Click on "Payment Reminder" in the menu.
   - Select "Invoice settings".
   - All you have to do is insert the references of the cells that contain the details (so the app can get the information of the invoices), then click save.  

2. **Reminder Settings** and **Template Messages:**
   - Click on "Payment Reminder" in the menu.
   - Select "Mailing settings".
   - Choose the desired reminder frequency, days, and times.
   - Enable or disable reminders as needed.
   - Craft template messages using dynamic placeholders.
   - Ensure placeholders like {Client name}, {Invoice ID}, etc., are included for personalized messages.
   - Save all settings using the "Save" button.
   - Changes are automatically applied to streamline the reminder process.

3. **Automated Reminders:**
   - The app will automatically send reminders based on the configured settings.
   - The app will update the summary file. 

Feel free to explore and customize the Payment Reminder App to suit your invoicing needs. For any assistance, reach out to the project's creator, Slimane LATRECHE, at ⟨slimane.latreche@gmail.com⟩.

