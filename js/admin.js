// Admin Management System with Enhanced Features
class AdminAuth {
    constructor() {
        // 관리자 목록을 localStorage에서 로드 (동적 관리)
        this.loadAdminList();
        
        this.currentUser = null;
        this.isAdmin = false;
        this.selectedUsers = new Set();
        this.currentFilter = 'all';
        this.allUsers = {
            pending: [],
            approved: []
        };
        
        this.initializeAdmin();
    }
    
    // 관리자 목록 로드
    loadAdminList() {
        const storedAdmins = localStorage.getItem('admin_list');
        if (storedAdmins) {
            this.ADMIN_EMAILS = JSON.parse(storedAdmins);
        } else {
            // 기본 관리자 설정
            this.ADMIN_EMAILS = ['ggamsire@gmail.com'];
            this.saveAdminList();
        }
    }
    
    // 관리자 목록 저장
    saveAdminList() {
        localStorage.setItem('admin_list', JSON.stringify(this.ADMIN_EMAILS));
    }
    
    // 사용자를 관리자로 지정
    makeUserAdmin(email) {
        if (!this.ADMIN_EMAILS.includes(email)) {
            this.ADMIN_EMAILS.push(email);
            this.saveAdminList();
            this.showNotification(`${email}이(가) 관리자로 지정되었습니다.`, 'success');
            this.loadUsers(); // 사용자 목록 새로고침
            return true;
        }
        return false;
    }
    
    // 관리자 권한 취소
    removeUserAdmin(email) {
        // 최소 1명의 관리자는 유지
        if (this.ADMIN_EMAILS.length > 1) {
            const index = this.ADMIN_EMAILS.indexOf(email);
            if (index > -1) {
                this.ADMIN_EMAILS.splice(index, 1);
                this.saveAdminList();
                this.showNotification(`${email}의 관리자 권한이 취소되었습니다.`, 'success');
                this.loadUsers();
                return true;
            }
        } else {
            this.showNotification('최소 1명의 관리자가 필요합니다.', 'error');
        }
        return false;
    }
    
    // 사용자가 관리자인지 확인
    isUserAdmin(email) {
        return this.ADMIN_EMAILS.includes(email);
    }
    
    initializeAdmin() {
        // 인증 상태 확인
        this.checkAdminAuth();
        
        // 관리 기능 초기화
        if (this.isAdmin) {
            this.loadUsers();
            this.setupEventListeners();
        }
    }
    
    checkAdminAuth() {
        const userInfo = localStorage.getItem('user_info');
        
        if (userInfo) {
            try {
                this.currentUser = JSON.parse(userInfo);
                this.isAdmin = this.ADMIN_EMAILS.includes(this.currentUser.email);
                
                if (this.isAdmin) {
                    this.showAdminPanel();
                } else {
                    this.showAccessDenied();
                }
            } catch (e) {
                console.error('Error parsing user info:', e);
                this.showLoginRequired();
            }
        } else {
            this.showLoginRequired();
        }
    }
    
    showLoginRequired() {
        document.getElementById('admin-content').style.display = 'none';
        const noticeDiv = document.getElementById('admin-only-notice');
        if (noticeDiv) {
            noticeDiv.style.display = 'block';
            noticeDiv.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="ti ti-user-circle" style="font-size: 48px; color: #007AFF; margin-bottom: 20px; display: block;"></i>
                    <h3 style="color: #fff; font-size: 24px; margin-bottom: 12px;">로그인이 필요해요</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; line-height: 1.6;">
                        관리자 페이지에 접근하려면<br>
                        먼저 Google 계정으로 로그인해주세요.
                    </p>
                    <button onclick="window.location.href='/index.html'" 
                            style="padding: 10px 24px; 
                                   background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); 
                                   color: white; 
                                   border: none; 
                                   border-radius: 8px; 
                                   cursor: pointer; 
                                   font-size: 14px; 
                                   font-weight: 500;
                                   transition: transform 0.2s, box-shadow 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0, 122, 255, 0.4)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <i class="ti ti-login" style="font-size: 16px; vertical-align: middle; margin-right: 6px;"></i>
                        로그인 페이지로 이동
                    </button>
                </div>
            `;
        }
    }
    
    showAdminPanel() {
        document.getElementById('admin-content').style.display = 'block';
        document.getElementById('admin-only-notice').style.display = 'none';
        this.loadUsers();
    }
    
    showAccessDenied() {
        document.getElementById('admin-content').style.display = 'none';
        const noticeDiv = document.getElementById('admin-only-notice');
        if (noticeDiv) {
            noticeDiv.style.display = 'block';
            noticeDiv.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="ti ti-lock" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px; display: block;"></i>
                    <h3 style="color: #fff; font-size: 24px; margin-bottom: 12px;">관리자 전용 페이지</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 8px;">
                        이 페이지는 관리자만 접근할 수 있어요.
                    </p>
                    ${this.currentUser ? `
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-bottom: 24px;">
                            현재 계정: ${this.currentUser.email}
                        </p>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 13px; line-height: 1.6; max-width: 400px; margin: 0 auto 24px;">
                            관리자 권한이 필요하시면 시스템 관리자에게 문의해주세요.
                        </p>
                    ` : ''}
                    <button onclick="window.location.href='/index.html'" 
                            style="padding: 10px 24px; 
                                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                   color: white; 
                                   border: none; 
                                   border-radius: 8px; 
                                   cursor: pointer; 
                                   font-size: 14px; 
                                   font-weight: 500;
                                   transition: transform 0.2s, box-shadow 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <i class="ti ti-home" style="font-size: 16px; vertical-align: middle; margin-right: 6px;"></i>
                        메인 페이지로 돌아가기
                    </button>
                </div>
            `;
        }
    }
    
    
    loadUsers() {
        // 로컬 스토리지에서 사용자 목록 로드
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        
        // 전체 사용자 저장
        this.allUsers.pending = pendingUsers;
        this.allUsers.approved = approvedUsers;
        
        // 통계 업데이트
        this.updateStats(pendingUsers.length, approvedUsers.length);
        
        // 배지 업데이트
        this.updateBadges(pendingUsers.length, approvedUsers.length);
        
        // 사용자 목록 렌더링
        this.renderPendingUsers(pendingUsers);
        this.renderApprovedUsers(approvedUsers);
    }
    
    updateStats(pendingCount, approvedCount) {
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('approved-count').textContent = approvedCount;
        document.getElementById('total-count').textContent = pendingCount + approvedCount;
        document.getElementById('active-count').textContent = approvedCount; // 임시로 승인된 사용자를 활성으로 표시
    }
    
    updateBadges(pendingCount, approvedCount) {
        const pendingBadge = document.getElementById('pending-badge');
        const approvedBadge = document.getElementById('approved-badge');
        
        if (pendingBadge) pendingBadge.textContent = pendingCount;
        if (approvedBadge) approvedBadge.textContent = approvedCount;
    }
    
    renderPendingUsers(users) {
        const container = document.getElementById('pending-users');
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">승인 대기 사용자 없음</div>
                    <p class="empty-state-text">새로운 가입 요청이 들어오면 여기에 표시됩니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = users.map(user => `
            <div class="user-item" data-email="${user.email}" data-type="pending">
                <div>
                    <input type="checkbox" class="user-checkbox" data-email="${user.email}" onchange="adminAuth.toggleUserSelection('${user.email}', 'pending')">
                </div>
                <div class="user-info">
                    <img src="${user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff6b6b&color=fff`}" 
                         alt="${user.name}" class="user-avatar">
                    <div class="user-details">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                <div class="user-meta">${this.formatDate(user.requestedAt)}</div>
                <div class="user-actions">
                    <button class="user-action-btn approve-btn" onclick="adminAuth.approveUser('${user.email}')">승인</button>
                    <button class="user-action-btn reject-btn" onclick="adminAuth.rejectUser('${user.email}')">거절</button>
                </div>
            </div>
        `).join('');
    }
    
    renderApprovedUsers(emails) {
        const container = document.getElementById('approved-users');
        
        if (emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">승인된 사용자 없음</div>
                    <p class="empty-state-text">승인된 사용자가 여기에 표시됩니다</p>
                </div>
            `;
            return;
        }
        
        // 승인된 사용자 정보 구성
        const approvedUserDetails = JSON.parse(localStorage.getItem('approvedUserDetails') || '{}');
        
        container.innerHTML = emails.map(email => {
            const userDetail = approvedUserDetails[email] || {};
            return `
                <div class="user-item" data-email="${email}" data-type="approved">
                    <div>
                        <input type="checkbox" class="user-checkbox" data-email="${email}" onchange="adminAuth.toggleUserSelection('${email}', 'approved')">
                    </div>
                    <div class="user-info">
                        <img src="${userDetail.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=4ecdc4&color=fff`}" 
                             alt="${email}" class="user-avatar">
                        <div class="user-details">
                            <div class="user-name">${userDetail.name || email.split('@')[0]}</div>
                            <div class="user-email">${email}</div>
                        </div>
                    </div>
                    <div class="user-meta">
                        ${this.formatDate(userDetail.approvedAt) || '승인됨'}
                        ${this.isUserAdmin(email) ? '<span style="background: #ff6b6b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">관리자</span>' : ''}
                    </div>
                    <div class="user-actions">
                        ${!this.isUserAdmin(email) ? 
                            `<button class="user-action-btn approve-btn" onclick="adminAuth.makeUserAdmin('${email}')">관리자 지정</button>` :
                            this.ADMIN_EMAILS.length > 1 ? 
                                `<button class="user-action-btn reject-btn" onclick="adminAuth.removeUserAdmin('${email}')">관리자 해제</button>` :
                                ''
                        }
                        <button class="user-action-btn revoke-btn" onclick="adminAuth.revokeUser('${email}')">권한 취소</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 검색 기능
    searchUsers(query) {
        const lowerQuery = query.toLowerCase();
        
        // 대기 중인 사용자 필터링
        const filteredPending = this.allUsers.pending.filter(user => 
            user.name.toLowerCase().includes(lowerQuery) || 
            user.email.toLowerCase().includes(lowerQuery)
        );
        
        // 승인된 사용자 필터링
        const filteredApproved = this.allUsers.approved.filter(email => 
            email.toLowerCase().includes(lowerQuery)
        );
        
        // 현재 필터에 따라 렌더링
        if (this.currentFilter === 'all' || this.currentFilter === 'pending') {
            this.renderPendingUsers(filteredPending);
        }
        
        if (this.currentFilter === 'all' || this.currentFilter === 'approved') {
            this.renderApprovedUsers(filteredApproved);
        }
        
        // 검색 결과가 없을 때
        if (filteredPending.length === 0 && filteredApproved.length === 0) {
            if (this.currentFilter === 'pending' || (this.currentFilter === 'all' && filteredPending.length === 0)) {
                document.getElementById('pending-users').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <div class="empty-state-title">검색 결과 없음</div>
                        <p class="empty-state-text">"${query}"에 대한 검색 결과가 없습니다</p>
                    </div>
                `;
            }
            
            if (this.currentFilter === 'approved' || (this.currentFilter === 'all' && filteredApproved.length === 0)) {
                document.getElementById('approved-users').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <div class="empty-state-title">검색 결과 없음</div>
                        <p class="empty-state-text">"${query}"에 대한 검색 결과가 없습니다</p>
                    </div>
                `;
            }
        }
    }
    
    // 필터 기능
    filterUsers(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.filter-btn').classList.add('active');
        
        // 섹션 표시/숨김
        const pendingSection = document.querySelector('.users-section:first-of-type');
        const approvedSection = document.querySelector('.users-section:last-of-type');
        
        switch(filter) {
            case 'all':
                pendingSection.style.display = 'block';
                approvedSection.style.display = 'block';
                break;
            case 'pending':
                pendingSection.style.display = 'block';
                approvedSection.style.display = 'none';
                break;
            case 'approved':
                pendingSection.style.display = 'none';
                approvedSection.style.display = 'block';
                break;
        }
        
        // 검색 필드 초기화
        document.getElementById('user-search').value = '';
        this.loadUsers();
    }
    
    // 사용자 선택/해제
    toggleUserSelection(email, type) {
        const key = `${type}-${email}`;
        if (this.selectedUsers.has(key)) {
            this.selectedUsers.delete(key);
        } else {
            this.selectedUsers.add(key);
        }
    }
    
    // 전체 선택/해제
    selectAll(type, checked) {
        const checkboxes = document.querySelectorAll(`[data-type="${type}"] .user-checkbox`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const email = checkbox.dataset.email;
            const key = `${type}-${email}`;
            if (checked) {
                this.selectedUsers.add(key);
            } else {
                this.selectedUsers.delete(key);
            }
        });
    }
    
    // 선택된 사용자 승인
    approveSelected() {
        const pendingSelected = Array.from(this.selectedUsers)
            .filter(key => key.startsWith('pending-'))
            .map(key => key.replace('pending-', ''));
        
        if (pendingSelected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }
        
        pendingSelected.forEach(email => {
            this.approveUserSilent(email);
        });
        
        this.selectedUsers.clear();
        this.loadUsers();
        this.showNotification(`${pendingSelected.length}명의 사용자를 승인했습니다`, 'success');
    }
    
    // 선택된 사용자 거절
    rejectSelected() {
        const pendingSelected = Array.from(this.selectedUsers)
            .filter(key => key.startsWith('pending-'))
            .map(key => key.replace('pending-', ''));
        
        if (pendingSelected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }
        
        if (confirm(`정말로 ${pendingSelected.length}명의 사용자를 거절하시겠습니까?`)) {
            pendingSelected.forEach(email => {
                this.rejectUserSilent(email);
            });
            
            this.selectedUsers.clear();
            this.loadUsers();
            this.showNotification(`${pendingSelected.length}명의 사용자를 거절했습니다`, 'error');
        }
    }
    
    // 선택된 사용자 권한 취소
    revokeSelected() {
        const approvedSelected = Array.from(this.selectedUsers)
            .filter(key => key.startsWith('approved-'))
            .map(key => key.replace('approved-', ''));
        
        if (approvedSelected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }
        
        if (confirm(`정말로 ${approvedSelected.length}명의 사용자 권한을 취소하시겠습니까?`)) {
            approvedSelected.forEach(email => {
                this.revokeUserSilent(email);
            });
            
            this.selectedUsers.clear();
            this.loadUsers();
            this.showNotification(`${approvedSelected.length}명의 사용자 권한을 취소했습니다`, 'error');
        }
    }
    
    // 개별 사용자 승인
    approveUser(email) {
        this.approveUserSilent(email);
        this.loadUsers();
        this.showNotification(`${email} 사용자를 승인했습니다.`, 'success');
    }
    
    approveUserSilent(email) {
        // 대기 목록에서 제거
        let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const userInfo = pendingUsers.find(u => u.email === email);
        pendingUsers = pendingUsers.filter(u => u.email !== email);
        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        
        // 승인 목록에 추가
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        if (!approvedUsers.includes(email)) {
            approvedUsers.push(email);
            localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        }
        
        // 승인된 사용자 상세 정보 저장
        if (userInfo) {
            let approvedUserDetails = JSON.parse(localStorage.getItem('approvedUserDetails') || '{}');
            approvedUserDetails[email] = {
                ...userInfo,
                approvedAt: new Date().toISOString()
            };
            localStorage.setItem('approvedUserDetails', JSON.stringify(approvedUserDetails));
        }
        
        // 승인 기록 저장
        this.logAction('approve', email, userInfo);
    }
    
    // 개별 사용자 거절
    rejectUser(email) {
        if (confirm(`정말로 ${email} 사용자를 거절하시겠습니까?`)) {
            this.rejectUserSilent(email);
            this.loadUsers();
            this.showNotification(`${email} 사용자를 거절했습니다.`, 'error');
        }
    }
    
    rejectUserSilent(email) {
        // 대기 목록에서 제거
        let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const userInfo = pendingUsers.find(u => u.email === email);
        pendingUsers = pendingUsers.filter(u => u.email !== email);
        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        
        // 거절 기록 저장
        this.logAction('reject', email, userInfo);
    }
    
    // 개별 사용자 권한 취소
    revokeUser(email) {
        if (confirm(`정말로 ${email} 사용자의 권한을 취소하시겠습니까?`)) {
            this.revokeUserSilent(email);
            this.loadUsers();
            this.showNotification(`${email} 사용자의 권한을 취소했습니다.`, 'error');
        }
    }
    
    revokeUserSilent(email) {
        // 승인 목록에서 제거
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        approvedUsers = approvedUsers.filter(e => e !== email);
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        
        // 취소 기록 저장
        this.logAction('revoke', email);
    }
    
    // 데이터 내보내기
    exportUsers() {
        const data = {
            pending: this.allUsers.pending,
            approved: this.allUsers.approved,
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser.email
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aifi_users_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('사용자 데이터를 내보냈습니다', 'success');
    }
    
    // 데이터 새로고침
    refreshData() {
        this.loadUsers();
        this.showNotification('데이터를 새로고침했습니다', 'success');
    }
    
    logAction(action, email, userInfo = null) {
        // 관리 활동 로그 저장
        let logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
        logs.push({
            action: action,
            email: email,
            userInfo: userInfo,
            adminEmail: this.currentUser.email,
            timestamp: new Date().toISOString()
        });
        
        // 최근 100개 로그만 유지
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        localStorage.setItem('adminLogs', JSON.stringify(logs));
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 시간 차이 계산
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        
        // 일주일 이상이면 날짜 표시
        return date.toLocaleDateString('ko-KR');
    }
    
    setupEventListeners() {
        // 페이지 새로고침 시 데이터 다시 로드
        window.addEventListener('storage', (e) => {
            if (e.key === 'pendingUsers' || e.key === 'approvedUsers') {
                this.loadUsers();
            }
        });
        
        // 5초마다 자동 새로고침 (새로운 요청 확인)
        setInterval(() => {
            this.loadUsers();
        }, 5000);
    }
    
    logout() {
        // 로그아웃 처리
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_approved');
        
        // Google 로그아웃
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        this.showNotification('로그아웃되었습니다.', 'success');
        
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
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
}

// 관리자 인스턴스 생성
const adminAuth = new AdminAuth();

// 전역 접근
window.adminAuth = adminAuth;