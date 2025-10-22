// prisma/seed.js
const { db } = require('../src/lib/db')
const bcrypt = require('bcryptjs')

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await db.admin.upsert({
    where: { email: 'admin@studyabroadwithhadi.info' },
    update: {},
    create: {
      email: 'admin@studyabroadwithhadi.info',
      name: 'Hadi Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Created admin user:', admin)


}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
