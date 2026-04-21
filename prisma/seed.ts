import { PrismaClient, UserRole, PaymentType, ShiftStatus, POStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data (optional, but good for pure seed)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 2. Branches
  const branch1 = await prisma.branch.create({
    data: { name: 'Pusat Jakarta', location: 'Jl. Sudirman No. 1' }
  });
  const branch2 = await prisma.branch.create({
    data: { name: 'Cabang Bandung', location: 'Jl. Dago No. 10' }
  });

  // 3. Users
  const admin = await prisma.user.create({
    data: { name: 'Admin Pusat', email: 'admin@pospro.com', password: 'password', role: UserRole.ADMIN, branchId: branch1.id }
  });
  const kasir1 = await prisma.user.create({
    data: { name: 'Kasir Satu', email: 'kasir1@pospro.com', password: 'password', role: UserRole.KASIR, branchId: branch1.id }
  });

  // 4. Categories & Products
  const food = await prisma.category.create({ data: { name: 'Makanan' } });
  const drink = await prisma.category.create({ data: { name: 'Minuman' } });

  const prod1 = await prisma.product.create({
    data: { name: 'Nasi Goreng Spesial', sku: 'FOOD-001', price: 25000, stock: 50, categoryId: food.id }
  });
  const prod2 = await prisma.product.create({
    data: { name: 'Mie Ayam Bakso', sku: 'FOOD-002', price: 20000, stock: 40, categoryId: food.id }
  });
  const prod3 = await prisma.product.create({
    data: { name: 'Es Teh Manis', sku: 'DRV-001', price: 5000, stock: 100, categoryId: drink.id }
  });
  const prod4 = await prisma.product.create({
    data: { name: 'Kopi Susu Gula Aren', sku: 'DRV-002', price: 15000, stock: 8, categoryId: drink.id } // Low stock
  });

  // 5. Customers
  const cust1 = await prisma.customer.create({
    data: { name: 'Budi Santoso', phone: '081234567890', email: 'budi@example.com' }
  });
  const cust2 = await prisma.customer.create({
    data: { name: 'Siti Aminah', phone: '089876543210', email: 'siti@example.com' }
  });

  // 6. Orders (Simulate last 7 days)
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const orderDate = new Date(now);
    orderDate.setDate(now.getDate() - i);
    
    // Create 2-5 orders per day
    const numOrders = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < numOrders; j++) {
      const isCust = Math.random() > 0.5;
      
      const qty1 = Math.floor(Math.random() * 3) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;
      
      const subtotal = Number(prod1.price) * qty1 + Number(prod3.price) * qty2;
      const tax = subtotal * 0.11;
      
      await prisma.order.create({
        data: {
          orderNumber: `TRX-${Date.now()}-${i}-${j}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: subtotal + tax,
          taxAmount: tax,
          discount: 0,
          paymentType: j % 2 === 0 ? PaymentType.CASH : PaymentType.QRIS,
          customerId: isCust ? cust1.id : undefined,
          createdAt: orderDate,
          items: {
            create: [
              { productId: prod1.id, quantity: qty1, price: prod1.price },
              { productId: prod3.id, quantity: qty2, price: prod3.price }
            ]
          }
        }
      });
    }
  }

  // 7. Shifts
  await prisma.shift.create({
    data: {
      userId: kasir1.id,
      branchId: branch1.id,
      startingCash: 500000,
      actualCash: null,
      status: ShiftStatus.ACTIVE,
      startTime: new Date()
    }
  });

  // 8. Purchase Orders
  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-20260421-001',
      supplier: 'PT Minuman Segar',
      totalAmount: 150000,
      status: POStatus.SUBMITTED,
      items: {
        create: [
          { productId: prod4.id, quantity: 10, unitCost: 15000 }
        ]
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
