// PDF export functionality
export async function generatePDF() {
    // Create a clean summary div
    const summaryDiv = document.createElement('div');
    summaryDiv.style.padding = '20px';
    summaryDiv.style.maxWidth = '800px';
    summaryDiv.style.margin = '0 auto';
    summaryDiv.style.fontFamily = 'Arial, sans-serif';

    // Get current values
    const propertyPrice = document.getElementById('propertyPrice').value;
    const deposit = document.getElementById('deposit').value;
    const mortgageTerm = document.getElementById('mortgageTerm').value;
    const interestRate = document.getElementById('interestRate').value;
    const monthlyPayment = document.querySelector('.metric-value').textContent;
    const ltvRatio = document.querySelectorAll('.metric-value')[2].textContent;

    // Create summary HTML
    summaryDiv.innerHTML = `
        <h1 style="color: #2196F3; margin-bottom: 30px;">Mortgage Summary</h1>
        
        <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Property Details</h2>
            <p><strong>Property Price:</strong> £${propertyPrice}</p>
            <p><strong>Deposit:</strong> £${deposit}</p>
            <p><strong>LTV Ratio:</strong> ${ltvRatio}</p>
        </div>

        <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Mortgage Details</h2>
            <p><strong>Term:</strong> ${mortgageTerm} years</p>
            <p><strong>Interest Rate:</strong> ${interestRate}%</p>
            <p><strong>Monthly Payment:</strong> ${monthlyPayment}</p>
        </div>

        <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Additional Costs</h2>
            <p><strong>Legal Fees:</strong> £${document.getElementById('legalFees').textContent}</p>
            <p><strong>Survey & Valuation:</strong> £${document.getElementById('surveyFees').textContent}</p>
        </div>

        <div style="font-size: 12px; color: #666; margin-top: 40px; text-align: center;">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>This is a summary of your mortgage calculation. For detailed information and professional advice, please consult with a mortgage advisor.</p>
        </div>
    `;

    // PDF options
    const opt = {
        margin: 1,
        filename: 'mortgage-summary.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    try {
        const element = summaryDiv;
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}
