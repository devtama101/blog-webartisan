import { prisma } from '../db'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@webartisan.id' },
    update: {},
    create: {
      email: 'admin@webartisan.id',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  
  console.log('User created:', { id: user.id, email: user.email, role: user.role })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
