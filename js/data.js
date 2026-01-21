// Dummy data storage for the application
// This simulates a database with localStorage persistence

// Data version - increment this when you want to reset data
const DATA_VERSION = 4; // Incremented to regenerate data with current dates

// Helper function to get date X days ago
function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// Helper function to generate random time
function getRandomTime() {
    const hours = Math.floor(Math.random() * 12) + 9; // 9 AM to 8 PM
    const minutes = Math.floor(Math.random() * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Platform and Model mappings
const PLATFORM_MODELS = {
    'PlayStation': ['PS3', 'PS4', 'PS4 Pro', 'PS5'],
    'Xbox': ['Xbox 360', 'One', 'One X', 'Series S', 'Series X'],
    'Nintendo': ['Switch', 'Switch Lite', 'Switch OLED']
};

// Controller models by platform
const CONTROLLER_MODELS = {
    'PlayStation': ['DualShock 3', 'DualShock 4', 'DualSense', 'DualSense Edge'],
    'Xbox': ['Wireless Controller', 'Elite Controller', 'Elite Controller Series 2'],
    'Nintendo': ['Joy-Con Pair', 'Pro Controller']
};

// Power Pack models by platform
const POWERPACK_MODELS = {
    'PlayStation': ['Charging Station', 'Portable Charger', 'Battery Pack'],
    'Xbox': ['Play & Charge Kit', 'Rechargeable Battery', 'Charging Station'],
    'Nintendo': ['Portable Charger', 'USB-C Charger', 'Power Bank']
};

// Get models based on category and platform
function getModelsForPlatform(category, platform) {
    if (category === 'Console') {
        return PLATFORM_MODELS[platform] || [];
    } else if (category === 'Controller') {
        return CONTROLLER_MODELS[platform] || [];
    } else if (category === 'Power Pack') {
        return POWERPACK_MODELS[platform] || [];
    }
    return [];
}

// Auto-generate product name
function generateProductName(category, platform, model) {
    return `${platform} ${model} ${category}`;
}

// Check if data needs to be reset
function checkDataVersion() {
    const currentVersion = localStorage.getItem('dataVersion');
    if (!currentVersion || parseInt(currentVersion) < DATA_VERSION) {
        // Clear old data
        localStorage.removeItem('stockData');
        localStorage.removeItem('salesData');
        localStorage.removeItem('expensesData');
        localStorage.removeItem('notifications');
        localStorage.setItem('dataVersion', DATA_VERSION);
    }
}

// Run version check
checkDataVersion();

// Initialize stock data
let stockData = JSON.parse(localStorage.getItem('stockData')) || [
    {
        id: 1,
        category: 'Console',
        platform: 'PlayStation',
        model: 'PS5',
        productName: 'PlayStation PS5 Console',
        serialNumber: 'PS5-2024-001',
        condition: 'New',
        quantity: 1,
        buyingPrice: 4500,
        sellingPrice: 5500,
        dateAdded: getDaysAgo(0), // Today
        supplier: 'Main Distributor',
        notes: 'Digital Edition',
        lowStockThreshold: 2
    },
    {
        id: 2,
        category: 'Console',
        platform: 'Xbox',
        model: 'Series X',
        productName: 'Xbox Series X Console',
        serialNumber: 'XBX-2024-001',
        condition: 'New',
        quantity: 1,
        buyingPrice: 4200,
        sellingPrice: 5200,
        dateAdded: getDaysAgo(1),
        supplier: 'Main Distributor',
        notes: '',
        lowStockThreshold: 2
    },
    {
        id: 3,
        category: 'Console',
        platform: 'PlayStation',
        model: 'PS4 Pro',
        productName: 'PlayStation PS4 Pro Console',
        serialNumber: 'PS4-2024-001',
        condition: 'Pre-Owned',
        quantity: 1,
        buyingPrice: 2800,
        sellingPrice: 3500,
        dateAdded: getDaysAgo(2),
        supplier: 'Trade-in',
        notes: 'Good condition',
        lowStockThreshold: 2
    },
    {
        id: 4,
        category: 'Accessory',
        subcategory: 'Controller',
        platform: 'PlayStation',
        model: 'DualSense',
        productName: 'PlayStation DualSense Controller',
        quantity: 8,
        buyingPrice: 450,
        sellingPrice: 650,
        dateAdded: getDaysAgo(3),
        supplier: 'Main Distributor',
        notes: 'White color',
        lowStockThreshold: 5
    },
    {
        id: 5,
        category: 'Accessory',
        subcategory: 'Controller',
        platform: 'Xbox',
        model: 'Wireless Controller',
        productName: 'Xbox Wireless Controller',
        quantity: 10,
        buyingPrice: 400,
        sellingPrice: 600,
        dateAdded: getDaysAgo(4),
        supplier: 'Main Distributor',
        notes: 'Black color',
        lowStockThreshold: 5
    },
    {
        id: 6,
        category: 'Accessory',
        subcategory: 'Power Pack',
        platform: 'PlayStation',
        model: 'Charging Station',
        productName: 'PlayStation Charging Station',
        quantity: 15,
        buyingPrice: 250,
        sellingPrice: 400,
        dateAdded: getDaysAgo(5),
        supplier: 'Accessory Supplier',
        notes: 'Dual charging',
        lowStockThreshold: 10
    },
    {
        id: 7,
        category: 'Console',
        platform: 'Other',
        model: 'Switch',
        productName: 'Nintendo Switch Console',
        serialNumber: 'NSW-2024-001',
        condition: 'New',
        quantity: 1,
        buyingPrice: 2500,
        sellingPrice: 3200,
        dateAdded: getDaysAgo(6),
        supplier: 'Main Distributor',
        notes: '',
        lowStockThreshold: 2
    },
    {
        id: 8,
        category: 'Accessory',
        subcategory: 'Controller',
        platform: 'Other',
        model: 'Pro Controller',
        productName: 'Nintendo Pro Controller',
        quantity: 6,
        buyingPrice: 500,
        sellingPrice: 750,
        dateAdded: getDaysAgo(7),
        supplier: 'Main Distributor',
        notes: '',
        lowStockThreshold: 5
    },
    {
        id: 9,
        category: 'Accessory',
        subcategory: 'Power Pack',
        platform: 'Xbox',
        model: 'Play & Charge Kit',
        productName: 'Xbox Play & Charge Kit',
        quantity: 12,
        buyingPrice: 200,
        sellingPrice: 350,
        dateAdded: getDaysAgo(8),
        supplier: 'Accessory Supplier',
        notes: 'Rechargeable battery',
        lowStockThreshold: 10
    },
    {
        id: 10,
        category: 'Console',
        platform: 'Xbox',
        model: 'Series S',
        productName: 'Xbox Series S Console',
        serialNumber: 'XBS-2024-001',
        condition: 'New',
        quantity: 1,
        buyingPrice: 3200,
        sellingPrice: 4000,
        dateAdded: getDaysAgo(9),
        supplier: 'Main Distributor',
        notes: 'Digital only',
        lowStockThreshold: 2
    },
    {
        id: 11,
        category: 'Console',
        platform: 'PlayStation',
        model: 'PS5',
        productName: 'PlayStation PS5 Console',
        serialNumber: 'PS5-2024-002',
        condition: 'New',
        quantity: 1,
        buyingPrice: 4500,
        sellingPrice: 5500,
        dateAdded: getDaysAgo(10),
        supplier: 'Main Distributor',
        notes: 'Disc Edition',
        lowStockThreshold: 2
    },
    {
        id: 12,
        category: 'Accessory',
        subcategory: 'Controller',
        platform: 'PlayStation',
        model: 'DualShock 4',
        productName: 'PlayStation DualShock 4 Controller',
        quantity: 5,
        buyingPrice: 350,
        sellingPrice: 550,
        dateAdded: getDaysAgo(11),
        supplier: 'Main Distributor',
        notes: 'For PS4',
        lowStockThreshold: 5
    },
    {
        id: 13,
        category: 'Accessory',
        subcategory: 'Power Pack',
        platform: 'Other',
        model: 'Portable Charger',
        productName: 'Nintendo Portable Charger',
        quantity: 8,
        buyingPrice: 280,
        sellingPrice: 450,
        dateAdded: getDaysAgo(12),
        supplier: 'Accessory Supplier',
        notes: 'USB-C',
        lowStockThreshold: 10
    },
    {
        id: 14,
        category: 'Console',
        platform: 'PlayStation',
        model: 'PS4',
        productName: 'PlayStation PS4 Console',
        serialNumber: 'PS4-2024-002',
        condition: 'Pre-Owned',
        quantity: 1,
        buyingPrice: 2200,
        sellingPrice: 2800,
        dateAdded: getDaysAgo(13),
        supplier: 'Trade-in',
        notes: 'Slim model',
        lowStockThreshold: 2
    },
    {
        id: 15,
        category: 'Console',
        platform: 'Xbox',
        model: 'One',
        productName: 'Xbox One Console',
        serialNumber: 'XB1-2024-001',
        condition: 'Pre-Owned',
        quantity: 1,
        buyingPrice: 1800,
        sellingPrice: 2500,
        dateAdded: getDaysAgo(14),
        supplier: 'Trade-in',
        notes: 'Good condition',
        lowStockThreshold: 2
    }
];

// Initialize sales data
let salesData = JSON.parse(localStorage.getItem('salesData')) || [
    // Today's sales
    {
        id: 1,
        stockId: 1,
        stockName: 'PlayStation PS5 Console',
        category: 'Console',
        platform: 'PlayStation',
        serialNumber: 'PS5-2024-001',
        quantity: 1,
        buyingPrice: 4500,
        sellingPrice: 5500,
        totalAmount: 5500,
        profit: 1000,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(0),
        time: '09:30 AM'
    },
    {
        id: 2,
        stockId: 4,
        stockName: 'PlayStation DualSense Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 450,
        sellingPrice: 650,
        totalAmount: 1300,
        profit: 400,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(0),
        time: '10:15 AM'
    },
    {
        id: 3,
        stockId: 5,
        stockName: 'Xbox Wireless Controller',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 400,
        sellingPrice: 600,
        totalAmount: 600,
        profit: 200,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(0),
        time: '11:45 AM'
    },
    {
        id: 4,
        stockId: 6,
        stockName: 'PlayStation Charging Station',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 3,
        buyingPrice: 250,
        sellingPrice: 400,
        totalAmount: 1200,
        profit: 450,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(0),
        time: '02:30 PM'
    },
    {
        id: 5,
        stockId: 2,
        stockName: 'Xbox Series X Console',
        category: 'Console',
        platform: 'Xbox',
        serialNumber: 'XBX-2024-001',
        quantity: 1,
        buyingPrice: 4200,
        sellingPrice: 5200,
        totalAmount: 5200,
        profit: 1000,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(0),
        time: '03:45 PM'
    },
    // Yesterday's sales
    {
        id: 6,
        stockId: 4,
        stockName: 'PlayStation DualSense Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 450,
        sellingPrice: 650,
        totalAmount: 650,
        profit: 200,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(1),
        time: '09:00 AM'
    },
    {
        id: 7,
        stockId: 10,
        stockName: 'Xbox Series S Console',
        category: 'Console',
        platform: 'Xbox',
        serialNumber: 'XBS-2024-001',
        quantity: 1,
        buyingPrice: 3200,
        sellingPrice: 4000,
        totalAmount: 4000,
        profit: 800,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(1),
        time: '10:20 AM'
    },
    {
        id: 8,
        stockId: 5,
        stockName: 'Xbox Wireless Controller',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 400,
        sellingPrice: 600,
        totalAmount: 1200,
        profit: 400,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(1),
        time: '12:00 PM'
    },
    {
        id: 9,
        stockId: 9,
        stockName: 'Xbox Play & Charge Kit',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 200,
        sellingPrice: 350,
        totalAmount: 700,
        profit: 300,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(1),
        time: '01:45 PM'
    },
    {
        id: 10,
        stockId: 3,
        stockName: 'PlayStation PS4 Pro Console',
        category: 'Console',
        platform: 'PlayStation',
        serialNumber: 'PS4-2024-001',
        quantity: 1,
        buyingPrice: 2800,
        sellingPrice: 3500,
        totalAmount: 3500,
        profit: 700,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(1),
        time: '03:10 PM'
    },
    // 2 days ago
    {
        id: 11,
        stockId: 12,
        stockName: 'PlayStation DualShock 4 Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 350,
        sellingPrice: 550,
        totalAmount: 1100,
        profit: 400,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(2),
        time: '09:00 AM'
    },
    {
        id: 12,
        stockId: 8,
        stockName: 'Nintendo Pro Controller',
        category: 'Accessory',
        platform: 'Other',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 500,
        sellingPrice: 750,
        totalAmount: 750,
        profit: 250,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(2),
        time: '10:30 AM'
    },
    {
        id: 13,
        stockId: 6,
        stockName: 'PlayStation Charging Station',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 250,
        sellingPrice: 400,
        totalAmount: 800,
        profit: 300,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(2),
        time: '11:50 AM'
    },
    {
        id: 14,
        stockId: 7,
        stockName: 'Nintendo Switch Console',
        category: 'Console',
        platform: 'Other',
        serialNumber: 'NSW-2024-001',
        quantity: 1,
        buyingPrice: 2500,
        sellingPrice: 3200,
        totalAmount: 3200,
        profit: 700,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(2),
        time: '02:20 PM'
    },
    {
        id: 15,
        stockId: 13,
        stockName: 'Nintendo Portable Charger',
        category: 'Accessory',
        platform: 'Other',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 280,
        sellingPrice: 450,
        totalAmount: 450,
        profit: 170,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(2),
        time: '03:45 PM'
    },
    // 3 days ago
    {
        id: 16,
        stockId: 4,
        stockName: 'PlayStation DualSense Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 3,
        buyingPrice: 450,
        sellingPrice: 650,
        totalAmount: 1950,
        profit: 600,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(3),
        time: '09:30 AM'
    },
    {
        id: 17,
        stockId: 11,
        stockName: 'PlayStation PS5 Console',
        category: 'Console',
        platform: 'PlayStation',
        serialNumber: 'PS5-2024-002',
        quantity: 1,
        buyingPrice: 4500,
        sellingPrice: 5500,
        totalAmount: 5500,
        profit: 1000,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(3),
        time: '11:00 AM'
    },
    {
        id: 18,
        stockId: 5,
        stockName: 'Xbox Wireless Controller',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 400,
        sellingPrice: 600,
        totalAmount: 1200,
        profit: 400,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(3),
        time: '01:15 PM'
    },
    {
        id: 19,
        stockId: 9,
        stockName: 'Xbox Play & Charge Kit',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 200,
        sellingPrice: 350,
        totalAmount: 350,
        profit: 150,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(3),
        time: '02:40 PM'
    },
    {
        id: 20,
        stockId: 6,
        stockName: 'PlayStation Charging Station',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 250,
        sellingPrice: 400,
        totalAmount: 400,
        profit: 150,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(3),
        time: '04:00 PM'
    },
    // 4 days ago
    {
        id: 21,
        stockId: 14,
        stockName: 'PlayStation PS4 Console',
        category: 'Console',
        platform: 'PlayStation',
        serialNumber: 'PS4-2024-002',
        quantity: 1,
        buyingPrice: 2200,
        sellingPrice: 2800,
        totalAmount: 2800,
        profit: 600,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(4),
        time: '10:00 AM'
    },
    {
        id: 22,
        stockId: 12,
        stockName: 'PlayStation DualShock 4 Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 350,
        sellingPrice: 550,
        totalAmount: 550,
        profit: 200,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(4),
        time: '12:30 PM'
    },
    {
        id: 23,
        stockId: 15,
        stockName: 'Xbox One Console',
        category: 'Console',
        platform: 'Xbox',
        serialNumber: 'XB1-2024-001',
        quantity: 1,
        buyingPrice: 1800,
        sellingPrice: 2500,
        totalAmount: 2500,
        profit: 700,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(4),
        time: '02:00 PM'
    },
    {
        id: 24,
        stockId: 4,
        stockName: 'PlayStation DualSense Controller',
        category: 'Accessory',
        platform: 'PlayStation',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 450,
        sellingPrice: 650,
        totalAmount: 1300,
        profit: 400,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(4),
        time: '03:30 PM'
    },
    // 5 days ago
    {
        id: 25,
        stockId: 5,
        stockName: 'Xbox Wireless Controller',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 3,
        buyingPrice: 400,
        sellingPrice: 600,
        totalAmount: 1800,
        profit: 600,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(5),
        time: '09:45 AM'
    },
    {
        id: 26,
        stockId: 2,
        stockName: 'Xbox Series X Console',
        category: 'Console',
        platform: 'Xbox',
        serialNumber: 'XBX-2024-001',
        quantity: 1,
        buyingPrice: 4200,
        sellingPrice: 5200,
        totalAmount: 5200,
        profit: 1000,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(5),
        time: '11:20 AM'
    },
    {
        id: 27,
        stockId: 13,
        stockName: 'Nintendo Portable Charger',
        category: 'Accessory',
        platform: 'Other',
        serialNumber: null,
        quantity: 2,
        buyingPrice: 280,
        sellingPrice: 450,
        totalAmount: 900,
        profit: 340,
        paymentMethod: 'Cash',
        notes: '',
        date: getDaysAgo(5),
        time: '01:50 PM'
    },
    {
        id: 28,
        stockId: 9,
        stockName: 'Xbox Play & Charge Kit',
        category: 'Accessory',
        platform: 'Xbox',
        serialNumber: null,
        quantity: 1,
        buyingPrice: 200,
        sellingPrice: 350,
        totalAmount: 350,
        profit: 150,
        paymentMethod: 'Mobile Money',
        notes: '',
        date: getDaysAgo(5),
        time: '03:15 PM'
    }
];

// Initialize expenses data
let expensesData = JSON.parse(localStorage.getItem('expensesData')) || [
    {
        id: 1,
        item: 'Monthly shop rent payment',
        amount: 5000,
        date: getDaysAgo(0),
        category: 'Rent',
        notes: 'January 2026'
    },
    {
        id: 2,
        item: 'Electricity bill',
        amount: 800,
        date: getDaysAgo(0),
        category: 'Utilities',
        notes: ''
    },
    {
        id: 3,
        item: 'Fuel for delivery',
        amount: 450,
        date: getDaysAgo(0),
        category: 'Transport',
        notes: 'Customer deliveries'
    },
    {
        id: 4,
        item: 'Internet & Phone bill',
        amount: 600,
        date: getDaysAgo(1),
        category: 'Utilities',
        notes: ''
    },
    {
        id: 5,
        item: 'Facebook ads campaign',
        amount: 1200,
        date: getDaysAgo(1),
        category: 'Marketing',
        notes: 'PS5 promotion'
    },
    {
        id: 6,
        item: 'Staff salaries',
        amount: 8000,
        date: getDaysAgo(2),
        category: 'Salaries',
        notes: '2 employees'
    },
    {
        id: 7,
        item: 'Packaging materials',
        amount: 350,
        date: getDaysAgo(3),
        category: 'Supplies',
        notes: 'Boxes and bubble wrap'
    },
    {
        id: 8,
        item: 'Console repair tools',
        amount: 800,
        date: getDaysAgo(4),
        category: 'Repairs',
        notes: 'Screwdriver set'
    },
    {
        id: 9,
        item: 'Transportation to supplier',
        amount: 250,
        date: getDaysAgo(5),
        category: 'Transport',
        notes: 'Stock pickup'
    },
    {
        id: 10,
        item: 'Water bill',
        amount: 150,
        date: getDaysAgo(6),
        category: 'Utilities',
        notes: ''
    },
    {
        id: 11,
        item: 'Instagram promotion',
        amount: 800,
        date: getDaysAgo(7),
        category: 'Marketing',
        notes: 'New stock announcement'
    },
    {
        id: 12,
        item: 'Shop cleaning supplies',
        amount: 200,
        date: getDaysAgo(8),
        category: 'Supplies',
        notes: ''
    },
    {
        id: 13,
        item: 'Controller repair',
        amount: 350,
        date: getDaysAgo(9),
        category: 'Repairs',
        notes: 'DualSense stick replacement'
    },
    {
        id: 14,
        item: 'Taxi fare',
        amount: 180,
        date: getDaysAgo(10),
        category: 'Transport',
        notes: 'Bank deposit'
    },
    {
        id: 15,
        item: 'Business license renewal',
        amount: 1500,
        date: getDaysAgo(11),
        category: 'Other',
        notes: 'Annual fee'
    },
    {
        id: 16,
        item: 'Printer ink and paper',
        amount: 280,
        date: getDaysAgo(12),
        category: 'Supplies',
        notes: 'For receipts'
    },
    {
        id: 17,
        item: 'Security guard payment',
        amount: 2000,
        date: getDaysAgo(13),
        category: 'Salaries',
        notes: 'Night shift'
    },
    {
        id: 18,
        item: 'Console cleaning service',
        amount: 400,
        date: getDaysAgo(14),
        category: 'Repairs',
        notes: 'Pre-owned units'
    }
];

// Initialize notifications
let notifications = JSON.parse(localStorage.getItem('notifications')) || [
    {
        id: 1,
        title: 'Low Stock Alert',
        message: 'PlayStation DualSense Controller stock is running low (8 units remaining)',
        type: 'warning',
        date: getDaysAgo(0),
        time: getRandomTime(),
        read: false
    },
    {
        id: 2,
        title: 'High Sales Day',
        message: 'Today\'s sales exceeded K 13,000',
        type: 'success',
        date: getDaysAgo(0),
        time: getRandomTime(),
        read: false
    },
    {
        id: 3,
        title: 'New Stock Added',
        message: 'PlayStation PS5 Console added to inventory',
        type: 'info',
        date: getDaysAgo(0),
        time: getRandomTime(),
        read: false
    },
    {
        id: 4,
        title: 'Low Stock Alert',
        message: 'Xbox Wireless Controller stock is running low (10 units remaining)',
        type: 'warning',
        date: getDaysAgo(1),
        time: getRandomTime(),
        read: true
    },
    {
        id: 5,
        title: 'Payment Received',
        message: 'Customer payment of K 5,200 received for Xbox Series X',
        type: 'success',
        date: getDaysAgo(1),
        time: getRandomTime(),
        read: true
    },
    {
        id: 6,
        title: 'Stock Update',
        message: 'PlayStation Charging Station stock replenished - 15 units added',
        type: 'info',
        date: getDaysAgo(2),
        time: getRandomTime(),
        read: true
    },
    {
        id: 7,
        title: 'Expense Alert',
        message: 'Monthly rent payment of K 5,000 is due',
        type: 'warning',
        date: getDaysAgo(2),
        time: getRandomTime(),
        read: true
    },
    {
        id: 8,
        title: 'Sales Milestone',
        message: 'Congratulations! You\'ve reached 25 total sales',
        type: 'success',
        date: getDaysAgo(3),
        time: getRandomTime(),
        read: true
    },
    {
        id: 9,
        title: 'New Stock Added',
        message: 'Xbox Series S added to inventory - 1 unit',
        type: 'info',
        date: getDaysAgo(3),
        time: getRandomTime(),
        read: true
    },
    {
        id: 10,
        title: 'Low Stock Alert',
        message: 'Nintendo Pro Controller stock is running low (6 units remaining)',
        type: 'warning',
        date: getDaysAgo(4),
        time: getRandomTime(),
        read: true
    },
    {
        id: 11,
        title: 'System Update',
        message: 'Inventory system updated successfully',
        type: 'info',
        date: getDaysAgo(4),
        time: getRandomTime(),
        read: true
    },
    {
        id: 12,
        title: 'High Profit Alert',
        message: 'Today\'s profit margin exceeded 25%',
        type: 'success',
        date: getDaysAgo(5),
        time: getRandomTime(),
        read: true
    }
];

// User profile data
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: 'Admin User',
    email: 'admin@consoleplug.com',
    phone: '+260 97 123 4567',
    role: 'Manager',
    joinDate: '2023-06-15',
    dob: '',
    address: '',
    avatar: null
};

// Helper functions to save data
function saveStockData() {
    localStorage.setItem('stockData', JSON.stringify(stockData));
}

function saveSalesData() {
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

function saveExpensesData() {
    localStorage.setItem('expensesData', JSON.stringify(expensesData));
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Calculate total stock value
function getTotalStockValue() {
    return stockData.reduce((total, item) => {
        return total + (item.quantity * item.buyingPrice);
    }, 0);
}

// Get low stock items count
function getLowStockCount() {
    return stockData.filter(item => item.quantity <= item.lowStockThreshold).length;
}

// Format currency
function formatCurrency(amount) {
    return 'K ' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Get next ID for new items
function getNextId(dataArray) {
    if (dataArray.length === 0) return 1;
    return Math.max(...dataArray.map(item => item.id)) + 1;
}

// Logout function
function handleLogout() {
    showSuccess('Logging out...');
    setTimeout(() => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    }, 1000);
}

// Toggle sidebar (desktop only - remembers state)
function toggleSidebar() {
    // Only works on desktop
    if (window.innerWidth < 768) return;
    
    const sidebar = document.getElementById('sidebar');
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (!sidebar || !sidebarContainer) return;
    
    // Toggle collapsed state
    const isCollapsed = sidebarContainer.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand sidebar
        sidebarContainer.classList.remove('collapsed');
        sidebar.classList.remove('collapsed');
        localStorage.setItem('sidebarCollapsed', 'false');
    } else {
        // Collapse sidebar
        sidebarContainer.classList.add('collapsed');
        sidebar.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
    }
}

// Restore sidebar state on page load
function restoreSidebarState() {
    // Only on desktop
    if (window.innerWidth < 768) return;
    
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        const sidebarContainer = document.getElementById('sidebar-container');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarContainer) sidebarContainer.classList.add('collapsed');
        if (sidebar) sidebar.classList.add('collapsed');
    }
}

// Toggle mobile menu modal
function toggleMobileMenu() {
    const modal = document.getElementById('mobileMenuModal');
    const content = document.getElementById('mobileMenuContent');
    
    if (!modal || !content) return;
    
    modal.classList.remove('hidden');
    
    // Trigger animation after a small delay
    setTimeout(() => {
        content.classList.add('show');
    }, 10);
    
    // Add swipe gesture support on the entire modal
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    };
    
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Only allow dragging down
        if (deltaY > 0) {
            content.style.transform = `translateY(${deltaY}px)`;
        }
    };
    
    const handleTouchEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaY = currentY - startY;
        
        // If dragged down more than 50px, close the menu
        if (deltaY > 50) {
            closeMobileMenu();
        } else {
            // Reset position
            content.style.transform = '';
        }
    };
    
    // Add touch event listeners to the entire modal (not just content)
    modal.addEventListener('touchstart', handleTouchStart, { passive: true });
    modal.addEventListener('touchmove', handleTouchMove, { passive: true });
    modal.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Remove listeners when menu closes
    const originalClose = closeMobileMenu;
    window.closeMobileMenu = function(event) {
        modal.removeEventListener('touchstart', handleTouchStart);
        modal.removeEventListener('touchmove', handleTouchMove);
        modal.removeEventListener('touchend', handleTouchEnd);
        originalClose(event);
        window.closeMobileMenu = originalClose;
    };
}

// Close mobile menu modal
function closeMobileMenu(event) {
    const modal = document.getElementById('mobileMenuModal');
    const content = document.getElementById('mobileMenuContent');
    
    if (!modal || !content) return;
    
    // If event exists, check if we should close
    if (event) {
        const clickedInsideContent = content.contains(event.target);
        const clickedOnModal = event.target === modal;
        const clickedOnHandle = event.target.classList.contains('w-12');
        
        // Only close if clicked outside content, on modal overlay, or on handle
        if (!clickedInsideContent || clickedOnModal || clickedOnHandle) {
            content.style.transform = '';
            content.classList.remove('show');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    } else {
        // No event means programmatic close (from swipe gesture)
        content.style.transform = '';
        content.classList.remove('show');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Check authentication
function checkAuth() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
}

// Initialize auth check on page load
if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html')) {
    checkAuth();
}

// Update header avatar on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHeaderProfileAvatar();
    updateNotificationCount();
});

// Update header profile avatar
function updateHeaderProfileAvatar() {
    const headerBtn = document.getElementById('headerProfileBtn');
    if (!headerBtn) return;
    
    if (userProfile.avatar) {
        headerBtn.innerHTML = `<img src="${userProfile.avatar}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
    } else {
        headerBtn.innerHTML = '<i data-lucide="user" class="text-white" style="width: 16px; height: 16px;"></i>';
    }
}

// Update notification count badge
function updateNotificationCount() {
    const countBadge = document.getElementById('notificationCount');
    const mobileCountBadge = document.getElementById('mobileNotificationBadge');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (countBadge) {
        if (unreadCount > 0) {
            countBadge.textContent = unreadCount;
            countBadge.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
        }
    }
    
    if (mobileCountBadge) {
        if (unreadCount > 0) {
            mobileCountBadge.textContent = unreadCount;
            mobileCountBadge.style.display = 'flex';
        } else {
            mobileCountBadge.style.display = 'none';
        }
    }
}


