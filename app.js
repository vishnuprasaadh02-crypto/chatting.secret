/**
 * FAMWAVE — Application Engine
 * Private Family-Only Messaging System with Calm Water Waves,
 * Glassmorphic UI, Family Gatekeeper, Member PINs, Rich Chat & Persistence.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DEFAULT DATA & STORAGE INITIALIZATION
  // =========================================================================
  const DEFAULT_FAMILY = {
    id: 'PRASAADH2026',
    name: 'The Prasaadh Family',
    passwordHash: 'Family@2026', // Secure credential match
    avatar: '🌊',
    members: [
      { id: 'm1', name: 'Mom', role: 'Mother', avatar: '👩', pin: '5678', bio: 'Always here for my family ❤️', online: true, lastSeen: 'Just now' },
      { id: 'm2', name: 'Dad', role: 'Father', avatar: '👨', pin: '1234', bio: 'Family first, always 🌟', online: true, lastSeen: 'Just now' },
      { id: 'm3', name: 'Vishnu', role: 'Son', avatar: '👦', pin: '2468', bio: 'Coding, adventures & weekend trips 🚀', online: true, lastSeen: 'Just now' },
      { id: 'm4', name: 'Sister', role: 'Daughter', avatar: '👧', pin: '1111', bio: 'Art, books & sunshine ☀️', online: false, lastSeen: '25m ago' },
      { id: 'm5', name: 'Brother', role: 'Son', avatar: '🧒', pin: '2222', bio: 'Gaming & weekend fun 🎮', online: false, lastSeen: '1h ago' }
    ]
  };

  // Sample family image SVG data URI
  const SAMPLE_PHOTO_URI = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="50%" stop-color="%230ea5e9"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g)"/><circle cx="300" cy="180" r="110" fill="rgba(255,255,255,0.15)"/><text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="64" fill="%23ffffff">👨‍👩‍👧‍👦</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ffffff">Family Weekend Getaway</text><text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="rgba(255,255,255,0.85)">Lakeview Cabin • Memories Captured ❤️</text></svg>';

  const DEFAULT_MESSAGES = [
    {
      id: 'msg-1',
      senderId: 'm1',
      senderName: 'Mom',
      senderAvatar: '👩',
      text: 'Good morning everyone! Reminder: dinner is at 7:30 PM tonight. I am making your favorite pasta 😊',
      timestamp: '09:15 AM',
      date: 'Today',
      isPinned: false,
      reactions: { '❤️': ['m2', 'm3'], '😊': ['m4'] },
      readStatus: 'read'
    },
    {
      id: 'msg-2',
      senderId: 'm2',
      senderName: 'Dad',
      senderAvatar: '👨',
      text: '📌 Family trip to Coorg is confirmed for this Sunday! Let us leave at 6:30 AM sharp to avoid traffic.',
      timestamp: '09:42 AM',
      date: 'Today',
      isPinned: true,
      pinnedBy: 'Dad',
      attachment: {
        type: 'doc',
        name: 'Coorg_Trip_Itinerary.pdf',
        size: '2.4 MB'
      },
      reactions: { '👍': ['m1', 'm3', 'm5'], '🎉': ['m3', 'm4'] },
      readStatus: 'read'
    },
    {
      id: 'msg-3',
      senderId: 'm3',
      senderName: 'Vishnu',
      senderAvatar: '👦',
      text: '@Dad @Mom I have packed the tent, power banks, and camera gear! 📸 Let me know if you need anything else from the market.',
      timestamp: '10:05 AM',
      date: 'Today',
      isPinned: false,
      replyTo: {
        id: 'msg-2',
        senderName: 'Dad',
        snippet: 'Family trip to Coorg is confirmed for this Sunday...'
      },
      reactions: { '❤️': ['m1'] },
      readStatus: 'read'
    },
    {
      id: 'msg-4',
      senderId: 'm4',
      senderName: 'Sister',
      senderAvatar: '👧',
      text: 'Sharing a photo from last year\'s trip! Look how beautiful the lake view was ✨',
      timestamp: '10:30 AM',
      date: 'Today',
      isPinned: false,
      attachment: {
        type: 'image',
        name: 'Family_Lake_Memory.jpg',
        url: SAMPLE_PHOTO_URI
      },
      reactions: { '❤️': ['m1', 'm2', 'm3'] },
      readStatus: 'read'
    }
  ];

  // Global State
  const STATE = {
    families: JSON.parse(localStorage.getItem('famwave_families') || 'null') || [DEFAULT_FAMILY],
    currentFamily: null,
    currentMember: null,
    activeRoom: 'main', // 'main' or memberId for 1-on-1 direct
    messages: JSON.parse(localStorage.getItem('famwave_messages') || 'null') || DEFAULT_MESSAGES,
    notifications: JSON.parse(localStorage.getItem('famwave_notifications') || '[]'),
    activeReply: null,
    editingMessageId: null,
    showOnlinePrivacy: localStorage.getItem('famwave_show_online') !== 'false'
  };

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  const DOM = {
    // Canvas
    waveCanvas: document.getElementById('wave-canvas'),

    // Screens
    authScreen: document.getElementById('auth-screen'),
    appScreen: document.getElementById('app-screen'),
    authStepFamily: document.getElementById('auth-step-family'),
    authStepMember: document.getElementById('auth-step-member'),

    // Auth Elements
    familyLoginForm: document.getElementById('family-login-form'),
    familyIdInput: document.getElementById('family-id-input'),
    familyPassInput: document.getElementById('family-pass-input'),
    toggleFamilyPwd: document.getElementById('toggle-family-pwd'),
    btnOpenCreateFamily: document.getElementById('btn-open-create-family'),
    memberSelectFamilyName: document.getElementById('member-select-family-name'),
    memberSelectionGrid: document.getElementById('member-selection-grid'),
    memberPinBox: document.getElementById('member-pin-box'),
    pinTargetAvatar: document.getElementById('pin-target-avatar'),
    pinTargetName: document.getElementById('pin-target-name'),
    memberPinInput: document.getElementById('member-pin-input'),
    btnConfirmPin: document.getElementById('btn-confirm-pin'),
    btnCancelPin: document.getElementById('btn-cancel-pin'),
    pinErrorMsg: document.getElementById('pin-error-msg'),
    btnBackToFamilyLogin: document.getElementById('btn-back-to-family-login'),

    // Modals
    setupFamilyModal: document.getElementById('setup-family-modal'),
    btnCloseSetupModal: document.getElementById('btn-close-setup-modal'),
    btnCancelCreateFamily: document.getElementById('btn-cancel-create-family'),
    createFamilyForm: document.getElementById('create-family-form'),
    newFamilyName: document.getElementById('new-family-name'),
    newFamilyId: document.getElementById('new-family-id'),
    newFamilyPass: document.getElementById('new-family-pass'),
    newMembersList: document.getElementById('new-members-list'),
    btnAddMemberField: document.getElementById('btn-add-member-field'),

    // App Header
    headerFamilyName: document.getElementById('header-family-name'),
    headerStats: document.getElementById('header-stats'),
    currentUserAvatar: document.getElementById('current-user-avatar'),
    currentUserName: document.getElementById('current-user-name'),
    btnQuickSwitch: document.getElementById('btn-quick-switch'),
    headerUserAvatar: document.getElementById('header-user-avatar'),
    btnOpenSearch: document.getElementById('btn-open-search'),
    btnOpenPinned: document.getElementById('btn-open-pinned'),
    pinnedCountBadge: document.getElementById('pinned-count-badge'),
    btnOpenNotifications: document.getElementById('btn-open-notifications'),
    notifCountBadge: document.getElementById('notif-count-badge'),
    btnOpenMyProfile: document.getElementById('btn-open-my-profile'),
    btnFamilyLogout: document.getElementById('btn-family-logout'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    appSidebar: document.getElementById('app-sidebar'),

    // Sidebar
    sidebarMemberCount: document.getElementById('sidebar-member-count'),
    sidebarMembersList: document.getElementById('sidebar-members-list'),
    tabRoomMain: document.getElementById('tab-room-main'),
    mainUnreadBadge: document.getElementById('main-unread-badge'),
    btnManageFamily: document.getElementById('btn-manage-family'),
    toggleOnlinePrivacy: document.getElementById('toggle-online-privacy'),
    privacyStatusLabel: document.getElementById('privacy-status-label'),

    // Chat Area
    roomBannerAvatar: document.getElementById('room-banner-avatar'),
    roomBannerTitle: document.getElementById('room-banner-title'),
    roomBannerDesc: document.getElementById('room-banner-desc'),
    liveTypingIndicator: document.getElementById('live-typing-indicator'),
    typingStatusText: document.getElementById('typing-status-text'),
    messagesContainer: document.getElementById('messages-container'),
    messagesStream: document.getElementById('messages-stream'),
    btnScrollBottom: document.getElementById('btn-scroll-bottom'),

    // Input & Context
    messageContextBar: document.getElementById('message-context-bar'),
    contextLabel: document.getElementById('context-label'),
    contextSnippet: document.getElementById('context-snippet'),
    btnCloseContext: document.getElementById('btn-close-context'),
    mentionAutocompleteBox: document.getElementById('mention-autocomplete-box'),
    emojiPickerPanel: document.getElementById('emoji-picker-panel'),
    emojiPickerGrid: document.getElementById('emoji-picker-grid'),
    btnToggleEmoji: document.getElementById('btn-toggle-emoji'),
    btnToggleAttach: document.getElementById('btn-toggle-attach'),
    attachmentMenu: document.getElementById('attachment-menu'),
    fileInputImage: document.getElementById('file-input-image'),
    fileInputDoc: document.getElementById('file-input-doc'),
    btnSamplePhoto: document.getElementById('btn-sample-photo'),
    chatInputForm: document.getElementById('chat-input-form'),
    chatMessageInput: document.getElementById('chat-message-input'),
    btnSendMessage: document.getElementById('btn-send-message'),

    // Drawers & Modals
    searchDrawer: document.getElementById('search-drawer'),
    drawerSearchInput: document.getElementById('drawer-search-input'),
    btnClearSearchDrawer: document.getElementById('btn-clear-search-drawer'),
    searchResultsList: document.getElementById('search-results-list'),
    btnCloseSearch: document.getElementById('btn-close-search'),

    pinnedModal: document.getElementById('pinned-modal'),
    pinnedMessagesList: document.getElementById('pinned-messages-list'),
    btnClosePinnedModal: document.getElementById('btn-close-pinned-modal'),

    notificationsDrawer: document.getElementById('notifications-drawer'),
    notificationsList: document.getElementById('notifications-list'),
    btnClearNotifs: document.getElementById('btn-clear-notifs'),
    btnCloseNotifications: document.getElementById('btn-close-notifications'),

    memberProfileModal: document.getElementById('member-profile-modal'),
    profModalAvatar: document.getElementById('prof-modal-avatar'),
    profModalStatusDot: document.getElementById('prof-modal-status-dot'),
    profModalName: document.getElementById('prof-modal-name'),
    profModalRole: document.getElementById('prof-modal-role'),
    profModalStatusText: document.getElementById('prof-modal-status-text'),
    profModalBio: document.getElementById('prof-modal-bio'),
    profModalFamilyId: document.getElementById('prof-modal-family-id'),
    profModalActions: document.getElementById('prof-modal-actions'),
    btnDirectMessageProfile: document.getElementById('btn-direct-message-profile'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal'),

    imageLightbox: document.getElementById('image-lightbox'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxDownloadLink: document.getElementById('lightbox-download-link'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),

    toastContainer: document.getElementById('toast-container')
  };

  let pendingMemberForPin = null;

  // =========================================================================
  // 3. BACKGROUND WATER WAVE SIMULATION (CANVAS)
  // =========================================================================
  function initWaveCanvas() {
    const canvas = DOM.waveCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let step = 0;
    const waves = [
      { color: 'rgba(6, 182, 212, 0.08)', length: 0.0035, speed: 0.015, height: 45, offset: 0.68 },
      { color: 'rgba(14, 165, 233, 0.06)', length: 0.0028, speed: 0.012, height: 60, offset: 0.72 },
      { color: 'rgba(99, 102, 241, 0.05)', length: 0.0020, speed: 0.008, height: 75, offset: 0.78 }
    ];

    function animateWaves() {
      ctx.clearRect(0, 0, width, height);
      step += 1;

      waves.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        const baseline = height * w.offset;

        for (let x = 0; x <= width; x += 10) {
          const y = Math.sin(x * w.length + step * w.speed) * w.height + baseline;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      });

      requestAnimationFrame(animateWaves);
    }

    animateWaves();
  }

  // =========================================================================
  // 4. STORAGE SYNC HELPERS
  // =========================================================================
  function saveState() {
    localStorage.setItem('famwave_families', JSON.stringify(STATE.families));
    localStorage.setItem('famwave_messages', JSON.stringify(STATE.messages));
    localStorage.setItem('famwave_notifications', JSON.stringify(STATE.notifications));
    localStorage.setItem('famwave_show_online', STATE.showOnlinePrivacy ? 'true' : 'false');
  }

  function showToast(message, icon = '🌊') {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(dateObj = new Date()) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // =========================================================================
  // 5. AUTHENTICATION & FAMILY GATEKEEPER
  // =========================================================================
  function initAuth() {
    // Password visibility toggle
    DOM.toggleFamilyPwd.addEventListener('click', () => {
      const type = DOM.familyPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
      DOM.familyPassInput.setAttribute('type', type);
      DOM.toggleFamilyPwd.textContent = type === 'password' ? '👁️' : '🔒';
    });

    // Step 1: Family Gate Form Submit
    DOM.familyLoginForm.addEventListener('submit', e => {
      e.preventDefault();
      const enteredId = DOM.familyIdInput.value.trim().toUpperCase();
      const enteredPass = DOM.familyPassInput.value.trim();

      const matchedFamily = STATE.families.find(
        f => f.id.toUpperCase() === enteredId && f.passwordHash === enteredPass
      );

      if (matchedFamily) {
        STATE.currentFamily = matchedFamily;
        showToast(`Welcome to ${matchedFamily.name}! ❤️`, '🌊');
        showMemberSelectionStep();
      } else {
        showToast('Invalid Family ID or Secret Password. Please check credentials.', '⚠️');
      }
    });

    // Step 2: Member Selection Grid
    function showMemberSelectionStep() {
      DOM.authStepFamily.classList.remove('active');
      DOM.authStepMember.classList.add('active');
      DOM.memberSelectFamilyName.textContent = STATE.currentFamily.name;
      DOM.memberPinBox.classList.add('hidden');
      DOM.pinErrorMsg.classList.add('hidden');
      DOM.memberPinInput.value = '';

      DOM.memberSelectionGrid.innerHTML = '';
      STATE.currentFamily.members.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-pick-card';
        card.innerHTML = `
          ${member.pin ? '<span class="pin-protected-badge" title="Protected by PIN">🔒</span>' : ''}
          <div class="member-3d-avatar">${member.avatar}</div>
          <span class="member-name">${escapeHtml(member.name)}</span>
          <span class="member-role">${escapeHtml(member.role)}</span>
        `;
        card.addEventListener('click', () => handleMemberSelect(member));
        DOM.memberSelectionGrid.appendChild(card);
      });
    }

    // Handle Member Identity Click
    function handleMemberSelect(member) {
      if (member.pin) {
        pendingMemberForPin = member;
        DOM.pinTargetAvatar.textContent = member.avatar;
        DOM.pinTargetName.textContent = member.name;
        DOM.memberPinBox.classList.remove('hidden');
        DOM.pinErrorMsg.classList.add('hidden');
        DOM.memberPinInput.value = '';
        DOM.memberPinInput.focus();
      } else {
        loginAsMember(member);
      }
    }

    // PIN unlock submit
    DOM.btnConfirmPin.addEventListener('click', verifyMemberPin);
    DOM.memberPinInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyMemberPin();
      }
    });

    function verifyMemberPin() {
      if (!pendingMemberForPin) return;
      const enteredPin = DOM.memberPinInput.value.trim();
      if (enteredPin === pendingMemberForPin.pin) {
        loginAsMember(pendingMemberForPin);
      } else {
        DOM.pinErrorMsg.classList.remove('hidden');
        DOM.memberPinInput.value = '';
        DOM.memberPinInput.focus();
      }
    }

    DOM.btnCancelPin.addEventListener('click', () => {
      DOM.memberPinBox.classList.add('hidden');
      pendingMemberForPin = null;
    });

    DOM.btnBackToFamilyLogin.addEventListener('click', () => {
      DOM.authStepMember.classList.remove('active');
      DOM.authStepFamily.classList.add('active');
      STATE.currentFamily = null;
    });

    // Open Setup Family Modal
    DOM.btnOpenCreateFamily.addEventListener('click', () => {
      DOM.setupFamilyModal.classList.remove('hidden');
    });

    DOM.btnCloseSetupModal.addEventListener('click', () => {
      DOM.setupFamilyModal.classList.add('hidden');
    });

    DOM.btnCancelCreateFamily.addEventListener('click', () => {
      DOM.setupFamilyModal.classList.add('hidden');
    });

    // Add Member Row in Setup Modal
    const AVATARS_POOL = ['👨', '👩', '👦', '👧', '🧒', '👴', '👵', '🐱', '🐶'];
    DOM.btnAddMemberField.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'member-form-row';
      const randAvatar = AVATARS_POOL[Math.floor(Math.random() * AVATARS_POOL.length)];
      row.innerHTML = `
        <span class="member-avatar-preview">${randAvatar}</span>
        <input type="text" class="new-member-name" placeholder="Name" required>
        <input type="text" class="new-member-role" placeholder="Role (e.g. Son)">
        <input type="password" maxlength="4" class="new-member-pin" placeholder="PIN">
      `;
      DOM.newMembersList.appendChild(row);
    });

    // Create New Family Form Submit
    DOM.createFamilyForm.addEventListener('submit', e => {
      e.preventDefault();
      const famName = DOM.newFamilyName.value.trim();
      const famId = DOM.newFamilyId.value.trim().toUpperCase();
      const famPass = DOM.newFamilyPass.value.trim();

      const memberRows = DOM.newMembersList.querySelectorAll('.member-form-row');
      const members = [];

      memberRows.forEach((row, idx) => {
        const nameInput = row.querySelector('.new-member-name');
        const roleInput = row.querySelector('.new-member-role');
        const pinInput = row.querySelector('.new-member-pin');
        const avatar = row.querySelector('.member-avatar-preview').textContent;

        if (nameInput && nameInput.value.trim()) {
          members.push({
            id: `m_${Date.now()}_${idx}`,
            name: nameInput.value.trim(),
            role: roleInput ? roleInput.value.trim() || 'Member' : 'Member',
            avatar: avatar || '👤',
            pin: pinInput ? pinInput.value.trim() : '',
            bio: 'Part of our warm family circle ❤️',
            online: true,
            lastSeen: 'Just now'
          });
        }
      });

      if (members.length < 2) {
        showToast('Please add at least 2 family members.', '⚠️');
        return;
      }

      const newFam = {
        id: famId,
        name: famName,
        passwordHash: famPass,
        avatar: '🌊',
        members: members
      };

      STATE.families.push(newFam);
      saveState();

      DOM.setupFamilyModal.classList.add('hidden');
      STATE.currentFamily = newFam;
      showToast(`Created ${famName} successfully!`, '🎉');
      showMemberSelectionStep();
    });
  }

  function loginAsMember(member) {
    STATE.currentMember = member;
    DOM.authScreen.classList.remove('active');
    DOM.appScreen.classList.remove('hidden');

    // Update member online state
    member.online = true;
    saveState();

    renderAppHeader();
    renderSidebar();
    renderMessages();
    updateBadges();

    showToast(`Entered family chat as ${member.name}`, member.avatar);
  }

  // =========================================================================
  // 6. MAIN CHAT ENGINE & RENDERING
  // =========================================================================
  function renderAppHeader() {
    if (!STATE.currentFamily || !STATE.currentMember) return;
    DOM.headerFamilyName.textContent = STATE.currentFamily.name;
    const onlineCount = STATE.currentFamily.members.filter(m => m.online).length;
    DOM.headerStats.textContent = `${STATE.currentFamily.members.length} Members • ${onlineCount} Online`;

    DOM.currentUserAvatar.textContent = STATE.currentMember.avatar;
    DOM.currentUserName.textContent = STATE.currentMember.name;
    DOM.headerUserAvatar.textContent = STATE.currentMember.avatar;
  }

  function renderSidebar() {
    if (!STATE.currentFamily) return;
    DOM.sidebarMemberCount.textContent = STATE.currentFamily.members.length;
    DOM.sidebarMembersList.innerHTML = '';

    STATE.currentFamily.members.forEach(member => {
      const isCurrent = member.id === STATE.currentMember.id;
      const card = document.createElement('div');
      card.className = `sidebar-member-card ${isCurrent ? 'active' : ''}`;
      
      const isOnline = member.online && STATE.showOnlinePrivacy;

      card.innerHTML = `
        <div class="member-avatar-box">
          <span>${member.avatar}</span>
          <span class="online-dot ${isOnline ? 'online' : 'offline'}"></span>
        </div>
        <div class="member-card-details">
          <div class="member-card-name-row">
            <span class="member-card-name">${escapeHtml(member.name)} ${isCurrent ? '(You)' : ''}</span>
            <span class="member-card-role">${escapeHtml(member.role)}</span>
          </div>
          <span class="member-card-status ${isOnline ? 'online' : ''}">
            ${isOnline ? '🟢 Online' : `⚪ ${member.lastSeen || 'Offline'}`}
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        openMemberProfile(member);
      });

      DOM.sidebarMembersList.appendChild(card);
    });
  }

  function renderMessages() {
    DOM.messagesStream.innerHTML = '';

    let lastDate = null;

    STATE.messages.forEach(msg => {
      // Date Separator
      if (msg.date !== lastDate) {
        lastDate = msg.date;
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date-separator';
        dateDiv.innerHTML = `<span>${escapeHtml(msg.date)}</span>`;
        DOM.messagesStream.appendChild(dateDiv);
      }

      const isOutgoing = STATE.currentMember && msg.senderId === STATE.currentMember.id;
      const bubbleWrapper = document.createElement('div');
      bubbleWrapper.className = `message-bubble-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`;
      bubbleWrapper.id = `msg-el-${msg.id}`;

      // Highlight mentions with tags
      let renderedText = escapeHtml(msg.text);
      if (STATE.currentFamily) {
        STATE.currentFamily.members.forEach(m => {
          const mentionPattern = new RegExp(`@${m.name}\\b`, 'gi');
          renderedText = renderedText.replace(mentionPattern, `<span class="mention-tag">@${m.name}</span>`);
        });
      }

      // Quoted Reply snippet
      let replyHtml = '';
      if (msg.replyTo) {
        replyHtml = `
          <div class="reply-quote-card" onclick="FamWave.scrollToMessage('${msg.replyTo.id}')">
            <span class="reply-quote-sender">Replying to ${escapeHtml(msg.replyTo.senderName)}</span>
            <p class="reply-quote-text">${escapeHtml(msg.replyTo.snippet)}</p>
          </div>
        `;
      }

      // Attached Image or Document
      let attachHtml = '';
      if (msg.attachment) {
        if (msg.attachment.type === 'image') {
          attachHtml = `
            <div class="message-image-frame" onclick="FamWave.openLightbox('${escapeHtml(msg.attachment.url)}', '${escapeHtml(msg.attachment.name || 'Family Photo')}')">
              <img src="${escapeHtml(msg.attachment.url)}" alt="${escapeHtml(msg.attachment.name || 'Family Photo')}" loading="lazy">
            </div>
          `;
        } else if (msg.attachment.type === 'doc') {
          attachHtml = `
            <div class="message-doc-card">
              <span class="doc-icon">📄</span>
              <div class="doc-details">
                <div class="doc-title">${escapeHtml(msg.attachment.name)}</div>
                <div class="doc-size">${escapeHtml(msg.attachment.size || 'Document')}</div>
              </div>
              <button class="doc-btn" onclick="FamWave.downloadSimulatedDoc('${escapeHtml(msg.attachment.name)}')">View</button>
            </div>
          `;
        }
      }

      // Reactions Tray
      let reactionsHtml = '';
      if (msg.reactions && Object.keys(msg.reactions).length > 0) {
        reactionsHtml = '<div class="message-reactions-tray">';
        for (const [emoji, users] of Object.entries(msg.reactions)) {
          if (users.length > 0) {
            const hasReacted = STATE.currentMember && users.includes(STATE.currentMember.id);
            reactionsHtml += `
              <button class="reaction-pill ${hasReacted ? 'reacted' : ''}" onclick="FamWave.toggleReaction('${msg.id}', '${emoji}')" title="${users.length} reaction(s)">
                <span>${emoji}</span>
                <span class="reaction-count">${users.length}</span>
              </button>
            `;
          }
        }
        reactionsHtml += '</div>';
      }

      // Action Bar on hover
      const actionsBarHtml = `
        <div class="message-actions-bar">
          <button class="msg-act-btn" onclick="FamWave.startReply('${msg.id}')" title="Reply">↩️</button>
          <button class="msg-act-btn" onclick="FamWave.toggleReaction('${msg.id}', '❤️')" title="Love">❤️</button>
          <button class="msg-act-btn" onclick="FamWave.toggleReaction('${msg.id}', '👍')" title="Thumbs Up">👍</button>
          <button class="msg-act-btn" onclick="FamWave.toggleReaction('${msg.id}', '😂')" title="Laugh">😂</button>
          <button class="msg-act-btn" onclick="FamWave.togglePin('${msg.id}')" title="${msg.isPinned ? 'Unpin Message' : 'Pin Message'}">${msg.isPinned ? '📌' : '📍'}</button>
          <button class="msg-act-btn" onclick="FamWave.copyMessage('${msg.id}')" title="Copy Text">📋</button>
          ${isOutgoing ? `<button class="msg-act-btn" onclick="FamWave.editMessage('${msg.id}')" title="Edit">✏️</button>` : ''}
          ${isOutgoing ? `<button class="msg-act-btn" onclick="FamWave.deleteMessage('${msg.id}')" title="Delete">🗑️</button>` : ''}
        </div>
      `;

      bubbleWrapper.innerHTML = `
        <div class="message-sender-avatar" title="${escapeHtml(msg.senderName)}">${msg.senderAvatar}</div>
        <div class="message-card">
          ${actionsBarHtml}
          <div class="message-header-row">
            <span class="message-sender-name">${escapeHtml(msg.senderName)}</span>
            ${msg.isPinned ? '<span class="pinned-tag">📌 Pinned</span>' : ''}
          </div>
          ${replyHtml}
          <div class="message-text">${renderedText}</div>
          ${attachHtml}
          ${reactionsHtml}
          <div class="message-meta-row">
            ${msg.edited ? '<span class="message-edited-badge">(edited)</span>' : ''}
            <span class="message-time">${escapeHtml(msg.timestamp)}</span>
            ${isOutgoing ? `<span class="read-status-icon ${msg.readStatus === 'read' ? 'read' : ''}">${msg.readStatus === 'read' ? '✓✓' : '✓'}</span>` : ''}
          </div>
        </div>
      `;

      DOM.messagesStream.appendChild(bubbleWrapper);
    });

    scrollToBottom();
  }

  function scrollToBottom(smooth = false) {
    if (smooth) {
      DOM.messagesContainer.scrollTo({ top: DOM.messagesContainer.scrollHeight, behavior: 'smooth' });
    } else {
      DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
    }
  }

  function updateBadges() {
    const pinnedCount = STATE.messages.filter(m => m.isPinned).length;
    DOM.pinnedCountBadge.textContent = pinnedCount;
    DOM.notifCountBadge.textContent = STATE.notifications.length;
  }

  // =========================================================================
  // 7. MESSAGE INPUT, ATTACHMENTS & EMOJIS
  // =========================================================================
  function initChatInput() {
    // Submit message form
    DOM.chatInputForm.addEventListener('submit', e => {
      e.preventDefault();
      sendMessage();
    });

    DOM.chatMessageInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea & mention check
    DOM.chatMessageInput.addEventListener('input', () => {
      DOM.chatMessageInput.style.height = 'auto';
      DOM.chatMessageInput.style.height = Math.min(DOM.chatMessageInput.scrollHeight, 120) + 'px';
      checkMentionAutocomplete();
    });

    // Emoji Picker Tab and Grid Setup
    const EMOJI_SETS = {
      family: ['👨‍👩‍👧‍👦', '❤️', '😊', '🏠', '🫂', '👶', '👴', '👵', '🥰', '💐', '✨', '🌟', '💖', '🌞', '🌙', '☕', '🍲', '🎂'],
      hearts: ['❤️', '💖', '💙', '💜', '💚', '💛', '🤍', '🧡', '💞', '💕', '💌', '💓', '💗', '💘', '💝', '✨', '🌸', '🌹'],
      reactions: ['👍', '😂', '😮', '😢', '🎉', '🔥', '👏', '🙏', '🙌', '💯', '🤩', '🥳', '😎', '👌', '🤝', '💪', '🚀', '⭐'],
      home: ['🏠', '🍕', '🍲', '☕', '🍉', '🥗', '🚗', '✈️', '🏖️', '⛰️', '🏕️', '📷', '🎁', '🎈', '🛒', '🚲', '⚽', '🎒']
    };

    function populateEmojiGrid(category = 'family') {
      DOM.emojiPickerGrid.innerHTML = '';
      const list = EMOJI_SETS[category] || EMOJI_SETS.family;
      list.forEach(emoji => {
        const span = document.createElement('span');
        span.className = 'emoji-cell';
        span.textContent = emoji;
        span.addEventListener('click', () => {
          DOM.chatMessageInput.value += emoji;
          DOM.chatMessageInput.focus();
        });
        DOM.emojiPickerGrid.appendChild(span);
      });
    }

    populateEmojiGrid('family');

    document.querySelectorAll('.emoji-tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.emoji-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        populateEmojiGrid(e.target.dataset.cat);
      });
    });

    DOM.btnToggleEmoji.addEventListener('click', e => {
      e.stopPropagation();
      DOM.emojiPickerPanel.classList.toggle('hidden');
      DOM.attachmentMenu.classList.add('hidden');
    });

    // Attachment dropdown toggle
    DOM.btnToggleAttach.addEventListener('click', e => {
      e.stopPropagation();
      DOM.attachmentMenu.classList.toggle('hidden');
      DOM.emojiPickerPanel.classList.add('hidden');
    });

    // Close popups on outer click
    document.addEventListener('click', e => {
      if (!DOM.emojiPickerPanel.contains(e.target) && e.target !== DOM.btnToggleEmoji) {
        DOM.emojiPickerPanel.classList.add('hidden');
      }
      if (!DOM.attachmentMenu.contains(e.target) && e.target !== DOM.btnToggleAttach) {
        DOM.attachmentMenu.classList.add('hidden');
      }
    });

    // Sample Photo Trigger
    DOM.btnSamplePhoto.addEventListener('click', () => {
      DOM.attachmentMenu.classList.add('hidden');
      sendPhotoMessage(SAMPLE_PHOTO_URI, 'Family_Getaway.png');
    });

    // File Image Input
    DOM.fileInputImage.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit.', '⚠️');
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        sendPhotoMessage(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
      DOM.attachmentMenu.classList.add('hidden');
      DOM.fileInputImage.value = '';
    });

    // File Document Input
    DOM.fileInputDoc.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      sendDocMessage(file.name, sizeStr);
      DOM.attachmentMenu.classList.add('hidden');
      DOM.fileInputDoc.value = '';
    });

    // Cancel Context Bar
    DOM.btnCloseContext.addEventListener('click', () => {
      STATE.activeReply = null;
      STATE.editingMessageId = null;
      DOM.messageContextBar.classList.add('hidden');
    });
  }

  function checkMentionAutocomplete() {
    const text = DOM.chatMessageInput.value;
    const cursorPos = DOM.chatMessageInput.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && lastAt === textBeforeCursor.length - 1) {
      // Show autocomplete options
      DOM.mentionAutocompleteBox.innerHTML = '';
      if (STATE.currentFamily) {
        STATE.currentFamily.members.forEach(member => {
          if (member.id !== STATE.currentMember.id) {
            const item = document.createElement('div');
            item.className = 'mention-suggest-item';
            item.innerHTML = `
              <span class="mention-suggest-avatar">${member.avatar}</span>
              <span class="mention-suggest-name">${escapeHtml(member.name)}</span>
            `;
            item.addEventListener('click', () => {
              const before = text.slice(0, lastAt);
              const after = text.slice(cursorPos);
              DOM.chatMessageInput.value = `${before}@${member.name} ${after}`;
              DOM.mentionAutocompleteBox.classList.add('hidden');
              DOM.chatMessageInput.focus();
            });
            DOM.mentionAutocompleteBox.appendChild(item);
          }
        });
        DOM.mentionAutocompleteBox.classList.remove('hidden');
      }
    } else {
      DOM.mentionAutocompleteBox.classList.add('hidden');
    }
  }

  function sendMessage() {
    const rawText = DOM.chatMessageInput.value.trim();
    if (!rawText) return;

    if (STATE.editingMessageId) {
      // Edit existing message
      const target = STATE.messages.find(m => m.id === STATE.editingMessageId);
      if (target) {
        target.text = rawText;
        target.edited = true;
        saveState();
        renderMessages();
        showToast('Message updated', '✏️');
      }
      STATE.editingMessageId = null;
      DOM.messageContextBar.classList.add('hidden');
      DOM.chatMessageInput.value = '';
      return;
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: STATE.currentMember.id,
      senderName: STATE.currentMember.name,
      senderAvatar: STATE.currentMember.avatar,
      text: rawText,
      timestamp: formatTime(),
      date: 'Today',
      isPinned: false,
      reactions: {},
      readStatus: 'delivered'
    };

    if (STATE.activeReply) {
      newMsg.replyTo = {
        id: STATE.activeReply.id,
        senderName: STATE.activeReply.senderName,
        snippet: STATE.activeReply.text.slice(0, 50) + (STATE.activeReply.text.length > 50 ? '...' : '')
      };
      STATE.activeReply = null;
      DOM.messageContextBar.classList.add('hidden');
    }

    // Check for @mentions and trigger simulated notification
    if (STATE.currentFamily) {
      STATE.currentFamily.members.forEach(m => {
        if (rawText.includes(`@${m.name}`) && m.id !== STATE.currentMember.id) {
          addNotification(`🔔 ${STATE.currentMember.name} mentioned ${m.name} in family chat.`);
        }
      });
    }

    STATE.messages.push(newMsg);
    saveState();
    renderMessages();

    DOM.chatMessageInput.value = '';
    DOM.chatMessageInput.style.height = 'auto';

    // Simulate other member read status & reply after a moment
    triggerSimulationResponses(rawText);
  }

  function sendPhotoMessage(dataUri, filename = 'Family_Photo.jpg') {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: STATE.currentMember.id,
      senderName: STATE.currentMember.name,
      senderAvatar: STATE.currentMember.avatar,
      text: 'Shared a family photo 🖼️',
      attachment: {
        type: 'image',
        name: filename,
        url: dataUri
      },
      timestamp: formatTime(),
      date: 'Today',
      isPinned: false,
      reactions: { '❤️': [STATE.currentMember.id] },
      readStatus: 'delivered'
    };

    STATE.messages.push(newMsg);
    saveState();
    renderMessages();
    showToast('Photo shared to family chat!', '🖼️');
  }

  function sendDocMessage(filename, sizeStr) {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: STATE.currentMember.id,
      senderName: STATE.currentMember.name,
      senderAvatar: STATE.currentMember.avatar,
      text: `Shared document: ${filename}`,
      attachment: {
        type: 'doc',
        name: filename,
        size: sizeStr
      },
      timestamp: formatTime(),
      date: 'Today',
      isPinned: false,
      reactions: {},
      readStatus: 'delivered'
    };

    STATE.messages.push(newMsg);
    saveState();
    renderMessages();
    showToast(`Shared ${filename}`, '📄');
  }

  // =========================================================================
  // 8. SIMULATION RESPONSES & TYPING INDICATORS
  // =========================================================================
  function triggerSimulationResponses(userText) {
    // Select an alternate online member to respond
    const otherMembers = STATE.currentFamily.members.filter(
      m => m.id !== STATE.currentMember.id && m.online
    );
    if (otherMembers.length === 0) return;

    const responder = otherMembers[Math.floor(Math.random() * otherMembers.length)];

    // Show typing after 1.5s
    setTimeout(() => {
      DOM.typingStatusText.textContent = `${responder.name} is typing`;
      DOM.liveTypingIndicator.classList.add('active');

      setTimeout(() => {
        DOM.liveTypingIndicator.classList.remove('active');

        let replyText = 'Love this! ❤️';
        const lower = userText.toLowerCase();
        if (lower.includes('dinner') || lower.includes('food')) {
          replyText = 'Sounds delicious! Can\'t wait 😊';
        } else if (lower.includes('trip') || lower.includes('coorg')) {
          replyText = 'All ready for Sunday! 🚙';
        } else if (lower.includes('photo') || lower.includes('pic')) {
          replyText = 'What a wonderful photo! 📸';
        } else {
          const genericReplies = [
            'Got it! 👍',
            'Sounds great! ❤️',
            'Will check it out right away.',
            'Thanks for sharing!'
          ];
          replyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
        }

        const simMsg = {
          id: `msg-${Date.now()}`,
          senderId: responder.id,
          senderName: responder.name,
          senderAvatar: responder.avatar,
          text: replyText,
          timestamp: formatTime(),
          date: 'Today',
          isPinned: false,
          reactions: {},
          readStatus: 'read'
        };

        STATE.messages.push(simMsg);
        saveState();
        renderMessages();
        showToast(`${responder.name}: "${replyText}"`, responder.avatar);
      }, 2500);
    }, 1200);
  }

  function addNotification(text) {
    const notif = {
      id: `notif-${Date.now()}`,
      text: text,
      time: formatTime()
    };
    STATE.notifications.unshift(notif);
    saveState();
    updateBadges();
  }

  // =========================================================================
  // 9. MEMBER PROFILE & MODALS
  // =========================================================================
  function openMemberProfile(member) {
    DOM.profModalAvatar.textContent = member.avatar;
    DOM.profModalName.textContent = member.name;
    DOM.profModalRole.textContent = member.role;
    const isOnline = member.online && STATE.showOnlinePrivacy;
    DOM.profModalStatusText.textContent = isOnline ? '🟢 Online' : `⚪ ${member.lastSeen || 'Offline'}`;
    DOM.profModalStatusDot.className = `profile-online-badge ${isOnline ? 'online' : 'offline'}`;
    DOM.profModalBio.textContent = `"${member.bio || 'Family member'}"`;
    DOM.profModalFamilyId.textContent = STATE.currentFamily ? STATE.currentFamily.id : 'PRASAADH2026';

    DOM.memberProfileModal.classList.remove('hidden');

    DOM.btnDirectMessageProfile.onclick = () => {
      DOM.memberProfileModal.classList.add('hidden');
      DOM.chatMessageInput.value = `@${member.name} `;
      DOM.chatMessageInput.focus();
    };
  }

  function initModalsAndDrawers() {
    // Member Profile Close
    DOM.btnCloseProfileModal.addEventListener('click', () => {
      DOM.memberProfileModal.classList.add('hidden');
    });

    // My Profile Button
    DOM.btnOpenMyProfile.addEventListener('click', () => {
      if (STATE.currentMember) openMemberProfile(STATE.currentMember);
    });

    // Quick Member Switcher (for pair demo)
    DOM.btnQuickSwitch.addEventListener('click', () => {
      if (!STATE.currentFamily) return;
      const members = STATE.currentFamily.members;
      const curIdx = members.findIndex(m => m.id === STATE.currentMember.id);
      const nextMember = members[(curIdx + 1) % members.length];
      STATE.currentMember = nextMember;
      renderAppHeader();
      renderSidebar();
      renderMessages();
      showToast(`Switched active user to ${nextMember.name}`, nextMember.avatar);
    });

    // Sidebar Toggle for Mobile
    DOM.btnToggleSidebar.addEventListener('click', () => {
      DOM.appSidebar.classList.toggle('open');
    });

    // Search Drawer
    DOM.btnOpenSearch.addEventListener('click', () => {
      DOM.searchDrawer.classList.remove('hidden');
      DOM.drawerSearchInput.focus();
      renderSearchResults();
    });
    DOM.btnCloseSearch.addEventListener('click', () => DOM.searchDrawer.classList.add('hidden'));
    DOM.btnClearSearchDrawer.addEventListener('click', () => {
      DOM.drawerSearchInput.value = '';
      renderSearchResults();
    });
    DOM.drawerSearchInput.addEventListener('input', renderSearchResults);

    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', e => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderSearchResults();
      });
    });

    function renderSearchResults() {
      const q = DOM.drawerSearchInput.value.trim().toLowerCase();
      const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';

      let results = STATE.messages.filter(msg => {
        const matchesQuery = !q || msg.text.toLowerCase().includes(q) || msg.senderName.toLowerCase().includes(q);
        if (!matchesQuery) return false;

        if (activeFilter === 'photos') return msg.attachment && msg.attachment.type === 'image';
        if (activeFilter === 'files') return msg.attachment && msg.attachment.type === 'doc';
        if (activeFilter === 'pinned') return msg.isPinned;
        return true;
      });

      DOM.searchResultsList.innerHTML = '';
      if (results.length === 0) {
        DOM.searchResultsList.innerHTML = `
          <div class="empty-search-state">
            <span>🔍</span>
            <p>No messages match your search.</p>
          </div>
        `;
        return;
      }

      results.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          <div class="result-sender-row">
            <span class="result-sender">${msg.senderAvatar} ${escapeHtml(msg.senderName)}</span>
            <span class="result-time">${escapeHtml(msg.timestamp)}</span>
          </div>
          <p class="result-snippet">${escapeHtml(msg.text)}</p>
        `;
        item.addEventListener('click', () => {
          DOM.searchDrawer.classList.add('hidden');
          FamWave.scrollToMessage(msg.id);
        });
        DOM.searchResultsList.appendChild(item);
      });
    }

    // Pinned Messages Modal
    DOM.btnOpenPinned.addEventListener('click', () => {
      renderPinnedMessagesList();
      DOM.pinnedModal.classList.remove('hidden');
    });
    DOM.btnClosePinnedModal.addEventListener('click', () => DOM.pinnedModal.classList.add('hidden'));

    function renderPinnedMessagesList() {
      const pinned = STATE.messages.filter(m => m.isPinned);
      DOM.pinnedMessagesList.innerHTML = '';
      if (pinned.length === 0) {
        DOM.pinnedMessagesList.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 24px;">
            <span>📌</span>
            <p style="margin-top: 8px;">No pinned family announcements yet.</p>
          </div>
        `;
        return;
      }

      pinned.forEach(msg => {
        const card = document.createElement('div');
        card.className = 'pinned-item-card';
        card.innerHTML = `
          <div class="result-sender-row">
            <span class="result-sender">${msg.senderAvatar} ${escapeHtml(msg.senderName)}</span>
            <span class="result-time">Pinned by ${escapeHtml(msg.pinnedBy || msg.senderName)}</span>
          </div>
          <p class="result-snippet">${escapeHtml(msg.text)}</p>
        `;
        card.addEventListener('click', () => {
          DOM.pinnedModal.classList.add('hidden');
          FamWave.scrollToMessage(msg.id);
        });
        DOM.pinnedMessagesList.appendChild(card);
      });
    }

    // Notifications Drawer
    DOM.btnOpenNotifications.addEventListener('click', () => {
      renderNotificationsList();
      DOM.notificationsDrawer.classList.remove('hidden');
    });
    DOM.btnCloseNotifications.addEventListener('click', () => DOM.notificationsDrawer.classList.add('hidden'));
    DOM.btnClearNotifs.addEventListener('click', () => {
      STATE.notifications = [];
      saveState();
      updateBadges();
      renderNotificationsList();
    });

    function renderNotificationsList() {
      DOM.notificationsList.innerHTML = '';
      if (STATE.notifications.length === 0) {
        DOM.notificationsList.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 24px;">
            <span>🔔</span>
            <p style="margin-top: 8px;">No new family notifications.</p>
          </div>
        `;
        return;
      }

      STATE.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'notif-item';
        item.innerHTML = `
          <p style="font-size: 0.88rem; color: #fff;">${escapeHtml(notif.text)}</p>
          <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: block;">${escapeHtml(notif.time)}</span>
        `;
        DOM.notificationsList.appendChild(item);
      });
    }

    // Lightbox Close
    DOM.btnCloseLightbox.addEventListener('click', () => {
      DOM.imageLightbox.classList.add('hidden');
    });

    // Family Settings / Management
    DOM.btnManageFamily.addEventListener('click', () => {
      showToast(`Family ID: ${STATE.currentFamily.id} | Members: ${STATE.currentFamily.members.length}`, '⚙️');
    });

    // Privacy Toggle (Online Status)
    DOM.toggleOnlinePrivacy.checked = STATE.showOnlinePrivacy;
    DOM.toggleOnlinePrivacy.addEventListener('change', e => {
      STATE.showOnlinePrivacy = e.target.checked;
      DOM.privacyStatusLabel.textContent = STATE.showOnlinePrivacy ? 'Show Online Status' : 'Online Status Hidden';
      saveState();
      renderSidebar();
      showToast(STATE.showOnlinePrivacy ? 'Online status is visible to family' : 'Online status hidden', '🛡️');
    });

    // Logout / Lock Room
    DOM.btnFamilyLogout.addEventListener('click', () => {
      if (confirm('Lock and exit this Family Space?')) {
        DOM.appScreen.classList.add('hidden');
        DOM.authScreen.classList.add('active');
        DOM.authStepMember.classList.remove('active');
        DOM.authStepFamily.classList.add('active');
        STATE.currentFamily = null;
        STATE.currentMember = null;
        showToast('Family space locked safely 🔒', '🌊');
      }
    });
  }

  // =========================================================================
  // 10. GLOBAL EXPORTED HELPER ACTIONS (FamWave namespace)
  // =========================================================================
  window.FamWave = {
    scrollToMessage: function(msgId) {
      const el = document.getElementById(`msg-el-${msgId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 24px rgba(6, 182, 212, 0.8)';
        setTimeout(() => {
          el.style.boxShadow = '';
        }, 1800);
      }
    },

    startReply: function(msgId) {
      const msg = STATE.messages.find(m => m.id === msgId);
      if (!msg) return;
      STATE.activeReply = msg;
      STATE.editingMessageId = null;
      DOM.contextLabel.textContent = `Replying to ${msg.senderName}`;
      DOM.contextSnippet.textContent = msg.text;
      DOM.messageContextBar.classList.remove('hidden');
      DOM.chatMessageInput.focus();
    },

    toggleReaction: function(msgId, emoji) {
      const msg = STATE.messages.find(m => m.id === msgId);
      if (!msg || !STATE.currentMember) return;
      if (!msg.reactions) msg.reactions = {};
      if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

      const memberId = STATE.currentMember.id;
      const idx = msg.reactions[emoji].indexOf(memberId);

      if (idx > -1) {
        msg.reactions[emoji].splice(idx, 1);
        if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
      } else {
        msg.reactions[emoji].push(memberId);
        addNotification(`🔔 ${STATE.currentMember.name} reacted ${emoji} to a message.`);
      }

      saveState();
      renderMessages();
    },

    togglePin: function(msgId) {
      const msg = STATE.messages.find(m => m.id === msgId);
      if (!msg) return;
      msg.isPinned = !msg.isPinned;
      msg.pinnedBy = msg.isPinned ? STATE.currentMember.name : null;
      saveState();
      renderMessages();
      updateBadges();
      showToast(msg.isPinned ? 'Message pinned to family notices 📌' : 'Message unpinned', '📌');
    },

    copyMessage: function(msgId) {
      const msg = STATE.messages.find(m => m.id === msgId);
      if (!msg) return;
      navigator.clipboard.writeText(msg.text).then(() => {
        showToast('Message copied to clipboard', '📋');
      }).catch(() => {
        showToast('Copied: ' + msg.text.slice(0, 25), '📋');
      });
    },

    editMessage: function(msgId) {
      const msg = STATE.messages.find(m => m.id === msgId);
      if (!msg) return;
      STATE.editingMessageId = msg.id;
      STATE.activeReply = null;
      DOM.contextLabel.textContent = 'Editing Message';
      DOM.contextSnippet.textContent = msg.text;
      DOM.messageContextBar.classList.remove('hidden');
      DOM.chatMessageInput.value = msg.text;
      DOM.chatMessageInput.focus();
    },

    deleteMessage: function(msgId) {
      if (!confirm('Delete this message for everyone in the family?')) return;
      STATE.messages = STATE.messages.filter(m => m.id !== msgId);
      saveState();
      renderMessages();
      updateBadges();
      showToast('Message deleted', '🗑️');
    },

    openLightbox: function(imgUrl, caption = 'Family Photo') {
      DOM.lightboxImg.src = imgUrl;
      DOM.lightboxCaption.textContent = caption;
      DOM.lightboxDownloadLink.href = imgUrl;
      DOM.imageLightbox.classList.remove('hidden');
    },

    downloadSimulatedDoc: function(docName) {
      showToast(`Opening document: ${docName}`, '📄');
    }
  };

  // =========================================================================
  // 11. INITIALIZATION ON LOAD
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initWaveCanvas();
    initAuth();
    initChatInput();
    initModalsAndDrawers();
    updateBadges();
  });

})();
