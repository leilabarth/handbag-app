export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Importing googleapis...');
    const { google } = await import('googleapis');
    console.log('googleapis imported successfully');

    const serviceAccountKeyStr = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    console.log('Service Account Key exists:', !!serviceAccountKeyStr);
    console.log('Sheet ID:', sheetId);

    if (!serviceAccountKeyStr) {
      return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_KEY not found in environment' });
    }

    if (!sheetId) {
      return res.status(500).json({ error: 'GOOGLE_SHEET_ID not found in environment' });
    }

    // Parse the service account key
    console.log('Parsing service account key...');
    const serviceAccount = JSON.parse(serviceAccountKeyStr);
    console.log('Service account parsed, email:', serviceAccount.client_email);

    // Create auth
    console.log('Creating GoogleAuth...');
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log('GoogleAuth created');

    // Create sheets client
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('Sheets client created');

    const { data } = req.body;
    console.log('Received data:', !!data);

    if (!data) {
      return res.status(400).json({ error: 'No data in request body' });
    }

    // Build row
    const rowData = [
      data.bagId || 'N/A',
      data.brand || 'N/A',
      data.bagName || 'N/A',
      data.dateCode || '',
      data.yearCreated || '',
      data.color || '',
      data.yearAcquired || '',
      data.conditionCurrent || '',
      data.leatherType || '',
      data.conditionUponReceipt || '',
      data.accessories || '',
      data.dimensions || '',
      data.directPurchase || '',
      data.purchaseSource || '',
      data.purchaseDate || '',
      data.originalSourceURL || '',
      data.authenticationURL || '',
      data.referenceURL || '',
      data.purchasePrice || '',
      data.tax || '',
      data.shippingFees || '',
      data.totalCost || '',
      data.resaleLow || '',
      data.resaleHigh || '',
      data.resaleAverage || '',
      data.authenticated || '',
      data.certificateOfAuth || '',
      data.authenticationNotes || '',
      data.restorationStatus || '',
      data.restorationWork || '',
      data.restorationIncreasesValue || '',
      data.currentProjects || '',
      data.internalNotes || '',
      new Date().toISOString(),
    ];

    console.log('Appending to sheet:', sheetId);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:AH',
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });

    console.log('Sheet append successful');

    return res.status(200).json({ 
      success: true, 
      bagId: data.bagId,
      message: 'Data synced to Google Sheets'
    });

  } catch (error) {
    console.error('FULL ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to sync data',
      message: error.message,
      type: error.constructor.name
    });
  }
}
