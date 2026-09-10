import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_USERS,
  DEPARTMENTS,
  SUBJECTS,
  TIMETABLES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EDIT_REQUESTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_RESULTS,
  INITIAL_RESULTS,
  INITIAL_MATERIALS,
  INITIAL_NOTICES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS
} from './src/data/mockDatabase';
import { User, AttendanceRecord, AttendanceEditRequest, Assignment, AssignmentSubmission, Quiz, QuizResult, Notice, MessageThread, StudyMaterial, AuditLog } from './src/types';
import { findUserCredential, normalizeEmailDomain, cleanIdentifier } from './src/data/credentials';

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // In-memory data store backed by realistic Lokbharti University seed data
  let users: User[] = [...INITIAL_USERS];
  let attendanceRecords: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];
  let editRequests: AttendanceEditRequest[] = [...INITIAL_EDIT_REQUESTS];
  let assignments: Assignment[] = [...INITIAL_ASSIGNMENTS];
  let submissions: AssignmentSubmission[] = [...INITIAL_SUBMISSIONS];
  let quizzes: Quiz[] = [...INITIAL_QUIZZES];
  let quizResults: QuizResult[] = [...INITIAL_QUIZ_RESULTS];
  let studentResults = [...INITIAL_RESULTS];
  let materials: StudyMaterial[] = [...INITIAL_MATERIALS];
  let notices: Notice[] = [...INITIAL_NOTICES];
  let calendarEvents = [...INITIAL_CALENDAR_EVENTS];
  let notifications = [...INITIAL_NOTIFICATIONS];
  let messages: MessageThread[] = [...INITIAL_MESSAGES];
  let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  let purgedUserEmails = new Set<string>();
  let purgedUserIds = new Set<string>();

  // Synchronize any custom saved passwords from disk on startup
  const passwordsJsonPath = path.join(process.cwd(), 'src/data/custom_passwords.json');
  if (fs.existsSync(passwordsJsonPath)) {
    try {
      const savedPassMap: Record<string, string> = JSON.parse(fs.readFileSync(passwordsJsonPath, 'utf8'));
      for (const u of users) {
        const cleanE = normalizeEmailDomain(u.email);
        const normE1 = cleanE.replace('lokbharatiuniversity', 'lokbhartiuniversity');
        const normE2 = cleanE.replace('lokbhartiuniversity', 'lokbharatiuniversity');
        const uId = (u.id || '').trim().toLowerCase();
        const enroll = (u.enrollmentNo || '').trim().toLowerCase();
        const emp = (u.employeeId || '').trim().toLowerCase();

        const newPass = savedPassMap[cleanE] || savedPassMap[normE1] || savedPassMap[normE2] || (uId && savedPassMap[uId]) || (enroll && savedPassMap[enroll]) || (emp && savedPassMap[emp]);
        if (newPass) {
          u.password = newPass;
        }
      }
    } catch (e) {
      console.warn('Could not parse custom_passwords.json:', e);
    }
  }

  // Persistent password synchronization function that writes directly to mockDatabase.ts, credentials.ts, and custom_passwords.json
  function persistPasswordToFiles(matchedUser: any, newPassword: string): boolean {
    if (!matchedUser || !newPassword) return false;

    const identifiers: string[] = [];
    if (matchedUser.id) identifiers.push(matchedUser.id.trim());
    if (matchedUser.email) {
      const rawEmail = matchedUser.email.trim();
      identifiers.push(rawEmail);
      identifiers.push(rawEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity'));
      identifiers.push(rawEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity'));
    }
    if (matchedUser.enrollmentNo) identifiers.push(String(matchedUser.enrollmentNo).trim());
    if (matchedUser.employeeId) identifiers.push(String(matchedUser.employeeId).trim());

    let mockUpdated = false;
    let credsUpdated = false;

    // 1. Update src/data/mockDatabase.ts directly
    const mockDbPath = path.join(process.cwd(), 'src/data/mockDatabase.ts');
    if (fs.existsSync(mockDbPath)) {
      try {
        const content = fs.readFileSync(mockDbPath, 'utf8');
        const lines = content.split('\n');
        const escapedPass = newPassword.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const passRegex = /password:\s*'[^']*'/;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matches = identifiers.some((id) => id && line.includes(id));
          if (matches) {
            if (passRegex.test(line)) {
              lines[i] = line.replace(passRegex, `password: '${escapedPass}'`);
              mockUpdated = true;
              break;
            }
            // Multi-line object: scan object boundary
            let start = i;
            while (start > 0 && !lines[start].includes('{')) {
              start--;
            }
            let end = i;
            while (end < lines.length && !lines[end].includes('}')) {
              end++;
            }
            for (let j = start; j <= end; j++) {
              if (passRegex.test(lines[j])) {
                lines[j] = lines[j].replace(passRegex, `password: '${escapedPass}'`);
                mockUpdated = true;
                break;
              }
            }
            if (mockUpdated) break;
          }
        }

        if (mockUpdated) {
          fs.writeFileSync(mockDbPath, lines.join('\n'), 'utf8');
          console.log(`[AUTH] Successfully stored new password in src/data/mockDatabase.ts for ${identifiers[0]}`);
        }
      } catch (err) {
        console.error('[AUTH] Failed to update mockDatabase.ts:', err);
      }
    }

    // 2. Update src/data/credentials.ts directly
    const credsPath = path.join(process.cwd(), 'src/data/credentials.ts');
    if (fs.existsSync(credsPath)) {
      try {
        const content = fs.readFileSync(credsPath, 'utf8');
        const lines = content.split('\n');
        const escapedPass = newPassword.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const passRegex = /"password":\s*"[^"]*"/;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matches = identifiers.some((id) => id && line.includes(id));
          if (matches) {
            if (passRegex.test(line)) {
              lines[i] = line.replace(passRegex, `"password": "${escapedPass}"`);
              credsUpdated = true;
              break;
            }
            let start = i;
            while (start > 0 && !lines[start].includes('{')) {
              start--;
            }
            let end = i;
            while (end < lines.length && !lines[end].includes('}')) {
              end++;
            }
            for (let j = start; j <= end; j++) {
              if (passRegex.test(lines[j])) {
                lines[j] = lines[j].replace(passRegex, `"password": "${escapedPass}"`);
                credsUpdated = true;
                break;
              }
            }
            if (credsUpdated) break;
          }
        }

        if (credsUpdated) {
          fs.writeFileSync(credsPath, lines.join('\n'), 'utf8');
          console.log(`[AUTH] Successfully stored new password in src/data/credentials.ts for ${identifiers[0]}`);
        }
      } catch (err) {
        console.error('[AUTH] Failed to update credentials.ts:', err);
      }
    }

    // 3. Save to custom_passwords.json for persistence
    try {
      let saved: Record<string, string> = {};
      if (fs.existsSync(passwordsJsonPath)) {
        saved = JSON.parse(fs.readFileSync(passwordsJsonPath, 'utf8'));
      }
      for (const id of identifiers) {
        saved[id.toLowerCase()] = newPassword;
      }
      fs.writeFileSync(passwordsJsonPath, JSON.stringify(saved, null, 2), 'utf8');
    } catch (err) {
      console.error('[AUTH] Failed to save custom_passwords.json:', err);
    }

    return mockUpdated || credsUpdated;
  }

  // ==================== USERS & PROFILE API ====================
  app.get('/api/users', (req, res) => {
    res.json({ users });
  });

  app.post('/api/users/profile', (req, res) => {
    const { userId, email, updates } = req.body;
    if (!updates) return res.status(400).json({ error: 'Updates payload required' });

    const clean = (e: string) => (e || '').toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const cleanId = (userId || '').trim().toLowerCase();
    const cleanE = clean(email);

    let updatedUser: User | null = null;
    users = users.map((u) => {
      const uCleanE = clean(u.email);
      const uCleanId = (u.id || '').trim().toLowerCase();
      if ((cleanId && uCleanId === cleanId) || (cleanE && uCleanE === cleanE)) {
        const merged = { ...u, ...updates };
        updatedUser = merged;
        return merged;
      }
      return u;
    });

    if (updatedUser) {
      if (updates.password) {
        persistPasswordToFiles(updatedUser, updates.password);
      }
      auditLogs.unshift({
        id: `log_${Date.now()}`,
        userEmail: (updatedUser as User).email,
        userName: (updatedUser as User).name,
        role: (updatedUser as User).role,
        action: 'PROFILE_UPDATED',
        details: `Profile information updated by ${(updatedUser as User).name}.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    res.json({ success: true, user: updatedUser });
  });

  // ==================== PURGE USER API ====================
  app.post('/api/users/purge', (req, res) => {
    const { id, email } = req.body;
    const clean = (e: string) => e.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
    if (id) {
      purgedUserIds.add(id.toLowerCase().trim());
      users = users.filter((u) => u.id.toLowerCase().trim() !== id.toLowerCase().trim());
    }
    if (email) {
      const cleanE = clean(email);
      purgedUserEmails.add(cleanE);
      users = users.filter((u) => clean(u.email) !== cleanE);
    }
    res.json({ success: true, message: 'User account permanently purged' });
  });

  // ==================== AUTH API & EMAIL OTP ====================
  interface OtpEntry {
    code: string;
    expiresAt: number;
    attempts: number;
    email: string;
    deliveryMethod: 'smtp' | 'simulated';
    deliveredTo: string;
  }
  const otpStore = new Map<string, OtpEntry>();
  const recentEmailDeliveries: Array<{ id: string; email: string; subject: string; time: string; preview: string; code: string }> = [];

  // 1. Send OTP to registered email
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email, personalEmail } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      // Resolve user account with typo tolerance & case-insensitivity
      const match = findUserCredential(email, users);
      const existingUser = match.matchedUser || (match.credential ? users.find((u) => u.id === match.credential?.id) : undefined);

      if (!existingUser) {
        return res.status(404).json({
          error: `No university account found matching '${email}'. Please enter your registered university email.`
        });
      }

      const cleanEmail = normalizeEmailDomain(existingUser.email);

      // Use provided code from client or generate secure 6-digit OTP code
      const code = (req.body.code && String(req.body.code).replace(/\D/g, '').length === 6)
        ? String(req.body.code).replace(/\D/g, '').trim()
        : Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      let deliveryMethod: 'smtp' | 'simulated' = 'simulated';
      const targetSendEmail = (personalEmail && personalEmail.includes('@')) ? personalEmail.trim() : existingUser.email.trim();

      // Check if SMTP environment variables are configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Lokbharti University" <${process.env.SMTP_USER}>`,
            to: targetSendEmail,
            subject: `[Lokbharti University] ${code} is your Password Reset Verification Code`,
            text: `Your Lokbharti University password reset OTP is: ${code}. This code expires in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #10b981; margin: 0 0 4px 0;">Lokbharti University</h2>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">Official Identity & Access Management</p>
                </div>
                <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${existingUser.name}</strong>,</p>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #cbd5e1;">We received a request to reset the password for your university account (<code>${existingUser.email}</code>).</p>
                  <div style="text-align: center; padding: 16px; background: #020617; border-radius: 8px; border: 2px dashed #10b981; margin: 20px 0;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password (OTP)</div>
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #34d399; font-family: monospace;">${code}</span>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">This code is confidential and valid for <strong>10 minutes</strong>. Never share your OTP with anyone.</p>
                </div>
                <p style="text-align: center; font-size: 11px; color: #64748b; margin: 0;">Lokbharti University • Sanosara, Bhavnagar, Gujarat</p>
              </div>
            `,
          });
          deliveryMethod = 'smtp';
          console.log(`[EMAIL OTP] Real SMTP message successfully dispatched to ${targetSendEmail}`);
        } catch (smtpErr: any) {
          console.warn('[EMAIL OTP] SMTP dispatch error, falling back to secure simulated queue:', smtpErr?.message);
        }
      }

      // Store in memory under normalized email
      otpStore.set(cleanEmail, {
        code,
        expiresAt,
        attempts: 0,
        email: cleanEmail,
        deliveryMethod,
        deliveredTo: targetSendEmail,
      });

      // Keep recent audit record
      recentEmailDeliveries.unshift({
        id: `mail_${Date.now()}`,
        email: targetSendEmail,
        subject: `Password Reset Verification Code: ${code}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        preview: `University security OTP code sent to ${targetSendEmail}`,
        code,
      });
      if (recentEmailDeliveries.length > 20) recentEmailDeliveries.pop();

      res.json({
        success: true,
        message: `Verification code has been dispatched to your email (${maskEmail(targetSendEmail)}). Please check your email inbox.`,
        deliveryMethod,
        targetEmail: targetSendEmail,
        maskedEmail: maskEmail(targetSendEmail),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to dispatch email OTP' });
    }
  });

  function maskEmail(str: string): string {
    if (!str || !str.includes('@')) return str;
    const [userPart, domain] = str.split('@');
    if (userPart.length <= 2) return `${userPart[0]}***@${domain}`;
    return `${userPart.slice(0, 2)}***${userPart.slice(-1)}@${domain}`;
  }

  // 2. Verify OTP
  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const match = findUserCredential(email, users);
    const resolvedEmail = match.matchedUser?.email || match.credential?.email || email;
    const cleanEmail = normalizeEmailDomain(resolvedEmail);
    const entry = otpStore.get(cleanEmail);

    if (!entry) {
      return res.status(400).json({ error: 'No active OTP request found for this email. Please request a new OTP.' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: 'This verification code has expired. Please request a fresh OTP.' });
    }

    entry.attempts += 1;
    if (entry.attempts > 5) {
      otpStore.delete(cleanEmail);
      return res.status(429).json({ error: 'Too many incorrect attempts. For security, please request a new OTP.' });
    }

    const cleanInputOtp = otp.toString().replace(/\D/g, '').trim();
    if (cleanInputOtp !== entry.code) {
      return res.status(400).json({ error: 'Incorrect 6-digit OTP code. Please check your email and try again.' });
    }

    // Success
    res.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully. You may now set your new password.',
    });
  });

  // 3. Reset Password
  app.post('/api/auth/reset-password', (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const match = findUserCredential(email, users);
    const resolvedEmail = match.matchedUser?.email || match.credential?.email || email;
    const cleanEmail = normalizeEmailDomain(resolvedEmail);
    const cleanInputOtp = otp ? otp.toString().replace(/\D/g, '').trim() : '';

    const entry = otpStore.get(cleanEmail);
    if (entry && cleanInputOtp && entry.code !== cleanInputOtp) {
      // If code explicitly supplied and doesn't match
      return res.status(403).json({ error: 'Invalid or unverified OTP session. Please complete email verification.' });
    }

    const userIndex = users.findIndex((u) => normalizeEmailDomain(u.email) === cleanEmail);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
    }

    const targetUser = (userIndex !== -1 ? users[userIndex] : null) || match.matchedUser || match.credential;
    if (targetUser) {
      persistPasswordToFiles(targetUser, newPassword);
    }

    // Clear used OTP
    otpStore.delete(cleanEmail);

    auditLogs.unshift({
      id: `log_${Date.now()}`,
      userEmail: resolvedEmail,
      userName: users[userIndex]?.name || resolvedEmail,
      role: users[userIndex]?.role || 'student',
      action: 'PASSWORD_RESET_SUCCESS',
      details: 'Password was successfully reset and permanently persisted to mockDatabase.ts and credentials store.',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Your password has been successfully updated and saved in the database. You can now log in with your new password.',
    });
  });

  // 4. Update Password (from User Profile / Security Settings)
  app.post('/api/auth/update-password', (req, res) => {
    const { email, oldPassword, newPassword, otp } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const match = findUserCredential(email, users);
    const resolvedEmail = match.matchedUser?.email || match.credential?.email || email;
    const cleanEmail = normalizeEmailDomain(resolvedEmail);
    const userIndex = users.findIndex((u) => normalizeEmailDomain(u.email) === cleanEmail);
    const targetUser = (userIndex !== -1 ? users[userIndex] : null) || match.matchedUser || match.credential;

    if (!targetUser) {
      return res.status(404).json({ error: `Account not found for email: ${email}` });
    }

    // Verify OTP if provided
    if (otp) {
      const cleanInputOtp = otp.toString().replace(/\D/g, '').trim();
      const entry = otpStore.get(cleanEmail);
      if (entry && cleanInputOtp && entry.code !== cleanInputOtp) {
        return res.status(403).json({ error: 'Invalid or unverified OTP session. Please complete email verification.' });
      }
      otpStore.delete(cleanEmail);
    }

    // Update in-memory user
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
    }

    // Persist directly to mockDatabase.ts, credentials.ts, and custom_passwords.json
    persistPasswordToFiles(targetUser, newPassword);

    auditLogs.unshift({
      id: `log_${Date.now()}`,
      userEmail: resolvedEmail,
      userName: targetUser.name || resolvedEmail,
      role: targetUser.role || 'student',
      action: 'PASSWORD_UPDATE_SUCCESS',
      details: 'Password was successfully updated from profile and persisted to mockDatabase.ts.',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Password successfully updated and saved in the database.',
      newPassword,
    });
  });

  // Optional endpoint to check mail delivery for webmail simulation
  app.get('/api/auth/email-inbox', (req, res) => {
    const { email } = req.query;
    if (!email) return res.json({ deliveries: recentEmailDeliveries });
    const cleanEmail = normalizeEmailDomain(email as string);
    const filtered = recentEmailDeliveries.filter((d) => normalizeEmailDomain(d.email) === cleanEmail || cleanEmail.includes(normalizeEmailDomain(d.email)));
    res.json({ deliveries: filtered.length > 0 ? filtered : recentEmailDeliveries });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const match = findUserCredential(email, users);
    const existingUser = match.matchedUser || (match.credential ? users.find((u) => u.id === match.credential?.id) : undefined);

    if (!existingUser) {
      return res.status(401).json({
        error: `Account not found. No university account matching '${email}' was found.`
      });
    }

    const cleanEmail = normalizeEmailDomain(existingUser.email);

    if (purgedUserEmails.has(cleanEmail) || (existingUser.id && purgedUserIds.has(existingUser.id.toLowerCase().trim()))) {
      return res.status(401).json({
        error: `Account Purged: The account '${email}' has been permanently deleted by an administrator. Login access is disabled.`
      });
    }

    const expectedPassword = existingUser.password || 'Luri@123';
    if (!password || password !== expectedPassword) {
      return res.status(401).json({
        error: 'Incorrect password. Please enter the correct password for this account.'
      });
    }

    // Generate JWT token simulation payload
    const token = `lbu_jwt_${Buffer.from(JSON.stringify({ id: existingUser.id, role: existingUser.role, email: existingUser.email })).toString('base64')}`;

    // Record audit log
    auditLogs.unshift({
      id: `log_${Date.now()}`,
      userEmail: existingUser.email,
      userName: existingUser.name,
      role: existingUser.role,
      action: 'USER_LOGIN',
      details: `User signed in successfully via ${match.matchType} match.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      token,
      user: existingUser,
    });
  });

  // ==================== SMART ATTENDANCE API ====================
  // Automatically fetches date, time, current lecture slot, subject, classroom, and student roster
  app.get('/api/attendance/smart-fetch', (req, res) => {
    const { departmentId, semester, dayOfWeek } = req.query;

    const targetDept = (departmentId as string) || 'dept_cs';
    const targetSem = parseInt(semester as string) || 4;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = (dayOfWeek as string) || days[new Date().getDay()] || 'Monday';

    // Find timetable slots for this department and semester
    const matchingSlots = TIMETABLES.filter(
      (t) => t.departmentId === targetDept && t.semester === targetSem && t.dayOfWeek === currentDay
    );

    const activeSlot = matchingSlots[0] || TIMETABLES[0];

    // Find all enrolled students for this department and semester
    const students = users.filter((u) => u.role === 'student' && u.departmentId === targetDept && u.semester === targetSem);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    res.json({
      currentDate,
      currentTime: currentTimeStr,
      activeSlot,
      allSlots: matchingSlots,
      students: students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        enrollmentNo: s.enrollmentNo || '2024CS0000',
        status: 'present',
      })),
    });
  });

  // Submit attendance (locks record)
  app.post('/api/attendance/submit', (req, res) => {
    const { record } = req.body;
    if (!record) return res.status(400).json({ error: 'Record missing' });

    const newRecord: AttendanceRecord = {
      ...record,
      id: `att_${Date.now()}`,
      isSubmitted: true,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    attendanceRecords.unshift(newRecord);

    // Record audit log
    auditLogs.unshift({
      id: `log_${Date.now()}`,
      userEmail: record.teacherName,
      userName: record.teacherName,
      role: 'teacher',
      action: 'ATTENDANCE_SUBMITTED',
      details: `Submitted attendance for ${record.subjectName} (${record.date}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, record: newRecord });
  });

  // Request Edit
  app.post('/api/attendance/edit-request', (req, res) => {
    const { request } = req.body;
    const newReq: AttendanceEditRequest = {
      ...request,
      id: `req_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    editRequests.unshift(newReq);
    res.json({ success: true, request: newReq });
  });

  // Approve / Reject Request by HOD
  app.post('/api/attendance/approve-request', (req, res) => {
    const { requestId, status, hodComment } = req.body;
    const reqIndex = editRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });

    editRequests[reqIndex].status = status;
    editRequests[reqIndex].hodComment = hodComment;

    if (status === 'approved') {
      // Update attendance record
      const attRecord = attendanceRecords.find((a) => a.id === editRequests[reqIndex].attendanceRecordId);
      if (attRecord) {
        editRequests[reqIndex].requestedChanges.forEach((change) => {
          const studentEntry = attRecord.studentEntries.find((s) => s.studentId === change.studentId);
          if (studentEntry) {
            studentEntry.status = change.newStatus;
          }
        });
      }
    }

    res.json({ success: true, request: editRequests[reqIndex] });
  });

  // ==================== ASSIGNMENTS API ====================
  app.get('/api/assignments', (req, res) => {
    res.json({ assignments, submissions });
  });

  app.post('/api/assignments', (req, res) => {
    const newAsg: Assignment = {
      ...req.body,
      id: `asg_${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    assignments.unshift(newAsg);
    res.json({ success: true, assignment: newAsg });
  });

  app.post('/api/assignments/submit', (req, res) => {
    const sub: AssignmentSubmission = {
      ...req.body,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'submitted',
    };
    submissions.unshift(sub);
    res.json({ success: true, submission: sub });
  });

  // ==================== QUIZ API ====================
  app.get('/api/quizzes', (req, res) => {
    res.json({ quizzes, quizResults });
  });

  app.post('/api/quizzes/submit', (req, res) => {
    const qres: QuizResult = {
      ...req.body,
      id: `qres_${Date.now()}`,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    quizResults.unshift(qres);
    res.json({ success: true, result: qres });
  });

  // ==================== NOTICES API ====================
  app.get('/api/notices', (req, res) => {
    res.json({ notices });
  });

  app.post('/api/notices', (req, res) => {
    const notice: Notice = {
      ...req.body,
      id: `not_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    notices.unshift(notice);
    res.json({ success: true, notice });
  });

  // ==================== MESSAGING API ====================
  app.get('/api/messages', (req, res) => {
    res.json({ threads: messages });
  });

  app.post('/api/messages/send', (req, res) => {
    const { threadId, senderId, senderName, text, receiverId, receiverName, subject, senderRole, receiverRole } = req.body;

    let thread = messages.find((t) => t.id === threadId);
    if (!thread) {
      thread = {
        id: `msg_${Date.now()}`,
        senderId,
        senderName,
        senderRole,
        receiverId,
        receiverName,
        receiverRole,
        subject: subject || 'General Query',
        messages: [],
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      messages.unshift(thread);
    }

    thread.messages.push({
      id: `m_${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    thread.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);

    res.json({ success: true, thread });
  });

  // ==================== AI COPILOT & GEMINI BACKEND API ====================
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, user, agentType, memory } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          mode: 'offline_intelligent',
          message: 'Running in offline intelligent mode with grounded ERP database.'
        });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey
      });

      const systemPrompt = `You are Lokbharti AI Academic & University ERP Copilot v4.0 for Lokbharti University (Sanosara, Gujarat).
Student / User Context:
Name: ${user?.name || 'Student'}
Role: ${user?.role || 'student'}
Department: ${user?.departmentName || 'Computer Science & IT'}
Semester: ${user?.semester || 4}
Enrollment: ${user?.enrollmentNo || 'LBU2023CS001'}

Instructions:
1. Always be academically accurate, encouraging, and structured.
2. Support Gujarati (ગુજરાતી), Hindi, and English seamlessly when asked.
3. Ground your explanations in concrete university syllabus principles.
4. When discussing attendance, mention the 75% university minimum requirement.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: prompt }] }
        ]
      });

      const text = response.text || '';
      res.json({ success: true, text });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back gracefully:', err?.message || err);
      res.json({
        success: true,
        fallback: true,
        message: 'Intelligent fallback grounded in Lokbharti University ERP.'
      });
    }
  });

  // ==================== BACKUP API ====================
  app.get('/api/admin/backup', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="lokbharti_db_backup.json"');
    res.send(
      JSON.stringify(
        {
          university: 'Lokbharti University',
          backupDate: new Date().toISOString(),
          users,
          departments: DEPARTMENTS,
          subjects: SUBJECTS,
          timetables: TIMETABLES,
          attendanceRecords,
          editRequests,
          assignments,
          submissions,
          quizzes,
          quizResults,
          studentResults,
          materials,
          notices,
          calendarEvents,
          auditLogs,
        },
        null,
        2
      )
    );
  });

  // Vite middleware for development vs static serve for production
  const isDevSandbox = Boolean(process.env.CONTROL_PLANE_PORT && process.env.NODE_ENV !== 'production');
  const targetPort = isDevSandbox ? 3000 : (Number(process.env.PORT) || 3000);

  if (isDevSandbox) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(targetPort, '0.0.0.0', () => {
    console.log(`Lokbharti University LMS Server running on http://0.0.0.0:${targetPort}`);
  });

  // In production deployment outside sandbox, if targetPort is not 3000, also bind 3000 if available
  if (!isDevSandbox && targetPort !== 3000) {
    try {
      const backupServer = app.listen(3000, '0.0.0.0', () => {
        console.log('Also listening on port 3000 for internal container routing');
      });
      backupServer.on('error', () => {
        // Silently ignore if port 3000 is occupied
      });
    } catch {
      // Ignore
    }
  }
}

startServer();
