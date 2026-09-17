/* Custom styles for School Food Ticket Booking Web App */
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

:root {
  --font-prompt: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  font-family: var(--font-prompt);
  background-color: #f8fafc;
  color: #0f172a;
  -webkit-tap-highlight-color: transparent;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ticket Stub Design */
.ticket-card {
  position: relative;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.ticket-card::before,
.ticket-card::after {
  content: '';
  position: absolute;
  top: 60%;
  width: 24px;
  height: 24px;
  background-color: #f8fafc; /* Matches page background */
  border-radius: 50%;
  z-index: 10;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.08);
}

.ticket-card::before {
  left: -12px;
  border-right: 1px solid #e2e8f0;
}

.ticket-card::after {
  right: -12px;
  border-left: 1px solid #e2e8f0;
}

.ticket-divider {
  position: relative;
  border-top: 2px dashed #cbd5e1;
  margin: 1rem 0;
}

/* Status Elevation */
.status-active {
  border-color: #059669;
}

.status-redeemed {
  opacity: 0.8;
  filter: grayscale(0.1);
}

/* Scanner Viewfinder overlay */
.scanner-overlay {
  position: relative;
}

.scanner-overlay::before {
  content: '';
  position: absolute;
  inset: 15%;
  border: 3px solid #10b981;
  border-radius: 1rem;
  box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65);
  animation: pulse-border 2s infinite ease-in-out;
}

@keyframes pulse-border {
  0%, 100% { border-color: #059669; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65); }
  50% { border-color: #10b981; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.75); }
}

.scan-line {
  position: absolute;
  left: 15%;
  right: 15%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan-move 2s infinite linear;
  z-index: 20;
}

@keyframes scan-move {
  0% { top: 15%; }
  50% { top: 85%; }
  100% { top: 15%; }
}

/* Print Stylesheet */
@media print {
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  header, footer, nav, .no-print {
    display: none !important;
  }
  .print-only-ticket {
    display: block !important;
    box-shadow: none !important;
    border: 2px solid #000000 !important;
    width: 100% !important;
    max-width: 450px !important;
    margin: 0 auto !important;
  }
}
