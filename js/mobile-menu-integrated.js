// 모바일 통합 메뉴 시스템
class MobileMenuIntegrated {
    constructor() {
        this.isMenuOpen = false;
        this.user = null;
        this.init();
    }

    init() {
        // 사용자 정보 로드
        this.loadUserInfo();

        // 메뉴 HTML 생성
        this.createMenuStructure();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 모바일 감지 및 적용
        this.detectMobile();
    }

    loadUserInfo() {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            this.user = JSON.parse(userInfo);
        }
    }

    createMenuStructure() {
        // 기존 메뉴가 있으면 제거
        const existingMenu = document.getElementById('mobile-integrated-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // 모바일 헤더 생성
        const mobileHeader = document.createElement('div');
        mobileHeader.id = 'mobile-header';
        mobileHeader.className = 'mobile-header';
        mobileHeader.innerHTML = `
            <div class="mobile-header-content">
                <div class="logo-section">
                    <a href="index.html" class="mobile-logo">AIFI</a>
                </div>
                <button class="hamburger-menu" id="hamburgerBtn" aria-label="메뉴">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        `;

        // 통합 메뉴 생성
        const integratedMenu = document.createElement('div');
        integratedMenu.id = 'mobile-integrated-menu';
        integratedMenu.className = 'mobile-integrated-menu';
        integratedMenu.innerHTML = `
            <div class="menu-overlay" id="menuOverlay"></div>
            <div class="menu-panel" id="menuPanel">
                <!-- 사용자 섹션 -->
                <div class="menu-user-section">
                    ${this.getUserSectionHTML()}
                </div>

                <!-- 구분선 -->
                <div class="menu-divider"></div>

                <!-- 네비게이션 메뉴 -->
                <nav class="menu-navigation">
                    <a href="index.html" class="menu-item">
                        <i class="ti ti-home"></i>
                        <span>홈</span>
                        <i class="ti ti-chevron-right arrow"></i>
                    </a>
                    <a href="storyboard/index.html" class="menu-item">
                        <i class="ti ti-layout-grid"></i>
                        <span>스토리보드</span>
                        <i class="ti ti-chevron-right arrow"></i>
                    </a>
                    <a href="concept-art/index.html" class="menu-item">
                        <i class="ti ti-palette"></i>
                        <span>컨셉아트</span>
                        <i class="ti ti-chevron-right arrow"></i>
                    </a>
                    <a href="user-dashboard.html" class="menu-item">
                        <i class="ti ti-dashboard"></i>
                        <span>대시보드</span>
                        <i class="ti ti-chevron-right arrow"></i>
                    </a>
                </nav>

                <!-- 구분선 -->
                <div class="menu-divider"></div>

                <!-- 사용자 메뉴 (로그인 상태) -->
                ${this.user ? `
                    <div class="menu-user-actions">
                        <a href="profile.html" class="menu-item">
                            <i class="ti ti-user-circle"></i>
                            <span>프로필 설정</span>
                            <i class="ti ti-chevron-right arrow"></i>
                        </a>
                        <a href="settings.html" class="menu-item">
                            <i class="ti ti-settings"></i>
                            <span>환경설정</span>
                            <i class="ti ti-chevron-right arrow"></i>
                        </a>
                        <button onclick="mobileMenu.handleLogout()" class="menu-item logout">
                            <i class="ti ti-logout"></i>
                            <span>로그아웃</span>
                            <i class="ti ti-chevron-right arrow"></i>
                        </button>
                    </div>
                ` : `
                    <div class="menu-auth-actions">
                        <a href="login-google.html" class="menu-item primary">
                            <i class="ti ti-login"></i>
                            <span>로그인</span>
                            <i class="ti ti-chevron-right arrow"></i>
                        </a>
                        <a href="signup-v2.html" class="menu-item">
                            <i class="ti ti-user-plus"></i>
                            <span>회원가입</span>
                            <i class="ti ti-chevron-right arrow"></i>
                        </a>
                    </div>
                `}

                <!-- 하단 정보 -->
                <div class="menu-footer">
                    <div class="menu-footer-links">
                        <a href="#">도움말</a>
                        <span>•</span>
                        <a href="#">개인정보</a>
                        <span>•</span>
                        <a href="#">약관</a>
                    </div>
                    <div class="menu-footer-copyright">
                        © 2024 AIFI. All rights reserved.
                    </div>
                </div>
            </div>
        `;

        // DOM에 추가
        document.body.appendChild(mobileHeader);
        document.body.appendChild(integratedMenu);

        // 스타일 추가
        this.addStyles();
    }

    getUserSectionHTML() {
        if (this.user) {
            const isApproved = localStorage.getItem('user_approved') === 'true';
            return `
                <div class="user-profile">
                    <img src="${this.user.picture || 'https://via.placeholder.com/80'}"
                         alt="${this.user.name}"
                         class="user-avatar">
                    <div class="user-info">
                        <h3 class="user-name">${this.user.name}</h3>
                        <p class="user-email">${this.user.email}</p>
                        <span class="user-status ${isApproved ? 'approved' : 'pending'}">
                            ${isApproved ? '✓ 승인됨' : '⏳ 승인 대기중'}
                        </span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="guest-welcome">
                    <div class="guest-icon">
                        <i class="ti ti-user-circle"></i>
                    </div>
                    <div class="guest-info">
                        <h3>환영합니다!</h3>
                        <p>로그인하여 모든 기능을 이용하세요</p>
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // 햄버거 버튼 클릭
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleMenu());
        }

        // 오버레이 클릭
        const overlay = document.getElementById('menuOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeMenu());
        }

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // 스와이프로 닫기 (모바일)
        this.setupSwipeGestures();
    }

    setupSwipeGestures() {
        const panel = document.getElementById('menuPanel');
        if (!panel) return;

        let touchStartX = 0;
        let touchEndX = 0;

        panel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        panel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        this.handleSwipe = () => {
            // 오른쪽으로 스와이프 (메뉴 닫기)
            if (touchEndX - touchStartX > 50) {
                this.closeMenu();
            }
        };
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        document.getElementById('menuPanel').classList.add('open');
        document.getElementById('menuOverlay').classList.add('show');
        document.getElementById('hamburgerBtn').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.isMenuOpen = false;
        document.getElementById('menuPanel').classList.remove('open');
        document.getElementById('menuOverlay').classList.remove('show');
        document.getElementById('hamburgerBtn').classList.remove('active');
        document.body.style.overflow = '';
    }

    handleLogout() {
        if (confirm('로그아웃 하시겠습니까?')) {
            // Google 로그아웃
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }

            // 로컬 스토리지 클리어
            localStorage.removeItem('user_info');
            localStorage.removeItem('user_approved');
            localStorage.removeItem('google_credential');

            // 페이지 새로고침
            window.location.reload();
        }
    }

    detectMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.body.classList.add('mobile-view');
        }

        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            const nowMobile = window.innerWidth <= 768;
            if (nowMobile) {
                document.body.classList.add('mobile-view');
            } else {
                document.body.classList.remove('mobile-view');
                this.closeMenu();
            }
        });
    }

    addStyles() {
        if (document.getElementById('mobile-menu-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'mobile-menu-styles';
        styles.innerHTML = `
            /* 모바일 헤더 */
            .mobile-header {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: rgba(20, 20, 20, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                z-index: 9999;
            }

            .mobile-view .mobile-header {
                display: block;
            }

            .mobile-header-content {
                height: 100%;
                padding: 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .mobile-logo {
                font-size: 24px;
                font-weight: 900;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-decoration: none;
            }

            /* 햄버거 메뉴 버튼 */
            .hamburger-menu {
                width: 30px;
                height: 24px;
                position: relative;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
            }

            .hamburger-line {
                position: absolute;
                left: 0;
                width: 100%;
                height: 2px;
                background: white;
                border-radius: 2px;
                transition: all 0.3s ease;
            }

            .hamburger-line:nth-child(1) {
                top: 0;
            }

            .hamburger-line:nth-child(2) {
                top: 11px;
            }

            .hamburger-line:nth-child(3) {
                bottom: 0;
            }

            .hamburger-menu.active .hamburger-line:nth-child(1) {
                transform: rotate(45deg) translate(8px, 8px);
            }

            .hamburger-menu.active .hamburger-line:nth-child(2) {
                opacity: 0;
            }

            .hamburger-menu.active .hamburger-line:nth-child(3) {
                transform: rotate(-45deg) translate(8px, -8px);
            }

            /* 메뉴 오버레이 */
            .menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 10000;
            }

            .menu-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            /* 메뉴 패널 */
            .menu-panel {
                position: fixed;
                top: 0;
                right: -320px;
                width: 320px;
                max-width: 85vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10001;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            .menu-panel.open {
                transform: translateX(-320px);
            }

            /* 사용자 섹션 */
            .menu-user-section {
                padding: 30px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .user-profile {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .user-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 3px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            }

            .user-info {
                flex: 1;
            }

            .user-name {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 4px 0;
                color: white;
            }

            .user-email {
                font-size: 13px;
                opacity: 0.9;
                margin: 0 0 8px 0;
            }

            .user-status {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                background: rgba(255, 255, 255, 0.2);
            }

            .user-status.approved {
                background: rgba(76, 175, 80, 0.3);
            }

            .user-status.pending {
                background: rgba(255, 193, 7, 0.3);
            }

            /* 게스트 환영 */
            .guest-welcome {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .guest-icon {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .guest-icon i {
                font-size: 32px;
                color: white;
            }

            .guest-info h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 4px 0;
                color: white;
            }

            .guest-info p {
                font-size: 13px;
                opacity: 0.9;
                margin: 0;
            }

            /* 구분선 */
            .menu-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0;
            }

            /* 메뉴 네비게이션 */
            .menu-navigation,
            .menu-user-actions,
            .menu-auth-actions {
                padding: 15px 0;
            }

            .menu-item {
                display: flex;
                align-items: center;
                padding: 14px 20px;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                transition: all 0.2s ease;
                cursor: pointer;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                font-size: 15px;
            }

            .menu-item:hover {
                background: rgba(255, 255, 255, 0.05);
                color: white;
                padding-left: 25px;
            }

            .menu-item i:first-child {
                width: 24px;
                margin-right: 15px;
                font-size: 20px;
                color: rgba(255, 255, 255, 0.7);
            }

            .menu-item span {
                flex: 1;
            }

            .menu-item .arrow {
                font-size: 16px;
                opacity: 0.5;
            }

            .menu-item.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 10px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
            }

            .menu-item.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                padding-left: 20px;
            }

            .menu-item.logout {
                color: #ff6b6b;
            }

            .menu-item.logout i:first-child {
                color: #ff6b6b;
            }

            /* 메뉴 푸터 */
            .menu-footer {
                margin-top: auto;
                padding: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
            }

            .menu-footer-links {
                margin-bottom: 10px;
            }

            .menu-footer-links a {
                color: rgba(255, 255, 255, 0.5);
                text-decoration: none;
                font-size: 12px;
                margin: 0 5px;
            }

            .menu-footer-links span {
                color: rgba(255, 255, 255, 0.3);
            }

            .menu-footer-copyright {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.3);
            }

            /* 애니메이션 */
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(-320px);
                }
            }

            /* 모바일 뷰 조정 */
            .mobile-view {
                padding-top: 60px;
            }

            .mobile-view .main-header,
            .mobile-view .desktop-nav {
                display: none;
            }

            /* 반응형 */
            @media (max-width: 400px) {
                .menu-panel {
                    width: 100vw;
                    right: -100vw;
                    max-width: 100%;
                }

                .menu-panel.open {
                    transform: translateX(-100vw);
                }
            }

            /* 다크모드 지원 */
            @media (prefers-color-scheme: dark) {
                .menu-panel {
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // 사용자 정보 업데이트
    updateUserInfo(userInfo) {
        this.user = userInfo;
        this.createMenuStructure();
    }
}

// 전역 인스턴스 생성
const mobileMenu = new MobileMenuIntegrated();

// DOM 로드 완료시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📱 모바일 통합 메뉴 초기화 완료');
    });
} else {
    console.log('📱 모바일 통합 메뉴 즉시 초기화');
}

// Export
window.mobileMenu = mobileMenu;