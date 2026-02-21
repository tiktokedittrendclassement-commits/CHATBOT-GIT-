
(function () {
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const baseUrl = script.src.split('/embed.js')[0];

  if (!chatbotId) {
    console.error('UseVendo: No data-chatbot-id attribute found on script tag.');
    return;
  }

  // Inject keyframes
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes vendo-slide-in {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // === BUBBLE BUTTON ===
  const bubble = document.createElement('div');
  bubble.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #673DE6 0%, #9B5CF6 100%);
    box-shadow: 0 12px 24px rgba(103, 61, 230, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  // Desktop adjustment for position
  if (window.innerWidth > 768) {
    bubble.style.bottom = '32px';
    bubble.style.right = '32px';
  }

  // Letter label
  const letterSpan = document.createElement('span');
  letterSpan.style.cssText = `
    font-family: Inter, -apple-system, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 28px;
    color: white;
    line-height: 1;
    user-select: none;
  `;
  letterSpan.textContent = 'V'; // default, will be updated

  // Green dot
  const greenDot = document.createElement('div');
  greenDot.style.cssText = `
    position: absolute;
    top: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: #10B981;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const bubbleInner = document.createElement('div');
  bubbleInner.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;';
  bubbleInner.appendChild(letterSpan);
  bubble.appendChild(bubbleInner);
  bubble.appendChild(greenDot);

  // Close icon (hidden by default)
  const closeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  bubble.addEventListener('mouseenter', () => {
    if (!isOpen) bubble.style.transform = 'translateY(-5px) scale(1.05)';
  });
  bubble.addEventListener('mouseleave', () => {
    if (!isOpen) bubble.style.transform = 'translateY(0) scale(1)';
  });

  // === IFRAME CONTAINER ===
  const iframeContainer = document.createElement('div');
  iframeContainer.style.cssText = `
    position: fixed;
    bottom: 104px;
    right: 24px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 120px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
    border-radius: 28px;
    overflow: hidden;
    z-index: 999998;
    display: none;
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    transition: opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  // Iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/embed/${chatbotId}`;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';

  iframeContainer.appendChild(iframe);
  document.body.appendChild(bubble);
  document.body.appendChild(iframeContainer);

  // Listen for bot config from iframe to update bubble color & letter
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'vendo-bot-config') {
      const { name, color } = event.data;
      if (name) letterSpan.textContent = name.charAt(0).toUpperCase();
      if (color) {
        bubble.style.background = `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;
        bubble.style.boxShadow = `0 20px 40px ${color}55`;
      }
    }
  });

  // Toggle Logic
  let isOpen = false;
  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      if (teaserBubble) teaserBubble.style.display = 'none';
      setTimeout(() => {
        iframeContainer.style.opacity = '1';
        iframeContainer.style.transform = 'translateY(0) scale(1)';
      }, 10);
      // Show X icon
      bubbleInner.innerHTML = closeIcon;
      bubble.style.transform = 'scale(1)';
    } else {
      iframeContainer.style.opacity = '0';
      iframeContainer.style.transform = 'translateY(30px) scale(0.95)';
      setTimeout(() => { iframeContainer.style.display = 'none'; }, 400);
      // Restore letter + dot
      bubbleInner.innerHTML = '';
      bubbleInner.appendChild(letterSpan);
      bubbleInner.appendChild(greenDot);
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
