// ── Admin Auth Modal for static pages ──
(function () {
  const ADMIN_EMAIL = 'Bylivinclothing@gmail.com';
  const ADMIN_PASS  = 'LIVN@2026_clothing';

  // Inject modal HTML + styles
  function injectModal() {
    const style = document.createElement('style');
    style.textContent = `
      .auth-modal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .auth-modal-overlay.open { opacity: 1; pointer-events: all; }
      .auth-modal {
        background: #fff; border-radius: 16px;
        padding: 44px 36px; width: 100%; max-width: 400px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        transform: translateY(20px) scale(0.97);
        transition: transform 0.25s ease;
        position: relative;
      }
      .auth-modal-overlay.open .auth-modal { transform: translateY(0) scale(1); }
      .auth-modal-close {
        position: absolute; top: 16px; right: 18px;
        background: none; border: none; font-size: 1.4rem;
        color: #9ca3af; cursor: pointer; line-height: 1;
        transition: color 0.2s;
      }
      .auth-modal-close:hover { color: #111; }
      .auth-modal-logo {
        text-align: center; font-family: 'Cinzel', serif;
        font-size: 1.8rem; font-weight: 800; letter-spacing: 4px;
        color: #6a040f; margin-bottom: 4px;
      }
      .auth-modal-sub {
        text-align: center; font-size: 0.8rem; color: #9ca3af;
        letter-spacing: 1px; text-transform: uppercase; margin-bottom: 28px;
      }
      .auth-modal-title {
        text-align: center; font-family: 'Cinzel', serif;
        font-size: 1.2rem; font-weight: 700; color: #111;
        margin-bottom: 24px;
      }
      .auth-modal-error {
        background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        padding: 9px 14px; border-radius: 6px; font-size: 0.82rem;
        margin-bottom: 14px; display: none;
      }
      .auth-modal-error.show { display: block; }
      .auth-field { margin-bottom: 16px; }
      .auth-field label {
        display: block; font-size: 0.82rem; font-weight: 600;
        color: #111; margin-bottom: 7px;
        font-family: 'Cinzel', serif;
      }
      .auth-field input {
        width: 100%; padding: 11px 14px;
        border: 1.5px solid #e5e7eb; border-radius: 6px;
        font-size: 0.9rem; outline: none;
        transition: border-color 0.2s; background: #fafafa;
        font-family: inherit;
      }
      .auth-field input:focus { border-color: #6a040f; background: #fff; }
      .auth-submit-btn {
        width: 100%; padding: 13px; background: #6a040f; color: #fff;
        border: none; border-radius: 6px; font-size: 0.95rem;
        font-weight: 700; letter-spacing: 1px; cursor: pointer;
        font-family: 'Cinzel', serif; text-transform: uppercase;
        transition: all 0.2s; margin-top: 4px;
      }
      .auth-submit-btn:hover { background: #370617; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(106,4,15,0.3); }
      .auth-divider {
        display: flex; align-items: center; gap: 12px;
        margin: 18px 0; color: #9ca3af; font-size: 0.8rem;
      }
      .auth-divider::before, .auth-divider::after {
        content: ''; flex: 1; height: 1px; background: #e5e7eb;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';
    overlay.id = 'auth-modal-overlay';
    overlay.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-label="Admin Login">
        <button class="auth-modal-close" onclick="closeAuthModal()" aria-label="Close">✕</button>
        <div class="auth-modal-logo">LIVN</div>
        <div class="auth-modal-sub">Admin Portal</div>
        <h2 class="auth-modal-title">Sign in to continue</h2>
        <div class="auth-modal-error" id="auth-error">Invalid credentials. Please try again.</div>
        <form onsubmit="handleAuthSubmit(event)">
          <div class="auth-field">
            <label for="auth-email">Email Address</label>
            <input type="email" id="auth-email" placeholder="admin@example.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label for="auth-password">Password</label>
            <input type="password" id="auth-password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <button type="submit" class="auth-submit-btn">Sign In</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAuthModal();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAuthModal();
    });
  }

  window.openAuthModal = function () {
    // If already logged in, go straight to dashboard
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      window.location.href = getAdminPath() + 'dashboard.html';
      return;
    }
    document.getElementById('auth-modal-overlay').classList.add('open');
    setTimeout(() => document.getElementById('auth-email').focus(), 100);
  };

  window.closeAuthModal = function () {
    document.getElementById('auth-modal-overlay').classList.remove('open');
    document.getElementById('auth-error').classList.remove('show');
  };

  window.handleAuthSubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const pass  = document.getElementById('auth-password').value;
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      window.location.href = getAdminPath() + 'dashboard.html';
    } else {
      document.getElementById('auth-error').classList.add('show');
      document.getElementById('auth-password').value = '';
    }
  };

  // Resolve correct relative path to admin/ from current page
  function getAdminPath() {
    const path = window.location.pathname;
    if (path.includes('/admin/')) return '';          // already inside admin/
    return 'admin/';
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModal);
  } else {
    injectModal();
  }
})();
