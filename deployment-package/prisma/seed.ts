import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default settings
  console.log('📋 Creating default settings...');
  const settings = await prisma.settings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      defaultTaskPoints: 50,
      minTaskPoints: 10,
      maxTaskPoints: 200,
      multiplierMin: 0.5,
      multiplierMax: 3.0,
      dailyBudgetDefault: 500,
      overdueDaysDefault: 7,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      rewardScheme: {
        extraDayOff: 1000,
        bonusPoints: 500,
        recognition: 200
      },
      skillAwardDefault: 50,
      photoRetentionMonths: 6
    }
  });

  // Create default disciplinary types
  console.log('⚠️ Creating disciplinary types...');
  const disciplinaryTypes = await Promise.all([
    prisma.disciplinaryType.upsert({
      where: { name: 'Sudden Absence' },
      update: {},
      create: {
        name: 'Sudden Absence',
        defaultPoints: -200,
        active: true
      }
    }),
    prisma.disciplinaryType.upsert({
      where: { name: 'Late Arrival (>15m)' },
      update: {},
      create: {
        name: 'Late Arrival (>15m)',
        defaultPoints: -30,
        active: true
      }
    }),
    prisma.disciplinaryType.upsert({
      where: { name: 'Phone Use on Duty' },
      update: {},
      create: {
        name: 'Phone Use on Duty',
        defaultPoints: -20,
        active: true
      }
    }),
    prisma.disciplinaryType.upsert({
      where: { name: 'Uniform Violation' },
      update: {},
      create: {
        name: 'Uniform Violation',
        defaultPoints: -10,
        active: true
      }
    }),
    prisma.disciplinaryType.upsert({
      where: { name: 'Safety Breach' },
      update: {},
      create: {
        name: 'Safety Breach',
        defaultPoints: -100,
        active: true
      }
    })
  ]);

  // Create default skills
  console.log('🎯 Creating default skills...');
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'Brew Coffee' },
      update: {},
      create: { name: 'Brew Coffee', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Tom Yam Prep' },
      update: {},
      create: { name: 'Tom Yam Prep', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Curry Mee Base' },
      update: {},
      create: { name: 'Curry Mee Base', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Cashier' },
      update: {},
      create: { name: 'Cashier', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'POS Closing' },
      update: {},
      create: { name: 'POS Closing', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Knife Skills' },
      update: {},
      create: { name: 'Knife Skills', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Food Safety' },
      update: {},
      create: { name: 'Food Safety', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Customer Service' },
      update: {},
      create: { name: 'Customer Service', active: true }
    }),
    prisma.skill.upsert({
      where: { name: 'Inventory Management' },
      update: {},
      create: { name: 'Inventory Management', active: true }
    })
  ]);

  // Create default owner user
  console.log('👑 Creating default owner user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      passwordHash: hashedPassword,
      name: 'System Owner',
      phone: '+60123456789',
      email: 'owner@makanmanager.com',
      roles: ['owner'],
      purchasingPerm: true,
      status: 'active',
      startDate: new Date('2024-01-01'),
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+60123456789'
      },
      station: 'kitchen'
    }
  });

  // Create sample manager user
  console.log('👔 Creating sample manager user...');
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      passwordHash: managerPassword,
      name: 'Restaurant Manager',
      phone: '+60123456788',
      email: 'manager@makanmanager.com',
      roles: ['manager'],
      purchasingPerm: true,
      status: 'active',
      startDate: new Date('2024-01-15'),
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+60123456788'
      },
      station: 'front'
    }
  });

  // Create sample head of kitchen
  console.log('👨‍🍳 Creating sample head of kitchen...');
  const hokPassword = await bcrypt.hash('hok123', 12);
  const headOfKitchen = await prisma.user.upsert({
    where: { username: 'hok' },
    update: {},
    create: {
      username: 'hok',
      passwordHash: hokPassword,
      name: 'Head of Kitchen',
      phone: '+60123456787',
      email: 'hok@makanmanager.com',
      roles: ['head-of-kitchen'],
      purchasingPerm: false,
      status: 'active',
      startDate: new Date('2024-01-20'),
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+60123456787'
      },
      station: 'kitchen'
    }
  });

  // Create sample staff users
  console.log('👥 Creating sample staff users...');
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staffUsers = await Promise.all([
    prisma.user.upsert({
      where: { username: 'chef1' },
      update: {},
      create: {
        username: 'chef1',
        passwordHash: staffPassword,
        name: 'Chef Ahmad',
        phone: '+60123456786',
        email: 'chef1@makanmanager.com',
        roles: ['staff'],
        purchasingPerm: false,
        status: 'active',
        startDate: new Date('2024-02-01'),
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+60123456786'
        },
        station: 'kitchen'
      }
    }),
    prisma.user.upsert({
      where: { username: 'cashier1' },
      update: {},
      create: {
        username: 'cashier1',
        passwordHash: staffPassword,
        name: 'Cashier Sarah',
        phone: '+60123456785',
        email: 'cashier1@makanmanager.com',
        roles: ['staff'],
        purchasingPerm: false,
        status: 'active',
        startDate: new Date('2024-02-01'),
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+60123456785'
        },
        station: 'front'
      }
    }),
    prisma.user.upsert({
      where: { username: 'waiter1' },
      update: {},
      create: {
        username: 'waiter1',
        passwordHash: staffPassword,
        name: 'Waiter John',
        phone: '+60123456784',
        email: 'waiter1@makanmanager.com',
        roles: ['staff'],
        purchasingPerm: false,
        status: 'active',
        startDate: new Date('2024-02-01'),
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+60123456784'
        },
        station: 'front'
      }
    })
  ]);

  // Create sample tasks
  console.log('📝 Creating sample tasks...');
  const sampleTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Clean Kitchen Equipment',
        description: 'Clean and sanitize all kitchen equipment including stoves, cutting boards, and utensils',
        station: 'kitchen',
        points: 50,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'open',
        assignerId: owner.id,
        proofType: 'photo',
        allowMultiplier: true
      }
    }),
    prisma.task.create({
      data: {
        title: 'Restock Front Counter',
        description: 'Check and restock front counter supplies including napkins, condiments, and utensils',
        station: 'front',
        points: 30,
        dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        status: 'open',
        assignerId: manager.id,
        proofType: 'checklist',
        allowMultiplier: true
      }
    }),
    prisma.task.create({
      data: {
        title: 'Inventory Check - Store Room',
        description: 'Conduct weekly inventory check of store room items and update stock levels',
        station: 'store',
        points: 75,
        dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
        status: 'open',
        assignerId: headOfKitchen.id,
        proofType: 'text',
        allowMultiplier: true
      }
    })
  ]);

  // Assign some skills to users
  console.log('🎯 Assigning skills to users...');
  await Promise.all([
    prisma.userSkill.create({
      data: {
        userId: headOfKitchen.id,
        skillId: skills.find(s => s.name === 'Knife Skills')!.id,
        level: 'Expert',
        verified: true,
        verifiedById: owner.id,
        verifiedAt: new Date()
      }
    }),
    prisma.userSkill.create({
      data: {
        userId: headOfKitchen.id,
        skillId: skills.find(s => s.name === 'Food Safety')!.id,
        level: 'Expert',
        verified: true,
        verifiedById: owner.id,
        verifiedAt: new Date()
      }
    }),
    prisma.userSkill.create({
      data: {
        userId: staffUsers[0].id, // Chef Ahmad
        skillId: skills.find(s => s.name === 'Tom Yam Prep')!.id,
        level: 'Proficient',
        verified: true,
        verifiedById: headOfKitchen.id,
        verifiedAt: new Date()
      }
    }),
    prisma.userSkill.create({
      data: {
        userId: staffUsers[1].id, // Cashier Sarah
        skillId: skills.find(s => s.name === 'Cashier')!.id,
        level: 'Proficient',
        verified: true,
        verifiedById: manager.id,
        verifiedAt: new Date()
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Settings: 1`);
  console.log(`- Disciplinary Types: ${disciplinaryTypes.length}`);
  console.log(`- Skills: ${skills.length}`);
  console.log(`- Users: ${1 + 1 + 1 + staffUsers.length} (Owner, Manager, HoK, ${staffUsers.length} Staff)`);
  console.log(`- Sample Tasks: ${sampleTasks.length}`);
  console.log('\n🔑 Default Login Credentials:');
  console.log('Owner: owner / admin123');
  console.log('Manager: manager / manager123');
  console.log('Head of Kitchen: hok / hok123');
  console.log('Staff: chef1, cashier1, waiter1 / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
