import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.notification.count()
  const last = await prisma.notification.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  console.log('--- DB CHECK ---')
  console.log('Total Notifications:', count)
  console.log('Last Notification:', last)
  console.log('--- END CHECK ---')
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
