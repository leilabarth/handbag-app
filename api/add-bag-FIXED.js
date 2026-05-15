export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { google } = await import('googleapis');
    
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountKey || !sheetId) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        error: 'Missing environment variables',
        hasKey: !!serviceAccountKey,
        hasSheetId: !!sheetId
      });
    }

    let serviceAccount;
    try {
      serviceAccount = typeof serviceAccountKey === 'string' 
        ? JSON.parse(serviceAccountKey) 
        : serviceAccountKey;
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      return res.status(500).json({ error: 'Invalid service account key format' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const rowData = [
      data.bagId || '',
      data.brand || '',
      data.bagName || '',
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
      data.timestamp || new Date().toISOString(),
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:AH',
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });

    return res.status(200).json({ 
      success: true, 
      bagId: data.bagId,
      appendedRows: response.data.updates?.updatedRows
    });

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to add bag',
      details: error.toString()
    });
  }
}
