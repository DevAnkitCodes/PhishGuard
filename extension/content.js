// ============================================================
//  PHISHGUARD AI - GMAIL CONTENT SCRIPT (Render Version)
// ============================================================

// 🔁 REPLACE THIS URL with your actual Render backend URL provided by the Render Dashboard
const BASE_URL = "https://your-app-name.onrender.com"; 
const API_URL = `${BASE_URL}/analyze`;

/**
 * Injects the PhishGuard button into the Gmail toolbar.
 * Targets both the Inbox list view and the individual Email view.
 */
function injectButton() {
    // Target common Gmail toolbar containers (.amH, .nk, .adC, .G-atb)
    const navContainer = document.querySelector('.amH, .nk, .adC, .G-atb');
    
    if (!navContainer) return;

    const existingBtn = document.querySelector('.phishguard-btn');

    // Handle button persistence during Gmail UI swaps
    if (existingBtn) {
        if (existingBtn.parentElement !== navContainer.parentNode) {
            existingBtn.remove();
        } else {
            return; 
        }
    }

    const btn = document.createElement('button');
    btn.className = "phishguard-btn";
    btn.innerHTML = `
        <svg style="margin-right: 6px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>Analyze It</span>
    `;

    // Professional UI Styling matching Google's Design Language
    Object.assign(btn.style, {
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "5px 14px",
        marginRight: "15px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "12px",
        fontFamily: "Google Sans, Roboto, sans-serif",
        display: "inline-flex",
        alignItems: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        zIndex: "9999",
        height: "32px",
        alignSelf: "center",
        transition: "background-color 0.2s"
    });

    // Interaction Effects
    btn.onmouseover = () => btn.style.backgroundColor = "#1d4ed8";
    btn.onmouseout = () => btn.style.backgroundColor = "#2563eb";

    // Injection before navigation arrows
    navContainer.parentNode.insertBefore(btn, navContainer);
}

/**
 * Event Listener for the Analyze button.
 * Scrapes email body and sender info to send to the Flask Backend.
 */
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.phishguard-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const btnText = btn.querySelector('span');
    const originalText = btnText.innerText;
    
    // UI Feedback: Loading state
    btnText.innerText = "Analyzing...";
    btn.disabled = true;
    btn.style.opacity = "0.8";

    try {
        // Scrape Gmail DOM for content
        const emailBody = document.querySelector('.a3s, .adn, .ii.gt');
        const senderInfo = document.querySelector('.gD, .iw .gD, [email]');

        if (!emailBody) {
            alert("❌ Analysis Failed: Please make sure the email is fully open and visible.");
            return;
        }

        const payload = {
            content: emailBody.innerText.trim(),
            sender: senderInfo ? (senderInfo.getAttribute('email') || senderInfo.innerText) : "Unknown Sender"
        };

        // REST API call to Render Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Server communication failed");

        const data = await response.json();
        
        // HYBRID VERDICT LOGIC: Checks both score and AI-generated status
        const isPhishing = data.status.toLowerCase().includes('phishing') || 
                           data.status.toLowerCase().includes('threat');
        
        const verdict = isPhishing ? '⚠️ PHISHING DETECTED' : '✅ SECURE';
        
        // Final Alert Report
        alert(`🛡️ PHISHGUARD REPORT\n\nScore: ${data.score}%\nVerdict: ${verdict}\n\nReason: ${data.explanation}`);

    } catch (error) {
        console.error("PhishGuard Error:", error);
        // Inform user about Render's "Cold Start" (Spin-up time)
        alert("❌ Connection Error: The PhishGuard cloud engine is unreachable. If this is the first run, the server may be 'waking up'—please try again in 30 seconds.");
    } finally {
        // UI Restoration
        btnText.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
});

// Dynamic Monitoring for Single Page App (SPA) navigation
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });

// Initialization
injectButton();
setInterval(injectButton, 2000);