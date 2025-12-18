import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VisitsModule } from './visits/visits.module';
import { MedicinesModule } from './medicines/medicines.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LabTestsModule } from './lab-tests/lab-tests.module';
import { LabRequestsModule } from './lab-requests/lab-requests.module';
import { RadiologyTestsModule } from './radiology-tests/radiology-tests.module';
import { RadiologyRequestsModule } from './radiology-requests/radiology-requests.module';
import { InvoicesModule } from './invoices/invoices.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // ✅ تأكدي ملف .env موجود بجذر مشروع الباك
    }),

    PrismaModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    VisitsModule,
    MedicinesModule,
    PrescriptionsModule,
    LabTestsModule,
    LabRequestsModule,
    RadiologyTestsModule,
    RadiologyRequestsModule,
    InvoicesModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
