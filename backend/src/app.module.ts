import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ScansModule } from './scans/scans.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ReportsModule } from './reports/reports.module';
import { ActivityModule } from './activity/activity.module';
import { RolesModule } from './roles/roles.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    RolesModule,
    VehiclesModule,
    ScansModule,
    StatisticsModule,
    ReportsModule,
    ActivityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}