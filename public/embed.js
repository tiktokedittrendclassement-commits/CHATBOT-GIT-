
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
    @keyframes vendo-slide-in-up-premium {
      0% { opacity: 0; transform: translateY(40px) scale(0.95) rotateX(10deg); }
      100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
    }
    @keyframes vendo-online-pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
  `;
  document.head.appendChild(style);

  // === BUBBLE BUTTON ===
  const bubble = document.createElement('div');
  bubble.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: linear-gradient(135deg, #673DE6 0%, #9B5CF6 100%);
    box-shadow: 0 12px 24px rgba(103, 61, 230, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    visibility: hidden;
  `;

  // Desktop adjustment for position
  if (window.innerWidth > 768) {
    bubble.style.bottom = '32px';
    bubble.style.right = '32px';
  }

  // Letter label
  const letterSpan = document.createElement('span');
  letterSpan.style.cssText = `
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 28px;
    color: white;
    user-select: none;
  `;
  letterSpan.textContent = ''; // Empty until config received
  // default, will be updated

  // Green dot
  const greenDot = document.createElement('div');
  greenDot.style.cssText = `
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
  `;

  const bubbleInner = document.createElement('div');
  bubbleInner.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;';
  bubbleInner.appendChild(letterSpan);
  bubble.appendChild(bubbleInner);
  bubble.appendChild(greenDot);

  // Close icon (hidden by default)
  const closeIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  const botIcon = '<div style="font-family: \'Inter\', sans-serif; font-weight: 900; font-style: italic; font-size: 32px; color: white;">V</div>';

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
    bottom: 30px;
    right: 32px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 60px);
    box-shadow: 0 30px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    border-radius: 28px;
    overflow: hidden;
    z-index: 999998;
    display: none;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-origin: bottom right;
  `;

  // Iframe
  const iframe = document.createElement('iframe');
  const currentUrl = encodeURIComponent(window.location.href);
  iframe.src = `${baseUrl}/embed/${chatbotId}?u=${currentUrl}`;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';

  iframeContainer.appendChild(iframe);
  document.body.appendChild(bubble);
  document.body.appendChild(iframeContainer);

  // Consolidated Message Listener
  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;

    // console.log('UseVendo: Message received:', event.data.type);

    switch (event.data.type) {
      case 'vendo-bot-config':
        const { name, color, avatar, theme } = event.data;
        window.vendoBotName = name;
        window.vendoBotColor = color;
        window.vendoBotAvatar = avatar;
        window.vendoBotTheme = theme;

        bubbleInner.innerHTML = '';
        if (avatar === 'ICON:BOT') {
          bubbleInner.innerHTML = botIcon;
        } else if (avatar && (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:'))) {
          bubbleInner.innerHTML = `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
        } else {
          const letter = (avatar && avatar.length <= 2) ? avatar.toUpperCase() : (name || 'V').substring(0, 2).toUpperCase();
          letterSpan.textContent = letter;
          letterSpan.style.fontSize = letter.length > 1 ? '22px' : '28px';
          bubbleInner.appendChild(letterSpan);
        }
        bubbleInner.appendChild(greenDot);

        if (color) {
          bubble.style.background = `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
          bubble.style.boxShadow = `0 12px 24px ${color}33`;
        }

        bubble.style.visibility = 'visible';
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0) scale(1)';
        break;

      case 'vendo-visitor-id':
        console.log('UseVendo: Visitor ID received:', event.data.visitorId);
        sessionStorage.setItem('vendo_visitor_id', event.data.visitorId);
        sessionStorage.setItem('vendo_active_chatbot_id', event.data.chatbotId);
        break;

      case 'vendo-toggle-chat':
        toggleChat();
        break;

      case 'vendo-proactive-message':
        window.vendoSenderName = event.data.sender;
        window.vendoAvatarUrl = event.data.avatar;
        showTeaser(event.data.message);
        break;

      case 'vendo-init-triggers':
        const triggers = event.data.triggers;
        if (!triggers || !Array.isArray(triggers)) return;
        triggers.forEach(trigger => {
          const sessionKey = `vendo_trigger_sent_session_${trigger.id || trigger.message}`;
          const persistentKey = `vendo_trigger_sent_forever_${trigger.id || trigger.message}`;

          // If restricted to once per user (forever), check localStorage
          if (trigger.oncePerUser && localStorage.getItem(persistentKey)) return;

          // Otherwise check session storage (default behavior for repeat visitors in same session)
          if (sessionStorage.getItem(sessionKey)) return;

          if (trigger.page && !window.location.href.includes(trigger.page)) return;

          const executeTrigger = () => {
            if (trigger.oncePerUser && localStorage.getItem(persistentKey)) return;
            if (sessionStorage.getItem(sessionKey)) return;

            showTeaser(trigger.message, trigger);

            // Mark as sent
            sessionStorage.setItem(sessionKey, 'true');
            if (trigger.oncePerUser) {
              localStorage.setItem(persistentKey, 'true');
            }
          };

          if (trigger.type === 'time') {
            setTimeout(executeTrigger, (parseInt(trigger.spawn) || 5) * 1000);
          } else if (trigger.type === 'scroll') {
            const onScroll = () => {
              const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
              if (scrollPercent >= parseInt(trigger.spawn)) {
                executeTrigger();
                window.removeEventListener('scroll', onScroll);
              }
            };
            onScroll();
            window.addEventListener('scroll', onScroll);
          }
        });
        break;
    }
  });

  // Global Tracking API
  window.Vendo = {
    recordSale: async function (amount, currency = 'EUR') {
      const visitorId = sessionStorage.getItem('vendo_visitor_id');
      const activeChatbotId = chatbotId || sessionStorage.getItem('vendo_active_chatbot_id');

      if (!activeChatbotId) {
        console.error('UseVendo: Cannot record sale. No active chatbot ID found.');
        return;
      }

      console.log(`UseVendo: Recording sale of ${amount} ${currency} for bot ${activeChatbotId}...`);

      try {
        const response = await fetch(`${baseUrl}/api/record-sale`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbotId: activeChatbotId,
            amount: amount,
            currency: currency,
            visitorId: visitorId
          })
        });
        const data = await response.json();
        if (data.success) {
          console.log('UseVendo: Sale recorded successfully.');
        } else {
          console.error('UseVendo: Failed to record sale:', data.error);
        }
      } catch (err) {
        console.error('UseVendo: Error recording sale:', err);
      }
    }
  };

  // Automatic Sale Detection (Zero-Code)
  let pendingAmount = 0; // "Memory" to handle race conditions where price resets to 0 on success

  async function detectAutoSale() {
    const url = window.location.href.toLowerCase();
    const bodyText = document.body.innerText.toLowerCase();

    // Patterns for success in URL OR in the page text (for modals/SPAs)
    const successPatterns = ['thank_you', 'order-confirmation', 'checkout/success', 'order-received', 'confirmation'];
    const successTextPatterns = ['merci pour votre achat', 'commande confirmée', 'paiement accepté', 'order successful', 'félicitations'];

    const isSuccessPage = successPatterns.some(p => url.includes(p)) ||
      successTextPatterns.some(p => bodyText.includes(p));

    // Patterns for "Checkout" or "Cart" to pre-capture price
    const checkoutPatterns = ['checkout', 'panier', 'cart', 'paiement', 'recapitulatif'];
    const isCheckoutPage = checkoutPatterns.some(p => url.includes(p)) ||
      checkoutPatterns.some(p => bodyText.includes(p));

    // Scanning for totals
    let currentAmount = 0;
    // 1. SHOPIFY HEURISTIC
    if (window.Shopify && window.Shopify.checkout) {
      currentAmount = window.Shopify.checkout.total_price;
      if (currentAmount > 0) console.log('UseVendo: Shopify order detected, currentAmount:', currentAmount);
    }
    // 2. GENERIC DOM SCRAPING
    else {
      const selectors = [
        '.total-price', '#total-price', '.order-total', '.amount-total',
        '.cart-total-amount', '#cartTotal', '.summary-total span:last-child',
        '.checkout-total', '.total-amount'
      ];

      for (const s of selectors) {
        const elements = document.querySelectorAll(s);
        for (const el of elements) {
          if (el.offsetParent !== null) { // Only visible elements
            const text = el.innerText;
            const matched = text.match(/(\d+([\s,.]\d+)?)/);
            if (matched) {
              const val = matched[0].replace(/\s/g, '').replace(',', '.');
              if (parseFloat(val) > 0) {
                currentAmount = val;
                break;
              }
            }
          }
        }
        if (currentAmount > 0) break;
      }
    }

    // Pre-capture amount if we are checking out
    if (isCheckoutPage && currentAmount > 0) {
      if (currentAmount !== pendingAmount) {
        console.log('UseVendo: Pre-captured price for detection:', currentAmount);
        pendingAmount = currentAmount;
      }
    }

    if (!isSuccessPage) {
      // console.log('UseVendo: Not a success page. Current amount:', currentAmount, 'Pending amount:', pendingAmount);
      return;
    }

    // Check if we already recorded a sale for this "session" state
    const storageKey = `vendo_sale_recorded_${chatbotId || 'global'}`;
    if (sessionStorage.getItem(storageKey)) {
      console.log('UseVendo: Sale already recorded for this session state, skipping.');
      return;
    }

    // Final amount is either what we see now, or what we saw just before (pre-captured)
    const finalAmount = currentAmount || pendingAmount;

    if (finalAmount > 0) {
      console.log('UseVendo: Sale success detected! Amount:', finalAmount);
      sessionStorage.setItem(storageKey, 'true');
      await window.Vendo.recordSale(finalAmount);
      pendingAmount = 0; // Reset
    } else {
      console.warn('UseVendo: Success detected but could not find a price in DOM or memory.');
    }
  }

  // Periodic check (High frequency for modals)
  setInterval(detectAutoSale, 1000); // Check every 1s

  // Also monitor navigation
  const checkNav = () => {
    // We don't clear the recorded status here because some SPAs stay on same "session"
    detectAutoSale();
  };

  window.addEventListener('popstate', checkNav);
  const originalPush = history.pushState;
  history.pushState = function () {
    originalPush.apply(this, arguments);
    setTimeout(checkNav, 1000); // Give page time to render
  };

  // Initial check
  if (document.readyState === 'complete') {
    checkNav();
  } else {
    window.addEventListener('load', checkNav);
  }

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

      // Hide Bubble when open
      bubble.style.opacity = '0';
      bubble.style.pointerEvents = 'none';
      bubble.style.transform = 'translateY(10px) scale(0.9)';
    } else {
      iframeContainer.style.opacity = '0';
      iframeContainer.style.transform = 'translateY(30px) scale(0.95)';
      setTimeout(() => { iframeContainer.style.display = 'none'; }, 400);

      // Show Bubble when closed
      bubble.style.opacity = '1';
      bubble.style.pointerEvents = 'auto';
      bubble.style.transform = 'translateY(0) scale(1)';
    }
  };

  bubble.addEventListener('click', toggleChat);


  // Teaser Bubble Logic
  let teaserBubble = null;


  // State for auto-dismiss
  let autoCloseTimer = null;
  let scrollDismissListener = null;

  function showTeaser(text, triggerContext = null) {
    if (isOpen) return; // Don't show if already open
    if (sessionStorage.getItem(`vendo_teaser_seen_${chatbotId}`)) return; // Only show once per session

    // cleanup previous if exists
    removeTeaser();

    const isDark = window.vendoBotTheme === 'dark';
    const brandColor = window.vendoBotColor || '#673DE6';
    const senderName = window.vendoSenderName || window.vendoBotName || 'Assistant Vendo';
    const avatarToUse = window.vendoAvatarUrl || window.vendoBotAvatar;

    teaserBubble = document.createElement('div');
    Object.assign(teaserBubble.style, {
      position: 'fixed',
      bottom: '110px',
      right: '32px',
      width: '340px',
      background: isDark ? 'rgba(15, 23, 42, 1)' : 'rgba(255, 255, 255, 1)',
      backdropFilter: 'blur(20px)',
      webkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: isDark
        ? '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)'
        : '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      zIndex: '999998',
      cursor: 'pointer',
      opacity: '0',
      transformOrigin: 'bottom right',
      animation: 'vendo-slide-in-up-premium 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, vendo-float 4s ease-in-out infinite',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
      padding: '4px'
    });

    let avatarInnerHtml = '';
    if (avatarToUse && avatarToUse !== 'ICON:BOT' && (avatarToUse.startsWith('http') || avatarToUse.startsWith('/') || avatarToUse.startsWith('data:'))) {
      avatarInnerHtml = `<img src="${avatarToUse}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
    } else if (avatarToUse === 'ICON:BOT') {
      avatarInnerHtml = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
        ${botIcon}
      </div>`;
    } else {
      // Prioritize avatarToUse if it's 1-2 chars
      const letter = (avatarToUse && avatarToUse.length <= 2) ? avatarToUse.toUpperCase() : (senderName || 'A').substring(0, 2).toUpperCase();
      avatarInnerHtml = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-style: italic; font-size: ${letter.length > 1 ? '16px' : '20px'};">
        ${letter}
      </div>`;
    }

    const isBrandDark = brandColor === '#000000' || brandColor === '#000' || brandColor === 'black' || (brandColor && brandColor.startsWith('#0'));
    const teaserNameColor = (isDark && isBrandDark) ? '#FFFFFF' : brandColor;
    const teaserReplyTextColor = '#FFFFFF';
    const teaserReplyBg = brandColor;

    teaserBubble.innerHTML = `
            <div style="padding: 16px 18px; display: flex; gap: 14px; align-items: center;">
                <div style="position: relative; flex-shrink: 0; width: 50px; height: 50px;">
                    ${avatarInnerHtml}
                    <div style="position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: #10B981; border: 3px solid ${isDark ? '#0f172a' : 'white'}; border-radius: 50%;"></div>
                </div>
                <div style="flex: 1; overflow: hidden; padding-right: 20px;">
                    <div style="font-size: 11px; font-weight: 800; color: ${teaserNameColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; opacity: ${isDark && isBrandDark ? '0.9' : '1'};">${senderName}</div>
                    <div style="font-size: 14.5px; color: ${isDark ? '#F1F5F9' : '#1E293B'}; font-weight: 600; line-height: 1.5; word-break: break-word;">${text}</div>
                </div>
                 <button id="vendo-close-teaser" style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: ${isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'}; cursor: pointer; padding: 4px; transition: color 0.2s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div style="margin: 0 4px 4px; padding: 10px 16px; background: ${brandColor}1A; border-radius: 18px; display: flex; align-items: center; justify-content: space-between;">
                 <span style="font-size: 11px; color: ${isDark ? '#94A3B8' : '#6b7280'}; font-weight: 600;">Maintenant</span>
                 <div style="font-size: 13px; font-weight: 700; color: ${teaserReplyTextColor}; background: ${teaserReplyBg}; padding: 6px 12px; borderRadius: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                    Répondre <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
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

    // 1. Auto-close after custom duration
    const dismissDuration = (parseInt(triggerContext?.despawn) || 5) * 1000;
    autoCloseTimer = setTimeout(() => {
      removeTeaser();
    }, dismissDuration);

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
