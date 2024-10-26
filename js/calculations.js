// Mortgage and cost calculations
export async function calculateAllCosts() {
    try {
        // Get input values
        const propertyPrice = getInputValue('propertyPrice');
        const depositPercentage = getInputValue('depositPercentage');
        const mortgageTerm = getSelectValue('mortgageTerm');
        const interestRate = getInputValue('interestRate');
        
        // Get checkbox values
        const isFirstTimeBuyer = getCheckboxValue('firstTimeBuyer');
        const usesBroker = getCheckboxValue('mortgageBroker');
        const fullSurvey = getCheckboxValue('fullSurvey');
        const needsRemovals = getCheckboxValue('removals');
        const needsStorage = getCheckboxValue('storage');
        const isLeasehold = getCheckboxValue('isLeasehold');

        console.log('Calculating with options:', {
            usesBroker,
            needsRemovals,
            needsStorage,
            isLeasehold
        });

        // Calculate deposit
        const deposit = (propertyPrice * depositPercentage) / 100;

        // Calculate stamp duty
        const stampDuty = calculateStampDuty(propertyPrice, isFirstTimeBuyer);

        // Calculate one-time costs
        const legalFees = 1600;
        const surveyFees = fullSurvey ? 800 : 400;
        const brokerFees = usesBroker ? 750 : 0;
        const removalsCost = needsRemovals ? 1000 : 0;

        // Calculate monthly costs
        const monthlyPayment = calculateMonthlyMortgage(propertyPrice - deposit, interestRate, mortgageTerm);
        const monthlyInsurance = 25;
        const serviceCharge = isLeasehold ? 150 : 0;
        const maintenance = 100;
        const storageCost = needsStorage ? 75 : 0;

        // Calculate total interest
        const totalPayments = monthlyPayment * mortgageTerm * 12;
        const totalInterest = totalPayments - (propertyPrice - deposit);

        // Calculate total upfront costs
        const upfrontCosts = deposit + stampDuty + legalFees + surveyFees + brokerFees + removalsCost;

        // Calculate total monthly costs
        const totalMonthlyCosts = monthlyPayment + monthlyInsurance + serviceCharge + maintenance + storageCost;

        // Calculate total one-time costs
        const totalOneTimeCosts = upfrontCosts;

        // Calculate other costs for the pie chart
        const otherCosts = brokerFees + removalsCost + (fullSurvey ? 400 : 0);

        console.log('Calculation results:', {
            totalMonthlyCosts,
            totalOneTimeCosts,
            brokerFees,
            removalsCost,
            storageCost
        });

        return {
            propertyPrice,
            depositPercentage,
            mortgageTerm,
            interestRate,
            isFirstTime: isFirstTimeBuyer,
            usesBroker,
            fullSurvey,
            needsRemovals,
            needsStorage,
            isLeasehold,
            deposit,
            stampDuty,
            legalFees,
            surveyFees,
            brokerFees,
            removalsCost,
            monthlyPayment,
            monthlyInsurance,
            serviceCharge,
            maintenance,
            storageCost,
            totalInterest,
            upfrontCosts,
            otherCosts,
            totalMonthlyCosts,
            totalOneTimeCosts
        };
    } catch (error) {
        console.error('Error calculating costs:', error);
        throw error;
    }
}

function calculateStampDuty(propertyPrice, isFirstTimeBuyer) {
    if (isFirstTimeBuyer && propertyPrice <= 425000) {
        return 0;
    }

    let stampDuty = 0;
    const bands = [
        { threshold: 250000, rate: 0.05 },
        { threshold: 925000, rate: 0.1 },
        { threshold: 1500000, rate: 0.12 },
        { threshold: Infinity, rate: 0.14 }
    ];

    let remainingAmount = propertyPrice;
    let previousThreshold = isFirstTimeBuyer ? 425000 : 0;

    for (const band of bands) {
        if (remainingAmount > 0) {
            const amountInBand = Math.min(remainingAmount, band.threshold - previousThreshold);
            stampDuty += amountInBand * band.rate;
            remainingAmount -= amountInBand;
            previousThreshold = band.threshold;
        }
    }

    return Math.round(stampDuty);
}

function calculateMonthlyMortgage(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / totalPayments;
    }
    
    const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return Math.round(monthlyPayment);
}

// Helper functions to get form values
function getInputValue(id) {
    const input = document.getElementById(id);
    if (!input) {
        console.error(`Input element with id '${id}' not found`);
        return 0;
    }
    return parseFloat(input.value) || 0;
}

function getSelectValue(id) {
    const select = document.getElementById(id);
    if (!select) {
        console.error(`Select element with id '${id}' not found`);
        return 25; // Default to 25 years if not found
    }
    return parseInt(select.value) || 25;
}

function getCheckboxValue(id) {
    const checkbox = document.getElementById(id);
    if (!checkbox) {
        console.error(`Checkbox element with id '${id}' not found`);
        return false;
    }
    return checkbox.checked;
}
