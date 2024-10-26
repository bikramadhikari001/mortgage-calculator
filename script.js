// Initialize charts
let costsChart;
let comparisonChart;

// Utility functions
function calculateStampDuty(price, isFirstTime) {
    if (isFirstTime) {
        if (price <= 425000) return 0;
        if (price <= 625000) return (price - 425000) * 0.05;
        return (price - 425000) * 0.05;
    } else {
        if (price <= 250000) return 0;
        if (price <= 925000) return (price - 250000) * 0.05;
        if (price <= 1500000) return 33750 + (price - 925000) * 0.1;
        return 93750 + (price - 1500000) * 0.12;
    }
}

function calculateMonthlyMortgage(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return monthlyPayment;
}

function formatCurrency(value) {
    return '£' + value.toLocaleString('en-UK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function initializeCharts() {
    // Wait for components to load
    setTimeout(() => {
        // Costs breakdown chart
        const costsCtx = document.getElementById('costsChart');
        if (costsCtx) {
            costsChart = new Chart(costsCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Deposit', 'Stamp Duty', 'Legal Fees', 'Other Costs'],
                    datasets: [{
                        data: [25000, 0, 1600, 2100],
                        backgroundColor: [
                            '#2563eb',
                            '#10b981',
                            '#f59e0b',
                            '#6b7280'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Comparison chart
        const comparisonCtx = document.getElementById('comparisonChart');
        if (comparisonCtx) {
            comparisonChart = new Chart(comparisonCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Monthly Payment', 'Total Interest', 'Upfront Costs'],
                    datasets: [{
                        label: 'Current',
                        data: [1250, 150000, 28700],
                        backgroundColor: '#2563eb'
                    }, {
                        label: '5% Deposit',
                        data: [1400, 168000, 15000],
                        backgroundColor: '#10b981'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => '£' + value.toLocaleString()
                            }
                        }
                    }
                }
            });
        }
    }, 1000); // Give components time to load
}

function updateCharts(data) {
    if (costsChart) {
        costsChart.data.datasets[0].data = [
            data.deposit,
            data.stampDuty,
            data.legalFees,
            data.otherCosts
        ];
        costsChart.update();
    }

    if (comparisonChart) {
        comparisonChart.data.datasets[0].data = [
            data.monthlyPayment,
            data.totalInterest,
            data.upfrontCosts
        ];
        comparisonChart.update();
    }
}

function generateRecommendations(data) {
    const recommendations = [];
    
    if (data.depositPercentage < 10) {
        recommendations.push({
            type: 'warning',
            text: 'Consider saving for a larger deposit to get better mortgage rates',
            action: 'Calculate with 15% deposit'
        });
    }

    if (data.interestRate > 4.2) {
        recommendations.push({
            type: 'info',
            text: 'Current interest rate is above market average. Consider speaking with a broker',
            action: 'Find a broker'
        });
    }

    if (data.isFirstTime && data.propertyPrice > 425000) {
        recommendations.push({
            type: 'warning',
            text: 'Property price exceeds first-time buyer relief threshold',
            action: 'View alternatives'
        });
    }

    return recommendations;
}

function updateRecommendations(recommendations) {
    const container = document.getElementById('recommendationsList');
    if (container) {
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.type}">
                <div class="rec-content">
                    <i class="fas ${rec.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                    <span>${rec.text}</span>
                </div>
                <button class="btn btn-outline btn-sm">${rec.action}</button>
            </div>
        `).join('');
    }
}

function calculateCosts() {
    const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
    const depositPercentage = parseFloat(document.getElementById('depositPercentage').value) || 10;
    const mortgageTerm = parseFloat(document.getElementById('mortgageTerm').value) || 25;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 4.5;
    const isFirstTime = document.getElementById('firstTimeBuyer').checked;
    const usesBroker = document.getElementById('mortgageBroker').checked;
    const fullSurvey = document.getElementById('fullSurvey').checked;
    const removals = document.getElementById('removals').checked;
    const storage = document.getElementById('storage').checked;
    const isLeasehold = document.getElementById('isLeasehold').checked;

    // Calculate costs
    const deposit = propertyPrice * (depositPercentage / 100);
    const stampDuty = calculateStampDuty(propertyPrice, isFirstTime);
    const legalFees = 1600;
    const surveyFees = fullSurvey ? 1500 : 400;
    const brokerFee = usesBroker ? 750 : 0;
    const removalsCost = removals ? 1000 : 0;
    const storageCost = storage ? 400 : 0;
    const otherCosts = surveyFees + brokerFee + removalsCost + storageCost;

    // Calculate mortgage details
    const mortgageAmount = propertyPrice - deposit;
    const monthlyPayment = calculateMonthlyMortgage(mortgageAmount, interestRate, mortgageTerm);
    const totalInterest = (monthlyPayment * mortgageTerm * 12) - mortgageAmount;
    const monthlyInsurance = 25;
    const serviceCharge = isLeasehold ? 150 : 0;
    const maintenance = propertyPrice * 0.01 / 12;

    // Update UI
    const elements = {
        depositResult: deposit,
        stampDutyResult: stampDuty,
        legalFeesResult: legalFees,
        surveyResult: surveyFees,
        mortgagePaymentResult: monthlyPayment,
        insuranceResult: monthlyInsurance,
        serviceLeaseholdResult: serviceCharge,
        maintenanceResult: maintenance,
        monthlyPaymentMetric: monthlyPayment,
        upfrontCostMetric: deposit + stampDuty + legalFees + otherCosts,
        ltvMetric: `${(100 - depositPercentage)}%`
    };

    // Update all elements
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'string' ? value : formatCurrency(value);
        }
    });

    // Update charts
    updateCharts({
        deposit,
        stampDuty,
        legalFees,
        otherCosts,
        monthlyPayment,
        totalInterest,
        upfrontCosts: deposit + stampDuty + legalFees + otherCosts
    });

    // Generate and update recommendations
    const recommendations = generateRecommendations({
        depositPercentage,
        interestRate,
        isFirstTime,
        propertyPrice
    });
    updateRecommendations(recommendations);

    // Show/hide leasehold row
    const leaseholdRow = document.getElementById('serviceLeaseholdRow');
    if (leaseholdRow) {
        leaseholdRow.style.display = isLeasehold ? 'flex' : 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initializeCharts();
    
    // Add event listeners
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.addEventListener('input', calculateCosts);
        } else {
            input.addEventListener('change', calculateCosts);
        }
    });

    // Sync range slider with number input
    const termSlider = document.getElementById('termSlider');
    const mortgageTermInput = document.getElementById('mortgageTerm');
    
    if (termSlider && mortgageTermInput) {
        termSlider.addEventListener('input', (e) => {
            mortgageTermInput.value = e.target.value;
            calculateCosts();
        });

        mortgageTermInput.addEventListener('input', (e) => {
            termSlider.value = e.target.value;
        });
    }

    // Initialize share functionality
    const shareBtn = document.getElementById('shareCalculator');
    const shareModal = document.getElementById('shareModal');
    
    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', () => {
            shareModal.style.display = 'flex';
        });

        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }
    
    // Initial calculation
    calculateCosts();
});
