const pdf = require('pdf-parse');
const rp = require('request-promise');

async function extractTextFromPDF(pdfUrl) {
  try {
    // Make an HTTP request to the PDF URL and get the response as a buffer.
    const pdfBuffer = await rp({ url: pdfUrl, encoding: null });

    // Parse the PDF data.
    const pdfData = await pdf(pdfBuffer);

    // Extract the text content.
    const textContent = pdfData.text;

    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

module.exports = extractTextFromPDF;
