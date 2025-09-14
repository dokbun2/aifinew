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
        console.log('🔄 Initializing Google Auth...');
        console.log('Current domain:', window.location.hostname);
        console.log('Current protocol:', window.location.protocol);
        
        // Google Identity Services 초기화
        const initGoogleAuth = () => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                try {
                    google.accounts.id.initialize({
                        client_id: this.CLIENT_ID,
                        callback: this.handleCredentialResponse.bind(this),
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });
                    
                    console.log('✅ Google Auth initialized successfully');
                    console.log('Client ID:', this.CLIENT_ID);
                    
                    // 초기화 성공 후 바로 버튼 렌더링 시도
                    setTimeout(() => {
                        this.renderButton('google-signin-button');
                    }, 100);
                } catch (error) {
                    console.error('❌ Error initializing Google Auth:', error);
                }
            } else {
                console.warn('⏳ Google Identity Services not loaded yet, retrying...');
                setTimeout(() => initGoogleAuth(), 1000);
            }
        };
        
        // DOMContentLoaded와 load 이벤트 모두 처리
        if (document.readyState === 'loading') {
            window.addEventListener('load', initGoogleAuth);
        } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
            // 이미 로드된 경우 즉시 실행
            setTimeout(initGoogleAuth, 100);
        } else {
            window.addEventListener('load', initGoogleAuth);
        }
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
        console.log('🔍 승인 상태 확인 중:', email);

        // Supabase에 사용자 정보 저장/업데이트
        const saveResult = await this.saveUserToSupabase(this.user);

        // Supabase에서 직접 승인 상태 확인
        if (saveResult) {
            try {
                let supabaseClient = null;

                if (window.ProjectBackup && window.ProjectBackup.supabase) {
                    supabaseClient = window.ProjectBackup.supabase;
                } else if (window.supabase) {
                    const module = await import('./modules/supabase-config.js');
                    if (module.SUPABASE_CONFIG) {
                        supabaseClient = window.supabase.createClient(
                            module.SUPABASE_CONFIG.url,
                            module.SUPABASE_CONFIG.anonKey
                        );
                    }
                }

                if (supabaseClient) {
                    const { data: userData, error } = await supabaseClient
                        .from('users')
                        .select('status, created_at, login_count')
                        .eq('email', email)
                        .single();

                    if (!error && userData) {
                        this.isApproved = userData.status === 'approved';
                        console.log('📊 Supabase 사용자 상태:', {
                            email: email,
                            status: userData.status,
                            isApproved: this.isApproved,
                            loginCount: userData.login_count
                        });

                        // 이미 가입한 사용자가 다시 가입 시도하는 경우 체크
                        if (userData.login_count > 1 && userData.status === 'pending') {
                            console.log('⚠️ 이미 가입 신청한 사용자입니다. 승인 대기중...');
                            this.showNotification('이미 가입 신청이 완료되었습니다. 관리자 승인을 기다려주세요.', 'info');
                        }

                        return this.isApproved;
                    }
                }
            } catch (error) {
                console.error('❌ Supabase 상태 확인 실패:', error);
            }
        }

        // 로컬 스토리지 백업 확인 (Supabase 실패 시)
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');

        // 승인된 사용자 확인
        this.isApproved = approvedUsers.some(u =>
            typeof u === 'string' ? u === email : u.email === email
        );

        // 신규 사용자인 경우 대기 목록에 추가
        if (!this.isApproved) {
            const existingPending = pendingUsers.find(u => u.email === email);

            if (!existingPending) {
                // 신규 사용자 추가
                const newUser = {
                    email: email,
                    name: this.user.name || 'Unknown',
                    picture: this.user.picture || '',
                    requestedAt: new Date().toISOString(),
                    status: 'pending'
                };
                pendingUsers.push(newUser);
                localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

                console.log('🆕 새 사용자가 대기 목록에 추가됨:', newUser);
            } else {
                // 기존 대기 사용자 - 중복 가입 시도
                console.log('⚠️ 이미 대기 목록에 있는 사용자:', existingPending);
                existingPending.name = this.user.name || existingPending.name;
                existingPending.picture = this.user.picture || existingPending.picture;
                existingPending.lastLoginAt = new Date().toISOString();
                existingPending.loginAttempts = (existingPending.loginAttempts || 1) + 1;
                localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

                // 중복 가입 시도 알림
                if (existingPending.loginAttempts > 2) {
                    this.showNotification('이미 가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.', 'warning');
                }
            }
        } else {
            // 승인된 사용자 정보 업데이트
            const approvedUser = approvedUsers.find(u =>
                typeof u === 'object' && u.email === email
            );

            if (approvedUser) {
                approvedUser.lastLoginAt = new Date().toISOString();
                approvedUser.name = this.user.name || approvedUser.name;
                approvedUser.picture = this.user.picture || approvedUser.picture;
                localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
            }
        }

        return this.isApproved;
    }

    // Supabase에 사용자 정보 저장
    async saveUserToSupabase(user) {
        try {
            console.log('🔄 Supabase에 사용자 정보 저장 시작:', user.email);

            // ProjectBackup 인스턴스 사용 또는 새로 생성
            let supabaseClient = null;

            // 방법 1: ProjectBackup 인스턴스가 있으면 사용
            if (window.ProjectBackup && window.ProjectBackup.supabase) {
                console.log('✅ ProjectBackup Supabase 클라이언트 사용');
                supabaseClient = window.ProjectBackup.supabase;
            } else {
                // 방법 2: 직접 Supabase 클라이언트 생성
                console.log('🔄 새 Supabase 클라이언트 생성 시도');

                // Supabase 라이브러리 로드 대기
                let retries = 0;
                while (!window.supabase && retries < 10) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    retries++;
                }

                if (!window.supabase) {
                    console.error('❌ Supabase 라이브러리를 로드할 수 없습니다.');
                    return false;
                }

                // Supabase config 로드
                try {
                    const module = await import('./modules/supabase-config.js');
                    if (module.SUPABASE_CONFIG) {
                        supabaseClient = window.supabase.createClient(
                            module.SUPABASE_CONFIG.url,
                            module.SUPABASE_CONFIG.anonKey
                        );
                        console.log('✅ 새 Supabase 클라이언트 생성됨');
                    }
                } catch (error) {
                    console.error('❌ Supabase 설정 로드 실패:', error);
                    return false;
                }
            }

            if (!supabaseClient) {
                console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
                return false;
            }

            // 먼저 기존 사용자 확인
            const { data: existingUser, error: fetchError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('email', user.email)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116은 데이터가 없을 때 발생
                console.error('❌ 사용자 조회 실패:', fetchError);
            }

            let userData = {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                picture: user.picture || '',
                google_id: user.id || '',
                last_login: new Date().toISOString(),
                metadata: {
                    browser: navigator.userAgent,
                    language: navigator.language,
                    login_time: new Date().toISOString()
                }
            };

            // 신규 사용자인 경우
            if (!existingUser) {
                userData.created_at = new Date().toISOString();
                userData.status = 'pending'; // 기본값: 승인 대기
                userData.login_count = 1;

                console.log('🆕 신규 사용자 등록:', userData.email);
            } else {
                // 기존 사용자 업데이트
                userData.login_count = (existingUser.login_count || 0) + 1;
                userData.status = existingUser.status; // 기존 상태 유지

                console.log('📝 기존 사용자 업데이트:', userData.email);
            }

            // users 테이블에 저장/업데이트
            const { data, error } = await supabaseClient
                .from('users')
                .upsert(userData, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                })
                .select();

            if (error) {
                console.error('❌ Supabase 사용자 저장 실패:', error);
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return false;
            } else {
                console.log('✅ Supabase에 사용자 정보 저장 성공:', data);

                // 승인 상태 확인 및 업데이트
                if (data && data[0]) {
                    this.isApproved = data[0].status === 'approved';
                    console.log('👤 사용자 상태:', data[0].status);
                }
                return true;
            }
        } catch (error) {
            console.error('❌ 사용자 정보 저장 중 예외 발생:', error);
            return false;
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
                        ${this.isApproved ? `
                        <button onclick="googleAuth.openDashboard()" class="dropdown-menu-btn">
                            <span>📁</span>
                            <span>나의 프로젝트</span>
                        </button>
                        <div class="dropdown-divider"></div>
                        ` : ''}
                        <button onclick="googleAuth.logout()" class="dropdown-logout-btn">
                            <span>🚪</span>
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async resendApplication() {
        console.log('🔄 가입 신청 재전송 시작...');

        try {
            // 로딩 표시
            this.showNotification('가입 신청을 다시 전송하는 중...', 'info');

            // Supabase에 다시 저장 시도
            const result = await this.saveUserToSupabase(this.user);

            if (result) {
                // 로컬 스토리지 업데이트
                const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
                const existingUser = pendingUsers.find(u => u.email === this.user.email);

                if (!existingUser) {
                    // 새로 추가
                    pendingUsers.push({
                        email: this.user.email,
                        name: this.user.name,
                        picture: this.user.picture,
                        requestedAt: new Date().toISOString(),
                        status: 'pending',
                        resent: true
                    });
                } else {
                    // 기존 데이터 업데이트
                    existingUser.lastResent = new Date().toISOString();
                    existingUser.resentCount = (existingUser.resentCount || 0) + 1;
                }

                localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

                this.showNotification('✅ 가입 신청이 성공적으로 재전송되었습니다!', 'success');
                console.log('✅ 가입 신청 재전송 완료');

                // 관리자에게 알림 (선택사항)
                console.log(`📧 관리자 알림: ${this.user.email}님이 가입 신청을 재전송했습니다.`);
            } else {
                // Supabase 저장 실패 시 로컬에만 저장
                console.log('⚠️ Supabase 저장 실패, 로컬 저장 시도...');

                const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
                const existingIndex = pendingUsers.findIndex(u => u.email === this.user.email);

                const userData = {
                    email: this.user.email,
                    name: this.user.name,
                    picture: this.user.picture,
                    requestedAt: new Date().toISOString(),
                    status: 'pending',
                    resent: true,
                    lastResent: new Date().toISOString()
                };

                if (existingIndex >= 0) {
                    pendingUsers[existingIndex] = userData;
                } else {
                    pendingUsers.push(userData);
                }

                localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

                this.showNotification('⚠️ 서버 연결 문제로 로컬에만 저장되었습니다. 나중에 다시 시도해주세요.', 'warning');
            }
        } catch (error) {
            console.error('❌ 가입 신청 재전송 실패:', error);
            this.showNotification('❌ 가입 신청 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        }
    }

    showPendingApproval() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.approval-pending-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'approval-pending-modal';

        const content = document.createElement('div');
        content.className = 'approval-pending-content';

        // X 버튼 생성
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-x';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => modal.remove();

        // 컨텐츠 HTML
        content.innerHTML = `
            <div class="pending-icon">⏳</div>
            <h3>승인 대기중</h3>
            <p>관리자의 승인을 기다리고 있습니다.</p>
            <p>승인이 완료되면 모든 기능을 사용하실 수 있습니다.</p>
            <p class="user-email">${this.user.email}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px;">
                    가입 신청이 확인되지 않으신다면 아래 버튼을 클릭하세요
                </p>
            </div>
        `;

        // 재신청 버튼 생성
        const resendBtn = document.createElement('button');
        resendBtn.className = 'btn-resend';
        resendBtn.style.cssText = `
            background: #4ecdc4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin: 10px 5px;
            font-size: 14px;
        `;
        resendBtn.textContent = '재신청';
        resendBtn.onclick = async () => {
            if (confirm('가입 신청을 다시 하시겠습니까?\n\n관리자 페이지에서 확인할 수 있도록 데이터를 재전송합니다.')) {
                await this.resendApplication();
            }
        };

        // 확인 버튼 생성
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'close-btn';
        confirmBtn.textContent = '확인';
        confirmBtn.onclick = () => modal.remove();

        // 버튼들을 appendChild로 추가
        content.insertBefore(closeBtn, content.firstChild);
        content.appendChild(resendBtn);
        content.appendChild(confirmBtn);

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Tool 페이지도 잠금 처리
        this.disableAllFeatures();

        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    enableMainFeatures() {
        // 메인 기능 활성화
        document.querySelectorAll('.stage-card').forEach(card => {
            // 좌물쇠 오버레이 제거
            const lockOverlay = card.querySelector('.lock-overlay');
            if (lockOverlay) {
                lockOverlay.remove();
            }
            
            // 활성화 스타일
            card.classList.remove('disabled');
            card.style.pointerEvents = 'auto';
            card.dataset.locked = 'false';
        });
        
        // 보호된 링크 활성화
        document.querySelectorAll('.protected-link').forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('data-protected');
        });
    }

    disableMainFeatures() {
        // 메인 기능 비활성화 - Tool 카드에 좌물쇠 오버레이 추가
        document.querySelectorAll('.stage-card').forEach(card => {
            // 이미 처리된 카드는 스킵
            if (card.dataset.locked === 'true') return;
            
            // 카드 중앙에 좌물쇠 오버레이 추가
            if (!card.querySelector('.lock-overlay')) {
                const lockOverlay = document.createElement('div');
                lockOverlay.className = 'lock-overlay';
                lockOverlay.innerHTML = '🔒';
                lockOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(2px);
                    font-size: 32px;
                    z-index: 10;
                    border-radius: inherit;
                `;
                
                // 카드에 position relative 추가 (절대 위치 지정을 위해)
                card.style.position = 'relative';
                card.appendChild(lockOverlay);
            }
            
            // 비활성화 스타일
            card.classList.add('disabled');
            card.style.pointerEvents = 'none';
            card.dataset.locked = 'true';
        });
        
        // 보호된 링크 비활성화
        document.querySelectorAll('.protected-link').forEach(link => {
            link.classList.add('disabled');
            link.setAttribute('data-protected', 'true');
        });
    }
    
    disableAllFeatures() {
        // 현재 페이지가 Tool 페이지인지 확인
        const currentPath = window.location.pathname;
        const toolPages = [
            'prompt-builder.html',
            'video-prompt-builder.html',
            'prompt-generator/index.html',
            'concept-art/index.html',
            'storyboard/index.html',
            'media-gallery/index.html'
        ];
        
        // Tool 페이지에서 간단하게 좌물쇠 아이콘만 추가하고 비활성화
        if (toolPages.some(page => currentPath.includes(page))) {
            // 모든 버튼과 인터랙티브 요소에 좌물쇠 추가
            document.querySelectorAll('button, .btn, a[href], input, textarea, select, .clickable, .card, .stage-card').forEach(element => {
                // 이미 처리된 요소는 스킵
                if (element.dataset.locked === 'true') return;
                
                // 좌물쇠 아이콘 추가
                const lockIcon = document.createElement('span');
                lockIcon.innerHTML = '🔒 ';
                lockIcon.style.cssText = 'margin-right: 4px;';
                
                // 텍스트가 있는 요소에만 아이콘 추가
                if (element.textContent.trim()) {
                    element.insertBefore(lockIcon, element.firstChild);
                }
                
                // 비활성화 스타일 적용
                element.style.opacity = '0.5';
                element.style.cursor = 'not-allowed';
                element.style.pointerEvents = 'none';
                element.dataset.locked = 'true';
                
                // disabled 속성 추가 (form 요소들)
                if ('disabled' in element) {
                    element.disabled = true;
                }
            });
        }
        
        // 메인 페이지의 기능도 비활성화
        this.disableMainFeatures();
    }

    openDashboard() {
        // 대시보드 페이지로 이동
        window.location.href = '/dashboard.html';
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
                        // Tool 페이지인지 확인
                        const currentPath = window.location.pathname;
                        const toolPages = [
                            'prompt-builder.html',
                            'video-prompt-builder.html',
                            'prompt-generator',
                            'concept-art',
                            'storyboard',
                            'media-gallery'
                        ];
                        
                        const isToolPage = toolPages.some(page => currentPath.includes(page));
                        
                        if (isToolPage) {
                            // Tool 페이지에서는 전체 잠금
                            this.disableAllFeatures();
                        } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                            // 메인 페이지에서는 기능 비활성화 및 대기 메시지
                            this.disableMainFeatures();
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
            // Tool 페이지인지 확인
            const currentPath = window.location.pathname;
            const toolPages = [
                'prompt-builder.html',
                'video-prompt-builder.html',
                'prompt-generator',
                'concept-art',
                'storyboard',
                'media-gallery'
            ];
            
            const isToolPage = toolPages.some(page => currentPath.includes(page));
            
            if (isToolPage) {
                // Tool 페이지에서 로그인 안 된 경우 접근 차단
                this.showToolAccessDenied();
            } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                // 메인 페이지에서는 로그인 모달 표시
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
            // 버튼 렌더링을 여러 번 시도
            this.renderButton('google-signin-button');
            
            // 추가 시도
            setTimeout(() => {
                if (!document.querySelector('#google-signin-button iframe')) {
                    console.log('🔄 Retrying button render...');
                    this.renderButton('google-signin-button');
                }
            }, 500);
            
            setTimeout(() => {
                if (!document.querySelector('#google-signin-button iframe')) {
                    console.log('🔄 Final retry button render...');
                    this.renderButton('google-signin-button');
                }
            }, 1500);
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
    
    showToolAccessDenied() {
        // 전체 페이지를 덮는 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'tool-access-denied-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(20, 20, 20, 0.98);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 20px;
            padding: 48px;
            text-align: center;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        content.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 24px;">🔐</div>
            <h2 style="color: #fff; font-size: 28px; margin-bottom: 16px; font-weight: 600;">로그인이 필요합니다</h2>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin-bottom: 32px; line-height: 1.6;">
                이 도구를 사용하려면 먼저 로그인해주세요.<br>
                Google 계정으로 간편하게 로그인할 수 있습니다.
            </p>
            <button onclick="window.location.href='/'" style="
                background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                color: white;
                border: none;
                padding: 14px 40px;
                border-radius: 28px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 107, 107, 0.4)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 107, 107, 0.3)'">
                로그인 페이지로 이동
            </button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // 모든 인터랙션 차단
        document.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
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