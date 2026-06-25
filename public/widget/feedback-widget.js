(function () {
  "use strict";

  // --- Configuration ---
  const SCRIPT_TAG = document.currentScript;
  const API_KEY = SCRIPT_TAG?.getAttribute("data-api-key") || "";
  const scriptSrc = SCRIPT_TAG?.src?.split("?")[0] || "";
  const API_URL =
    SCRIPT_TAG?.getAttribute("data-api-url") ||
    scriptSrc.replace("/widget/feedback-widget.js", "/api/widget/feedback") ||
    "";

  if (!API_KEY) {
    console.warn("[Pealo] Missing data-api-key attribute.");
    return;
  }

  // --- Config State ---
  let widgetConfig = {
    color: "#06AB78",
    bgColor: "#ffffff",
    btnColorOpen: "#ffffff",
    buttonText: "Send feedback",
    title: "Send us your feedback",
    showSubtitle: true,
    subtitle: "We appreciate your thoughts and ideas.",
    position: "right",
  };

  // --- Luminance helper ---
  function isDarkColor(hex) {
    if (!hex) return true;
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16);
      const g = parseInt(cleanHex[1] + cleanHex[1], 16);
      const b = parseInt(cleanHex[2] + cleanHex[2], 16);
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
    return true;
  }

  // --- Detect Browser Info ---
  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return {
      url: window.location.href,
      userAgent: ua,
      os: os,
      browser: browser,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || "en",
    };
  }

  // --- Inject Styles ---
  function injectStyles() {
    const isDark = isDarkColor(widgetConfig.bgColor || "#ffffff");
    const isColorDark = isDarkColor(widgetConfig.color || "#06AB78");
    const isBtnOpenDark = isDarkColor(widgetConfig.btnColorOpen || "#ffffff");

    const textColor = isDark ? "#FFFFFF" : "#1F2937";
    const titleColor = isDark ? "#FFFFFF" : "#111827";
    const subtitleColor = isDark ? "#6b7c85" : "#6B7280";
    const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E5E7EB";
    const modalBorderColor = isDark ? "rgba(255, 255, 255, 0.06)" : "#E5E7EB";
    const textareaBg = isDark ? "rgba(255, 255, 255, 0.03)" : "#F9FAFB";
    const textareaPlaceholder = isDark ? "#4a5a63" : "#9CA3AF";
    const starDefaultColor = isDark ? "#3e4e56" : "#D1D5DB";
    const footerBorderColor = isDark ? "rgba(255, 255, 255, 0.04)" : "#E5E7EB";

    const submitBtnTextColor = isColorDark ? "#FFFFFF" : "#001E2B";
    const btnOpenTextColor = isBtnOpenDark ? "#FFFFFF" : "#1F2937";
    const btnNormalTextColor = isColorDark ? "#FFFFFF" : "#001E2B";

    const STYLES = `
      #fl-widget-container *,
      #fl-widget-container *::before,
      #fl-widget-container *::after {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* --- Floating Button --- */
      #fl-widget-btn {
        position: fixed;
        bottom: 24px;
        left: ${widgetConfig.position === "left" ? "24px" : "auto"};
        right: ${widgetConfig.position === "right" ? "24px" : "auto"};
        z-index: 9999999;
        width: 52px;
        height: 52px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
        color: ${btnNormalTextColor};
        background-color: ${widgetConfig.color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        margin: 0;
        padding: 0;
      }

      #fl-widget-btn:hover {
        transform: scale(1.06);
      }

      #fl-widget-btn.fl-open {
        transform: rotate(90deg);
        background-color: ${widgetConfig.btnColorOpen || "#ffffff"};
        color: ${btnOpenTextColor};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      /* --- Modal Panel --- */
      #fl-widget-modal {
        position: fixed;
        bottom: 92px;
        left: ${widgetConfig.position === "left" ? "24px" : "auto"};
        right: ${widgetConfig.position === "right" ? "24px" : "auto"};
        background: ${widgetConfig.bgColor || "#ffffff"};
        color: ${textColor};
        border-radius: 14px;
        width: 340px;
        max-width: calc(100vw - 48px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border: 1px solid ${modalBorderColor};
        z-index: 9999999;
        transform-origin: ${widgetConfig.position === "left" ? "bottom left" : "bottom right"};
        opacity: 0;
        transform: scale(0.4) translateY(20px);
        pointer-events: none;
        visibility: hidden;
        transition: opacity 0.2s ease, 
                    transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), 
                    visibility 0.25s;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }

      #fl-widget-modal.fl-open {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
        visibility: visible;
      }

      .fl-hide-temp {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: scale(0.8) !important;
        transition: none !important;
      }

      /* --- Header --- */
      #fl-widget-modal .fl-modal-header {
        padding: 20px 20px 12px;
        margin: 0;
        text-align: center;
      }

      #fl-widget-modal .fl-modal-title {
        font-size: 16px;
        font-weight: 700;
        color: ${titleColor};
        margin: 0 0 4px 0;
        padding: 0;
        letter-spacing: -0.2px;
      }

      #fl-widget-modal .fl-modal-subtitle {
        font-size: 12px;
        color: ${subtitleColor};
        margin: 0;
        padding: 0;
      }

      /* --- Body --- */
      #fl-widget-modal .fl-modal-body {
        padding: 0 20px 20px;
        margin: 0;
      }

      /* Stars Rating Container */
      #fl-widget-modal .fl-stars-container {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 0 0 16px 0;
        padding: 0;
      }

      #fl-widget-modal .fl-star {
        font-size: 32px;
        cursor: pointer;
        color: ${starDefaultColor};
        transition: color 0.15s ease, transform 0.1s ease;
        user-select: none;
        display: inline-block;
      }

      #fl-widget-modal .fl-star:hover {
        transform: scale(1.2);
      }

      #fl-widget-modal .fl-star.fl-active {
        color: #FFC107;
      }

      #fl-widget-modal .fl-stars-container.fl-is-hovering .fl-star {
        color: ${starDefaultColor};
      }

      #fl-widget-modal .fl-stars-container.fl-is-hovering .fl-star.fl-hovered {
        color: #FFC107;
      }

      /* --- Textarea --- */
      #fl-widget-modal .fl-textarea {
        width: 100%;
        min-height: 90px;
        padding: 10px 12px;
        border: 1px solid ${borderColor};
        border-radius: 8px;
        font-size: 13px;
        resize: none;
        outline: none;
        font-family: inherit;
        color: ${textColor};
        background: ${textareaBg};
        transition: border-color 0.15s ease;
        margin: 0 0 14px 0;
        line-height: 1.5;
      }

      #fl-widget-modal .fl-textarea:focus {
        border-color: ${widgetConfig.color};
      }

      #fl-widget-modal .fl-textarea::placeholder {
        color: ${textareaPlaceholder};
      }

      /* --- Action Buttons --- */
      #fl-widget-modal .fl-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 0;
      }

      #fl-widget-modal .fl-submit-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        background-color: ${widgetConfig.color};
        color: ${submitBtnTextColor};
        transition: background-color 0.15s ease;
        margin: 0;
        padding: 0 12px;
      }

      #fl-widget-modal .fl-submit-btn:hover {
        opacity: 0.9;
      }

      #fl-widget-modal .fl-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* --- Success State --- */
      #fl-widget-modal .fl-success {
        text-align: center;
        padding: 40px 24px;
        margin: 0;
      }

      #fl-widget-modal .fl-success-icon {
        font-size: 40px;
        margin: 0 0 12px 0;
        padding: 0;
      }

      #fl-widget-modal .fl-success-title {
        font-size: 17px;
        font-weight: 700;
        color: ${titleColor};
        margin: 0 0 4px 0;
        padding: 0;
      }

      #fl-widget-modal .fl-success-text {
        font-size: 13px;
        color: ${subtitleColor};
        margin: 0;
        padding: 0;
      }

      /* --- Footer --- */
      #fl-widget-modal .fl-powered {
        text-align: center;
        padding: 12px 20px;
        margin: 0;
        font-size: 10px;
        color: ${textareaPlaceholder};
        border-top: 1px solid ${footerBorderColor};
      }

      #fl-widget-modal .fl-powered a {
        color: ${widgetConfig.color};
        text-decoration: none;
        font-weight: 600;
      }

      #fl-widget-modal .fl-powered a:hover {
        text-decoration: underline;
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  // --- Create Widget Container ---
  const container = document.createElement("div");
  container.id = "fl-widget-container";
  document.body.appendChild(container);

  // --- Icons ---
  const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" style="display: block;"><path d="M 16 3 C 23.5 3 29 7.5 29 13 C 29 18.5 23.5 23 16 23 C 14.5 23 13.1 22.8 11.7 22.4 C 9 24.5 5.5 25 5.5 25 C 5.5 25 7 21.5 7.6 19.8 C 4.8 18.1 3 15.7 3 13 C 3 7.5 8.5 3 16 3 Z" fill="#ffffff" stroke="#222222" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path transform="translate(10, 6) scale(0.6)" fill-rule="evenodd" clip-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" fill="#facc15" stroke="#222222" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  // --- State ---
  let isOpen = false;
  let selectedRating = null;

  // --- Render DOM Elements ---
  function initDOM() {
    container.innerHTML = `
      <button id="fl-widget-btn">${CHAT_ICON}</button>
      <div id="fl-widget-modal">
        <div class="fl-modal-header">
          <div class="fl-modal-title">${widgetConfig.title || "Send us your feedback"}</div>
          ${
            widgetConfig.showSubtitle !== false
              ? `<div class="fl-modal-subtitle">${widgetConfig.subtitle || "We appreciate your thoughts and ideas."}</div>`
              : ""
          }
        </div>
        <div class="fl-modal-body">
          <div class="fl-stars-container">
            <span class="fl-star" data-rating="1">★</span>
            <span class="fl-star" data-rating="2">★</span>
            <span class="fl-star" data-rating="3">★</span>
            <span class="fl-star" data-rating="4">★</span>
            <span class="fl-star" data-rating="5">★</span>
          </div>
          <textarea class="fl-textarea" placeholder="Tell us more (optional)..." id="fl-message"></textarea>
          <div class="fl-actions">
            <button class="fl-submit-btn" id="fl-submit-btn" disabled>
              ${widgetConfig.buttonText || "Send feedback"}
            </button>
          </div>
        </div>
        <div class="fl-powered">
          Powered by <a href="#" target="_blank">Pealo</a>
        </div>
      </div>
    `;

    // Event listeners
    const btn = document.getElementById("fl-widget-btn");
    btn.onclick = toggleModal;

    const modal = document.getElementById("fl-widget-modal");
    const starsContainer = modal.querySelector(".fl-stars-container");
    const stars = modal.querySelectorAll(".fl-star");
    const submitBtn = document.getElementById("fl-submit-btn");

    stars.forEach((star) => {
      star.onmouseover = () => {
        starsContainer.classList.add("fl-is-hovering");
        const rating = parseInt(star.dataset.rating, 10);
        stars.forEach((s) => {
          const r = parseInt(s.dataset.rating, 10);
          if (r <= rating) {
            s.classList.add("fl-hovered");
          } else {
            s.classList.remove("fl-hovered");
          }
        });
      };

      star.onclick = () => {
        selectedRating = parseInt(star.dataset.rating, 10);
        stars.forEach((s) => {
          const r = parseInt(s.dataset.rating, 10);
          if (r <= selectedRating) {
            s.classList.add("fl-active");
          } else {
            s.classList.remove("fl-active");
          }
        });
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      };
    });

    if (starsContainer) {
      starsContainer.onmouseleave = () => {
        starsContainer.classList.remove("fl-is-hovering");
        stars.forEach((s) => s.classList.remove("fl-hovered"));
      };
    }

    submitBtn.onclick = submitFeedback;
  }

  // --- Toggle Modal ---
  function toggleModal() {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }

  // --- Open Modal ---
  function openModal() {
    isOpen = true;
    const modal = document.getElementById("fl-widget-modal");
    const btn = document.getElementById("fl-widget-btn");
    modal.classList.add("fl-open");
    btn.classList.add("fl-open");
    btn.innerHTML = CLOSE_ICON;
  }

  // --- Close Modal ---
  function closeModal() {
    isOpen = false;
    selectedRating = null;
    const modal = document.getElementById("fl-widget-modal");
    const btn = document.getElementById("fl-widget-btn");
    modal.classList.remove("fl-open");
    btn.classList.remove("fl-open");
    btn.innerHTML = CHAT_ICON;

    // Reset stars and text input
    const starsContainer = modal.querySelector(".fl-stars-container");
    if (starsContainer) starsContainer.classList.remove("fl-is-hovering");
    const stars = modal.querySelectorAll(".fl-star");
    stars.forEach((s) => {
      s.classList.remove("fl-active");
      s.classList.remove("fl-hovered");
    });
    const textarea = document.getElementById("fl-message");
    if (textarea) textarea.value = "";
    const submitBtn = document.getElementById("fl-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = widgetConfig.buttonText || "Send feedback";
    }
  }

  // --- Submit Feedback ---
  async function submitFeedback() {
    const message = document.getElementById("fl-message")?.value?.trim() || "";
    const submitBtn = document.getElementById("fl-submit-btn");

    if (selectedRating === null) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          rating: selectedRating,
          message: message,
          screenshot: null,
          metadata: getBrowserInfo(),
        }),
      });

      if (response.ok) {
        showSuccess();
      } else {
        throw new Error("Failed to submit");
      }
    } catch (e) {
      console.error("[Pealo] Submit error:", e);
      submitBtn.disabled = false;
      submitBtn.textContent = "Try again";
    }
  }

  // --- Show Success ---
  function showSuccess() {
    const modal = document.getElementById("fl-widget-modal");
    if (modal) {
      modal.innerHTML = `
        <div class="fl-success">
          <div class="fl-success-icon">🎉</div>
          <div class="fl-success-title">Thank you!</div>
          <div class="fl-success-text">Your feedback has been sent successfully.</div>
        </div>
        <div class="fl-powered">
          Powered by <a href="#" target="_blank">Pealo</a>
        </div>
      `;

      setTimeout(() => {
        closeModal();
        // Restore standard layout after closing
        setTimeout(initDOM, 400);
      }, 3000);
    }
  }

  // --- Init Flow ---
  async function init() {
    const configUrl = API_URL.replace("/api/widget/feedback", "/api/widget/config") + "?apiKey=" + API_KEY + "&_t=" + Date.now();
    try {
      const res = await fetch(configUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.widgetConfig) {
          widgetConfig = { ...widgetConfig, ...data.widgetConfig };
        }
      }
    } catch (e) {
      console.warn("[Pealo] Could not retrieve widget config dynamically. Using defaults.", e);
    }

    const currentPath = window.location.pathname;

    if (widgetConfig.includePaths && widgetConfig.includePaths.trim() !== "") {
      const paths = widgetConfig.includePaths.split(",").map(p => p.trim()).filter(Boolean);
      if (paths.length > 0) {
        let matched = false;
        for (const p of paths) {
          if (p === currentPath || (p.endsWith("/*") && currentPath.startsWith(p.slice(0, -2)))) {
            matched = true;
            break;
          }
        }
        if (!matched) return; 
      }
    }

    if (widgetConfig.excludePaths && widgetConfig.excludePaths.trim() !== "") {
      const paths = widgetConfig.excludePaths.split(",").map(p => p.trim()).filter(Boolean);
      if (paths.length > 0) {
        for (const p of paths) {
          if (p === currentPath || (p.endsWith("/*") && currentPath.startsWith(p.slice(0, -2)))) {
            return; 
          }
        }
      }
    }

    injectStyles();
    initDOM();
    initTriggers();
  }

  // --- Auto Open Triggers ---
  function initTriggers() {
    const trigger = widgetConfig.autoOpenTrigger || "none";
    if (trigger === "none") return;

    // Check if URL targeting matches for auto-opening
    const currentPath = window.location.pathname;
    if (widgetConfig.autoOpenPages && widgetConfig.autoOpenPages.trim() !== "") {
      const paths = widgetConfig.autoOpenPages.split(",").map(p => p.trim()).filter(Boolean);
      let matched = false;
      for (const p of paths) {
        if (p === currentPath || (p.endsWith("/*") && currentPath.startsWith(p.slice(0, -2)))) {
          matched = true;
          break;
        }
      }
      if (!matched) return; // If targeting is specified and we don't match, don't auto-open
    }

    if (trigger === "time") {
      const delay = (Number(widgetConfig.autoOpenValue) || 5) * 1000;
      setTimeout(() => {
        if (!isOpen) openModal();
      }, delay);
    } else if (trigger === "scroll") {
      const targetPercent = Number(widgetConfig.autoOpenValue) || 50;
      const handleScroll = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const scrollPercent = (window.scrollY / docHeight) * 100;
        if (scrollPercent >= targetPercent) {
          if (!isOpen) openModal();
          window.removeEventListener("scroll", handleScroll);
        }
      };
      window.addEventListener("scroll", handleScroll);
    } else if (trigger === "exit_intent") {
      const handleMouseLeave = (e) => {
        if (e.clientY < 20) {
          if (!isOpen) openModal();
          document.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
      document.addEventListener("mouseleave", handleMouseLeave);
    }
  }

  init();
})();
