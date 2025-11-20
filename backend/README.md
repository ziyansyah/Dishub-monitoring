# Dishub Monitoring Backend

Backend API untuk sistem monitoring kendaraan Dishub Kota Medan dibangun dengan NestJS, Prisma ORM, dan MySQL.

## Fitur

- **Autentikasi & Authorization**: JWT dengan role-based access control
- **Manajemen Kendaraan**: CRUD data kendaraan dengan search dan filtering
- **Vehicle Scanning**: Tracking pencatatan kendaraan dari CCTV
- **Statistik Dashboard**: Analytics real-time dan trends
- **Report Generation**: Export PDF dan Excel
- **Activity Logging**: Audit trail lengkap untuk semua aktivitas
- **User Management**: Manajemen pengguna dengan role dan permissions

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm atau yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Setup database (gunakan Prisma Studio untuk visual):
```bash
npm run prisma:push
# Atau
npm run prisma:migrate
```

5. Seed database dengan data awal:
```bash
npm run prisma:seed
```

### Menjalankan Server

Development:
```bash
npm run start:dev
```

Production:
```bash
npm run build
npm run start:prod
```

## Database Setup

### Configuration MySQL

Edit file `.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/dishub_monitoring"
JWT_SECRET="your-secret-jwt-key"
PORT=3000
NODE_ENV="development"
```

### Default Users

Setelah seeding, Anda memiliki 3 user default:

- **Admin**: `admin` / `admin` (Full access)
- **Operator**: `operator` / `operator` (View & Edit)
- **Viewer**: `viewer` / `viewer` (Read-only)

## API Documentation

Server berjalan di `http://localhost:3000`

### Documentation
- **Swagger Docs**: `http://localhost:3000/api/docs`

### Authentication Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

#### Profile
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

### Main Endpoints

#### Vehicles
- `GET /api/vehicles` - List kendaraan dengan pagination
- `POST /api/vehicles` - Tambah kendaraan baru
- `GET /api/vehicles/:id` - Detail kendaraan
- `PUT /api/vehicles/:id` - Update kendaraan
- `DELETE /api/vehicles/:id` - Hapus kendaraan

#### Scans
- `GET /api/scans` - List scan history
- `POST /api/scans` - Record new scan
- `GET /api/scans/recent` - Recent scans untuk dashboard
- `GET /api/scans/stats` - Scan statistics

#### Statistics
- `GET /api/statistics/dashboard` - Dashboard stats
- `GET /api/statistics/tax-compliance` - Tax compliance stats
- `GET /api/statistics/weekly-trends` - Weekly trends
- `GET /api/statistics/activity-heatmap` - Activity heatmap

#### Reports
- `POST /api/reports/generate` - Generate report (PDF/Excel)
- `GET /api/reports` - List generated reports
- `GET /api/reports/:id/download` - Download report

#### Activity Logs
- `GET /api/activity/logs` - Activity logs dengan filtering
- `GET /api/activity/export` - Export to CSV
- `GET /api/activity/stats` - Activity statistics

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Data transfer objects
│   ├── guards/       # JWT & role guards
│   └── strategies/   # JWT strategy
├── users/            # User management
├── vehicles/         # Vehicle data management
├── scans/           # Vehicle scanning
├── statistics/      # Analytics & dashboard
├── reports/         # Report generation
├── activity/        # Activity logging
├── roles/           # Role management
├── common/          # Shared utilities
├── config/          # Configuration
└── database/        # Database providers
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Database Schema

### Core Tables
- **users**: User data dengan role assignments
- **roles**: Role definitions dengan permissions
- **vehicles**: Vehicle registry
- **scans**: Vehicle scanning records
- **activity_logs**: Audit trail
- **reports**: Generated reports tracking

## Permissions System

### Role Types
- **Super Admin**: Full access (view, edit, export, delete)
- **Operator**: View, edit, dan export
- **Viewer**: Read-only access

### Permission Levels
- `canView`: Read access
- `canEdit`: Create dan update
- `canExport`: Download reports
- `canDelete`: Delete records

## Security Features

- JWT authentication dengan 1-hour expiry
- Rate limiting pada API endpoints
- Input validation dan sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- HTTP-only cookies untuk tokens

## Development Tools

### Prisma Studio
```bash
npm run prisma:studio
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Environment Variables

Required variables:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret untuk JWT signing
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

Optional variables:
- `FRONTEND_URL`: Frontend URL untuk CORS
- `UPLOAD_PATH`: Path untuk file uploads
- `EXPORT_PATH`: Path untuk generated reports

## Production Deployment

### Building
```bash
npm run build
```

### Process Manager (PM2)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

### Docker
```bash
docker build -t dishub-backend .
docker run -p 3000:3000 dishub-backend
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Pastikan MySQL running dan credentials benar
2. **Prisma Generate**: Run `npm run prisma:generate` setelah schema changes
3. **Module Not Found**: Check imports dan module exports
4. **Permission Denied**: Verify user role dan permissions

### Logs
```bash
# Development logs
npm run start:dev

# Production logs (PM2)
pm2 logs dishub-backend
```

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - Dishub Kota Medan