// Data structure
let appData = {
    months: [],
    recurringBills: [],
    oneTimeOutcomes: [],
    cashTransactions: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateUI();
    
    // Auto-save before page unload (like iPhone auto-save)
    window.addEventListener('beforeunload', () => {
        saveData();
    });
    
    // Auto-save periodically (every 30 seconds) as backup
    setInterval(() => {
        saveData();
    }, 30000);
});

// Event Listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('addMonthBtn').addEventListener('click', () => {
        openNewMonthModal();
    });

    // Make month input wrapper clickable - set up after modal is created
    setTimeout(() => {
        setupMonthInputClick();
    }, 100);

    // Modal buttons
    document.getElementById('closeNewMonthModal').addEventListener('click', closeNewMonthModal);
    document.getElementById('closeRecurringModal').addEventListener('click', closeRecurringModal);
    document.getElementById('closeOneTimeModal').addEventListener('click', closeOneTimeModal);
    document.getElementById('closeCashIncomeModal').addEventListener('click', closeCashIncomeModal);
    document.getElementById('closeCashSpendingModal').addEventListener('click', closeCashSpendingModal);

    // Save buttons
    document.getElementById('saveMonthBtn').addEventListener('click', saveNewMonth);
    document.getElementById('saveRecurringBtn').addEventListener('click', saveRecurringBill);
    document.getElementById('saveOneTimeBtn').addEventListener('click', saveOneTimeOutcome);
    document.getElementById('saveCashIncomeBtn').addEventListener('click', saveCashIncome);
    document.getElementById('saveCashSpendingBtn').addEventListener('click', saveCashSpending);

    // Add buttons
    document.getElementById('addRecurringBtn').addEventListener('click', () => {
        openRecurringModal();
    });
    document.getElementById('addOneTimeBtn').addEventListener('click', () => {
        openOneTimeModal();
    });
    document.getElementById('addCashIncomeBtn').addEventListener('click', () => {
        openCashIncomeModal();
    });
    document.getElementById('addCashSpendingBtn').addEventListener('click', () => {
        openCashSpendingModal();
    });

    // Bill type radio buttons
    document.querySelectorAll('input[name="billType"]').forEach(radio => {
        radio.addEventListener('change', handleBillTypeChange);
    });

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Day details modal close button
    document.getElementById('closeDayDetailsModal').addEventListener('click', () => {
        document.getElementById('dayDetailsModal').classList.remove('active');
    });
}

// Modal Functions
function setupMonthInputClick() {
    const monthWrapper = document.querySelector('.month-input-wrapper');
    const monthInput = document.getElementById('monthInput');
    if (monthWrapper && monthInput && !monthWrapper.dataset.listenerAdded) {
        monthWrapper.dataset.listenerAdded = 'true';
        monthWrapper.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const input = document.getElementById('monthInput');
            if (input) {
                input.focus();
                setTimeout(() => {
                    if (typeof input.showPicker === 'function') {
                        input.showPicker().catch(() => {
                            input.click();
                        });
                    } else {
                        input.click();
                    }
                }, 10);
            }
        });
    }
}

function openNewMonthModal() {
    const modal = document.getElementById('newMonthModal');
    const monthInput = document.getElementById('monthInput');
    const today = new Date();
    monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    modal.classList.add('active');
    
    // Ensure click handler is set up
    setTimeout(() => {
        setupMonthInputClick();
    }, 50);
}

function closeNewMonthModal() {
    document.getElementById('newMonthModal').classList.remove('active');
    document.getElementById('incomeInput').value = '';
}

function openRecurringModal() {
    const modal = document.getElementById('recurringBillModal');
    const today = new Date().toISOString().split('T')[0];
    // Allow past dates for bills, so no min restriction
    document.getElementById('billStartDate').value = today;
    modal.classList.add('active');
    handleBillTypeChange(); // Set initial state
}

function closeRecurringModal() {
    document.getElementById('recurringBillModal').classList.remove('active');
    document.getElementById('billNameInput').value = '';
    document.getElementById('billAmountInput').value = '';
    document.getElementById('billStartDate').value = '';
    document.getElementById('billEndDate').value = '';
    document.getElementById('debtAmountInput').value = '';
    document.getElementById('monthlyPaymentInput').value = '';
    document.querySelector('input[name="billType"][value="dates"]').checked = true;
}

function openOneTimeModal() {
    const modal = document.getElementById('oneTimeModal');
    const monthSelect = document.getElementById('outcomeMonthSelect');
    
    // Populate month select - only current and future months
    monthSelect.innerHTML = '';
    const today = new Date();
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayString = today.toISOString().split('T')[0];
    
    appData.months.forEach(month => {
        const monthDate = new Date(month.year, month.month - 1, 1);
        // Only show current and future months
        if (monthDate >= todayMonth) {
            const option = document.createElement('option');
            option.value = month.id;
            option.textContent = formatMonthName(month.month, month.year);
            monthSelect.appendChild(option);
        }
    });

    // Set default date to today and prevent past dates
    const dateInput = document.getElementById('outcomeDateInput');
    dateInput.value = todayString;
    dateInput.min = todayString;
    
    modal.classList.add('active');
}

function closeOneTimeModal() {
    document.getElementById('oneTimeModal').classList.remove('active');
    document.getElementById('outcomeDescriptionInput').value = '';
    document.getElementById('outcomeAmountInput').value = '';
}

function openCashIncomeModal() {
    const modal = document.getElementById('cashIncomeModal');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cashIncomeDateInput').value = today;
    document.getElementById('cashIncomeDateInput').min = today;
    modal.classList.add('active');
}

function closeCashIncomeModal() {
    document.getElementById('cashIncomeModal').classList.remove('active');
    document.getElementById('cashIncomeAmountInput').value = '';
    document.getElementById('cashIncomeDescriptionInput').value = '';
}

function openCashSpendingModal() {
    const modal = document.getElementById('cashSpendingModal');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cashSpendingDateInput').value = today;
    document.getElementById('cashSpendingDateInput').min = today;
    modal.classList.add('active');
}

function closeCashSpendingModal() {
    document.getElementById('cashSpendingModal').classList.remove('active');
    document.getElementById('cashSpendingAmountInput').value = '';
    document.getElementById('cashSpendingDescriptionInput').value = '';
}

function handleBillTypeChange() {
    const billType = document.querySelector('input[name="billType"]:checked').value;
    const datesSection = document.getElementById('datesSection');
    const debtSection = document.getElementById('debtSection');

    if (billType === 'dates') {
        datesSection.style.display = 'block';
        debtSection.style.display = 'none';
    } else if (billType === 'debt') {
        datesSection.style.display = 'none';
        debtSection.style.display = 'block';
    } else if (billType === 'infinite') {
        datesSection.style.display = 'none';
        debtSection.style.display = 'none';
    }
}

// Save Functions
function saveNewMonth() {
    const monthInput = document.getElementById('monthInput').value;
    const income = parseFloat(document.getElementById('incomeInput').value);

    if (!monthInput || isNaN(income) || income < 0) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const [year, month] = monthInput.split('-').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Check if month already exists
    const existingMonth = appData.months.find(m => m.month === month && m.year === year);
    if (existingMonth) {
        alert('This month already exists!');
        return;
    }

    // Calculate days in month and start date
    const daysInMonth = new Date(year, month, 0).getDate();
    let startDay = 1;
    
    // If opening in the middle of the month, start from today
    if (year === currentYear && month === currentMonth) {
        startDay = today.getDate();
    }

    const newMonth = {
        id: Date.now().toString(),
        month: month,
        year: year,
        income: income,
        startDay: startDay,
        endDay: daysInMonth,
        daysInMonth: daysInMonth
    };

    appData.months.push(newMonth);
    appData.months.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    saveData();
    updateUI();
    closeNewMonthModal();
}

function saveRecurringBill() {
    const name = document.getElementById('billNameInput').value.trim();
    const amount = parseFloat(document.getElementById('billAmountInput').value);
    const billType = document.querySelector('input[name="billType"]:checked').value;

    if (!name || isNaN(amount) || amount < 0) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    let startDate = null;
    let endDate = null;
    let isInfinite = false;
    let totalDebt = null;
    let monthlyPayment = null;

    if (billType === 'dates') {
        startDate = document.getElementById('billStartDate').value;
        endDate = document.getElementById('billEndDate').value;
        
        if (!startDate) {
            alert('Please select a start date.');
            return;
        }
        
        // Allow bills that started in the past (no restriction)
        if (endDate && new Date(endDate) < new Date(startDate)) {
            alert('End date must be after start date.');
            return;
        }
    } else if (billType === 'debt') {
        totalDebt = parseFloat(document.getElementById('debtAmountInput').value);
        monthlyPayment = parseFloat(document.getElementById('monthlyPaymentInput').value);
        
        if (isNaN(totalDebt) || totalDebt < 0 || isNaN(monthlyPayment) || monthlyPayment <= 0) {
            alert('Please enter valid debt amount and monthly payment.');
            return;
        }

        // Calculate end date based on debt
        const monthsNeeded = Math.ceil(totalDebt / monthlyPayment);
        const start = new Date();
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(start);
        end.setMonth(end.getMonth() + monthsNeeded);
        endDate = end.toISOString().split('T')[0];
    } else if (billType === 'infinite') {
        isInfinite = true;
        const start = new Date();
        startDate = start.toISOString().split('T')[0];
    }

    const newBill = {
        id: Date.now().toString(),
        name: name,
        amount: amount,
        startDate: startDate,
        endDate: endDate,
        isInfinite: isInfinite,
        totalDebt: totalDebt,
        monthlyPayment: monthlyPayment
    };

    appData.recurringBills.push(newBill);
    saveData();
    updateUI();
    closeRecurringModal();
}

function saveOneTimeOutcome() {
    const description = document.getElementById('outcomeDescriptionInput').value.trim();
    const amount = parseFloat(document.getElementById('outcomeAmountInput').value);
    const date = document.getElementById('outcomeDateInput').value;
    const monthId = document.getElementById('outcomeMonthSelect').value;

    if (!description || isNaN(amount) || amount < 0 || !date || !monthId) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Prevent adding outcomes for previous months or past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
        alert('Cannot add outcomes for previous dates. Please select today or a future date.');
        return;
    }

    const selectedMonth = appData.months.find(m => m.id === monthId);
    if (selectedMonth) {
        const monthDate = new Date(selectedMonth.year, selectedMonth.month - 1, 1);
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (monthDate < todayMonth) {
            alert('Cannot add outcomes for previous months. Please select current or future month.');
            return;
        }
    }

    const newOutcome = {
        id: Date.now().toString(),
        description: description,
        amount: amount,
        date: date,
        monthId: monthId
    };

    appData.oneTimeOutcomes.push(newOutcome);
    saveData();
    updateUI();
    closeOneTimeModal();
}

function saveCashIncome() {
    const amount = parseFloat(document.getElementById('cashIncomeAmountInput').value);
    const description = document.getElementById('cashIncomeDescriptionInput').value.trim();
    const date = document.getElementById('cashIncomeDateInput').value;

    if (!description || isNaN(amount) || amount < 0 || !date) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
        alert('Cannot add transactions for previous dates. Please select today or a future date.');
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount: amount,
        description: description,
        date: date
    };

    appData.cashTransactions.push(transaction);
    saveData();
    updateUI();
    closeCashIncomeModal();
}

function saveCashSpending() {
    const amount = parseFloat(document.getElementById('cashSpendingAmountInput').value);
    const description = document.getElementById('cashSpendingDescriptionInput').value.trim();
    const date = document.getElementById('cashSpendingDateInput').value;

    if (!description || isNaN(amount) || amount < 0 || !date) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
        alert('Cannot add transactions for previous dates. Please select today or a future date.');
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        type: 'spending',
        amount: amount,
        description: description,
        date: date
    };

    appData.cashTransactions.push(transaction);
    saveData();
    updateUI();
    closeCashSpendingModal();
}

// Calculation Functions
function calculateTotals() {
    let totalIncome = 0;
    let totalRecurring = 0;
    let totalOneTime = 0;

    // Calculate total income from all months
    appData.months.forEach(month => {
        totalIncome += month.income;
    });

    // Calculate total recurring bills spent - only for months that exist
    appData.recurringBills.forEach(bill => {
        let billMonths = 0;
        
        // Count how many opened months this bill applies to
        appData.months.forEach(month => {
            const monthStart = new Date(month.year, month.month - 1, 1);
            const monthEnd = new Date(month.year, month.month, 0);
            const billStart = new Date(bill.startDate);
            const billEnd = bill.endDate ? new Date(bill.endDate) : null;
            
            // Check if bill is active during this month
            if (bill.isInfinite) {
                // Infinite bills: count if bill started before or during this month
                if (billStart <= monthEnd) {
                    billMonths++;
                }
            } else {
                // Regular bills: count if month overlaps with bill period
                if (billStart <= monthEnd && (!billEnd || billEnd >= monthStart)) {
                    billMonths++;
                }
            }
        });
        
        totalRecurring += bill.amount * billMonths;
    });

    // Calculate total one-time outcomes
    appData.oneTimeOutcomes.forEach(outcome => {
        totalOneTime += outcome.amount;
    });

    return {
        totalIncome,
        totalRecurring,
        totalOneTime,
        totalAvailable: totalIncome - totalRecurring - totalOneTime
    };
}

function getMonthsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let months = 0;
    
    while (start <= end) {
        months++;
        start.setMonth(start.getMonth() + 1);
    }
    
    return Math.max(0, months);
}

function calculateMonthsLeft() {
    if (appData.recurringBills.length === 0) {
        return null;
    }

    let maxMonthsLeft = 0;
    let lastBillName = '';

    appData.recurringBills.forEach(bill => {
        if (bill.isInfinite) {
            return; // Skip infinite bills
        }

        const endDate = bill.endDate ? new Date(bill.endDate) : null;
        if (!endDate) {
            // Calculate from debt
            if (bill.totalDebt && bill.monthlyPayment) {
                // Count how many months have been paid (only for opened months)
                let monthsPaid = 0;
                appData.months.forEach(month => {
                    const monthStart = new Date(month.year, month.month - 1, 1);
                    const billStart = new Date(bill.startDate);
                    if (billStart <= monthStart) {
                        monthsPaid++;
                    }
                });
                
                const remainingDebt = bill.totalDebt - (bill.monthlyPayment * monthsPaid);
                const monthsLeft = Math.ceil(Math.max(0, remainingDebt) / bill.monthlyPayment);
                if (monthsLeft > maxMonthsLeft) {
                    maxMonthsLeft = monthsLeft;
                    lastBillName = bill.name;
                }
            }
        } else {
            // Find the last opened month
            let lastOpenedMonth = null;
            appData.months.forEach(month => {
                const monthEnd = new Date(month.year, month.month, 0);
                if (!lastOpenedMonth || monthEnd > lastOpenedMonth) {
                    lastOpenedMonth = monthEnd;
                }
            });
            
            if (lastOpenedMonth && endDate > lastOpenedMonth) {
                const monthsLeft = getMonthsBetween(lastOpenedMonth, endDate);
                if (monthsLeft > maxMonthsLeft) {
                    maxMonthsLeft = monthsLeft;
                    lastBillName = bill.name;
                }
            }
        }
    });

    return maxMonthsLeft > 0 ? {
        months: maxMonthsLeft,
        billName: lastBillName
    } : null;
}


// UI Update Functions
function updateUI() {
    updateCurrentMonth();
    updateTotals();
    updateTimeline();
    updateRecurringBills();
    updateOneTimeOutcomes();
    updateMonthsLeft();
    updateCash();
}

function updateCurrentMonth() {
    const currentMonthCard = document.getElementById('currentMonthCard');
    const todayText = document.getElementById('todayText');
    const currentMonthName = document.getElementById('currentMonthName');
    const monthDateRange = document.getElementById('monthDateRange');

    const today = new Date();
    const currentMonth = appData.months.find(m => 
        m.year === today.getFullYear() && m.month === today.getMonth() + 1
    );

    if (currentMonth) {
        const currentDay = today.getDate();
        todayText.textContent = `Today is the ${currentDay}${getDaySuffix(currentDay)}`;
        currentMonthName.textContent = formatMonthName(currentMonth.month, currentMonth.year);
        monthDateRange.textContent = `Day ${currentMonth.startDay} - ${currentMonth.endDay}`;
    } else {
        todayText.textContent = '-';
        currentMonthName.textContent = 'No Active Month';
        monthDateRange.textContent = '-';
    }
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function updateTotals() {
    const totals = calculateTotals();
    
    document.getElementById('totalAvailable').textContent = totals.totalAvailable.toFixed(2);
    document.getElementById('totalRecurring').textContent = totals.totalRecurring.toFixed(2);
    document.getElementById('totalOneTime').textContent = totals.totalOneTime.toFixed(2);
    
    const lastUpdated = document.getElementById('lastUpdated');
    const now = new Date();
    lastUpdated.textContent = `Updated ${formatTimeAgo(now)}`;
}

function updateTimeline() {
    const timeline = document.getElementById('monthTimeline');
    timeline.innerHTML = '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // Separate current month from others
    const currentMonthData = appData.months.find(m => 
        m.year === currentYear && m.month === currentMonth
    );
    const otherMonths = appData.months.filter(m => 
        !(m.year === currentYear && m.month === currentMonth)
    ).slice(-5); // Show last 5 other months
    
    // Combine all months: current first, then others
    const allMonths = [];
    if (currentMonthData) {
        allMonths.push(currentMonthData);
    }
    allMonths.push(...otherMonths);
    
    // Show all months with separators between them
    allMonths.forEach((month, index) => {
        const isCurrent = month.year === currentYear && month.month === currentMonth;
        const monthItem = createMonthItem(month, isCurrent, today);
        timeline.appendChild(monthItem);
        
        // Add separator line after each month (except after the last one)
        if (index < allMonths.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'month-separator';
            timeline.appendChild(separator);
        }
    });
}

function createMonthItem(month, isCurrentMonth, today) {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const isActuallyCurrent = month.year === currentYear && month.month === currentMonth;
    
    // Check if month is in the past
    const monthDate = new Date(month.year, month.month - 1, 1);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const isPastMonth = monthDate < todayMonth;
    
    const monthItem = document.createElement('div');
    monthItem.className = 'month-item';
    
    if (isActuallyCurrent) {
        monthItem.classList.add('current-month');
    }
    
    if (isPastMonth) {
        monthItem.classList.add('past-month');
    }
    
    const label = document.createElement('div');
    label.className = 'month-label';
    const monthShort = formatMonthName(month.month, month.year).substring(0, 3);
    const yearShort = String(month.year).slice(-2);
    label.textContent = `${monthShort} ${yearShort}`;
    if (isActuallyCurrent) {
        label.classList.add('current-month-label');
    }
    
    // Add thin gray line for current month
    if (isActuallyCurrent) {
        const line = document.createElement('div');
        line.className = 'current-month-line';
        monthItem.appendChild(line);
    }
    
    const dots = document.createElement('div');
    dots.className = 'month-dots';
    
    // Create dots for each day
    for (let i = 1; i <= month.daysInMonth; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i >= month.startDay && i <= month.endDay) {
            dot.classList.add('active');
        }
        
        // Make dots clickable for current month only
        if (isActuallyCurrent && i >= month.startDay && i <= month.endDay) {
            dot.classList.add('clickable');
            dot.dataset.day = i;
            dot.dataset.monthId = month.id;
            dot.addEventListener('click', () => showDayDetails(month, i));
        }
        
        dots.appendChild(dot);
    }
    
    monthItem.appendChild(label);
    monthItem.appendChild(dots);
    return monthItem;
}

function showDayDetails(month, day) {
    const date = new Date(month.year, month.month - 1, day);
    const dateString = date.toISOString().split('T')[0];
    
    // Calculate total spending for this day
    let totalSpending = 0;
    const dayOutcomes = [];
    const dayBills = [];
    
    // Get one-time outcomes for this day
    appData.oneTimeOutcomes.forEach(outcome => {
        if (outcome.monthId === month.id && outcome.date === dateString) {
            totalSpending += outcome.amount;
            dayOutcomes.push({
                type: 'outcome',
                name: outcome.description,
                amount: outcome.amount
            });
        }
    });
    
    // Get recurring bills that apply to this month (they're monthly, so count them)
    appData.recurringBills.forEach(bill => {
        const billStart = new Date(bill.startDate);
        const billEnd = bill.endDate ? new Date(bill.endDate) : null;
        const monthStart = new Date(month.year, month.month - 1, 1);
        const monthEnd = new Date(month.year, month.month, 0);
        
        // Check if bill applies to this month
        let appliesToMonth = false;
        if (bill.isInfinite) {
            appliesToMonth = billStart <= monthEnd;
        } else {
            appliesToMonth = billStart <= monthEnd && (!billEnd || billEnd >= monthStart);
        }
        
        if (appliesToMonth) {
            totalSpending += bill.amount;
            dayBills.push({
                type: 'bill',
                name: bill.name,
                amount: bill.amount,
                isInfinite: bill.isInfinite
            });
        }
    });
    
    // Show modal with day details
    const modal = document.getElementById('dayDetailsModal');
    document.getElementById('dayDetailsDate').textContent = `${formatDate(dateString)} - ${formatMonthName(month.month, month.year)}`;
    document.getElementById('dayDetailsTotal').textContent = totalSpending.toFixed(2);
    
    const outcomesList = document.getElementById('dayDetailsList');
    outcomesList.innerHTML = '';
    
    const allItems = [...dayBills, ...dayOutcomes];
    
    if (allItems.length === 0) {
        outcomesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 10px;">No spending recorded for this day</p>';
    } else {
        allItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'bill-item';
            const badge = item.isInfinite ? '<span class="infinite-badge">RECURRING</span>' : '';
            itemEl.innerHTML = `
                <div class="bill-info">
                    <div class="bill-name">${item.name} ${badge}</div>
                </div>
                <div class="bill-amount">₪${item.amount.toFixed(2)}</div>
            `;
            outcomesList.appendChild(itemEl);
        });
    }
    
    modal.classList.add('active');
}

function updateRecurringBills() {
    const list = document.getElementById('recurringBillsList');
    list.innerHTML = '';

    if (appData.recurringBills.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recurring bills yet</p>';
        return;
    }

    appData.recurringBills.forEach(bill => {
        const item = document.createElement('div');
        item.className = 'bill-item';
        
        const info = document.createElement('div');
        info.className = 'bill-info';
        
        const name = document.createElement('div');
        name.className = 'bill-name';
        name.textContent = bill.name;
        if (bill.isInfinite) {
            const badge = document.createElement('span');
            badge.className = 'infinite-badge';
            badge.textContent = 'INFINITE';
            name.appendChild(badge);
        }
        
        const details = document.createElement('div');
        details.className = 'bill-details';
        if (bill.isInfinite) {
            details.textContent = `Started ${formatDate(bill.startDate)}`;
        } else if (bill.endDate) {
            details.textContent = `${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}`;
        } else {
            details.textContent = `Debt: ₪${bill.totalDebt.toFixed(2)} | Monthly: ₪${bill.monthlyPayment.toFixed(2)}`;
        }
        
        const amount = document.createElement('div');
        amount.className = 'bill-amount';
        amount.textContent = `₪${bill.amount.toFixed(2)}`;
        
        info.appendChild(name);
        info.appendChild(details);
        item.appendChild(info);
        item.appendChild(amount);
        list.appendChild(item);
    });
}

function updateOneTimeOutcomes() {
    const list = document.getElementById('oneTimeList');
    list.innerHTML = '';

    if (appData.oneTimeOutcomes.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No one-time outcomes yet</p>';
        return;
    }

    appData.oneTimeOutcomes.forEach(outcome => {
        const month = appData.months.find(m => m.id === outcome.monthId);
        const item = document.createElement('div');
        item.className = 'bill-item';
        
        const info = document.createElement('div');
        info.className = 'bill-info';
        
        const name = document.createElement('div');
        name.className = 'bill-name';
        name.textContent = outcome.description;
        
        const details = document.createElement('div');
        details.className = 'bill-details';
        details.textContent = `${formatDate(outcome.date)}${month ? ` • ${formatMonthName(month.month, month.year)}` : ''}`;
        
        const amount = document.createElement('div');
        amount.className = 'bill-amount';
        amount.textContent = `₪${outcome.amount.toFixed(2)}`;
        
        info.appendChild(name);
        info.appendChild(details);
        item.appendChild(info);
        item.appendChild(amount);
        list.appendChild(item);
    });
}

function updateMonthsLeft() {
    const monthsLeftData = calculateMonthsLeft();
    const monthsLeftEl = document.getElementById('monthsLeft');
    const lastBillInfo = document.getElementById('lastBillInfo');

    if (monthsLeftData && monthsLeftData.months > 0) {
        monthsLeftEl.textContent = monthsLeftData.months;
        lastBillInfo.textContent = `For ${monthsLeftData.billName}`;
    } else {
        monthsLeftEl.textContent = '-';
        lastBillInfo.textContent = 'For Last Bill';
    }
}

function updateCash() {
    // Calculate cash balance
    let balance = 0;
    appData.cashTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            balance += transaction.amount;
        } else {
            balance -= transaction.amount;
        }
    });

    document.getElementById('cashBalance').textContent = balance.toFixed(2);

    // Display transactions
    const list = document.getElementById('cashTransactionsList');
    list.innerHTML = '';

    if (appData.cashTransactions.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No cash transactions yet</p>';
        return;
    }

    // Sort transactions by date (newest first)
    const sortedTransactions = [...appData.cashTransactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    sortedTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'bill-item';
        
        const info = document.createElement('div');
        info.className = 'bill-info';
        
        const name = document.createElement('div');
        name.className = 'bill-name';
        name.textContent = transaction.description;
        
        const details = document.createElement('div');
        details.className = 'bill-details';
        details.textContent = `${formatDate(transaction.date)}`;
        
        const amount = document.createElement('div');
        amount.className = 'bill-amount';
        if (transaction.type === 'income') {
            amount.style.color = '#4caf50';
            amount.textContent = `+₪${transaction.amount.toFixed(2)}`;
        } else {
            amount.style.color = '#f44336';
            amount.textContent = `-₪${transaction.amount.toFixed(2)}`;
        }
        
        info.appendChild(name);
        info.appendChild(details);
        item.appendChild(info);
        item.appendChild(amount);
        list.appendChild(item);
    });
}

// Utility Functions
function formatMonthName(month, year) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${year}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

// Data Persistence - Uses localStorage (similar to iPhone local storage)
function saveData() {
    try {
        // Ensure all data properties exist
        const dataToSave = {
            months: appData.months || [],
            recurringBills: appData.recurringBills || [],
            oneTimeOutcomes: appData.oneTimeOutcomes || [],
            cashTransactions: appData.cashTransactions || []
        };
        
        // Save all data to localStorage (like iPhone local storage)
        localStorage.setItem('budgetTrackerData', JSON.stringify(dataToSave));
        
        // Save timestamp of last save
        localStorage.setItem('budgetTrackerData_lastSave', new Date().toISOString());
        
    } catch (e) {
        console.error('Error saving data:', e);
        // If quota exceeded, try to clear old backups
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn('Storage quota exceeded. Clearing old backups...');
            // Clear old backup data
            const keys = Object.keys(localStorage);
            keys.filter(k => k.startsWith('budgetTrackerData_backup_')).forEach(key => {
                localStorage.removeItem(key);
            });
            // Try saving again
            try {
                localStorage.setItem('budgetTrackerData', JSON.stringify({
                    months: appData.months || [],
                    recurringBills: appData.recurringBills || [],
                    oneTimeOutcomes: appData.oneTimeOutcomes || [],
                    cashTransactions: appData.cashTransactions || []
                }));
            } catch (e2) {
                alert('Storage is full. Please clear browser data or export your data.');
            }
        }
    }
}

function loadData() {
    const saved = localStorage.getItem('budgetTrackerData');
    if (saved) {
        try {
            const loadedData = JSON.parse(saved);
            // Merge with default structure to ensure all properties exist (backward compatibility)
            appData = {
                months: Array.isArray(loadedData.months) ? loadedData.months : [],
                recurringBills: Array.isArray(loadedData.recurringBills) ? loadedData.recurringBills : [],
                oneTimeOutcomes: Array.isArray(loadedData.oneTimeOutcomes) ? loadedData.oneTimeOutcomes : [],
                cashTransactions: Array.isArray(loadedData.cashTransactions) ? loadedData.cashTransactions : []
            };
            
            // Check if data was loaded successfully
            const lastSave = localStorage.getItem('budgetTrackerData_lastSave');
            if (lastSave) {
                console.log('Data loaded successfully. Last saved:', new Date(lastSave).toLocaleString());
            }
        } catch (e) {
            console.error('Error loading data:', e);
            // Try to load from backup if main data is corrupted
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(k => k.startsWith('budgetTrackerData_backup_')).sort().reverse();
            if (backupKeys.length > 0) {
                try {
                    const backupData = JSON.parse(localStorage.getItem(backupKeys[0]));
                    appData = {
                        months: Array.isArray(backupData.months) ? backupData.months : [],
                        recurringBills: Array.isArray(backupData.recurringBills) ? backupData.recurringBills : [],
                        oneTimeOutcomes: Array.isArray(backupData.oneTimeOutcomes) ? backupData.oneTimeOutcomes : [],
                        cashTransactions: Array.isArray(backupData.cashTransactions) ? backupData.cashTransactions : []
                    };
                    console.log('Loaded from backup:', backupKeys[0]);
                } catch (e2) {
                    console.error('Backup also corrupted, resetting to default');
                    appData = {
                        months: [],
                        recurringBills: [],
                        oneTimeOutcomes: [],
                        cashTransactions: []
                    };
                }
            } else {
                // Reset to default if corrupted and no backup
                appData = {
                    months: [],
                    recurringBills: [],
                    oneTimeOutcomes: [],
                    cashTransactions: []
                };
            }
        }
    } else {
        // No saved data, use defaults
        appData = {
            months: [],
            recurringBills: [],
            oneTimeOutcomes: [],
            cashTransactions: []
        };
    }
}
