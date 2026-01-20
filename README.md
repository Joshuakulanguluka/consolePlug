# Console Plug Manager - POS System

A complete Point of Sale (POS) management system for a gaming console retail business.

## Features

### Dashboard
- Today-focused metrics (Today's Sales, Today's Expenses, Today's Net Profit, Low Stock Items)
- Last 7 Days Sales bar chart
- Quick Actions: New Sale, Add Stock, Add Expense, Close Day
- Low Stock Alert List and Top Selling Today

### Stock Management
- Two main categories: Console and Accessories
- Accessories subcategories: Controller, Power Pack, Headset, Hard Drive
- Platforms: Xbox, PlayStation, Other
- Conditions: New, Pre-Owned
- Serial number tracking for consoles (required and unique)
- Advanced filtering system with hierarchical category/subcategory filters
- Interactive stat cards with click-to-filter functionality
- Adjust Quantity modal for stock updates

### Sales
- Sales page shows TODAY's sales only (no date filters)
- Record new sale with product selection, serial numbers (for consoles), payment methods
- Auto-calculates Total Amount and Net Profit
- Payment methods: Cash, Mobile Money, Other

### Sales History
- Separate page for full sales history
- Date filters: All Time, Today, This Week, This Month
- Pagination: 10 items per page
- Sorted newest to oldest

### Expenses
- 4 stat cards:
  - Total Expenses (This Month) - clickable to filter
  - Expenses Today - clickable to filter
  - Highest Expense Category - clickable to filter
  - Average Daily Expense - read-only
- Add expense form with categories: Transport, Utilities, Repairs, Rent, Salaries, Marketing, Supplies, Other
- Expense history table with date and category filters
- Pagination: 10 items per page
- Sorted newest to oldest

### Reports
- Comprehensive business analytics and reports

### Notifications
- Real-time notifications for low stock, sales milestones, and system updates
- Unread count badge on desktop and mobile

### Profile & Settings
- User profile management
- System settings and preferences

## Design System

- **Background Color**: #f8f9fa
- **Currency**: K (Kwacha)
- **Icons**: Lucide icons only (no emojis)
- **Styling**: Tailwind CSS utility classes
- **Global Styles**: css/styles.css
- **Toast Notifications**: All alerts use toast system (no browser alerts)

## Mobile Features

- Responsive design for all screen sizes
- Bottom navigation bar (Dashboard, Sales, Stock, Menu)
- Swipe gestures to open/close mobile menu
- Hidden topbar on mobile
- Profile section in mobile menu (clickable)
- Touch-optimized UI elements

## Data Management

- LocalStorage persistence
- Dynamic date generation for realistic data
- Auto-sorting (newest first everywhere)
- Data version control for updates

## Tech Stack

- HTML5
- CSS3 (Tailwind CSS)
- Vanilla JavaScript
- Lucide Icons
- LocalStorage for data persistence

## Getting Started

1. Open `index.html` in a web browser
2. Login with any credentials (demo mode)
3. Navigate through the different sections using the sidebar or bottom nav

## File Structure

```
├── index.html              # Login page
├── pages/
│   ├── dashboard.html      # Main dashboard
│   ├── stock.html          # Stock management
│   ├── sales.html          # Today's sales
│   ├── sales-history.html  # Full sales history
│   ├── expenses.html       # Expense tracking
│   ├── reports.html        # Business reports
│   ├── notifications.html  # Notifications center
│   ├── profile.html        # User profile
│   └── settings.html       # System settings
├── components/
│   ├── sidebar.html        # Desktop sidebar
│   ├── topbar.html         # Top navigation bar
│   └── bottomnav.html      # Mobile bottom nav
├── js/
│   ├── data.js             # Data management & storage
│   ├── dashboard.js        # Dashboard functionality
│   ├── stock.js            # Stock management logic
│   ├── sales.js            # Sales functionality
│   ├── expenses.js         # Expense tracking logic
│   ├── reports.js          # Reports generation
│   ├── notifications.js    # Notifications handling
│   ├── profile.js          # Profile management
│   ├── settings.js         # Settings functionality
│   ├── components.js       # Component loader
│   ├── toast.js            # Toast notification system
│   └── icons-config.js     # Icon configurations
├── css/
│   └── styles.css          # Global styles
└── img/
    └── logo/
        └── logo.png        # Application logo
```

## Notes

- All dates are dynamically generated based on current date
- Serial numbers are required and unique for consoles only
- Selling Price must be ≥ Buying Price
- Pagination shows 10 items per page across all tables
- All data persists in browser LocalStorage
