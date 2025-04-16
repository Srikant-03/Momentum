import { createWorker } from 'tesseract.js';

/**
 * Processes an image with Tesseract.js OCR
 * @param imageFile The image file to process
 * @returns Promise with the extracted text
 */
export async function processImageWithTesseract(imageFile: File): Promise<string> {
  try {
    // Create a worker with English language
    const worker = await createWorker('eng');
    
    // Convert file to base64 string
    const imageData = await fileToBase64(imageFile);
    
    // Recognize text in the image
    const { data: { text } } = await worker.recognize(imageData);
    
    // Terminate the worker to free resources
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image with OCR');
  }
}

/**
 * Parses OCR text into structured timetable data
 * @param ocrText The text extracted from OCR
 * @returns An array of schedule entries
 */
export function parseOCRToTimetable(ocrText: string): any[] {
  // Regular expression patterns for common timetable formats
  const timePattern = /(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[-–—to]+\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?/i;
  const dayPattern = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const roomPattern = /\b(?:room|lab|hall|lecture)\s*[a-z]?[-\s]?(\d+[a-z]?)\b/i;
  
  // Split into lines and trim whitespace
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
  
  const entries: any[] = [];
  
  // Process each line
  lines.forEach(line => {
    // Skip very short lines or headers
    if (line.length < 5 || /header|table|schedule/i.test(line)) {
      return;
    }
    
    // Extract time if found
    const timeMatch = line.match(timePattern);
    if (!timeMatch) return;
    
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    
    // Extract day if found
    const dayMatch = line.match(dayPattern);
    const day = dayMatch ? dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase() : 'Monday';
    
    // Extract location if found
    const roomMatch = line.match(roomPattern);
    const location = roomMatch ? roomMatch[0] : '';
    
    // Extract title (everything not matched by other patterns)
    let title = line
      .replace(timePattern, '')
      .replace(dayPattern, '')
      .replace(roomPattern, '')
      .trim();
    
    // If title still empty, use generic name
    if (!title) {
      title = 'Class ' + (entries.length + 1);
    }
    
    // Create entry
    entries.push({
      title,
      day,
      startTime,
      endTime,
      location,
    });
  });
  
  return entries;
}

/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns Promise with the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Converts a base64 string to a blob
 * @param base64 The base64 string
 * @param mimeType The MIME type of the resulting blob
 * @returns The created blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
}
