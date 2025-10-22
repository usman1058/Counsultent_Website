import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@studyabroadwithhadi.info' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      12
    )

    const admin = await db.admin.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@studyabroadwithhadi.info',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('Admin user created successfully:', admin.email)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await db.$disconnect()
  }
}

seedAdmin()