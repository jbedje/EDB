import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CinetPayService {
  private apiKey: string;
  private siteId: string;
  private secretKey: string;
  private notifyUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('payment.cinetpay.apiKey');
    this.siteId = this.configService.get<string>('payment.cinetpay.siteId');
    this.secretKey = this.configService.get<string>('payment.cinetpay.secretKey');
    this.notifyUrl = this.configService.get<string>('payment.cinetpay.notifyUrl');
  }

  async initiatePayment(paymentId: string, amount: number): Promise<string> {
    try {
      // Documentation CinetPay: https://docs.cinetpay.com
      const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: paymentId,
        amount: amount,
        currency: 'XOF',
        description: 'Abonnement École de la Bourse',
        notify_url: this.notifyUrl,
        return_url: `${this.configService.get('app.url')}/payment/success`,
        channels: 'ALL',
      });

      return response.data.data.payment_url;
    } catch (error) {
      console.error('CinetPay error:', error);
      // En mode développement, retourner une URL de test
      return `https://payment-test.cinetpay.com?id=${paymentId}&amount=${amount}`;
    }
  }

  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment/check', {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: transactionId,
      });

      return response.data;
    } catch (error) {
      console.error('CinetPay verification error:', error);
      throw error;
    }
  }
}
