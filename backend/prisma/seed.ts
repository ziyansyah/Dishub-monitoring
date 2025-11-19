import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.scan.deleteMany();
    await prisma.report.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  }

  // Create roles
  console.log('👥 Creating roles...');
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      canView: true,
      canEdit: true,
      canExport: true,
      canDelete: true,
    },
  });

  const operatorRole = await prisma.role.create({
    data: {
      name: 'Operator',
      description: 'Can view and edit vehicle data, generate reports',
      canView: true,
      canEdit: true,
      canExport: true,
      canDelete: false,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: 'Viewer',
      description: 'Read-only access to monitoring data',
      canView: true,
      canEdit: false,
      canExport: false,
      canDelete: false,
    },
  });

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('admin', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dishub-medan.go.id',
      username: 'admin',
      name: 'System Administrator',
      password: hashedPassword,
      roleId: superAdminRole.id,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0d47a1&color=fff',
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@dishub-medan.go.id',
      username: 'operator',
      name: 'Data Operator',
      password: await bcrypt.hash('operator', 10),
      roleId: operatorRole.id,
      avatar: 'https://ui-avatars.com/api/?name=Operator&background=2e7d32&color=fff',
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@dishub-medan.go.id',
      username: 'viewer',
      name: 'Data Viewer',
      password: await bcrypt.hash('viewer', 10),
      roleId: viewerRole.id,
      avatar: 'https://ui-avatars.com/api/?name=Viewer&background=1976d2&color=fff',
    },
  });

  // Create sample vehicles
  console.log('🚗 Creating sample vehicles...');
  const vehicles = [
    {
      plateNumber: 'BK 1234 AB',
      vehicleType: 'Mobil',
      color: 'Merah',
      ownerName: 'Ahmad Wijaya',
      taxStatus: 'Aktif',
      taxExpiryDate: new Date('2025-12-31'),
    },
    {
      plateNumber: 'BK 5678 CD',
      vehicleType: 'Motor',
      color: 'Hitam',
      ownerName: 'Siti Nurhaliza',
      taxStatus: 'Aktif',
      taxExpiryDate: new Date('2025-06-30'),
    },
    {
      plateNumber: 'BK 9012 EF',
      vehicleType: 'Mobil',
      color: 'Silver',
      ownerName: 'Budi Santoso',
      taxStatus: 'Mati',
      taxExpiryDate: new Date('2024-12-31'),
    },
    {
      plateNumber: 'BK 3456 GH',
      vehicleType: 'Truk',
      color: 'Biru',
      ownerName: 'PT. Logistics Indonesia',
      taxStatus: 'Aktif',
      taxExpiryDate: new Date('2025-09-30'),
    },
    {
      plateNumber: 'BK 7890 IJ',
      vehicleType: 'Motor',
      color: 'Putih',
      ownerName: 'Dewi Lestari',
      taxStatus: 'Aktif',
      taxExpiryDate: new Date('2025-08-31'),
    },
  ];

  const createdVehicles = await Promise.all(
    vehicles.map((vehicle) =>
      prisma.vehicle.create({
        data: vehicle,
      }),
    ),
  );

  // Create sample scans
  console.log('📸 Creating sample scans...');
  const scans = [
    {
      plateNumber: 'BK 1234 AB',
      vehicleType: 'Mobil',
      color: 'Merah',
      ownerName: 'Ahmad Wijaya',
      taxStatus: 'Aktif',
      vehicleId: createdVehicles[0].id,
      userId: operatorUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Dishub Scanner v1.0',
      location: 'Jl. Gatot Subroto - Medan',
      scanTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      plateNumber: 'BK 5678 CD',
      vehicleType: 'Motor',
      color: 'Hitam',
      ownerName: 'Siti Nurhaliza',
      taxStatus: 'Aktif',
      vehicleId: createdVehicles[1].id,
      userId: operatorUser.id,
      ipAddress: '192.168.1.101',
      userAgent: 'Dishub Scanner v1.0',
      location: 'Jl. Sisingamangaraja - Medan',
      scanTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      plateNumber: 'BK 9012 EF',
      vehicleType: 'Mobil',
      color: 'Silver',
      ownerName: 'Budi Santoso',
      taxStatus: 'Mati',
      vehicleId: createdVehicles[2].id,
      userId: adminUser.id,
      ipAddress: '192.168.1.102',
      userAgent: 'Dishub Scanner v1.0',
      location: 'Jl. Diponegoro - Medan',
      scanTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ];

  await Promise.all(
    scans.map((scan) =>
      prisma.scan.create({
        data: scan,
      }),
    ),
  );

  // Create sample activity logs
  console.log('📝 Creating sample activity logs...');
  const activities = [
    {
      action: 'Login',
      userId: adminUser.id,
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: 'Admin login successful',
    },
    {
      action: 'Export',
      userId: operatorUser.id,
      ipAddress: '192.168.1.20',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      details: 'Exported vehicle data to Excel',
    },
    {
      action: 'Create Vehicle',
      userId: adminUser.id,
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: 'Created new vehicle record: BK 3456 GH',
    },
    {
      action: 'Login',
      userId: viewerUser.id,
      ipAddress: '192.168.1.30',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      status: 'failed',
      details: 'Invalid password attempt',
    },
  ];

  await Promise.all(
    activities.map((activity) =>
      prisma.activityLog.create({
        data: {
          ...activity,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
        },
      }),
    ),
  );

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Created summary:');
  console.log(`- Roles: 3 (Super Admin, Operator, Viewer)`);
  console.log(`- Users: 3 (admin, operator, viewer)`);
  console.log(`- Vehicles: ${vehicles.length}`);
  console.log(`- Scans: ${scans.length}`);
  console.log(`- Activity Logs: ${activities.length}`);

  console.log('\n🔐 Login credentials:');
  console.log('- Admin: admin / admin');
  console.log('- Operator: operator / operator');
  console.log('- Viewer: viewer / viewer');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });