/**
 * Prepared Email Backend Integration Architecture
 * 
 * Future Email Integration Provider Interface (e.g. SendGrid, AWS SES, Resend, Nodemailer)
 */

export interface EmailPayload {
  to: string;
  studentName: string;
  collegeName: string;
  activationToken: string;
  template: 'STUDENT_ACTIVATION' | 'WELCOME_COLLEGE';
}

export interface EmailQueueResult {
  success: boolean;
  messageId: string;
  queuedAt: string;
  status: 'PENDING_DISPATCH' | 'SENT' | 'FAILED';
}

export class EmailService {
  /**
   * Queue activation email to student.
   * This is a backend ready architectural handler.
   */
  static async queueStudentActivation(student: { studentName: string; email: string }, collegeName: string): Promise<EmailQueueResult> {
    const activationToken = 'act_tok_' + Math.random().toString(36).substring(2, 12);
    
    // Log structured email payload for developer visibility & audit
    console.log('[EmailService] Prepared Activation Email Payload:', {
      to: student.email,
      studentName: student.studentName,
      collegeName,
      activationToken,
      activationUrl: `https://codegalatta.com/activate?token=${activationToken}`,
      template: 'STUDENT_ACTIVATION',
    });

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date().toISOString(),
      status: 'PENDING_DISPATCH',
    };
  }

  /**
   * Bulk queue activation emails for imported students.
   */
  static async bulkQueueStudentActivations(students: { studentName: string; email: string }[], collegeName: string): Promise<EmailQueueResult[]> {
    return Promise.all(students.map(st => this.queueStudentActivation(st, collegeName)));
  }
}
