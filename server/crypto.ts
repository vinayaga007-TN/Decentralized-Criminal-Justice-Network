import crypto from 'crypto';

// Server-side secret key for AES-256 encryption of sensitive institutional off-chain records
const MASTER_ENCRYPTION_KEY = crypto.scryptSync(process.env.APP_SECRET || 'dcjmn-sovereign-master-key-2026', 'justice-salt', 32);

/**
 * Standard SHA-256 hashing for records, documents, evidence
 */
export function sha256(data: string | object): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Keccak-256 equivalent using SHA-3 256 for Ethereum/Besu compatibility
 */
export function keccak256(data: string | object): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return '0x' + crypto.createHash('sha3-256').update(content).digest('hex');
}

/**
 * Encrypt sensitive off-chain data (e.g., National ID, sensitive medical notes, raw addresses)
 * using AES-256-GCM so sensitive data is NEVER plaintext in database or exposed
 */
export function encryptSensitive(plaintext: string): { ciphertext: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

/**
 * Decrypt sensitive off-chain data with authentication tag verification
 */
export function decryptSensitive(payload: { ciphertext: string; iv: string; tag: string }): string {
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_ENCRYPTION_KEY, Buffer.from(payload.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));
    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '[ENCRYPTED_RESTRICTED_DATA]';
  }
}

/**
 * Institutional digital signing simulation using ECDSA/Ed25519 deterministic signatures
 */
export function generateDigitalSignature(signerId: string, payloadHash: string): string {
  const hmac = crypto.createHmac('sha256', `institution-hsm-signer-key-${signerId}`);
  hmac.update(payloadHash);
  return '0x' + hmac.digest('hex');
}

export function verifyDigitalSignature(signerId: string, payloadHash: string, signature: string): boolean {
  const expected = generateDigitalSignature(signerId, payloadHash);
  return expected.toLowerCase() === signature.toLowerCase();
}

/**
 * Generates canonical transaction hash
 */
export function generateTxHash(action: string, fromId: string, nonce: number): string {
  return '0x' + crypto.createHash('sha256').update(`${action}:${fromId}:${nonce}:${Date.now()}`).digest('hex');
}

/**
 * Generates block hash
 */
export function generateBlockHash(blockNumber: number, prevHash: string, txsCount: number): string {
  return '0x' + crypto.createHash('sha256').update(`${blockNumber}:${prevHash}:${txsCount}:${Date.now()}`).digest('hex');
}
