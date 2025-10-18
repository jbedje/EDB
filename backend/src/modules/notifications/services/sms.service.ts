import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendSMS(to: string, message: string) {
    try {
      // Twilio or other SMS provider integration
      console.log(`Sending SMS to ${to}: ${message}`);
      return { success: true };
    } catch (error) {
      console.error('SMS error:', error);
      return { success: false, error: error.message };
    }
  }
}
