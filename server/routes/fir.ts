import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { policeDb } from '../db';
import { blockchain } from '../blockchain';
import { encryptSensitive, generateDigitalSignature, sha256 } from '../crypto';
import { CaseRecord } from '../../src/types';

export const firRouter = Router();

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

type StoredFIR = {
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  originalHash: string;
  data: string;
  uploadedAt: string;
  ocrText: string;
  ocrStatus: 'COMPLETED' | 'FAILED' | 'NOT_AVAILABLE';
};

// Prototype off-chain document store. Production should use encrypted object storage.
const firDocuments = new Map<string, StoredFIR>();

async function extractFIRText(base64Data: string, mimeType: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return '';

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        {
          text: `Extract the text from this FIR document exactly as faithfully as possible. This may be a handwritten FIR, scanned FIR, or digital PDF. Preserve names, dates, locations, case numbers, sections, and factual narrative. Do not invent missing text. If a word is unclear, write [ILLEGIBLE]. Return only the extracted/transcribed text, with reasonable line breaks.`
        }
      ]
    }]
  });

  return response.text?.trim() || '';
}

firRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType, data } = req.body as {
      fileName?: string;
      mimeType?: string;
      data?: string;
    };

    if (!fileName || !mimeType || !data) {
      return res.status(400).json({ error: 'fileName, mimeType and base64 data are required.' });
    }

    if (!ALLOWED_MIME.has(mimeType)) {
      return res.status(415).json({ error: 'Unsupported FIR format. Upload PDF, JPG, PNG or WEBP.' });
    }

    const cleanBase64 = data.includes(',') ? data.split(',')[1] : data;
    const size = Math.ceil((cleanBase64.length * 3) / 4);
    if (size > MAX_FILE_BYTES) {
      return res.status(413).json({ error: 'FIR document exceeds the 15 MB upload limit.' });
    }

    const documentId = `FIR-DOC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const originalHash = sha256(cleanBase64);
    let ocrText = '';
    let ocrStatus: StoredFIR['ocrStatus'] = 'NOT_AVAILABLE';

    try {
      ocrText = await extractFIRText(cleanBase64, mimeType);
      ocrStatus = ocrText ? 'COMPLETED' : 'NOT_AVAILABLE';
    } catch (ocrError) {
      console.error('FIR OCR failed:', ocrError);
      ocrStatus = 'FAILED';
    }

    const document: StoredFIR = {
      documentId,
      fileName,
      mimeType,
      size,
      originalHash,
      data: cleanBase64,
      uploadedAt: new Date().toISOString(),
      ocrText,
      ocrStatus
    };

    firDocuments.set(documentId, document);

    return res.status(201).json({
      success: true,
      document: {
        documentId,
        fileName,
        mimeType,
        size,
        originalHash,
        uploadedAt: document.uploadedAt,
        ocrText,
        ocrStatus
      }
    });
  } catch (error) {
    console.error('FIR upload failed:', error);
    return res.status(500).json({ error: 'FIR upload failed.' });
  }
});

firRouter.get('/documents/:documentId', (req: Request, res: Response) => {
  const document = firDocuments.get(req.params.documentId);
  if (!document) return res.status(404).json({ error: 'FIR document not found.' });

  res.json({
    success: true,
    document: {
      documentId: document.documentId,
      fileName: document.fileName,
      mimeType: document.mimeType,
      size: document.size,
      originalHash: document.originalHash,
      uploadedAt: document.uploadedAt,
      data: document.data
    }
  });
});

firRouter.post('/create', (req: Request, res: Response) => {
  try {
    const {
      title,
      incidentDetails,
      complainant,
      accusedName,
      accusedAge,
      charges,
      officerId,
      officerName,
      documentId,
      documentHash,
      documentFileName,
      documentMimeType,
      ocrText,
      transcriptionSource
    } = req.body;

    if (!title || !incidentDetails) {
      return res.status(400).json({ error: 'Case title and FIR text are required.' });
    }

    let document = documentId ? firDocuments.get(documentId) : undefined;
    if (documentId && !document) {
      return res.status(404).json({ error: 'Uploaded FIR document could not be found.' });
    }

    if (document && documentHash && document.originalHash !== documentHash) {
      return res.status(409).json({ error: 'Original FIR document hash does not match the uploaded document.' });
    }

    const newCaseId = `CASE-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const rawCase: CaseRecord = {
      caseId: newCaseId,
      title,
      creatingInstitution: 'POLICE',
      officerId: officerId || 'POL-IND-004281',
      officerName: officerName || 'Inspector Kumar',
      station: 'Metro Central Division (#POL-MC-09)',
      timestamp: new Date().toISOString(),
      stage: 'FIR_REGISTERED',
      status: 'ACTIVE',
      incidentDetails,
      complainant: complainant || 'Citizen Complainant',
      accused: {
        name: accusedName || 'Suspect Undisclosed',
        nationalId: encryptSensitive('FED-ID: ' + Math.floor(1000 + Math.random() * 9000)).ciphertext,
        age: Number(accusedAge) || 30,
        gender: 'Male',
        charges: Array.isArray(charges) && charges.length ? charges : ['Section not specified']
      },
      recordHash: '',
      txHash: '',
      blockNumber: 0
    };

    const recordPayload = {
      ...rawCase,
      firDocument: document ? {
        documentId: document.documentId,
        fileName: document.fileName,
        mimeType: document.mimeType,
        originalHash: document.originalHash,
        transcriptionSource: transcriptionSource || 'OCR'
      } : null
    };

    const recordHash = sha256(recordPayload);
    const signature = generateDigitalSignature(rawCase.officerId, recordHash);
    const { tx, block } = blockchain.registerCaseOnChain(newCaseId, 'POLICE', recordHash, signature);

    rawCase.recordHash = recordHash;
    rawCase.txHash = tx.txHash;
    rawCase.blockNumber = block.blockNumber;

    // Keep document linkage off-chain; only its hash/metadata participates in the case proof.
    if (document) {
      const linkedDocument = {
        ...document,
        ocrText: ocrText || document.ocrText,
        linkedCaseId: newCaseId,
        transcriptionSource: transcriptionSource || 'OCR'
      };
      firDocuments.set(document.documentId, linkedDocument as StoredFIR);
    }

    policeDb.cases.set(newCaseId, rawCase);

    blockchain.recordAudit(
      'POLICE',
      'CASE_CREATED',
      newCaseId,
      document ? `FIR document ${document.documentId} uploaded; original SHA-256 ${document.originalHash}; transcription source ${transcriptionSource || 'OCR'}.` : 'FIR created from manual entry.',
      recordHash,
      tx.txHash,
      block.blockNumber
    );

    return res.status(201).json({
      success: true,
      case: rawCase,
      firDocument: document ? {
        documentId: document.documentId,
        fileName: document.fileName,
        mimeType: document.mimeType,
        originalHash: document.originalHash,
        ocrText: ocrText || document.ocrText,
        transcriptionSource: transcriptionSource || 'OCR'
      } : null,
      tx,
      block
    });
  } catch (error) {
    console.error('FIR creation failed:', error);
    return res.status(500).json({ error: 'Failed to create FIR case.' });
  }
});
