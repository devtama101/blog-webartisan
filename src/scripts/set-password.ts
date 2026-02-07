import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })
  
  console.log('✅ Password set for:', email)
  console.log('   Password:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
