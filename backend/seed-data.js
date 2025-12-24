const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Tenant = require('./models/Tenant');
const Bill = require('./models/Bill');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB Connected');
    seedData();
})
.catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
});

async function seedData() {
    try {
        console.log('\n🌱 Starting to seed test data...\n');

        // Get the first user (your account)
        const user = await User.findOne();
        
        if (!user) {
            console.log('❌ No user found. Please register first.');
            process.exit(1);
        }

        console.log(`👤 Found user: ${user.name} (${user.email})`);
        console.log(`🆔 User ID: ${user._id}\n`);

        // Create test tenants
        console.log('Creating tenants...');
        const tenants = await Tenant.create([
            {
                userId: user._id,
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '9876543210',
                roomNumber: '101',
                rentAmount: 8000,
                depositAmount: 16000,
                joinDate: new Date('2024-01-15'),
                status: 'active',
                address: 'Delhi',
                notes: 'Good tenant, always pays on time'
            },
            {
                userId: user._id,
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '9876543211',
                roomNumber: '102',
                rentAmount: 9000,
                depositAmount: 18000,
                joinDate: new Date('2024-03-20'),
                status: 'active',
                address: 'Mumbai'
            },
            {
                userId: user._id,
                name: 'Amit Patel',
                email: 'amit@example.com',
                phone: '9876543212',
                roomNumber: '103',
                rentAmount: 7500,
                depositAmount: 15000,
                joinDate: new Date('2024-06-10'),
                status: 'active',
                address: 'Bangalore'
            },
            {
                userId: user._id,
                name: 'Sneha Reddy',
                email: 'sneha@example.com',
                phone: '9876543213',
                roomNumber: '201',
                rentAmount: 10000,
                depositAmount: 20000,
                joinDate: new Date('2024-02-28'),
                status: 'active',
                address: 'Hyderabad'
            }
        ]);

        console.log(`✅ Created ${tenants.length} tenants\n`);

        // Create test bills
        console.log('Creating bills...');
        const bills = [];
        
        // November 2024 bills (all paid)
        for (let i = 0; i < tenants.length; i++) {
            bills.push({
                userId: user._id,
                tenantId: tenants[i]._id,
                tenantName: tenants[i].name,
                roomNumber: tenants[i].roomNumber,
                billMonth: 'November',
                billYear: 2024,
                date: new Date('2024-11-01'),
                dueDate: new Date('2024-11-10'),
                rentAmount: tenants[i].rentAmount,
                electricityBill: Math.floor(Math.random() * 500) + 200,
                waterBill: Math.floor(Math.random() * 200) + 100,
                maintenanceFee: 500,
                otherCharges: 0,
                discount: 0,
                totalAmount: tenants[i].rentAmount + Math.floor(Math.random() * 500) + 200 + Math.floor(Math.random() * 200) + 100 + 500,
                paymentStatus: 'paid',
                paymentDate: new Date('2024-11-08'),
                paymentMethod: i % 2 === 0 ? 'upi' : 'bank_transfer'
            });
        }

        // December 2024 bills (mix of statuses)
        bills.push({
            userId: user._id,
            tenantId: tenants[0]._id,
            tenantName: tenants[0].name,
            roomNumber: tenants[0].roomNumber,
            billMonth: 'December',
            billYear: 2024,
            date: new Date('2024-12-01'),
            dueDate: new Date('2024-12-10'),
            rentAmount: tenants[0].rentAmount,
            electricityBill: 450,
            waterBill: 150,
            maintenanceFee: 500,
            otherCharges: 0,
            discount: 0,
            totalAmount: 9100,
            paymentStatus: 'paid',
            paymentDate: new Date('2024-12-09'),
            paymentMethod: 'upi'
        });

        bills.push({
            userId: user._id,
            tenantId: tenants[1]._id,
            tenantName: tenants[1].name,
            roomNumber: tenants[1].roomNumber,
            billMonth: 'December',
            billYear: 2024,
            date: new Date('2024-12-01'),
            dueDate: new Date('2024-12-08'),
            rentAmount: tenants[1].rentAmount,
            electricityBill: 520,
            waterBill: 180,
            maintenanceFee: 500,
            otherCharges: 0,
            discount: 0,
            totalAmount: 10200,
            paymentStatus: 'overdue',
            paymentDate: null,
            paymentMethod: 'cash'
        });

        bills.push({
            userId: user._id,
            tenantId: tenants[2]._id,
            tenantName: tenants[2].name,
            roomNumber: tenants[2].roomNumber,
            billMonth: 'December',
            billYear: 2024,
            date: new Date('2024-12-01'),
            dueDate: new Date('2024-12-15'),
            rentAmount: tenants[2].rentAmount,
            electricityBill: 380,
            waterBill: 120,
            maintenanceFee: 500,
            otherCharges: 0,
            discount: 0,
            totalAmount: 8500,
            paymentStatus: 'pending',
            paymentDate: null,
            paymentMethod: 'cash'
        });

        bills.push({
            userId: user._id,
            tenantId: tenants[3]._id,
            tenantName: tenants[3].name,
            roomNumber: tenants[3].roomNumber,
            billMonth: 'December',
            billYear: 2024,
            date: new Date('2024-12-01'),
            dueDate: new Date('2024-12-12'),
            rentAmount: tenants[3].rentAmount,
            electricityBill: 600,
            waterBill: 200,
            maintenanceFee: 500,
            otherCharges: 0,
            discount: 0,
            totalAmount: 11300,
            paymentStatus: 'pending',
            paymentDate: null,
            paymentMethod: 'cash'
        });

        await Bill.create(bills);
        console.log(`✅ Created ${bills.length} bills\n`);

        // Calculate summary
        const totalRevenue = bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
        const pendingAmount = bills.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);
        const overdueAmount = bills.filter(b => b.paymentStatus === 'overdue').reduce((sum, b) => sum + b.totalAmount, 0);

        console.log('📊 Summary:');
        console.log(`   Tenants: ${tenants.length} active`);
        console.log(`   Bills: ${bills.length} total`);
        console.log(`   Paid: ${bills.filter(b => b.paymentStatus === 'paid').length} bills (₹${totalRevenue.toLocaleString('en-IN')})`);
        console.log(`   Pending: ${bills.filter(b => b.paymentStatus === 'pending').length} bills (₹${pendingAmount.toLocaleString('en-IN')})`);
        console.log(`   Overdue: ${bills.filter(b => b.paymentStatus === 'overdue').length} bills (₹${overdueAmount.toLocaleString('en-IN')})`);
        console.log('\n✅ Test data seeded successfully!');
        console.log('\n🌐 Now refresh your dashboard: http://localhost:5500/frontend/admin-dashboard.html\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}
