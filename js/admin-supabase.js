// Admin Dashboard Supabase Integration
// admin.html 페이지 끝에 이 스크립트를 추가하세요

// Supabase 사용자 목록 가져오기
async function loadUsersFromSupabase() {
    try {
        // ProjectBackup 인스턴스 대기
        let retries = 0;
        while (!window.ProjectBackup && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }

        if (!window.ProjectBackup || !window.ProjectBackup.supabase) {
            console.warn('⚠️ Supabase 연결을 사용할 수 없습니다.');
            return null;
        }

        // users 테이블에서 모든 사용자 가져오기
        const { data, error } = await window.ProjectBackup.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase 사용자 목록 가져오기 실패:', error);
            return null;
        }

        console.log('✅ Supabase에서 사용자 목록 로드됨:', data);
        return data;
    } catch (error) {
        console.error('❌ Supabase 연결 오류:', error);
        return null;
    }
}

// 사용자 승인
async function approveUserInSupabase(email) {
    try {
        if (!window.ProjectBackup || !window.ProjectBackup.supabase) {
            console.warn('⚠️ Supabase 연결을 사용할 수 없습니다.');
            return false;
        }

        const { data, error } = await window.ProjectBackup.supabase
            .from('users')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: JSON.parse(localStorage.getItem('user_info'))?.email
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('❌ 사용자 승인 실패:', error);
            return false;
        }

        console.log('✅ 사용자 승인됨:', data);
        return true;
    } catch (error) {
        console.error('❌ 승인 오류:', error);
        return false;
    }
}

// 사용자 거절
async function rejectUserInSupabase(email) {
    try {
        if (!window.ProjectBackup || !window.ProjectBackup.supabase) {
            console.warn('⚠️ Supabase 연결을 사용할 수 없습니다.');
            return false;
        }

        const { data, error } = await window.ProjectBackup.supabase
            .from('users')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('❌ 사용자 거절 실패:', error);
            return false;
        }

        console.log('✅ 사용자 거절됨:', data);
        return true;
    } catch (error) {
        console.error('❌ 거절 오류:', error);
        return false;
    }
}

// AdminAuth의 loadUsers 메서드 오버라이드
if (window.adminAuth) {
    const originalLoadUsers = window.adminAuth.loadUsers.bind(window.adminAuth);

    window.adminAuth.loadUsers = async function() {
        console.log('🔄 Supabase에서 사용자 목록 로드 중...');

        // Supabase에서 사용자 목록 가져오기
        const supabaseUsers = await loadUsersFromSupabase();

        if (supabaseUsers && supabaseUsers.length > 0) {
            // Supabase 데이터를 localStorage 형식으로 변환
            const pendingUsers = [];
            const approvedUsers = [];

            supabaseUsers.forEach(user => {
                const userData = {
                    email: user.email,
                    name: user.name || user.email.split('@')[0],
                    picture: user.picture || '',
                    requestedAt: user.created_at,
                    approvedAt: user.approved_at,
                    status: user.status || 'pending'
                };

                if (user.status === 'approved') {
                    approvedUsers.push(userData);
                } else if (user.status === 'pending' || !user.status) {
                    pendingUsers.push(userData);
                }
            });

            // localStorage 업데이트 (백업용)
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
            localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

            console.log(`✅ Supabase 사용자: 대기 ${pendingUsers.length}명, 승인 ${approvedUsers.length}명`);
        }

        // 원래 loadUsers 함수 호출
        originalLoadUsers();
    };

    // 승인/거절 메서드도 오버라이드
    const originalApproveUser = window.adminAuth.approveUser.bind(window.adminAuth);
    window.adminAuth.approveUser = async function(email) {
        await approveUserInSupabase(email);
        originalApproveUser(email);
    };

    const originalRejectUser = window.adminAuth.rejectUser.bind(window.adminAuth);
    window.adminAuth.rejectUser = async function(email) {
        await rejectUserInSupabase(email);
        originalRejectUser(email);
    };
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Admin Supabase Integration 시작...');

    // 3초 후 사용자 목록 로드 (초기화 대기)
    setTimeout(async () => {
        if (window.adminAuth && window.adminAuth.isAdmin) {
            await window.adminAuth.loadUsers();
        }
    }, 3000);

    // 10초마다 자동 새로고침
    setInterval(async () => {
        if (window.adminAuth && window.adminAuth.isAdmin) {
            console.log('🔄 자동 새로고침...');
            await window.adminAuth.loadUsers();
        }
    }, 10000);
});

console.log('✅ Admin Supabase Integration 로드됨');