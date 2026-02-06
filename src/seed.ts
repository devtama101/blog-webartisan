import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
