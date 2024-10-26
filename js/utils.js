// Utility functions for formatting and calculations
export function formatCurrency(value) {
    return '£' + value.toLocaleString('en-UK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

export function calculateStampDuty(price, isFirstTime) {
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

export function calculateMonthlyMortgage(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return monthlyPayment;
}

export function getInputValue(id, defaultValue = 0) {
    const element = document.getElementById(id);
    return element ? parseFloat(element.value) || defaultValue : defaultValue;
}

export function getCheckboxValue(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

export function updateElement(id, value, formatter = formatCurrency) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = typeof value === 'string' ? value : formatter(value);
    }
}
