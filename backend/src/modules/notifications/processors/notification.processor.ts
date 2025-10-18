import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { notificationId } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification) return;

    const result = await this.emailService.sendEmail(
      notification.user.email,
      notification.title,
      notification.message,
    );

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
      },
    });
  }

  @Process('send-sms')
  async handleSendSMS(job: Job) {
    const { notificationId } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification || !notification.user.phone) return;

    const result = await this.smsService.sendSMS(
      notification.user.phone,
      notification.message,
    );

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
      },
    });
  }
}
