// Event handlers with debouncing and better event delegation
import { calculateAllCosts } from './calculations.js';
import { updateUI } from './ui.js';
import { generatePDF } from './export.js';

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Handle calculations with debouncing
const debouncedCalculation = debounce(async () => {
    try {
        console.log('Recalculating costs...');
        const results = await calculateAllCosts();
        console.log('Calculation results:', results);
        await updateUI(results);
    } catch (error) {
        console.error('Error in calculation:', error);
    }
}, 300);

export function initializeEventListeners() {
    setupInputListeners();
    setupSelectListeners();
    setupOptionCards();
    setupShareModal();
    setupExportButton();
}

function setupInputListeners() {
    // Use event delegation for better performance
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (target.matches('input[type="number"]')) {
            validateNumberInput(target);
            debouncedCalculation();
        }
    });
}

function setupSelectListeners() {
    const mortgageTermSelect = document.getElementById('mortgageTerm');
    if (mortgageTermSelect) {
        mortgageTermSelect.addEventListener('change', () => {
            console.log('Mortgage term changed:', mortgageTermSelect.value);
            debouncedCalculation();
        });
    }
}

function setupOptionCards() {
    const optionsGrid = document.querySelector('.options-grid');
    if (optionsGrid) {
        // Handle checkbox changes
        optionsGrid.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                console.log(`Option changed: ${checkbox.id} = ${checkbox.checked}`);
                debouncedCalculation();
            }
        });

        // Handle card clicks
        optionsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.option-card');
            if (card) {
                const checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox && e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }
}

function validateNumberInput(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    if (!isNaN(min) && value < min) {
        input.value = min;
    }
    if (!isNaN(max) && value > max) {
        input.value = max;
    }
}

function setupShareModal() {
    const shareBtn = document.getElementById('shareButton');
    const shareModal = document.getElementById('shareModal');
    
    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', () => {
            shareModal.style.display = 'flex';
            setTimeout(() => shareModal.classList.add('show'), 10);
        });

        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.remove('show');
                setTimeout(() => {
                    shareModal.style.display = 'none';
                }, 300);
            }
        });

        setupShareButtons(shareModal);
    }
}

function setupShareButtons(modal) {
    const copyBtn = modal.querySelector('.btn-primary');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const input = modal.querySelector('input');
            input.select();
            document.execCommand('copy');
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('success');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('success');
            }, 2000);
        });
    }

    // Social share buttons
    const shareButtons = modal.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Check out this mortgage calculator!');
            
            let shareUrl = '';
            if (btn.classList.contains('facebook')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            } else if (btn.classList.contains('twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            } else if (btn.classList.contains('whatsapp')) {
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
            } else if (btn.classList.contains('email')) {
                shareUrl = `mailto:?subject=${text}&body=${url}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank');
            }
        });
    });
}

function setupExportButton() {
    const exportBtn = document.getElementById('exportPDF');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                exportBtn.disabled = true;
                exportBtn.textContent = 'Generating PDF...';
                await generatePDF();
            } catch (error) {
                console.error('Error generating PDF:', error);
            } finally {
                exportBtn.disabled = false;
                exportBtn.textContent = 'Export Report';
            }
        });
    }
}
