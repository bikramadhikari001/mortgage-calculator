// Main application initialization
import { initializeEventListeners } from './events.js';
import { initializeCharts } from './charts.js';
import { calculateAllCosts } from './calculations.js';
import { updateUI } from './ui.js';

export async function initializeCalculator() {
    console.log('Initializing calculator...');
    
    try {
        await initializeCharts();
        console.log('Initializing charts...');
        
        initializeEventListeners();
        console.log('Setting up event listeners...');
        
        setupShareModal();
        
        // Perform initial calculation
        console.log('Performing initial calculation...');
        const results = await calculateAllCosts();
        console.log('Initial calculation results:', results);
        
        // Update UI with results
        console.log('Updating UI...');
        await updateUI(results);
        
    } catch (error) {
        console.error('Error initializing calculator:', error);
    }
}

function setupShareModal() {
    const shareButton = document.getElementById('shareButton');
    const shareModal = document.getElementById('shareModal');
    const shareButtons = document.querySelectorAll('.share-btn');
    const copyLinkButton = shareModal.querySelector('.btn-primary');
    const linkInput = shareModal.querySelector('input');

    // Show modal when share button is clicked
    shareButton.addEventListener('click', () => {
        shareModal.style.display = 'flex';
        setTimeout(() => shareModal.classList.add('show'), 10);
    });

    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('show');
            setTimeout(() => shareModal.style.display = 'none', 300);
        }
    });

    // Handle social share buttons
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
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
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // Copy link functionality
    copyLinkButton.addEventListener('click', () => {
        linkInput.select();
        document.execCommand('copy');
        
        const originalText = copyLinkButton.textContent;
        copyLinkButton.textContent = 'Copied!';
        copyLinkButton.classList.add('success');
        
        setTimeout(() => {
            copyLinkButton.textContent = originalText;
            copyLinkButton.classList.remove('success');
        }, 2000);
    });

    // Update share link with current URL
    linkInput.value = window.location.href;
}
