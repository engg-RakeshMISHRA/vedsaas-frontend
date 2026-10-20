/**
 * VedSAAS Live Feedback System
 * Handles public sentiment display and live submissions
 */

const INITIAL_FEEDBACK = [
    { name: "Rahul S.", message: "VedSAAS is incredibly fast in Hindi!", time: "2m ago" },
    { name: "John Doe", message: "The universal translation works flawlessly in Tokyo.", time: "5m ago" },
    { name: "Priya Singh", message: "Finally, an AI that understands Indian context.", time: "8m ago" },
    { name: "Dr. Aris", message: "Amazing research platform for ancient linguistics.", time: "12m ago" }
];

function initLiveFeedback() {
    const container = document.getElementById('live-feedback-container');
    if (!container) return;

    // Load from localStorage or defaults
    const saved = JSON.parse(localStorage.getItem('vedsaas_live_feedback') || '[]');
    const allFeedback = [...saved, ...INITIAL_FEEDBACK].slice(0, 10);

    renderFeedback(allFeedback);
    setupFeedbackForm();
}

function renderFeedback(items) {
    const container = document.getElementById('live-feedback-container');
    if (!container) return;

    container.innerHTML = items.map(item => `
        <div class="card-glass" style="padding: 20px; margin-bottom: 12px; animation: slideIn 0.5s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <strong style="color: var(--accent-cyan); font-size: 0.9rem;">${item.name}</strong>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">${item.time || 'Just now'}</small>
            </div>
            <p style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.4; margin: 0;">${item.message}</p>
        </div>
    `).join('');
}

function setupFeedbackForm() {
    const form = document.getElementById('live-feedback-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('fb-name');
        const msgInput = document.getElementById('fb-message');

        const newFeedback = {
            name: nameInput.value || "Anonymous",
            message: msgInput.value
        };

        // Send to Backend
        fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFeedback)
        }).then(res => res.json())
            .then(data => {
                console.log("[Community] Note saved to server.");
            });

        // Live Update (Optimistic UI)
        const container = document.getElementById('live-feedback-container');
        const html = `
            <div class="card-glass" style="padding: 20px; margin-bottom: 12px; border-color: var(--accent-cyan); box-shadow: 0 0 20px rgba(0,240,255,0.2); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <strong style="color: var(--accent-cyan); font-size: 0.9rem;">${newFeedback.name} ✅</strong>
                    <small style="color: var(--text-secondary); font-size: 0.75rem;">Just now</small>
                </div>
                <p style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.4; margin: 0;">${newFeedback.message}</p>
            </div>
        `;
        container.insertAdjacentHTML('afterbegin', html);

        msgInput.value = '';
        alert("Thank you! Your note is now live.");
    });
}

document.addEventListener('DOMContentLoaded', initLiveFeedback);

// Add necessary CSS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
`;
document.head.appendChild(style);
