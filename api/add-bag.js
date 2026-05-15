import { google } from 'googleapis';

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { data } = req.body;

    // Map form data to sheet columns in order
    const row = [
      data.bagId,
      data.brand,
      data.bagName,
      data.dateCode,
      data.yearCreated,
      data.color,
      data.yearAcquired,
      data.conditionCurrent,
      data.leatherType,
      data.conditionUponReceipt,
      data.accessories,
      data.dimensions,
      data.directPurchase,
      data.purchaseSource,
      data.purchaseDate,
      data.originalSourceURL,
      data.authenticationURL,
      data.referenceURL,
      data.purchasePrice,
      data.tax,
      data.shippingFees,
      data.totalCost,
      data.resaleLow,
      data.resaleHigh,
      data.resaleAverage,
      data.authenticated,
      data.certificateOfAuth,
      data.authenticationNotes,
      data.restorationStatus,
      data.restorationWork,
      data.restorationIncreasesValue,
      data.currentProjects,
      data.internalNotes,
      data.timestamp,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:AH',
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return res.status(200).json({ success: true, bagId: data.bagId });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
