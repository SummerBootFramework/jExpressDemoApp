/**
 * File Upload Manager SPA
 * Features: Login with JWT, File Upload with Drag & Drop, Progress Tracking
 */

// Constants
const CONFIG = {
    CONTEXT_ROOT: '/sampleapp/service/v1',
    STORAGE_KEY_TOKEN: 'authtoken',
    STORAGE_KEY_UID: 'uid',
    STORAGE_KEY_DISPLAY_NAME: 'displayName',
    STORAGE_KEY_TENANT_NAME: 'tenantName',
    STORAGE_KEY_GROUP_NAME: 'groupName',
    URI_LOGIN: '/j_security_check',
    URI_WS_OTT: '/ott',
    URI_UPLOAD: '/upload',
    URI_PING: '/ping',
    URI_ADMIN_VERSION: '/version',
    URI_ADMIN_CHECKHEALTH: '/checkhealth',
    URI_ADMIN_GRACEFULSHUTDOWN: '/gracefulshutdown',
    URI_MOCK_HEALTSTATUS: '/mock/health/',
    WS_URL_CHATROOM1: '/ws/chatroom1',
    WS_URL_CHATROOM2: '/ws/chatroom2'
};

const SUBMENU_VIEWS = {
    menu0: 'homeView',
    menu1: 'demo1View',
    menu2: 'demo2View',
    menu3: 'demo3View',
    menu4: 'demo4View',
    menu5: 'demo5View',
    menu6: 'demo6View',
    menu7: 'demo7View'
};

// State
let appState = {
    token: null,
    uid: '',
    displayName: '',
    tenantName: '',
    groupName: '',
    selectedFiles: [],
    uploadTasks: {},
    taskIdCounter: 0
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check for existing token
    const savedToken = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
    const savedUid = localStorage.getItem(CONFIG.STORAGE_KEY_UID) || '';
    ``
    const savedDisplayName = localStorage.getItem(CONFIG.STORAGE_KEY_DISPLAY_NAME) || '';
    const savedTenantName = localStorage.getItem(CONFIG.STORAGE_KEY_TENANT_NAME) || '';
    const savedGroupName = localStorage.getItem(CONFIG.STORAGE_KEY_GROUP_NAME) || '';

    appState.uid = savedUid;
    appState.displayName = savedDisplayName;
    appState.tenantName = savedTenantName;
    appState.groupName = savedGroupName;

    if (savedToken) {
        appState.token = savedToken;
        updateUserMenu();
        showUploadView();
    } else {
        updateUserMenu();
        showLoginView();
    }

    attachEventListeners();
    initSub32SplitResize();
}

function attachEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // File Upload module
    if (typeof attachFileUploadEventListeners === 'function') {
        attachFileUploadEventListeners();
    }

    // Logout - handle both desktop and mobile logout buttons
    const logoutBtn = document.getElementById('userLogoutBtn');
    const logoutBtnDesktop = document.getElementById('userLogoutBtnDesktop');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutBtnDesktop) {
        logoutBtnDesktop.addEventListener('click', handleLogout);
    }

    // Submenu navigation
    document.querySelectorAll('.submenu-link[data-view-target], .menu-link[data-view-target]').forEach(link => {
        link.addEventListener('click', handleSubmenuClick);
    });

    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleHamburgerMenu);
    }

    // Logo click → home view
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', e => {
            e.preventDefault();
            if (appState.token) {
                activateSubmenuView('menu0');
            }
        });
    }

    // Mobile submenu toggle - allow expanding/collapsing submenus on mobile
    setupMobileSubmenuToggle();
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const isHidden = passwordInput.type === 'password';

    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? '🙈' : '👁';
    togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

function toggleHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    hamburgerBtn.classList.toggle('open');
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');

    // Update accessibility attribute
    const isOpen = hamburgerBtn.classList.contains('open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
}

function closeHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbar = document.querySelector('.navbar');
    if (hamburgerBtn && navbar) {
        hamburgerBtn.classList.remove('open');
        navbar.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
}

function setupMobileSubmenuToggle() {
    // On mobile, parent menu items with submenus should toggle expand/collapse
    // instead of navigating directly
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            const menuLink = item.querySelector('.menu-link');
            if (menuLink) {
                menuLink.addEventListener('click', function (e) {
                    // Only prevent default on mobile (max-width 768px)
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        item.classList.toggle('expanded');

                        // Collapse other expanded items
                        document.querySelectorAll('.menu-item.expanded').forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('expanded');
                            }
                        });
                    }
                });
            }
        }
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', function (e) {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navbar = document.querySelector('.navbar');
        const header = document.querySelector('.header');

        if (hamburgerBtn && navbar && header && window.innerWidth <= 768) {
            if (!header.contains(e.target)) {
                closeHamburgerMenu();
            }
        }
    });
}

/**
 * LOGIN FUNCTIONALITY
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    const loginBtn = e.target.querySelector('button[type="submit"]');

    // Clear previous error
    loginError.textContent = '';

    // Prevent double-submit
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in…';
    }

    try {
        const response = await fetch(CONFIG.CONTEXT_ROOT + CONFIG.URI_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            throw new Error(`Login failed with status ${response.status}`);
        }
        const responseData = await response.json();

        // Get JWT from response header
        const token = response.headers.get('X-AuthToken');
        if (!token) {
            throw new Error('No authentication token received from server');
        }

        // Save token
        appState.token = token;
        appState.uid = responseData.uid || '';
        appState.displayName = responseData.displayName || username;
        appState.tenantName = responseData.tenantName || '';
        appState.groupName = responseData.groups || '';
        localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEY_UID, appState.uid);
        localStorage.setItem(CONFIG.STORAGE_KEY_DISPLAY_NAME, appState.displayName);
        localStorage.setItem(CONFIG.STORAGE_KEY_TENANT_NAME, appState.tenantName);
        localStorage.setItem(CONFIG.STORAGE_KEY_GROUP_NAME, appState.groupName);

        updateUserMenu();

        // Reset and clear form
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').textContent = '';

        // Show upload view
        showUploadView();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Login failed. Please try again.';
    } finally {
        // Re-enable the button so the user can try again
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }
}

function handleLogout() {
    const token = appState.token;

    // Call DELETE logout endpoint
    if (token) {
        fetch(CONFIG.CONTEXT_ROOT + '/login', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(error => {
            console.error('Logout API call error:', error);
        });
    }

    // Clear token
    appState.token = null;
    appState.uid = '';
    appState.displayName = '';
    appState.tenantName = '';
    appState.groupName = '';
    localStorage.removeItem(CONFIG.STORAGE_KEY_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEY_UID);
    localStorage.removeItem(CONFIG.STORAGE_KEY_DISPLAY_NAME);
    localStorage.removeItem(CONFIG.STORAGE_KEY_TENANT_NAME);
    localStorage.removeItem(CONFIG.STORAGE_KEY_GROUP_NAME);

    // Reset state and clear file upload UI
    if (typeof resetFileUploadState === 'function') {
        resetFileUploadState();
    }

    // Close hamburger menu and add fade out animation
    const navbar = document.querySelector('.navbar');
    closeHamburgerMenu();
    if (navbar) {
        navbar.classList.add('fade-out');
        // Remove fade-out class after animation completes
        setTimeout(() => {
            navbar.classList.remove('fade-out');
        }, 300);
    }

    updateUserMenu();

    // Show login view
    showLoginView();

    // Final step: force a fresh page load after logout.
    const url = new URL(window.location.href);
    url.searchParams.set('_reload', Date.now().toString());
    window.location.replace(url.toString());
}

function handleSubmenuClick(e) {
    e.preventDefault();

    if (!appState.token) {
        return;
    }

    const viewTarget = e.currentTarget.getAttribute('data-view-target');
    activateSubmenuView(viewTarget);

    // Close hamburger menu after selecting a menu item
    closeHamburgerMenu();
}

/**
 * VIEW MANAGEMENT
 */
function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('appViews').classList.add('hidden');
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active-root'));
    document.querySelector('.navbar')?.classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    // Hide hamburger menu during login
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.classList.add('hidden');
    }
    document.getElementById('username').focus();
}

function showUploadView() {
    document.getElementById('loginView').classList.remove('active');
    document.getElementById('appViews').classList.remove('hidden');
    document.querySelector('.navbar')?.classList.remove('hidden');
    // Show hamburger menu after login
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('hidden');
    }
    activateSubmenuView('menu0');
    document.getElementById('userMenu').classList.remove('hidden');
}

function activateSubmenuView(viewTarget) {
    const targetViewId = SUBMENU_VIEWS[viewTarget];
    if (!targetViewId) {
        return;
    }

    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active-root'));

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetLink = document.querySelector(`.submenu-link[data-view-target="${viewTarget}"], .menu-link[data-view-target="${viewTarget}"]`);
    if (targetLink) {
        if (targetLink.classList.contains('menu-link')) {
            targetLink.classList.add('active-root');
        } else {
            targetLink.classList.add('active');
            const rootMenuLink = targetLink.closest('.menu-item')?.querySelector('.menu-link');
            if (rootMenuLink) {
                rootMenuLink.classList.add('active-root');
            }
        }
    }
}


function updateUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuLabel = document.getElementById('userMenuLabel');
    const userMenuLabelDesktop = document.getElementById('userMenuLabelDesktop');
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const displayName = appState.displayName || 'User';
    const tenantName = appState.tenantName || '';
    //const groupName = appState.groupName || '';
    const groupName = (appState.groupName && String(appState.groupName).trim()) ?
        ` (${String(appState.groupName).trim()})` : '';

    userMenuLabel.textContent = displayName;
    if (userMenuLabelDesktop) {
        userMenuLabelDesktop.textContent = displayName;
        userMenuLabelDesktop.setAttribute('title', tenantName + groupName);
    }
    userMenuTrigger.setAttribute('title', tenantName + groupName);

    if (appState.token) {
        userMenu.classList.remove('hidden');
    } else {
        userMenu.classList.add('hidden');
    }
}

function initSub32SplitResize() {
    const container = document.getElementById('sub32SplitContainer');
    const leftPane = document.getElementById('sub32LeftPane');
    const rightPane = document.getElementById('sub32RightPane');
    const divider = document.getElementById('sub32Divider');

    if (!container || !leftPane || !rightPane || !divider) {
        return;
    }

    const MIN_PANE_WIDTH = 180;
    const MAX_PANE_RATIO = 0.8;
    let isDragging = false;

    function updatePaneSizes(clientX) {
        const rect = container.getBoundingClientRect();
        const dividerWidth = divider.offsetWidth;
        const totalPaneWidth = rect.width - dividerWidth;
        const maxPaneWidth = Math.floor(totalPaneWidth * MAX_PANE_RATIO);
        const minLeft = Math.max(MIN_PANE_WIDTH, totalPaneWidth - maxPaneWidth);
        const maxLeft = Math.min(maxPaneWidth, totalPaneWidth - MIN_PANE_WIDTH);
        let newLeft = clientX - rect.left;

        if (newLeft < minLeft) {
            newLeft = minLeft;
        }
        if (newLeft > maxLeft) {
            newLeft = maxLeft;
        }

        const rightWidth = totalPaneWidth - newLeft;
        leftPane.style.width = `${newLeft}px`;
        rightPane.style.width = `${rightWidth}px`;
    }

    function resetPaneSizes() {
        leftPane.style.width = '50%';
        rightPane.style.width = '50%';
    }

    divider.addEventListener('mousedown', e => {
        e.preventDefault();
        isDragging = true;
        document.body.classList.add('split-resizing');
    });

    divider.addEventListener('dblclick', e => {
        e.preventDefault();
        resetPaneSizes();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) {
            return;
        }
        updatePaneSizes(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) {
            return;
        }
        isDragging = false;
        document.body.classList.remove('split-resizing');
    });
}

function initWs() {
    //const wsClient = new WebSocketClient_Custom(CONFIG.WS_URL_CHATROOM1);
    const wsClient = new WebSocketClient_STOMP(CONFIG.WS_URL_CHATROOM2);
    wsClient.apiInitGUI('wsStatus', 'wsConnectBtn', 'wsDisconnectBtn', 'wsSendBtn', 'wsFileInput', 'wsChatInput', 'wsChatMessages', 'wsClearBtn', 'wsFileUploadProgressBar', 'wsFileUploadStatusText');
}

document.addEventListener('DOMContentLoaded', initWs);