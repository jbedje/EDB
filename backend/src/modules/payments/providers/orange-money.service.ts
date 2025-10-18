import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OrangeMoneyService {
  private apiKey: string;
  private merchantKey: string;
  private callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('payment.orangeMoney.apiKey');
    this.merchantKey = this.configService.get<string>('payment.orangeMoney.merchantKey');
    this.callbackUrl = this.configService.get<string>('payment.orangeMoney.callbackUrl');
  }

  async initiatePayment(paymentId: string, amount: number): Promise<string> {
    try {
      // Orange Money API integration
      const response = await axios.post('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
        merchant_key: this.merchantKey,
        currency: 'XOF',
        order_id: paymentId,
        amount: amount,
        return_url: `${this.configService.get('app.url')}/payment/success`,
        cancel_url: `${this.configService.get('app.url')}/payment/cancel`,
        notif_url: this.callbackUrl,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.payment_url;
    } catch (error) {
      console.error('Orange Money error:', error);
      return `https://payment-test.orange-money.com?id=${paymentId}&amount=${amount}`;
    }
  }

  async verifyPayment(orderId: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.orange.com/orange-money-webpay/dev/v1/webpayment/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Orange Money verification error:', error);
      throw error;
    }
  }
}
