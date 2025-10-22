import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

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
      role: 'admin'
    }
  })

  console.log('Created admin user:', admin)

  // Create default site settings
  const siteSettings = await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Study Abroad with Hadi',
      siteUrl: 'https://studyabroadwithhadi.info',
      contactEmail: 'info@studyabroadwithhadi.info',
      contactPhone: '+1-234-567-8900',
      address: '123 Education Street, Learning City, LC 12345',
      aboutContent: 'Welcome to Study Abroad with Hadi - Your trusted partner for international education and visa consulting.',
      metaTitle: 'Study Abroad with Hadi - Visa Consulting & International Education',
      metaDescription: 'Expert visa consulting services for students looking to study abroad. Personalized guidance for admissions, scholarships, and visa applications.'
    }
  })

  console.log('Created site settings:', siteSettings)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })