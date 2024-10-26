// UI updates and DOM manipulations with animations
import { formatCurrency } from './utils.js';
import { updateCharts } from './charts.js';

const updateQueue = new Map();
let updateFrame = null;

export async function updateUI(data) {
    try {
        console.log('Updating UI with data:', data);
        // Queue updates
        updateQueue.set('results', () => updateResults(data));
        updateQueue.set('metrics', () => updateMetrics(data));
        updateQueue.set('charts', () => updateCharts(data));
        updateQueue.set('totals', () => updateTotalCosts(data));
        updateQueue.set('visibility', () => updateVisibility(data));

        // Process queue on next animation frame
        if (!updateFrame) {
            updateFrame = requestAnimationFrame(processUpdateQueue);
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

function processUpdateQueue() {
    updateFrame = null;
    for (const [, update] of updateQueue) {
        update();
    }
    updateQueue.clear();
}

function updateResults(data) {
    const updates = {
        depositResult: data.deposit,
        stampDutyResult: data.stampDuty,
        legalFeesResult: data.legalFees,
        surveyResult: data.surveyFees,
        mortgagePaymentResult: data.monthlyPayment,
        insuranceResult: data.monthlyInsurance,
        serviceLeaseholdResult: data.serviceCharge,
        maintenanceResult: data.maintenance
    };

    Object.entries(updates).forEach(([id, value]) => {
        animateValue(id, value);
    });
}

function updateMetrics(data) {
    const metrics = {
        monthlyPaymentMetric: {
            value: data.monthlyPayment,
            formatter: formatCurrency
        },
        upfrontCostMetric: {
            value: data.upfrontCosts,
            formatter: formatCurrency
        },
        ltvMetric: {
            value: 100 - data.depositPercentage,
            formatter: value => `${value}%`
        }
    };

    Object.entries(metrics).forEach(([id, { value, formatter }]) => {
        animateValue(id, value, formatter);
    });

    // Update risk indicators
    updateRiskIndicators(data);
}

function updateTotalCosts(data) {
    console.log('Updating total costs:', {
        monthly: data.totalMonthlyCosts,
        oneTime: data.totalOneTimeCosts
    });

    // Update footer totals
    animateValue('totalOneTimeCosts', data.totalOneTimeCosts, formatCurrency);
    animateValue('totalMonthlyCosts', data.totalMonthlyCosts, formatCurrency);
}

function updateRiskIndicators(data) {
    const ltv = 100 - data.depositPercentage;
    const ltvElement = document.getElementById('ltvMetric');
    if (ltvElement) {
        const parent = ltvElement.closest('.metric-card');
        if (parent) {
            parent.className = 'metric-card';
            if (ltv > 90) {
                parent.classList.add('high-risk');
            } else if (ltv > 80) {
                parent.classList.add('moderate-risk');
            } else {
                parent.classList.add('low-risk');
            }
        }
    }
}

function animateValue(elementId, newValue, formatter = formatCurrency) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }

    const currentText = element.textContent;
    const currentValue = parseFloat(currentText.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(currentValue) || currentValue === newValue) {
        element.textContent = formatter(newValue);
        return;
    }

    const duration = 500;
    const startTime = performance.now();
    const startValue = currentValue;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = startValue + (newValue - startValue) * easeOutQuart;
        element.textContent = formatter(currentValue);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateVisibility(data) {
    // Update leasehold section visibility
    const leaseholdRow = document.getElementById('serviceLeaseholdRow');
    if (leaseholdRow) {
        if (data.isLeasehold) {
            leaseholdRow.style.display = 'flex';
            leaseholdRow.classList.add('fade-in');
        } else {
            leaseholdRow.classList.remove('fade-in');
            setTimeout(() => {
                leaseholdRow.style.display = 'none';
            }, 300);
        }
    }

    // Update other conditional elements
    updateConditionalElements(data);
}

function updateConditionalElements(data) {
    // Show/hide first-time buyer specific elements
    const firstTimeBuyerElements = document.querySelectorAll('[data-first-time-buyer]');
    firstTimeBuyerElements.forEach(element => {
        element.style.display = data.isFirstTime ? 'block' : 'none';
    });

    // Update risk indicators
    const riskElements = document.querySelectorAll('[data-risk-indicator]');
    riskElements.forEach(element => {
        const ltv = 100 - data.depositPercentage;
        element.className = 'risk-indicator';
        element.classList.add(ltv > 90 ? 'high' : ltv > 80 ? 'moderate' : 'low');
    });
}
