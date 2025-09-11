// Google OAuth Authentication Module with Admin Approval System
class GoogleAuth {
    constructor() {
        // Google OAuth Client ID
        this.CLIENT_ID = '325933740145-8ubka8q1fobrdv8hf5t196btkog8fnas.apps.googleusercontent.com';
        this.REDIRECT_URI = window.location.origin + '/auth/google/callback';
        
        this.user = null;
        this.isApproved = false;
        this.initializeAuth();
    }

    initializeAuth() {
        // Google Identity Services 초기화
        window.addEventListener('load', () => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                try {
                    google.accounts.id.initialize({
                        client_id: this.CLIENT_ID,
                        callback: this.handleCredentialResponse.bind(this),
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });
                    
                    console.log('Google Auth initialized');
                } catch (error) {
                    console.error('Error initializing Google Auth:', error);
                }
            } else {
                console.warn('Google Identity Services not loaded yet, retrying...');
                setTimeout(() => this.initializeAuth(), 1000);
            }
        });
    }

    renderButton(buttonId) {
        const buttonElement = document.getElementById(buttonId);
        if (!buttonElement) {
            console.warn('Button element not found:', buttonId);
            return;
        }
        
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            try {
                google.accounts.id.renderButton(
                    buttonElement,
                    {
                        theme: 'filled_black',
                        size: 'large',
                        type: 'standard',
                        shape: 'pill',
                        text: 'signin_with',
                        logo_alignment: 'left',
                        locale: 'ko'
                    }
                );
                console.log('Google button rendered successfully');
            } catch (error) {
                console.error('Error rendering Google button:', error);
            }
        }
    }

    async handleCredentialResponse(response) {
        const credential = response.credential;
        
        try {
            // JWT 토큰 디코딩
            const payload = this.parseJwt(credential);
            console.log('User info:', payload);
            
            // 사용자 정보 저장
            this.user = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                id: payload.sub
            };
            
            // 승인 상태 확인
            await this.checkApprovalStatus(this.user.email);
            
            // 로컬 스토리지에 저장
            this.saveAuthData(credential, this.user);
            
            // 로그인 모달 닫기
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.opacity = '0';
                setTimeout(() => {
                    loginModal.remove();
                }, 300);
            }
            
            // UI 업데이트
            this.updateUIAfterLogin(this.user);
            
            // 승인 상태에 따른 처리
            if (this.isApproved) {
                this.showSuccess(`환영합니다, ${this.user.name}님!`);
                this.enableMainFeatures();
                
                // 현재 페이지가 index.html이 아니면 자동 새로고침
                if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                this.showPendingApproval();
            }
            
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('인증 중 오류가 발생했습니다.');
        }
    }

    async checkApprovalStatus(email) {
        // 로컬 스토리지에서 승인된 사용자 목록 확인
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        
        this.isApproved = approvedUsers.includes(email);
        
        // 신규 사용자인 경우 대기 목록에 추가
        if (!this.isApproved && !pendingUsers.find(u => u.email === email)) {
            pendingUsers.push({
                email: email,
                name: this.user.name,
                requestedAt: new Date().toISOString()
            });
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        }
        
        return this.isApproved;
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
            console.error('Error parsing JWT:', e);
            return null;
        }
    }

    saveAuthData(token, user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(user));
        localStorage.setItem('user_approved', this.isApproved.toString());
    }

    updateUIAfterLogin(user) {
        // 로그인 모달 숨기기
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('show');
        }
        
        // Google 로그인 버튼 숨기기
        const googleBtn = document.getElementById('google-signin-button');
        if (googleBtn) {
            googleBtn.style.display = 'none';
        }
        
        // 관리자 버튼 표시 여부 확인
        if (typeof checkAdminAccess === 'function') {
            checkAdminAccess();
        }
        
        // 사용자 정보 표시 - 아이콘만 표시
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <div class="user-icon-wrapper">
                    <img src="${user.picture}" alt="${user.name}" class="user-icon" onclick="googleAuth.toggleUserMenu(event)">
                    <div class="user-dropdown-menu" id="user-dropdown-menu">
                        <div class="dropdown-user-info">
                            <img src="${user.picture}" alt="${user.name}" class="dropdown-avatar">
                            <div class="dropdown-user-details">
                                <div class="dropdown-user-name">${user.name}</div>
                                <div class="dropdown-user-email">${user.email}</div>
                                <div class="dropdown-user-status ${this.isApproved ? 'approved' : 'pending'}">
                                    ${this.isApproved ? '✅ 승인됨' : '⏳ 승인 대기중'}
                                </div>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <button onclick="googleAuth.logout()" class="dropdown-logout-btn">
                            <span>🚪</span>
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showPendingApproval() {
        const modal = document.createElement('div');
        modal.className = 'approval-pending-modal';
        modal.innerHTML = `
            <div class="approval-pending-content">
                <div class="pending-icon">⏳</div>
                <h3>승인 대기중</h3>
                <p>관리자의 승인을 기다리고 있습니다.</p>
                <p>승인이 완료되면 모든 기능을 사용하실 수 있습니다.</p>
                <p class="user-email">${this.user.email}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">확인</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    enableMainFeatures() {
        // 메인 기능 활성화
        document.querySelectorAll('.stage-card').forEach(card => {
            card.classList.remove('disabled');
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
        });
        
        // 보호된 링크 활성화
        document.querySelectorAll('.protected-link').forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('data-protected');
        });
    }

    disableMainFeatures() {
        // 메인 기능 비활성화
        document.querySelectorAll('.stage-card').forEach(card => {
            card.classList.add('disabled');
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.5';
        });
        
        // 보호된 링크 비활성화
        document.querySelectorAll('.protected-link').forEach(link => {
            link.classList.add('disabled');
            link.setAttribute('data-protected', 'true');
        });
    }

    async logout() {
        try {
            // Google 로그아웃
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }
            
            // 로컬 스토리지 클리어
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            localStorage.removeItem('user_approved');
            this.user = null;
            this.isApproved = false;
            
            // UI 초기화
            this.disableMainFeatures();
            
            // 사용자 정보 제거
            const userInfoDiv = document.getElementById('user-info');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = '';
            }
            
            // 로그인 버튼 다시 표시
            const googleBtn = document.getElementById('google-signin-button');
            if (googleBtn) {
                googleBtn.style.display = 'block';
                this.renderButton('google-signin-button');
            }
            
            // 로그인 모달 표시
            this.showLoginModal();
            
            this.showSuccess('로그아웃되었습니다.');
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');
        const approved = localStorage.getItem('user_approved') === 'true';
        
        if (token && userInfo) {
            try {
                this.user = JSON.parse(userInfo);
                this.isApproved = approved;
                
                // 승인 상태 재확인
                this.checkApprovalStatus(this.user.email).then(() => {
                    this.updateUIAfterLogin(this.user);
                    
                    if (this.isApproved) {
                        this.enableMainFeatures();
                    } else {
                        this.disableMainFeatures();
                        // 승인되지 않은 사용자는 메인 페이지에서만 대기 메시지 표시
                        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                            this.showPendingApproval();
                        }
                    }
                });
                
                return true;
            } catch (e) {
                console.error('Error parsing user info:', e);
                this.clearAuth();
            }
        } else {
            // 로그인이 필요한 페이지인 경우만 모달 표시
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                this.disableMainFeatures();
                this.showLoginModal();
            }
        }
        return false;
    }

    clearAuth() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_approved');
        this.user = null;
        this.isApproved = false;
    }

    showLoginModal() {
        let modal = document.getElementById('login-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'login-modal';
            modal.className = 'login-modal';
            modal.innerHTML = `
                <div class="login-modal-content" style="
                    max-width: 400px;
                    margin: 100px auto;
                    padding: 40px;
                    background: rgba(20, 20, 20, 0.98);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    text-align: center;
                ">
                    <div class="login-header" style="margin-bottom: 32px;">
                        <h2 style="
                            color: #fff;
                            font-size: 28px;
                            font-weight: 600;
                            margin-bottom: 8px;
                        ">AIFI Creative Platform</h2>
                        <p style="
                            color: rgba(255, 255, 255, 0.6);
                            font-size: 14px;
                        ">로그인이 필요한 서비스입니다</p>
                    </div>
                    <div class="login-body">
                        <div id="google-signin-button" style="
                            display: flex;
                            justify-content: center;
                            margin-bottom: 24px;
                        "></div>
                        <p class="login-note" style="
                            color: rgba(255, 255, 255, 0.5);
                            font-size: 13px;
                            line-height: 1.6;
                        ">
                            Google 계정으로 로그인 후<br>
                            관리자 승인을 받으면 서비스를 이용하실 수 있습니다.
                        </p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 모달 배경 스타일 추가
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
        }
        
        setTimeout(() => {
            modal.style.opacity = '1';
            this.renderButton('google-signin-button');
        }, 100);
    }

    // Helper methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    toggleUserMenu(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
}

// 전역 인스턴스 생성
const googleAuth = new GoogleAuth();

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Google Auth...');
    
    // 로그인 상태 확인
    googleAuth.checkAuthStatus();
    
    // 보호된 링크 클릭 이벤트 처리
    document.addEventListener('click', function(e) {
        const protectedLink = e.target.closest('.protected-link');
        if (protectedLink && protectedLink.getAttribute('data-protected') === 'true') {
            e.preventDefault();
            
            if (!googleAuth.user) {
                googleAuth.showError('로그인이 필요합니다.');
                googleAuth.showLoginModal();
            } else if (!googleAuth.isApproved) {
                googleAuth.showError('관리자 승인이 필요합니다.');
                googleAuth.showPendingApproval();
            }
        }
        
        // 드롭다운 메뉴 외부 클릭 시 닫기
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown && !e.target.closest('.user-icon-wrapper')) {
            dropdown.classList.remove('show');
        }
    });
});

// 전역 접근을 위한 export
window.googleAuth = googleAuth;