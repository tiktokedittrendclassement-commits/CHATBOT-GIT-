
(function () {
    const script = document.currentScript;
    const chatbotId = script.getAttribute('data-chatbot-id');
    const baseUrl = script.src.split('/embed.js')[0];
    // Should allow testing on localhost if src is http://localhost...
    // Or hardcode for now.

    if (!chatbotId) {
        console.error('UseVendo: No data-chatbot-id attribute found on script tag.');
        return;
    }

    // Styles for the Bubble
    const bubble = document.createElement('div');
    bubble.style.position = 'fixed';
    bubble.style.bottom = '20px';
    bubble.style.right = '20px';
    bubble.style.width = '60px';
    bubble.style.height = '60px';
    bubble.style.borderRadius = '50%';
    bubble.style.backgroundColor = '#4f46e5'; // Default color, ideally fetched or generic
    bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    bubble.style.cursor = 'pointer';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'center';
    bubble.style.zIndex = '999999';
    bubble.style.transition = 'transform 0.2s ease';

    // Icon (SVG)
    bubble.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

    // Iframe Container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.position = 'fixed';
    iframeContainer.style.bottom = '90px';
    iframeContainer.style.right = '20px';
    iframeContainer.style.width = '380px'; // Standard width
    iframeContainer.style.height = '600px';
    iframeContainer.style.maxHeight = 'calc(100vh - 120px)';
    iframeContainer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    iframeContainer.style.borderRadius = '16px';
    iframeContainer.style.overflow = 'hidden';
    iframeContainer.style.zIndex = '999999';
    iframeContainer.style.display = 'none'; // Hidden by default
    iframeContainer.style.opacity = '0';
    iframeContainer.style.transform = 'translateY(20px)';
    iframeContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    // Iframe
    const iframe = document.createElement('iframe');
    // Use absolute URL. For production, change this to 'https://usevendo.com'
    // For development, we assume this script is loaded from the same origin or we hardcode.
    // We'll use the origin derived from the script src.
    const iframeUrl = `${baseUrl}/embed/${chatbotId}`;
    iframe.src = iframeUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    iframeContainer.appendChild(iframe);
    document.body.appendChild(bubble);
    document.body.appendChild(iframeContainer);

    // Toggle Logic
    let isOpen = false;
    bubble.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.style.display = 'block';
            // Small timeout to allow display block to apply before transition
            setTimeout(() => {
                iframeContainer.style.opacity = '1';
                iframeContainer.style.transform = 'translateY(0)';
            }, 10);
            bubble.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
        } else {
            iframeContainer.style.opacity = '0';
            iframeContainer.style.transform = 'translateY(20px)';
            setTimeout(() => {
                iframeContainer.style.display = 'none';
            }, 300);
            bubble.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
        }
    });

})();
