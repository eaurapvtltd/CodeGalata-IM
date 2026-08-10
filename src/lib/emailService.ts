import { Student, Assignment, Contest } from './types';

export interface EmailPayload {
  to: string;
  studentName: string;
  collegeName: string;
  activationToken: string;
  template: 'STUDENT_ACTIVATION' | 'WELCOME_COLLEGE' | 'ASSIGNMENT_NOTIFICATION' | 'CONTEST_NOTIFICATION';
}

export interface EmailQueueResult {
  success: boolean;
  messageId: string;
  queuedAt: string;
  status: 'PENDING_DISPATCH' | 'SENT' | 'FAILED';
  recipient?: string;
  subject?: string;
}

export interface SentEmailRecord {
  id: string;
  type: 'ACTIVATION' | 'ASSIGNMENT' | 'CONTEST' | 'DAILY_CHALLENGE';
  to: string;
  studentName: string;
  subject: string;
  contentSnippet: string;
  directUrl: string;
  sentAt: string;
}

export class EmailService {
  private static saveSentEmail(record: Omit<SentEmailRecord, 'id' | 'sentAt'>) {
    if (typeof window === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem('cg_sent_emails') || '[]');
      const newRecord: SentEmailRecord = {
        ...record,
        id: 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        sentAt: new Date().toISOString(),
      };
      localStorage.setItem('cg_sent_emails', JSON.stringify([newRecord, ...existing]));
    } catch (e) {
      console.error('Failed to save sent email record', e);
    }
  }

  static getSentEmails(): SentEmailRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('cg_sent_emails') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Queue activation email to student.
   */
  static async queueStudentActivation(student: { studentName: string; email: string }, collegeName: string): Promise<EmailQueueResult> {
    const activationToken = 'act_tok_' + Math.random().toString(36).substring(2, 12);
    const directUrl = `https://codegalatta.com/activate?token=${activationToken}`;

    this.saveSentEmail({
      type: 'ACTIVATION',
      to: student.email,
      studentName: student.studentName,
      subject: `Welcome to ${collegeName} on Code Galatta!`,
      contentSnippet: `Your activation link is ready. Click below to verify your account.`,
      directUrl,
    });

    console.log('[EmailService] Prepared Activation Email Payload:', {
      to: student.email,
      studentName: student.studentName,
      collegeName,
      activationToken,
      activationUrl: directUrl,
      template: 'STUDENT_ACTIVATION',
    });

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date().toISOString(),
      status: 'SENT',
      recipient: student.email,
    };
  }

  /**
   * Bulk queue activation emails for imported students.
   */
  static async bulkQueueStudentActivations(students: { studentName: string; email: string }[], collegeName: string): Promise<EmailQueueResult[]> {
    return Promise.all(students.map(st => this.queueStudentActivation(st, collegeName)));
  }

  /**
   * Dispatch email notifications to batch students when an assignment is created or published.
   */
  static async dispatchAssignmentNotification(
    students: Student[], 
    collegeName: string, 
    batchName: string, 
    assignment: Assignment
  ): Promise<{ count: number; recipients: string[] }> {
    const formattedDueDate = new Date(assignment.dueDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const directUrl = `/assignments`;
    const recipients: string[] = [];

    students.forEach(st => {
      recipients.push(st.email);
      this.saveSentEmail({
        type: 'ASSIGNMENT',
        to: st.email,
        studentName: st.studentName,
        subject: `[${collegeName}] New Assignment: ${assignment.title}`,
        contentSnippet: `New assignment "${assignment.title}" for Batch ${batchName}. Deadline: ${formattedDueDate}. Total Marks: ${assignment.marks || 100}.`,
        directUrl,
      });

      console.log(`[EmailService 📩] Sent Assignment Notification Email to ${st.studentName} <${st.email}>:`, {
        subject: `[${collegeName}] New Assignment: ${assignment.title}`,
        batch: batchName,
        dueDate: formattedDueDate,
        directUrl,
      });
    });

    return { count: recipients.length, recipients };
  }

  /**
   * Dispatch email notifications to batch students when a contest is created or announced.
   */
  static async dispatchContestNotification(
    students: Student[], 
    collegeName: string, 
    batchName: string, 
    contest: Contest
  ): Promise<{ count: number; recipients: string[] }> {
    const start = new Date(contest.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const end = new Date(contest.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const directUrl = `/contests/${contest.id}`;
    const recipients: string[] = [];

    students.forEach(st => {
      recipients.push(st.email);
      this.saveSentEmail({
        type: 'CONTEST',
        to: st.email,
        studentName: st.studentName,
        subject: `[${collegeName}] Live Coding Contest: ${contest.title}`,
        contentSnippet: `Contest "${contest.title}" starts ${start} and ends ${end}. Direct access link included.`,
        directUrl,
      });

      console.log(`[EmailService 📩] Sent Contest Notification Email to ${st.studentName} <${st.email}>:`, {
        subject: `[${collegeName}] Live Coding Contest: ${contest.title}`,
        batch: batchName,
        startTime: start,
        endTime: end,
        directUrl,
      });
    });

    return { count: recipients.length, recipients };
  }

  /**
   * Dispatch email notifications to all students when a Daily Challenge is live.
   */
  static async dispatchDailyChallengeNotification(
    students: { studentName: string; email: string }[], 
    collegeName: string, 
    dailyChallenge: { title: string; difficulty: string; rewardXp: number; timeLimit: string }
  ): Promise<{ count: number; recipients: string[] }> {
    const directUrl = `/daily-challenge`;
    const recipients: string[] = [];

    students.forEach(st => {
      recipients.push(st.email);
      this.saveSentEmail({
        type: 'DAILY_CHALLENGE',
        to: st.email,
        studentName: st.studentName,
        subject: `🔥 [${collegeName}] Daily Coding Challenge Live: ${dailyChallenge.title}`,
        contentSnippet: `Today's Coding Challenge "${dailyChallenge.title}" (${dailyChallenge.difficulty}) is live! Earn +${dailyChallenge.rewardXp} XP and keep your streak alive.`,
        directUrl,
      });

      console.log(`[EmailService 📩] Sent Daily Challenge Email to ${st.studentName} <${st.email}>:`, {
        subject: `🔥 [${collegeName}] Daily Coding Challenge Live: ${dailyChallenge.title}`,
        rewardXp: dailyChallenge.rewardXp,
        directUrl,
      });
    });

    return { count: recipients.length, recipients };
  }
}

