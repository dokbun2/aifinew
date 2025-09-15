// Google OAuth 2.0 통합 인증 시스템
// Google Identity Services + Supabase 연동

class GoogleAuthIntegrated {
    constructor() {
        // Google OAuth 설정
        this.CLIENT_ID = '993283302195-v1obi6qc9jlhhcqf94lqha27qo9o0pbl.apps.googleusercontent.com';
        this.REDIRECT_URI = window.location.origin + '/auth/callback';

        // Supabase 설정 - 실제 프로젝트 설정 사용
        this.supabaseClient = null;
        this.supabaseUrl = 'https://ocbqffealslwnsybeurj.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYnFmZmVhbHNsd25zeWJldXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjMxMzYsImV4cCI6MjA3MzM5OTEzNn0.EkqrmbUgB3M7U0o_Caf7VMQwbmly7NkkCClynx7eamE';

        // 사용자 상태
        this.user = null;
        this.isAuthenticated = false;

        // 초기화
        this.init();
    }

    async init() {
        console.log('🚀 Google Auth 시스템 초기화 시작...');

        // Supabase 초기화
        await this.initSupabase();

        // Google Identity Services 초기화
        await this.initGoogleAuth();

        // 기존 세션 확인
        this.checkExistingSession();
    }

    async initSupabase() {
        try {
            if (typeof window.supabase !== 'undefined') {
                this.supabaseClient = window.supabase.createClient(
                    this.supabaseUrl,
                    this.supabaseAnonKey
                );
                console.log('✅ Supabase 클라이언트 초기화 완료');
            } else {
                // Supabase 라이브러리 동적 로드
                await this.loadSupabaseLibrary();
            }
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
        }
    }

    async loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                this.supabaseClient = window.supabase.createClient(
                    this.supabaseUrl,
                    this.supabaseAnonKey
                );
                console.log('✅ Supabase 라이브러리 로드 및 초기화 완료');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initGoogleAuth() {
        // Google Identity Services 라이브러리가 로드될 때까지 대기
        if (typeof google === 'undefined' || !google.accounts) {
            console.log('⏳ Google Identity Services 로딩 대기 중...');
            setTimeout(() => this.initGoogleAuth(), 500);
            return;
        }

        try {
            // Google Identity 초기화
            google.accounts.id.initialize({
                client_id: this.CLIENT_ID,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: true // Chrome 110+ FedCM API 사용
            });

            console.log('✅ Google Identity Services 초기화 완료');

            // 로그인 버튼 렌더링
            this.renderGoogleButton();

            // One Tap 프롬프트 (선택사항)
            if (!this.isAuthenticated && !localStorage.getItem('user_info')) {
                // google.accounts.id.prompt((notification) => {
                //     console.log('One Tap 상태:', notification);
                // });
            }
        } catch (error) {
            console.error('❌ Google Auth 초기화 실패:', error);
        }
    }

    renderGoogleButton() {
        // 로그인 버튼 렌더링
        const loginButton = document.getElementById('google-login-btn');
        if (loginButton && !this.isAuthenticated) {
            google.accounts.id.renderButton(
                loginButton,
                {
                    type: 'standard',
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'pill',
                    logo_alignment: 'left',
                    width: 300,
                    locale: 'ko'
                }
            );
            console.log('✅ Google 로그인 버튼 렌더링 완료');
        }

        // 회원가입 버튼 렌더링
        const signupButton = document.getElementById('google-signup-btn');
        if (signupButton && !this.isAuthenticated) {
            google.accounts.id.renderButton(
                signupButton,
                {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signup_with',
                    shape: 'pill',
                    logo_alignment: 'left',
                    width: 300,
                    locale: 'ko'
                }
            );
            console.log('✅ Google 회원가입 버튼 렌더링 완료');
        }
    }

    async handleCredentialResponse(response) {
        console.log('🔐 Google 인증 응답 수신');

        try {
            // JWT 토큰 디코딩
            const credential = response.credential;
            const payload = this.parseJwt(credential);

            if (!payload) {
                throw new Error('JWT 토큰 파싱 실패');
            }

            console.log('👤 사용자 정보:', {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                id: payload.sub
            });

            // 사용자 정보 객체 생성
            const userInfo = {
                google_id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified,
                locale: payload.locale || 'ko',
                last_login: new Date().toISOString()
            };

            // Supabase에 사용자 정보 저장/업데이트
            await this.saveUserToSupabase(userInfo);

            // 로컬 스토리지에 저장
            this.saveToLocalStorage(userInfo, credential);

            // 승인 상태 확인
            await this.checkApprovalStatus(userInfo.email);

        } catch (error) {
            console.error('❌ 인증 처리 실패:', error);
            this.showError('로그인 처리 중 오류가 발생했습니다.');
        }
    }

    async saveUserToSupabase(userInfo) {
        if (!this.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        try {
            // upsert를 사용하여 존재하면 업데이트, 없으면 삽입
            const { data, error } = await this.supabaseClient
                .from('users')
                .upsert({
                    google_id: userInfo.google_id,
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    last_login: userInfo.last_login,
                    is_approved: false // 기본값: 승인 대기
                }, {
                    onConflict: 'email',
                    returning: 'representation'
                });

            if (error) {
                // RLS 정책 오류 무시 (로컬 스토리지는 이미 저장됨)
                if (error.code === '42501') {
                    console.warn('⚠️ RLS 정책으로 인한 저장 제한. 로컬 스토리지에만 저장됩니다.');
                } else {
                    console.error('❌ Supabase 저장 오류:', error);
                }
            } else {
                console.log('✅ Supabase에 사용자 정보 저장 완료:', data);
            }
        } catch (error) {
            console.error('❌ Supabase 통신 오류:', error);
        }
    }

    saveToLocalStorage(userInfo, credential) {
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        localStorage.setItem('google_credential', credential);
        localStorage.setItem('last_login', new Date().toISOString());
        console.log('✅ 로컬 스토리지에 사용자 정보 저장 완료');
    }

    async checkApprovalStatus(email) {
        // 관리자 이메일 목록 (즉시 승인)
        const adminEmails = ['admin@example.com', 'sohee@example.com'];

        if (adminEmails.includes(email)) {
            this.approveUser();
            return;
        }

        // Supabase에서 승인 상태 확인
        if (this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .select('is_approved')
                    .eq('email', email)
                    .single();

                if (data && data.is_approved) {
                    this.approveUser();
                } else {
                    this.showPendingApproval();
                }
            } catch (error) {
                console.error('승인 상태 확인 오류:', error);
                // 오류 시 대기 상태로 표시
                this.showPendingApproval();
            }
        } else {
            // Supabase 연결 없으면 대기 상태
            this.showPendingApproval();
        }
    }

    approveUser() {
        this.isAuthenticated = true;
        localStorage.setItem('user_approved', 'true');
        this.updateUIForAuthenticatedUser();
        this.showSuccess('로그인에 성공했습니다!');

        // 대시보드로 리다이렉트 (선택사항)
        setTimeout(() => {
            if (window.location.pathname.includes('login') ||
                window.location.pathname.includes('signup')) {
                window.location.href = '/user-dashboard.html';
            }
        }, 1500);
    }

    showPendingApproval() {
        localStorage.setItem('user_approved', 'false');

        const modal = `
            <div id="approval-modal" class="modal-overlay">
                <div class="modal-content">
                    <h2>⏳ 승인 대기 중</h2>
                    <p>관리자의 승인을 기다리고 있습니다.</p>
                    <p>승인이 완료되면 서비스를 이용하실 수 있습니다.</p>
                    <button onclick="googleAuth.closeModal()" class="btn-close">확인</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        this.addModalStyles();
    }

    updateUIForAuthenticatedUser() {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

        // 로그인/회원가입 버튼 숨기기
        const authButtons = document.querySelectorAll('#google-login-btn, #google-signup-btn');
        authButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        // 사용자 메뉴 표시
        const userMenuHTML = `
            <div class="user-menu">
                <img src="${userInfo.picture}" alt="${userInfo.name}" class="user-avatar">
                <span class="user-name">${userInfo.name}</span>
                <button onclick="googleAuth.logout()" class="btn-logout">로그아웃</button>
            </div>
        `;

        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.innerHTML = userMenuHTML;
        }
    }

    async logout() {
        if (!confirm('로그아웃 하시겠습니까?')) return;

        try {
            // Google 로그아웃
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();

                // 사용자의 Google 계정 연결 해제 (선택사항)
                const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                if (userInfo.email) {
                    google.accounts.id.revoke(userInfo.email, done => {
                        console.log('Google 계정 연결 해제:', done);
                    });
                }
            }

            // Supabase 로그아웃
            if (this.supabaseClient) {
                await this.supabaseClient.auth.signOut();
            }

            // 로컬 스토리지 정리
            localStorage.clear();

            // 페이지 새로고침
            window.location.reload();

        } catch (error) {
            console.error('로그아웃 오류:', error);
            localStorage.clear();
            window.location.reload();
        }
    }

    checkExistingSession() {
        const userInfo = localStorage.getItem('user_info');
        const isApproved = localStorage.getItem('user_approved') === 'true';

        if (userInfo && isApproved) {
            this.isAuthenticated = true;
            this.user = JSON.parse(userInfo);
            this.updateUIForAuthenticatedUser();
            console.log('✅ 기존 세션 복원됨');
        }
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('JWT 파싱 오류:', e);
            return null;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = `
            <div class="notification notification-${type}">
                ${message}
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', notification);

        setTimeout(() => {
            const elem = document.querySelector('.notification');
            if (elem) elem.remove();
        }, 3000);
    }

    closeModal() {
        const modal = document.getElementById('approval-modal');
        if (modal) modal.remove();
    }

    addModalStyles() {
        if (document.getElementById('auth-modal-styles')) return;

        const styles = `
            <style id="auth-modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }

                .modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 400px;
                    text-align: center;
                }

                .modal-content h2 {
                    margin-bottom: 20px;
                    color: #333;
                }

                .modal-content p {
                    margin: 10px 0;
                    color: #666;
                }

                .btn-close {
                    margin-top: 20px;
                    padding: 10px 30px;
                    background: #4285f4;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }

                .btn-close:hover {
                    background: #357ae8;
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10001;
                    animation: slideIn 0.3s ease;
                }

                .notification-success {
                    background: #4caf50;
                }

                .notification-error {
                    background: #f44336;
                }

                .notification-info {
                    background: #2196f3;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 5px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 25px;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid white;
                }

                .user-name {
                    color: white;
                    font-weight: 500;
                }

                .btn-logout {
                    padding: 5px 15px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-logout:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// 전역 인스턴스 생성
const googleAuth = new GoogleAuthIntegrated();

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM 로드 완료, Google Auth 초기화 중...');
    });
} else {
    console.log('📄 Google Auth 즉시 초기화');
}

// 전역 접근을 위한 export
window.googleAuth = googleAuth;