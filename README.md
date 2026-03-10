# Budget Tracker

A simple and beautiful web application for tracking your monthly budget, income, recurring bills, and one-time outcomes.

## Features

- **Month Management**: Open a new month anytime, even in the middle of the month. The app automatically calculates until the last day of that month.
- **Income Tracking**: Set your income when opening a new month.
- **Recurring Bills**: 
  - Add bills with start and end dates
  - Calculate bills from debt amount and monthly payment
  - Set infinite recurring bills (no end date)
  - See which bills are infinite on the homepage
- **One-Time Outcomes**: Track individual expenses for specific months
- **Calculations**: 
  - Total amount of money available
  - Total spent in recurring bills
  - Total spent in one-time outcomes
  - Months left for the last bill (for debt-based bills)

## How to Use

1. **Open a New Month**: Click the "+" button in the header, select a month, and enter your income.
2. **Add Recurring Bills**: Click "Add Recurring Bill" and choose one of three options:
   - **Use Start/End Dates**: Set when the bill starts and ends
   - **Calculate from Debt**: Enter total debt and monthly payment - the app calculates how many months are left
   - **Infinite**: For bills with no end date
3. **Add One-Time Outcomes**: Click "Add One-Time Outcome", enter description, amount, date, and select the month.
4. **View Totals**: The homepage displays:
   - Total available money
   - Total spent in recurring bills
   - Total spent in one-time outcomes
   - Months left for the last bill

## Data Storage

All data is stored locally in your browser using localStorage. Your data persists between sessions.

## Design

The app features a dark, minimalist design with:
- Rounded card-based layout
- Clear typography hierarchy
- Intuitive navigation
- Responsive design

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- LocalStorage API
