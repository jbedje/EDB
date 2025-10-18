import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WaveService {
  private apiKey: string;
  private secretKey: string;
  private callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('payment.wave.apiKey');
    this.secretKey = this.configService.get<string>('payment.wave.secretKey');
    this.callbackUrl = this.configService.get<string>('payment.wave.callbackUrl');
  }

  async initiatePayment(paymentId: string, amount: number): Promise<string> {
    try {
      // Wave API integration
      const response = await axios.post('https://api.wave.com/v1/checkout/sessions', {
        amount: amount,
        currency: 'XOF',
        error_url: `${this.configService.get('app.url')}/payment/error`,
        success_url: `${this.configService.get('app.url')}/payment/success`,
        webhook_url: this.callbackUrl,
        metadata: {
          payment_id: paymentId,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.wave_launch_url;
    } catch (error) {
      console.error('Wave error:', error);
      return `https://payment-test.wave.com?id=${paymentId}&amount=${amount}`;
    }
  }

  async verifyPayment(checkoutSessionId: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.wave.com/v1/checkout/sessions/${checkoutSessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Wave verification error:', error);
      throw error;
    }
  }
}
