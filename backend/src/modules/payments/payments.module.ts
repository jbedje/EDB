import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CinetPayService } from './providers/cinetpay.service';
import { OrangeMoneyService } from './providers/orange-money.service';
import { WaveService } from './providers/wave.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CinetPayService,
    OrangeMoneyService,
    WaveService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
