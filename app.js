// Rent vs Buy Calculator Logic

// Get DOM elements
const form = document.getElementById('calculator-form');
const resultsSection = document.getElementById('results');
const rentTotalDiv = document.getElementById('rentTotal');
buyTotalDiv = document.getElementById('buyTotal');
const recommendationDiv = document.getElementById('recommendation');
const barChartDiv = document.getElementById('barChart');

// Helper: Calculate monthly mortgage payment (fixed-rate, Canadian style)
function calcMonthlyMortgage(P, annualRate, years) {
    const n = years * 12;
    const r = annualRate / 100 / 12;
    if (r === 0) return P / n;
    return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Helper: Calculate total rent cost
function calcTotalRent(monthlyRent, years) {
    return monthlyRent * 12 * years;
}

// Helper: Calculate total buy cost
function calcTotalBuy({
    homePrice,
    downPaymentPct,
    mortgageRate,
    amortization,
    propertyTaxRate,
    appreciation,
    years
}) {
    const downPayment = homePrice * (downPaymentPct / 100);
    const mortgageAmount = homePrice - downPayment;
    const monthlyPayment = calcMonthlyMortgage(mortgageAmount, mortgageRate, amortization);
    const months = years * 12;
    const totalMortgagePayments = monthlyPayment * months;
    const propertyTax = homePrice * (propertyTaxRate / 100) * years;
    // Home value at end
    const futureHomeValue = homePrice * Math.pow(1 + appreciation / 100, years);
    // Estimate principal repaid (approximate: sum of principal paid in period)
    let principalRepaid = 0;
    let balance = mortgageAmount;
    for (let i = 0; i < months; i++) {
        const interest = balance * (mortgageRate / 100 / 12);
        const principal = monthlyPayment - interest;
        principalRepaid += principal;
        balance -= principal;
        if (balance < 0) break;
    }
    // Net cost = down payment + total mortgage + property tax - (future value - home price) - principal repaid
    // (Principal repaid is equity, so subtract it)
    const netCost = downPayment + totalMortgagePayments + propertyTax - (futureHomeValue - homePrice) - principalRepaid;
    return {
        netCost,
        downPayment,
        totalMortgagePayments,
        propertyTax,
        futureHomeValue,
        principalRepaid
    };
}

// Helper: Format currency
function formatCurrency(num) {
    return '$' + num.toLocaleString('en-CA', {maximumFractionDigits: 0});
}

// Draw simple bar chart
function drawBarChart(rentCost, buyCost) {
    barChartDiv.innerHTML = '';
    const max = Math.max(rentCost, buyCost);
    const rentHeight = max ? Math.round((rentCost / max) * 100) : 0;
    const buyHeight = max ? Math.round((buyCost / max) * 100) : 0;
    // Rent bar
    const rentBar = document.createElement('div');
    rentBar.style.height = rentHeight + 'px';
    rentBar.style.width = '60px';
    rentBar.style.background = '#2563eb';
    rentBar.style.borderRadius = '6px 6px 0 0';
    rentBar.title = 'Total Rent';
    rentBar.style.display = 'flex';
    rentBar.style.alignItems = 'flex-end';
    rentBar.style.justifyContent = 'center';
    rentBar.innerHTML = `<span style="color:#fff;font-size:0.9rem;position:relative;top:-22px;">${formatCurrency(rentCost)}</span>`;
    // Buy bar
    const buyBar = document.createElement('div');
    buyBar.style.height = buyHeight + 'px';
    buyBar.style.width = '60px';
    buyBar.style.background = '#10b981';
    buyBar.style.borderRadius = '6px 6px 0 0';
    buyBar.title = 'Total Buy';
    buyBar.style.display = 'flex';
    buyBar.style.alignItems = 'flex-end';
    buyBar.style.justifyContent = 'center';
    buyBar.innerHTML = `<span style="color:#fff;font-size:0.9rem;position:relative;top:-22px;">${formatCurrency(buyCost)}</span>`;
    // Labels
    const rentLabel = document.createElement('div');
    rentLabel.style.textAlign = 'center';
    rentLabel.style.marginTop = '4px';
    rentLabel.textContent = 'Rent';
    const buyLabel = document.createElement('div');
    buyLabel.style.textAlign = 'center';
    buyLabel.style.marginTop = '4px';
    buyLabel.textContent = 'Buy';
    // Bar containers
    const rentContainer = document.createElement('div');
    rentContainer.appendChild(rentBar);
    rentContainer.appendChild(rentLabel);
    const buyContainer = document.createElement('div');
    buyContainer.appendChild(buyBar);
    buyContainer.appendChild(buyLabel);
    // Add to chart
    barChartDiv.appendChild(rentContainer);
    barChartDiv.appendChild(buyContainer);
}

// Handle form submission
form.addEventListener('submit', function(event) {
    event.preventDefault();
    // Get input values
    const monthlyRent = Number(form.rent.value);
    const homePrice = Number(form.homePrice.value);
    const downPaymentPct = Number(form.downPayment.value);
    const mortgageRate = Number(form.mortgageRate.value);
    const amortization = Number(form.amortization.value);
    const propertyTaxRate = Number(form.propertyTax.value);
    const appreciation = Number(form.appreciation.value);
    const years = Number(form.years.value);
    // Calculate totals
    const totalRent = calcTotalRent(monthlyRent, years);
    const buy = calcTotalBuy({
        homePrice,
        downPaymentPct,
        mortgageRate,
        amortization,
        propertyTaxRate,
        appreciation,
        years
    });
    // Show results
    resultsSection.style.display = 'block';
    rentTotalDiv.textContent = `Total Rent Cost: ${formatCurrency(totalRent)}`;
    buyTotalDiv.textContent = `Total Buy Cost: ${formatCurrency(buy.netCost)}`;
    // Recommendation
    let rec = '';
    if (totalRent < buy.netCost) {
        rec = 'Better to Rent';
    } else if (buy.netCost < totalRent) {
        rec = 'Better to Buy';
    } else {
        rec = 'Costs are about the same';
    }
    recommendationDiv.textContent = `Recommendation: ${rec}`;
    // Draw bar chart
    drawBarChart(totalRent, buy.netCost);
}); 