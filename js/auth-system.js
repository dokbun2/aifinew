/**
 * AIFI 자체 인증 시스템
 * 이메일/비밀번호 기반 로그인 및 회원가입
 * 관리자 승인 시스템 포함
 */

class AuthSystem {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initSupabase();
        this.initEventListeners();
        this.checkAuthStatus();
    }

    // Supabase 초기화
    async initSupabase() {
        if (window.supabase) {
            const config = {
                url: 'https://mnnbrsmkmnysdmtewuha.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubmJyc21rbW55c2RtdGV3dWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjcxMTIsImV4cCI6MjA3MzQ0MzExMn0.HZBpA_RLn_1Jew9jou1APUApBVfLIyq-wIM-kujtyuc'
            };
            this.supabase = window.supabase.createClient(config.url, config.anonKey);
            console.log('✅ Supabase 초기화 완료');
        }
    }

    // 이벤트 리스너 초기화
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createAuthUI();
            this.bindEvents();
        });
    }

    // 인증 UI 생성
    createAuthUI() {
        // 로그인/회원가입 모달 HTML
        const authModalHTML = `
            <!-- 로그인 모달 -->
            <div id="loginModal" class="auth-modal">
                <div class="auth-modal-content">
                    <button class="auth-modal-close" onclick="authSystem.closeModal('loginModal')">&times;</button>
                    <div class="auth-logo">
                        <h2>AIFI Creative Platform</h2>
                        <p>로그인이 필요한 서비스입니다</p>
                    </div>

                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">이메일</label>
                            <input type="email" id="loginEmail" class="form-input" required
                                   placeholder="example@email.com">
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">비밀번호</label>
                            <input type="password" id="loginPassword" class="form-input" required
                                   placeholder="비밀번호를 입력하세요">
                        </div>
                        <button type="submit" class="btn-auth-primary">로그인</button>
                    </form>

                    <div class="auth-divider">
                        <span>또는</span>
                    </div>

                    <button class="btn-auth-secondary" onclick="authSystem.showSignupModal()">
                        <span class="btn-text">회원가입</span>
                        <span class="btn-subtitle">새 계정 만들기</span>
                    </button>
                </div>
            </div>

            <!-- 회원가입 모달 -->
            <div id="signupModal" class="auth-modal">
                <div class="auth-modal-content">
                    <button class="auth-modal-close" onclick="authSystem.closeModal('signupModal')">&times;</button>
                    <div class="auth-logo">
                        <h2>AIFI 회원가입</h2>
                    </div>

                    <form id="signupForm" class="auth-form">
                        <div class="form-group">
                            <div class="input-with-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" id="signupName" class="form-input" required placeholder="이름">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="input-with-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path>
                                </svg>
                                <input type="text" id="signupNickname" class="form-input" required placeholder="닉네임">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="input-with-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                    <path d="m22 7-10 5L2 7"></path>
                                </svg>
                                <input type="email" id="signupEmail" class="form-input" required placeholder="이메일">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="input-with-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input type="password" id="signupPassword" class="form-input" required placeholder="비밀번호 (8자 이상)">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="input-with-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input type="password" id="signupPasswordConfirm" class="form-input" required placeholder="비밀번호 확인">
                            </div>
                        </div>

                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="agreeTerms" required>
                            <label for="agreeTerms">
                                <a href="#" onclick="authSystem.showTerms()">이용약관</a> 및
                                <a href="#" onclick="authSystem.showPrivacy()">개인정보처리방침</a>에 동의합니다
                            </label>
                        </div>

                        <button type="submit" class="btn-auth-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            회원가입
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>이미 계정이 있으신가요?</span>
                    </div>

                    <button class="btn-auth-secondary" onclick="authSystem.showLoginModal()">
                        <span class="btn-text">로그인</span>
                    </button>
                </div>
            </div>

            <!-- 승인 대기 모달 -->
            <div id="approvalPendingModal" class="auth-modal">
                <div class="auth-modal-content approval-pending">
                    <div class="approval-icon">⏳</div>
                    <h2>승인 대기 중</h2>
                    <p>회원가입이 완료되었습니다!</p>
                    <p>관리자의 승인을 기다리고 있습니다.</p>
                    <p class="approval-note">승인이 완료되면 이메일로 알려드리겠습니다.</p>
                    <button class="btn-auth-secondary btn-confirm" onclick="authSystem.logout()">
                        확인
                    </button>
                </div>
            </div>

            <!-- 알림 토스트 -->
            <div id="authToast" class="auth-toast"></div>
        `;

        // body에 모달 추가
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = authModalHTML;
        document.body.appendChild(modalContainer);

        // CSS 스타일 추가
        this.addAuthStyles();
    }

    // 스타일 추가
    addAuthStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 인증 모달 스타일 - Apple Developer Style */
            .auth-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.72);
                backdrop-filter: saturate(180%) blur(20px);
                -webkit-backdrop-filter: saturate(180%) blur(20px);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .auth-modal.show {
                display: flex;
            }

            .auth-modal-content {
                background: #000000;
                backdrop-filter: saturate(180%) blur(20px);
                -webkit-backdrop-filter: saturate(180%) blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 18px;
                padding: 48px;
                max-width: 420px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 44px 80px rgba(0, 0, 0, 0.8),
                            0 25px 50px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .auth-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.5);
                font-size: 20px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .auth-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.4);
                color: #ffffff;
                transform: scale(1.05);
            }

            .auth-logo {
                text-align: center;
                margin-bottom: 40px;
            }

            .auth-logo h2 {
                font-size: 28px;
                font-weight: 600;
                line-height: 1.2;
                letter-spacing: -0.02em;
                color: #ffffff;
                margin-bottom: 12px;
            }

            .auth-logo p {
                color: rgba(255, 255, 255, 0.5);
                font-size: 15px;
                line-height: 1.47;
            }

            .auth-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-group label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 13px;
                font-weight: 500;
                letter-spacing: -0.01em;
            }

            .form-input {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 14px 16px;
                color: #ffffff;
                font-size: 15px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Paperlogy', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
            }

            .form-input:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .form-input:focus {
                outline: none;
                background: rgba(255, 255, 255, 0.1);
                border-color: #ffffff;
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
            }

            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }

            .form-help {
                color: rgba(255, 255, 255, 0.4);
                font-size: 12px;
                line-height: 1.33;
            }

            .checkbox-group {
                flex-direction: row;
                align-items: flex-start;
                gap: 10px;
            }

            .checkbox-group input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                margin-top: 2px;
                accent-color: #ffffff;
                filter: grayscale(1) brightness(2);
            }

            .checkbox-group label {
                font-size: 13px;
                line-height: 1.5;
                cursor: pointer;
                color: rgba(255, 255, 255, 0.5);
            }

            .checkbox-group a {
                color: #ffffff;
                text-decoration: underline;
                text-decoration-color: rgba(255, 255, 255, 0.3);
                transition: all 0.2s;
            }

            .checkbox-group a:hover {
                color: #ffffff;
                text-decoration-color: rgba(255, 255, 255, 0.6);
            }

            .btn-auth-primary {
                background: #ffffff;
                color: #000000;
                border: none;
                border-radius: 12px;
                padding: 16px;
                font-size: 15px;
                font-weight: 600;
                letter-spacing: -0.01em;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                margin-top: 8px;
                font-family: 'Paperlogy', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
            }

            .btn-auth-primary:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
            }

            .btn-auth-primary svg {
                stroke: #000000;
            }

            .btn-auth-primary:active {
                transform: translateY(0);
            }

            .btn-auth-secondary {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Paperlogy', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                position: relative;
                overflow: hidden;
                width: 100%;
                min-height: 52px;
            }


            .btn-auth-secondary .btn-text {
                font-size: 15px;
                font-weight: 600;
                letter-spacing: -0.01em;
                color: #ffffff;
                position: relative;
                z-index: 1;
            }

            .btn-auth-secondary .btn-subtitle {
                font-size: 12px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.6);
                position: relative;
                z-index: 1;
            }

            .btn-auth-secondary:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
            }

            .btn-auth-secondary:hover .btn-text {
                color: #ffffff;
            }

            .btn-auth-secondary:hover .btn-subtitle {
                color: rgba(255, 255, 255, 0.8);
            }

            .auth-divider {
                text-align: center;
                margin: 24px 0;
                position: relative;
            }

            .auth-divider span {
                background: #000000;
                padding: 0 16px;
                color: rgba(255, 255, 255, 0.4);
                font-size: 13px;
                position: relative;
                z-index: 1;
            }

            .auth-divider::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(255, 255, 255, 0.08);
            }

            /* 승인 대기 스타일 */
            .approval-pending {
                text-align: center;
            }

            .approval-icon {
                font-size: 60px;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }

            .approval-pending h2 {
                color: #ffffff;
                margin-bottom: 15px;
                font-weight: 600;
            }

            .approval-pending p {
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 10px;
                line-height: 1.47;
            }

            .approval-note {
                color: rgba(255, 255, 255, 0.4);
                font-size: 13px;
                margin: 20px 0;
                line-height: 1.5;
            }

            /* 토스트 알림 */
            .auth-toast {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #000000;
                backdrop-filter: saturate(180%) blur(20px);
                -webkit-backdrop-filter: saturate(180%) blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                color: #ffffff;
                display: none;
                z-index: 10001;
                animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
            }

            .auth-toast.show {
                display: block;
            }

            .auth-toast.success {
                border-color: rgba(52, 199, 89, 0.4);
                background: rgba(29, 29, 31, 0.98);
            }

            .auth-toast.error {
                border-color: rgba(255, 59, 48, 0.4);
                background: rgba(29, 29, 31, 0.98);
            }

            /* 아이콘 입력 필드 스타일 */
            .input-with-icon {
                position: relative;
                display: flex;
                align-items: center;
            }

            .input-icon {
                position: absolute;
                left: 14px;
                color: rgba(255, 255, 255, 0.3);
                pointer-events: none;
                z-index: 1;
                transition: color 0.2s;
            }

            .input-with-icon .form-input {
                padding-left: 40px;
                width: 100%;
            }

            .input-with-icon:hover .input-icon {
                color: rgba(255, 255, 255, 0.5);
            }

            .input-with-icon .form-input:focus ~ .input-icon,
            .input-with-icon:focus-within .input-icon {
                color: #ffffff;
            }

            /* 버튼 아이콘 정렬 */
            .btn-auth-primary {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* 확인 버튼 스타일 */
            .btn-confirm {
                font-size: 18px !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                padding: 18px 32px !important;
                min-height: 56px !important;
            }

            .btn-confirm:hover {
                background: rgba(255, 255, 255, 0.15) !important;
                border-color: rgba(255, 255, 255, 0.6) !important;
            }

            /* 반응형 디자인 */
            @media (max-width: 520px) {
                .auth-modal-content {
                    max-width: 95%;
                    padding: 32px 24px;
                }
            }

            /* 애니메이션 */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 로그인 폼
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 회원가입 폼
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    // 로그인 처리
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!this.supabase) {
            this.showToast('시스템 오류가 발생했습니다', 'error');
            return;
        }

        try {
            // Supabase에서 사용자 확인
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !users) {
                this.showToast('이메일 또는 비밀번호가 올바르지 않습니다', 'error');
                return;
            }

            // 비밀번호 확인 (실제로는 해시 비교 필요)
            // 임시로 간단한 비교 (실제 구현시 bcrypt 등 사용)
            if (users.password_hash !== this.simpleHash(password)) {
                this.showToast('이메일 또는 비밀번호가 올바르지 않습니다', 'error');
                return;
            }

            // 승인 상태 확인
            if (users.status === 'pending') {
                this.closeModal('loginModal');
                this.showModal('approvalPendingModal');
                return;
            }

            if (users.status === 'rejected') {
                this.showToast('가입이 거절되었습니다. 관리자에게 문의하세요', 'error');
                return;
            }

            // 로그인 성공
            this.currentUser = users;
            this.saveAuthData(users);
            this.updateLastLogin(users.email);
            this.closeModal('loginModal');
            this.updateUIAfterLogin(users);
            this.showToast(`환영합니다, ${users.name}님!`, 'success');

        } catch (error) {
            console.error('로그인 오류:', error);
            this.showToast('로그인 중 오류가 발생했습니다', 'error');
        }
    }

    // 회원가입 처리
    async handleSignup() {
        const name = document.getElementById('signupName').value;
        const nickname = document.getElementById('signupNickname').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // 유효성 검사
        if (password !== passwordConfirm) {
            this.showToast('비밀번호가 일치하지 않습니다', 'error');
            return;
        }

        if (password.length < 8) {
            this.showToast('비밀번호는 8자 이상이어야 합니다', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showToast('이용약관에 동의해주세요', 'error');
            return;
        }

        if (!this.supabase) {
            this.showToast('시스템 오류가 발생했습니다', 'error');
            return;
        }

        try {
            // 이메일 중복 확인
            const { data: existing } = await this.supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (existing) {
                this.showToast('이미 등록된 이메일입니다', 'error');
                return;
            }

            // 사용자 등록
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    email: email,
                    password_hash: this.simpleHash(password),
                    name: name,
                    nickname: nickname,
                    status: 'pending',
                    role: 'user',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                throw error;
            }

            // 회원가입 성공
            this.closeModal('signupModal');
            this.showModal('approvalPendingModal');
            this.showToast('회원가입이 완료되었습니다!', 'success');

        } catch (error) {
            console.error('회원가입 오류:', error);
            this.showToast('회원가입 중 오류가 발생했습니다', 'error');
        }
    }

    // 간단한 해시 함수 (실제 구현시 bcrypt 사용 권장)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // 인증 데이터 저장
    saveAuthData(user) {
        localStorage.setItem('auth_token', `token_${Date.now()}`);
        localStorage.setItem('user_info', JSON.stringify({
            email: user.email,
            name: user.name,
            nickname: user.nickname || user.name,
            role: user.role,
            status: user.status,
            picture: user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=ff6b6b&color=fff`
        }));
    }

    // 마지막 로그인 시간 업데이트
    async updateLastLogin(email) {
        if (!this.supabase) return;

        try {
            await this.supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('email', email);
        } catch (error) {
            console.error('마지막 로그인 시간 업데이트 실패:', error);
        }
    }

    // 로그인 후 UI 업데이트
    updateUIAfterLogin(user) {
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <div class="user-profile-wrapper" style="position: relative;">
                    <img src="${user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=ff6b6b&color=fff`}"
                         alt="${user.name}"
                         class="user-profile-icon"
                         onclick="authSystem.toggleUserMenu(event)"
                         style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            cursor: pointer;
                            border: 2px solid rgba(255, 107, 107, 0.3);
                            transition: all 0.3s ease;
                         "
                         onmouseover="this.style.borderColor='rgba(255, 107, 107, 0.6)'"
                         onmouseout="this.style.borderColor='rgba(255, 107, 107, 0.3)'">

                    <div class="user-dropdown-menu" id="user-dropdown-menu" style="
                        position: absolute;
                        top: calc(100% + 10px);
                        right: 0;
                        min-width: 280px;
                        background: rgba(20, 20, 20, 0.98);
                        border: 1px solid rgba(255, 107, 107, 0.2);
                        border-radius: 12px;
                        padding: 8px;
                        opacity: 0;
                        visibility: hidden;
                        transform: translateY(-10px);
                        transition: all 0.3s ease;
                        z-index: 1000;
                        backdrop-filter: blur(10px);
                    ">
                        <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="${user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=ff6b6b&color=fff`}"
                                     style="width: 48px; height: 48px; border-radius: 50%;">
                                <div>
                                    <div style="color: #fff; font-weight: 600;">${user.nickname || user.name}</div>
                                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">${user.name}</div>
                                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">${user.email}</div>
                                    ${user.role === 'admin' ? '<div style="color: #ff6b6b; font-size: 11px;">관리자</div>' : ''}
                                </div>
                            </div>
                        </div>

                        ${user.role === 'admin' ? `
                        <a href="admin.html" class="dropdown-item" style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px 12px;
                            color: #ff6b6b;
                            text-decoration: none;
                            border-radius: 8px;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='rgba(255, 107, 107, 0.1)'"
                           onmouseout="this.style.background='transparent'">
                            <span>🛡️</span>
                            <span>관리자 대시보드</span>
                        </a>
                        ` : ''}

                        <button onclick="authSystem.logout()" class="dropdown-item" style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px 12px;
                            color: rgba(255, 255, 255, 0.8);
                            background: none;
                            border: none;
                            width: 100%;
                            text-align: left;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='rgba(255, 107, 107, 0.1)'"
                           onmouseout="this.style.background='transparent'">
                            <span>🚪</span>
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            `;

            // 드롭다운 메뉴 스타일 추가
            const dropdownStyle = document.createElement('style');
            dropdownStyle.textContent = `
                .user-dropdown-menu.show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(dropdownStyle);
        }
    }

    // 사용자 메뉴 토글
    toggleUserMenu(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) {
            dropdown.classList.toggle('show');

            // 외부 클릭시 닫기
            const closeDropdown = (e) => {
                if (!dropdown.contains(e.target) && !e.target.classList.contains('user-profile-icon')) {
                    dropdown.classList.remove('show');
                    document.removeEventListener('click', closeDropdown);
                }
            };

            if (dropdown.classList.contains('show')) {
                setTimeout(() => {
                    document.addEventListener('click', closeDropdown);
                }, 0);
            }
        }
    }

    // 로그아웃
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        this.currentUser = null;
        window.location.reload();
    }

    // 인증 상태 확인
    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');

        if (token && userInfo) {
            try {
                this.currentUser = JSON.parse(userInfo);
                this.updateUIAfterLogin(this.currentUser);
                return true;
            } catch (e) {
                console.error('사용자 정보 파싱 오류:', e);
                this.logout();
            }
        }
        return false;
    }

    // 모달 표시
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    // 모달 닫기
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // 로그인 모달 표시
    showLoginModal() {
        this.closeModal('signupModal');
        this.showModal('loginModal');
    }

    // 회원가입 모달 표시
    showSignupModal() {
        this.closeModal('loginModal');
        this.showModal('signupModal');
    }

    // 토스트 알림
    showToast(message, type = 'info') {
        const toast = document.getElementById('authToast');
        if (toast) {
            toast.textContent = message;
            toast.className = `auth-toast show ${type}`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // 약관 표시
    showTerms() {
        alert('이용약관 페이지로 이동합니다');
    }

    // 개인정보처리방침 표시
    showPrivacy() {
        alert('개인정보처리방침 페이지로 이동합니다');
    }

    // 접근 제어 확인
    checkAccess() {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');

        if (!token || !userInfo) {
            // 로그인 필요
            this.showLoginModal();
            return false;
        }

        try {
            const user = JSON.parse(userInfo);

            if (user.status !== 'approved') {
                // 승인 대기 중
                this.showModal('approvalPendingModal');
                return false;
            }

            return true;
        } catch (e) {
            this.showLoginModal();
            return false;
        }
    }
}

// 전역 인스턴스 생성
const authSystem = new AuthSystem();

// 전역 접근을 위한 export
window.authSystem = authSystem;