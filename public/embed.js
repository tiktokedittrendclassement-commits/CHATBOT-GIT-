
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
  const style = document.createElement('style');
  style.innerHTML = `
      @keyframes vendo-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
  document.head.appendChild(style);

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
  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      // Hide teaser if open
      if (teaserBubble) teaserBubble.style.display = 'none';

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
  };

  bubble.addEventListener('click', toggleChat);

  // Teaser Bubble Logic
  let teaserBubble = null;

  window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'vendo-proactive-message') {
      // We can check if it's for OUR bot 
      // Storing these globally so showTeaser can access them. 
      // In a cleaner implementation we'd pass them as args.
      window.vendoSenderName = event.data.sender;
      window.vendoAvatarUrl = event.data.avatar;
      showTeaser(event.data.message);
    }

    if (event.data.type === 'vendo-init-triggers') {
      const triggers = event.data.triggers;
      if (!triggers || !Array.isArray(triggers)) return;

      triggers.forEach(trigger => {
        // Check if trigger was already executed in this session
        const storageKey = `vendo_trigger_${trigger.id || trigger.message}`; // Fallback to message hash if no ID
        if (sessionStorage.getItem(storageKey)) return;

        // Check if trigger is restricted to a specific page
        if (trigger.page && !window.location.href.includes(trigger.page)) return;

        const executeTrigger = () => {
          if (sessionStorage.getItem(storageKey)) return; // Double check
          showTeaser(trigger.message);
          sessionStorage.setItem(storageKey, 'true');
        };

        if (trigger.type === 'time') {
          setTimeout(executeTrigger, (parseInt(trigger.value) || 5) * 1000);
        } else if (trigger.type === 'scroll') {
          const onScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= parseInt(trigger.value)) {
              executeTrigger();
              window.removeEventListener('scroll', onScroll);
            }
          };
          // Check immediately in case we are already scrolled
          onScroll();
          window.addEventListener('scroll', onScroll);
        }
      });
    }
  });

  // State for auto-dismiss
  let autoCloseTimer = null;
  let scrollDismissListener = null;

  function showTeaser(text) {
    if (isOpen) return; // Don't show if already open
    if (sessionStorage.getItem(`vendo_teaser_seen_${chatbotId}`)) return; // Only show once per session

    // cleanup previous if exists
    removeTeaser();

    teaserBubble = document.createElement('div');
    Object.assign(teaserBubble.style, {
      position: 'fixed',
      bottom: '100px',
      right: '25px',
      width: '300px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 36px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      zIndex: '999998',
      cursor: 'pointer',
      opacity: '0',
      transform: 'translateY(20px) scale(0.95)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    });

    const senderName = window.vendoSenderName || 'Assistant Vendo';
    const avatarHtml = window.vendoAvatarUrl
      ? `<img src="${window.vendoAvatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
      : `<div style="width: 100%; height: 100%; background: #673DE6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>`;

    teaserBubble.innerHTML = `
            <div style="padding: 16px 20px; display: flex; gap: 14px; align-items: flex-start;">
                <div style="position: relative; flex-shrink: 0; width: 44px; height: 44px;">
                    ${avatarHtml}
                    <div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%;"></div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px;">${senderName}</div>
                    <div style="font-size: 13px; color: #4b5563; line-height: 1.4;">${text}</div>
                </div>
                 <button id="vendo-close-teaser" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; padding: 4px; margin-top: -4px; margin-right: -8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div style="padding: 12px 20px; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between;">
                 <span style="font-size: 11px; color: #6b7280; font-weight: 500;">À l'instant</span>
                 <div style="font-size: 12px; font-weight: 600; color: #673DE6; display: flex; align-items: center; gap: 4px;">
                    Répondre <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
                 </div>
            </div>
        `;

    // Handle clicks
    teaserBubble.querySelector('#vendo-close-teaser').onclick = (e) => {
      e.stopPropagation();
      removeTeaser();
    };

    teaserBubble.onclick = (e) => {
      // Don't trigger if close button was clicked (handled above)
      if (!e.target.closest('#vendo-close-teaser')) {
        toggleChat();
        removeTeaser();
      }
    };

    document.body.appendChild(teaserBubble);

    // Animate in
    requestAnimationFrame(() => {
      if (teaserBubble) {
        teaserBubble.style.opacity = '1';
        teaserBubble.style.transform = 'translateY(0) scale(1)';
      }
    });

    // Mark as seen
    sessionStorage.setItem(`vendo_teaser_seen_${chatbotId}`, 'true');

    // 1. Auto-close after 5 seconds
    autoCloseTimer = setTimeout(() => {
      removeTeaser();
    }, 5000);

    // 2. Auto-close if user scrolls away from trigger point (pixels)
    const startScrollY = window.scrollY;
    scrollDismissListener = () => {
      if (Math.abs(window.scrollY - startScrollY) > 150) { // 150px threshold
        removeTeaser();
      }
    };
    window.addEventListener('scroll', scrollDismissListener);
  }

  // 3. Auto-close on SPA Navigation (URL change)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      removeTeaser();
    }
  }).observe(document, { subtree: true, childList: true });

  // Fallback signature for history API to catch programmatic navigation
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    removeTeaser();
  };
  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    removeTeaser();
  };
  window.addEventListener('popstate', () => {
    removeTeaser();
  });

  function removeTeaser() {
    // Clear auto-dismiss logic
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    if (scrollDismissListener) {
      window.removeEventListener('scroll', scrollDismissListener);
      scrollDismissListener = null;
    }

    if (teaserBubble) {
      teaserBubble.style.opacity = '0';
      teaserBubble.style.transform = 'translateY(10px)';
      const el = teaserBubble; // capture reference
      teaserBubble = null; // clear global ref immediately

      setTimeout(() => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 300);
    }
  }

})();
