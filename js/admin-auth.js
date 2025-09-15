/**
 * AIFI 관리자 대시보드 인증 시스템
 * Supabase 기반 사용자 관리
 */

class AdminAuth {
    constructor() {
        this.supabase = null;
        this.allUsers = [];
        this.filteredUsers = [];
        this.currentFilter = 'all';
        this.selectedUsers = new Set();
        this.isAdmin = false;

        this.initSupabase();
        this.checkAdminAuth();
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

    // 관리자 권한 확인
    async checkAdminAuth() {
        const userInfo = localStorage.getItem('user_info');

        if (!userInfo) {
            this.showNotification('로그인이 필요합니다', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        try {
            const user = JSON.parse(userInfo);

            // 관리자 이메일 목록
            const ADMIN_EMAILS = ['ggamsire@gmail.com'];

            if (!ADMIN_EMAILS.includes(user.email) && user.role !== 'admin') {
                this.showNotification('관리자 권한이 필요합니다', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }

            this.isAdmin = true;
            document.getElementById('admin-content').style.display = 'block';
            this.loadUsers();

            // 30초마다 자동 새로고침
            setInterval(() => this.refreshData(), 30000);

        } catch (e) {
            console.error('권한 확인 오류:', e);
            window.location.href = 'index.html';
        }
    }

    // 사용자 목록 로드
    async loadUsers() {
        if (!this.supabase) {
            this.showNotification('데이터베이스 연결 실패', 'error');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('사용자 목록 로드 실패:', error);
                this.showNotification('데이터 로드 실패', 'error');
                return;
            }

            this.allUsers = data || [];
            this.filteredUsers = this.allUsers;
            this.updateUI();

        } catch (error) {
            console.error('로드 오류:', error);
            this.showNotification('시스템 오류가 발생했습니다', 'error');
        }
    }

    // UI 업데이트
    updateUI() {
        this.updateStats();
        this.renderUserLists();
    }

    // 통계 업데이트
    updateStats() {
        const pending = this.allUsers.filter(u => u.status === 'pending').length;
        const approved = this.allUsers.filter(u => u.status === 'approved').length;
        const total = this.allUsers.length;

        // 30일 이내 로그인한 활성 사용자
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const active = this.allUsers.filter(u =>
            u.last_login && new Date(u.last_login) > thirtyDaysAgo
        ).length;

        document.getElementById('pending-count').textContent = pending;
        document.getElementById('approved-count').textContent = approved;
        document.getElementById('total-count').textContent = total;
        document.getElementById('active-count').textContent = active;

        document.getElementById('pending-badge').textContent = pending;
        document.getElementById('approved-badge').textContent = approved;
    }

    // 사용자 목록 렌더링
    renderUserLists() {
        const pendingUsers = this.filteredUsers.filter(u => u.status === 'pending');
        const approvedUsers = this.filteredUsers.filter(u => u.status === 'approved');

        document.getElementById('pending-users').innerHTML = this.renderUsers(pendingUsers, 'pending');
        document.getElementById('approved-users').innerHTML = this.renderUsers(approvedUsers, 'approved');
    }

    // 사용자 렌더링
    renderUsers(users, type) {
        if (users.length === 0) {
            return '<div class="no-users">사용자가 없습니다</div>';
        }

        return users.map(user => {
            const isSelected = this.selectedUsers.has(user.email);
            const dateStr = type === 'pending'
                ? this.formatDate(user.created_at)
                : this.formatDate(user.approved_at || user.created_at);

            const profilePicture = user.profile_picture ||
                `https://ui-avatars.com/api/?name=${user.name}&background=ff6b6b&color=fff`;

            return `
                <div class="user-item ${isSelected ? 'selected' : ''}">
                    <div class="user-checkbox">
                        <input type="checkbox"
                               data-email="${user.email}"
                               ${isSelected ? 'checked' : ''}
                               onchange="adminAuth.toggleUserSelection('${user.email}', this.checked)">
                    </div>
                    <div class="user-info">
                        <img src="${profilePicture}" alt="${user.name}" class="user-avatar">
                        <div class="user-details">
                            <div class="user-name">${user.name || 'N/A'}</div>
                            <div class="user-email">${user.email}</div>
                            ${user.role === 'admin' ? '<span class="admin-badge">관리자</span>' : ''}
                        </div>
                    </div>
                    <div class="user-date">${dateStr}</div>
                    <div class="user-actions">
                        ${type === 'pending' ? `
                            <button class="user-action-btn approve" onclick="adminAuth.approveUser('${user.email}')" title="승인">
                                <i class="ti ti-check"></i>
                            </button>
                            <button class="user-action-btn reject" onclick="adminAuth.rejectUser('${user.email}')" title="거절">
                                <i class="ti ti-x"></i>
                            </button>
                        ` : `
                            ${user.role !== 'admin' ? `
                                <button class="user-action-btn reject" onclick="adminAuth.revokeUser('${user.email}')" title="권한 취소">
                                    <i class="ti ti-user-x"></i>
                                </button>
                            ` : ''}
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 날짜 포맷
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // 사용자 승인
    async approveUser(email) {
        if (!confirm(`${email} 사용자를 승인하시겠습니까?`)) return;

        if (!this.supabase) {
            this.showNotification('데이터베이스 연결 실패', 'error');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('users')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString()
                })
                .eq('email', email);

            if (error) throw error;

            this.showNotification('사용자가 승인되었습니다', 'success');
            this.loadUsers();

        } catch (error) {
            console.error('승인 오류:', error);
            this.showNotification('승인 중 오류가 발생했습니다', 'error');
        }
    }

    // 사용자 거절
    async rejectUser(email) {
        if (!confirm(`${email} 사용자를 거절하시겠습니까?`)) return;

        if (!this.supabase) {
            this.showNotification('데이터베이스 연결 실패', 'error');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('users')
                .update({
                    status: 'rejected'
                })
                .eq('email', email);

            if (error) throw error;

            this.showNotification('사용자가 거절되었습니다', 'success');
            this.loadUsers();

        } catch (error) {
            console.error('거절 오류:', error);
            this.showNotification('거절 중 오류가 발생했습니다', 'error');
        }
    }

    // 권한 취소
    async revokeUser(email) {
        if (!confirm(`${email} 사용자의 권한을 취소하시겠습니까?`)) return;

        if (!this.supabase) {
            this.showNotification('데이터베이스 연결 실패', 'error');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('users')
                .update({
                    status: 'rejected'
                })
                .eq('email', email);

            if (error) throw error;

            this.showNotification('권한이 취소되었습니다', 'success');
            this.loadUsers();

        } catch (error) {
            console.error('권한 취소 오류:', error);
            this.showNotification('권한 취소 중 오류가 발생했습니다', 'error');
        }
    }

    // 선택된 사용자 승인
    async approveSelected() {
        const selected = Array.from(this.selectedUsers);
        if (selected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }

        if (!confirm(`선택된 ${selected.length}명의 사용자를 승인하시겠습니까?`)) return;

        for (const email of selected) {
            await this.approveUser(email);
        }

        this.selectedUsers.clear();
        this.loadUsers();
    }

    // 선택된 사용자 거절
    async rejectSelected() {
        const selected = Array.from(this.selectedUsers);
        if (selected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }

        if (!confirm(`선택된 ${selected.length}명의 사용자를 거절하시겠습니까?`)) return;

        for (const email of selected) {
            await this.rejectUser(email);
        }

        this.selectedUsers.clear();
        this.loadUsers();
    }

    // 선택된 사용자 권한 취소
    async revokeSelected() {
        const selected = Array.from(this.selectedUsers);
        if (selected.length === 0) {
            this.showNotification('선택된 사용자가 없습니다', 'error');
            return;
        }

        if (!confirm(`선택된 ${selected.length}명의 사용자 권한을 취소하시겠습니까?`)) return;

        for (const email of selected) {
            await this.revokeUser(email);
        }

        this.selectedUsers.clear();
        this.loadUsers();
    }

    // 사용자 선택 토글
    toggleUserSelection(email, checked) {
        if (checked) {
            this.selectedUsers.add(email);
        } else {
            this.selectedUsers.delete(email);
        }
        this.renderUserLists();
    }

    // 전체 선택
    selectAll(type, checked) {
        const users = type === 'pending'
            ? this.filteredUsers.filter(u => u.status === 'pending')
            : this.filteredUsers.filter(u => u.status === 'approved');

        users.forEach(user => {
            if (checked) {
                this.selectedUsers.add(user.email);
            } else {
                this.selectedUsers.delete(user.email);
            }
        });

        this.renderUserLists();
    }

    // 사용자 검색
    searchUsers(query) {
        query = query.toLowerCase();

        if (query === '') {
            this.filteredUsers = this.allUsers;
        } else {
            this.filteredUsers = this.allUsers.filter(user =>
                (user.name && user.name.toLowerCase().includes(query)) ||
                user.email.toLowerCase().includes(query)
            );
        }

        this.renderUserLists();
    }

    // 사용자 필터
    filterUsers(filter) {
        this.currentFilter = filter;

        // 필터 버튼 스타일 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        if (filter === 'all') {
            this.filteredUsers = this.allUsers;
        } else {
            this.filteredUsers = this.allUsers.filter(u => u.status === filter);
        }

        this.renderUserLists();
    }

    // 데이터 새로고침
    async refreshData() {
        this.showNotification('데이터를 새로고침합니다...', 'info');
        await this.loadUsers();
        this.showNotification('새로고침 완료', 'success');
    }

    // 데이터 내보내기
    exportUsers() {
        const data = this.allUsers.map(user => ({
            이름: user.name,
            이메일: user.email,
            상태: user.status,
            역할: user.role,
            가입일: user.created_at,
            승인일: user.approved_at,
            마지막_로그인: user.last_login
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `aifi_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('데이터를 내보냈습니다', 'success');
    }

    // CSV 변환
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row =>
            headers.map(header => `"${row[header] || ''}"`).join(',')
        );
        return `\uFEFF${csvHeaders}\n${csvRows.join('\n')}`;
    }

    // 로그아웃
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.href = 'index.html';
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 전역 인스턴스 생성
const adminAuth = new AdminAuth();

// 전역 접근을 위한 export
window.adminAuth = adminAuth;