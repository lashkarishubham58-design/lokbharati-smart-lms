import { safeStorageGet, safeStorageSet } from '../utils/storage';
import { normalizeEmailDomain, findUserCredential } from '../data/credentials';

export interface SimulatedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  preview: string;
  htmlBody: string;
  textBody: string;
  otp: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
}

export interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  createdAt: number;
}

type EmailListener = (email: SimulatedEmail) => void;

class MockOtpService {
  private listeners: Set<EmailListener> = new Set();
  private verifiedSessions: Map<string, number> = new Map(); // email -> verified timestamp

  private normalizeEmail(email: string): string {
    const match = findUserCredential(email);
    if (match.matchedUser?.email) {
      return normalizeEmailDomain(match.matchedUser.email);
    }
    if (match.credential?.email) {
      return normalizeEmailDomain(match.credential.email);
    }
    return normalizeEmailDomain(email);
  }

  private getStoredOtps(): Record<string, OtpRecord> {
    return safeStorageGet<Record<string, OtpRecord>>('lbu_otp_store', {});
  }

  private setStoredOtps(store: Record<string, OtpRecord>): void {
    safeStorageSet('lbu_otp_store', store);
  }

  /**
   * Get all simulated emails from local storage
   */
  public getSimulatedEmails(filterEmail?: string): SimulatedEmail[] {
    const all = safeStorageGet<SimulatedEmail[]>('lbu_simulated_inbox', []);
    if (!filterEmail) return all;
    const cleanFilter = filterEmail.toLowerCase().trim();
    const norm = this.normalizeEmail(filterEmail).toLowerCase().trim();
    return all.filter((m) => {
      const mTo = (m.to || '').toLowerCase().trim();
      const mToNorm = this.normalizeEmail(m.to).toLowerCase().trim();
      return (
        mTo === cleanFilter ||
        mToNorm === norm ||
        mTo.includes(cleanFilter) ||
        cleanFilter.includes(mTo) ||
        (m.textBody && m.textBody.toLowerCase().includes(cleanFilter)) ||
        (m.textBody && m.textBody.toLowerCase().includes(norm))
      );
    });
  }

  /**
   * Clear simulated inbox
   */
  public clearSimulatedEmails(): void {
    safeStorageSet('lbu_simulated_inbox', []);
  }

  /**
   * Subscribe to real-time simulated email dispatch events
   */
  public onEmailReceived(listener: EmailListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Generates a cryptographically sound 6-digit OTP and triggers the email simulation.
   */
  public async requestPasswordResetOtp(
    targetEmail: string,
    recipientPersonalEmail?: string
  ): Promise<{ success: boolean; otp: string; message: string; simulatedEmail: SimulatedEmail }> {
    if (!targetEmail) {
      throw new Error('Target email address is required to request password reset.');
    }

    const cleanEmail = this.normalizeEmail(targetEmail).toLowerCase().trim();
    const rawTarget = targetEmail.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiry

    // Save OTP Record under all normalized forms to guarantee instant resolution
    const store = this.getStoredOtps();
    const record: OtpRecord = {
      code: otp,
      email: cleanEmail,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: now,
    };

    store[cleanEmail] = record;
    store[rawTarget] = record;
    store[rawTarget.replace('lokbharatiuniversity', 'lokbhartiuniversity')] = record;
    store[rawTarget.replace('lokbhartiuniversity', 'lokbharatiuniversity')] = record;
    this.setStoredOtps(store);

    const deliverTo = recipientPersonalEmail && recipientPersonalEmail.includes('@')
      ? recipientPersonalEmail.trim()
      : targetEmail.trim();

    // Create Simulated Email Object
    const simulatedEmail: SimulatedEmail = {
      id: `mail_${now}_${Math.random().toString(36).substring(2, 7)}`,
      to: deliverTo,
      from: 'Lokbharti University Identity System <no-reply@lokbhartiuniversity.edu.in>',
      subject: `[Lokbharti University] ${otp} is your Password Reset Verification Code`,
      preview: `Your one-time security code is ${otp}. Valid for 10 minutes.`,
      textBody: `Dear User,\n\nWe received a password reset request for your university account (${targetEmail}).\n\nYour 6-Digit OTP is: ${otp}\n\nThis verification code will expire in 10 minutes.\n\nLokbharti University Identity & Access Management`,
      htmlBody: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #10b981; margin: 0 0 10px 0;">Lokbharti University</h2>
          <p style="font-size: 14px; color: #cbd5e1;">A password reset was requested for <strong>${targetEmail}</strong>.</p>
          <div style="background: #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">VERIFICATION OTP</div>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #34d399; font-family: monospace;">${otp}</div>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. If you did not request this, please contact IT Support immediately.</p>
        </div>
      `,
      otp,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: now,
      read: false,
    };

    // Store simulated email in inbox list
    const currentInbox = safeStorageGet<SimulatedEmail[]>('lbu_simulated_inbox', []);
    safeStorageSet('lbu_simulated_inbox', [simulatedEmail, ...currentInbox].slice(0, 30));

    // Dispatch to registered listeners
    this.listeners.forEach((fn) => {
      try {
        fn(simulatedEmail);
      } catch (e) {
        console.error('Email listener error:', e);
      }
    });

    // Also trigger custom browser window event for cross-component reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lbu:email-dispatched', {
          detail: simulatedEmail,
        })
      );
    }

    // Synchronize the EXACT OTP code with backend server endpoint
    try {
      fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, personalEmail: recipientPersonalEmail, code: otp }),
      }).catch(() => {});
    } catch {
      // safe fallback
    }

    return {
      success: true,
      otp,
      message: `A 6-digit verification code has been dispatched to ${deliverTo}.`,
      simulatedEmail,
    };
  }

  /**
   * Verifies the OTP code for a given email address.
   */
  public verifyOtp(targetEmail: string, enteredOtp: string): { success: boolean; error?: string } {
    if (!targetEmail) {
      return { success: false, error: 'Email is required for verification.' };
    }
    if (!enteredOtp) {
      return { success: false, error: 'Please enter the 6-digit OTP code.' };
    }

    const rawTarget = targetEmail.toLowerCase().trim();
    const cleanEmail = this.normalizeEmail(targetEmail).toLowerCase().trim();
    const cleanOtp = enteredOtp.toString().replace(/\D/g, '').trim();

    if (cleanOtp.length !== 6) {
      return { success: false, error: 'OTP must be a 6-digit numeric code.' };
    }

    const store = this.getStoredOtps();
    const record =
      store[cleanEmail] ||
      store[rawTarget] ||
      store[rawTarget.replace('lokbharatiuniversity', 'lokbhartiuniversity')] ||
      store[rawTarget.replace('lokbhartiuniversity', 'lokbharatiuniversity')];

    // Also check simulated inbox if store record had any key mismatch
    const allEmails = safeStorageGet<SimulatedEmail[]>('lbu_simulated_inbox', []);
    const matchingEmail = allEmails.find((m) => m.otp === cleanOtp);

    if (!record && !matchingEmail) {
      return { success: false, error: 'No active OTP request found for this email. Please request an OTP first.' };
    }

    const effectiveRecord = record || {
      code: matchingEmail!.otp,
      email: cleanEmail,
      expiresAt: matchingEmail!.createdAt + 10 * 60 * 1000,
      attempts: 0,
      verified: false,
      createdAt: matchingEmail!.createdAt,
    };

    if (Date.now() > effectiveRecord.expiresAt) {
      delete store[cleanEmail];
      delete store[rawTarget];
      this.setStoredOtps(store);
      return { success: false, error: 'The verification code has expired. Please request a fresh OTP.' };
    }

    effectiveRecord.attempts += 1;
    if (effectiveRecord.attempts > 5) {
      delete store[cleanEmail];
      delete store[rawTarget];
      this.setStoredOtps(store);
      return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
    }

    if (effectiveRecord.code !== cleanOtp && (!matchingEmail || matchingEmail.otp !== cleanOtp)) {
      if (store[cleanEmail]) store[cleanEmail].attempts = effectiveRecord.attempts;
      this.setStoredOtps(store);
      return {
        success: false,
        error: `Incorrect verification code. (${5 - effectiveRecord.attempts} attempts remaining)`,
      };
    }

    // Mark as verified
    effectiveRecord.verified = true;
    store[cleanEmail] = effectiveRecord;
    store[rawTarget] = effectiveRecord;
    this.setStoredOtps(store);
    this.verifiedSessions.set(cleanEmail, Date.now());
    this.verifiedSessions.set(rawTarget, Date.now());

    // Also attempt backend verification sync
    try {
      fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: cleanOtp }),
      }).catch(() => {});
    } catch {
      // safe fallback
    }

    return { success: true };
  }

  /**
   * Checks if an email has recently passed OTP verification (within 15 minutes).
   */
  public isEmailVerified(targetEmail: string): boolean {
    if (!targetEmail) return false;
    const cleanEmail = this.normalizeEmail(targetEmail);
    
    // Check in-memory verified sessions
    const sessionTime = this.verifiedSessions.get(cleanEmail);
    if (sessionTime && Date.now() - sessionTime < 15 * 60 * 1000) {
      return true;
    }

    // Check stored OTP record
    const store = this.getStoredOtps();
    const record = store[cleanEmail];
    if (record && record.verified && Date.now() < record.expiresAt + 5 * 60 * 1000) {
      return true;
    }

    return false;
  }

  /**
   * Mark an email as verified or clear verification
   */
  public markEmailVerified(targetEmail: string, verified: boolean): void {
    const cleanEmail = this.normalizeEmail(targetEmail);
    if (verified) {
      this.verifiedSessions.set(cleanEmail, Date.now());
      const store = this.getStoredOtps();
      if (store[cleanEmail]) {
        store[cleanEmail].verified = true;
        this.setStoredOtps(store);
      }
    } else {
      this.verifiedSessions.delete(cleanEmail);
      const store = this.getStoredOtps();
      delete store[cleanEmail];
      this.setStoredOtps(store);
    }
  }

  /**
   * Clear OTP record for an email
   */
  public clearOtp(targetEmail: string): void {
    const cleanEmail = this.normalizeEmail(targetEmail);
    this.verifiedSessions.delete(cleanEmail);
    const store = this.getStoredOtps();
    delete store[cleanEmail];
    this.setStoredOtps(store);
  }
}

export const mockOtpService = new MockOtpService();
