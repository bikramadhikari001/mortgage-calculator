// Chart initialization and updates
let costsChart = null;
let comparisonChart = null;

const chartColors = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    gray: '#6b7280'
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 750,
        easing: 'easeOutQuart'
    },
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleFont: {
                size: 14,
                weight: 'bold',
                family: "'Inter', sans-serif"
            },
            bodyFont: {
                size: 13,
                family: "'Inter', sans-serif"
            },
            callbacks: {
                label: (context) => {
                    return ` £${context.raw.toLocaleString()}`;
                }
            }
        }
    }
};

export async function initializeCharts() {
    try {
        console.log('Initializing charts...');
        await Promise.all([
            initializeCostsChart(),
            initializeComparisonChart()
        ]);
        return true;
    } catch (error) {
        console.error('Failed to initialize charts:', error);
        return false;
    }
}

async function initializeCostsChart() {
    const canvas = document.getElementById('costsChart');
    if (!canvas) {
        throw new Error('Costs chart canvas not found');
    }

    costsChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: [
                'Initial Deposit',
                'Stamp Duty Tax',
                'Legal & Admin Fees',
                'Additional Costs'
            ],
            datasets: [{
                data: [25000, 0, 1600, 2100],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.gray
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            ...chartOptions,
            cutout: '70%',
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return [
                                ` Amount: £${context.raw.toLocaleString()}`,
                                ` Percentage: ${percentage}% of total costs`
                            ];
                        }
                    }
                }
            }
        }
    });
}

async function initializeComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) {
        throw new Error('Comparison chart canvas not found');
    }

    comparisonChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: [
                'Monthly Mortgage Payment',
                'Total Interest Over Term',
                'Initial Upfront Costs'
            ],
            datasets: [{
                label: 'Current Plan',
                data: [1250, 150000, 28700],
                backgroundColor: chartColors.primary
            }, {
                label: 'Alternative (5% Deposit)',
                data: [1400, 168000, 15000],
                backgroundColor: chartColors.success
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: value => '£' + value.toLocaleString(),
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    },
                    title: {
                        display: true,
                        text: 'Amount in GBP (£)',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                }
            }
        }
    });
}

export function updateCharts(data) {
    try {
        console.log('Updating charts with data:', data);
        
        if (costsChart) {
            // Update costs breakdown chart
            const costsData = [
                data.deposit,
                data.stampDuty,
                data.legalFees,
                // Include all additional costs in the "Additional Costs" segment
                data.brokerFees + data.removalsCost + data.surveyFees
            ];

            costsChart.data.datasets[0].data = costsData;
            costsChart.update('show');
        }

        if (comparisonChart) {
            // Update comparison chart
            const currentData = [
                data.monthlyPayment,
                data.totalInterest,
                data.totalOneTimeCosts
            ];

            // Calculate 5% deposit scenario
            const fivePercentDeposit = data.propertyPrice * 0.05;
            const fivePercentMortgage = data.propertyPrice - fivePercentDeposit;
            const fivePercentMonthly = calculateMonthlyMortgage(fivePercentMortgage, data.interestRate + 0.5, data.mortgageTerm);
            const fivePercentTotal = (fivePercentMonthly * data.mortgageTerm * 12) - fivePercentMortgage;

            const alternativeData = [
                fivePercentMonthly,
                fivePercentTotal,
                fivePercentDeposit + data.stampDuty + data.legalFees + data.otherCosts
            ];

            comparisonChart.data.datasets[0].data = currentData;
            comparisonChart.data.datasets[1].data = alternativeData;
            comparisonChart.update('show');
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function calculateMonthlyMortgage(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    return principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
}
