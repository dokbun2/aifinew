// Admin Dashboard Supabase Integration
// admin.html 페이지 끝에 이 스크립트를 추가하세요

// Supabase 사용자 목록 가져오기
async function loadUsersFromSupabase() {
    try {
        console.log('🔄 Supabase에서 사용자 목록 로드 시작...');

        // ProjectBackup 인스턴스 대기
        let retries = 0;
        while (!window.ProjectBackup && retries < 10) {
            console.log(`⏳ ProjectBackup 대기중... (시도 ${retries + 1}/10)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }

        if (!window.ProjectBackup) {
            console.warn('⚠️ ProjectBackup 인스턴스를 찾을 수 없습니다.');

            // 직접 Supabase 클라이언트 생성 시도
            if (window.supabase) {
                try {
                    const module = await import('./modules/supabase-config.js');
                    if (module.SUPABASE_CONFIG) {
                        const supabaseClient = window.supabase.createClient(
                            module.SUPABASE_CONFIG.url,
                            module.SUPABASE_CONFIG.anonKey
                        );

                        const { data, error } = await supabaseClient
                            .from('users')
                            .select('*')
                            .order('created_at', { ascending: false });

                        if (error) {
                            console.error('❌ 직접 Supabase 사용자 목록 가져오기 실패:', error);
                            return null;
                        }

                        console.log('✅ 직접 Supabase에서 사용자 목록 로드됨:', data);
                        return data;
                    }
                } catch (error) {
                    console.error('❌ Supabase 클라이언트 생성 실패:', error);
                }
            }
            return null;
        }

        if (!window.ProjectBackup.supabase) {
            console.warn('⚠️ ProjectBackup.supabase가 초기화되지 않았습니다.');
            await window.ProjectBackup.initSupabase();

            // 재시도
            if (!window.ProjectBackup.supabase) {
                console.error('❌ Supabase 초기화 실패');
                return null;
            }
        }

        // users 테이블에서 모든 사용자 가져오기
        console.log('🔍 users 테이블에서 데이터 조회 중...');
        const { data, error } = await window.ProjectBackup.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase 사용자 목록 가져오기 실패:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return null;
        }

        console.log(`✅ Supabase에서 ${data ? data.length : 0}명의 사용자 목록 로드됨`);
        if (data && data.length > 0) {
            console.table(data.map(u => ({
                email: u.email,
                name: u.name,
                status: u.status,
                created_at: u.created_at
            })));
        }
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

// 사용자 목록 병합 함수 (중복 제거)
function mergeUserLists(existingUsers, newUsers) {
    const userMap = new Map();

    // 기존 사용자 추가
    existingUsers.forEach(user => {
        userMap.set(user.email, user);
    });

    // 새 사용자 추가/업데이트 (Supabase가 최신 데이터)
    newUsers.forEach(user => {
        userMap.set(user.email, user);
    });

    return Array.from(userMap.values());
}

// AdminAuth의 loadUsers 메서드 오버라이드
if (window.adminAuth) {
    const originalLoadUsers = window.adminAuth.loadUsers.bind(window.adminAuth);

    window.adminAuth.loadUsers = async function() {
        console.log('🔄 Supabase에서 사용자 목록 로드 중...');

        try {
            // Supabase에서 사용자 목록 가져오기
            const supabaseUsers = await loadUsersFromSupabase();

            if (supabaseUsers && supabaseUsers.length > 0) {
                // Supabase 데이터를 localStorage 형식으로 변환
                const pendingUsers = [];
                const approvedUsers = [];
                const rejectedUsers = [];

                supabaseUsers.forEach(user => {
                    const userData = {
                        email: user.email,
                        name: user.name || user.email.split('@')[0],
                        picture: user.picture || '',
                        requestedAt: user.created_at,
                        approvedAt: user.approved_at,
                        status: user.status || 'pending',
                        loginCount: user.login_count || 0,
                        lastLogin: user.last_login,
                        googleId: user.google_id
                    };

                    if (user.status === 'approved') {
                        approvedUsers.push(userData);
                    } else if (user.status === 'rejected') {
                        rejectedUsers.push(userData);
                    } else {
                        pendingUsers.push(userData);
                    }
                });

                // localStorage 업데이트 (백업용) - 기존 데이터와 병합
                const existingPending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
                const existingApproved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');

                // 이메일을 기준으로 중복 제거하며 병합
                const mergedPending = mergeUserLists(existingPending, pendingUsers);
                const mergedApproved = mergeUserLists(existingApproved, approvedUsers);

                localStorage.setItem('pendingUsers', JSON.stringify(mergedPending));
                localStorage.setItem('approvedUsers', JSON.stringify(mergedApproved));

                console.log(`✅ Supabase 사용자 현황:`);
                console.log(`   - 대기중: ${pendingUsers.length}명`);
                console.log(`   - 승인됨: ${approvedUsers.length}명`);
                console.log(`   - 거절됨: ${rejectedUsers.length}명`);
                console.log(`   - 총: ${supabaseUsers.length}명`);

                // 새로운 가입자가 있으면 알림
                const lastCheckTime = localStorage.getItem('lastUserCheck');
                const currentTime = new Date().toISOString();

                if (lastCheckTime) {
                    const newUsers = pendingUsers.filter(user =>
                        new Date(user.requestedAt) > new Date(lastCheckTime)
                    );

                    if (newUsers.length > 0) {
                        console.log(`🆕 새로운 가입 신청자: ${newUsers.length}명`);
                        newUsers.forEach(user => {
                            console.log(`   - ${user.name} (${user.email})`);
                        });

                        // 알림 표시 (옵션)
                        if (window.adminAuth && window.adminAuth.showNotification) {
                            window.adminAuth.showNotification(
                                `새로운 가입 신청자 ${newUsers.length}명이 있습니다!`,
                                'info'
                            );
                        }
                    }
                }

                localStorage.setItem('lastUserCheck', currentTime);
            } else {
                console.log('ℹ️ Supabase에 사용자 데이터가 없거나 연결 실패');
                console.log('💾 로컬 데이터 유지:');
                const localPending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
                const localApproved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
                console.log(`   - 로컬 대기중: ${localPending.length}명`);
                console.log(`   - 로컬 승인됨: ${localApproved.length}명`);
            }
        } catch (error) {
            console.error('❌ Supabase 데이터 로드 실패:', error);
            console.log('💾 로컬 데이터를 유지합니다');
            // 에러 발생 시 로컬 데이터 유지 (삭제하지 않음)
            const localPending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
            const localApproved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
            console.log(`   - 로컬 대기중: ${localPending.length}명`);
            console.log(`   - 로컬 승인됨: ${localApproved.length}명`);
        }

        // 원래 loadUsers 함수 호출 (UI 업데이트)
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

    // ProjectBackup 초기화 대기
    let retries = 0;
    const waitForProjectBackup = setInterval(async () => {
        retries++;

        if (window.ProjectBackup || retries > 10) {
            clearInterval(waitForProjectBackup);

            if (window.ProjectBackup) {
                console.log('✅ ProjectBackup 준비 완료');

                // Supabase 초기화 확인
                if (!window.ProjectBackup.supabase) {
                    await window.ProjectBackup.initSupabase();
                }

                // 사용자 목록 로드
                if (window.adminAuth && window.adminAuth.isAdmin) {
                    console.log('🔄 초기 사용자 목록 로드...');
                    await window.adminAuth.loadUsers();
                }
            } else {
                console.warn('⚠️ ProjectBackup을 찾을 수 없습니다. 수동으로 초기화 시도...');

                // 수동으로 ProjectBackup 초기화
                try {
                    const { default: ProjectBackupSystem } = await import('./modules/project-backup.js');
                    window.ProjectBackup = new ProjectBackupSystem();
                    console.log('✅ ProjectBackup 수동 초기화 성공');

                    // 사용자 목록 로드
                    if (window.adminAuth && window.adminAuth.isAdmin) {
                        await window.adminAuth.loadUsers();
                    }
                } catch (error) {
                    console.error('❌ ProjectBackup 수동 초기화 실패:', error);
                }
            }
        }
    }, 500);

    // 30초마다 자동 새로고침 (너무 자주하면 API 제한에 걸릴 수 있음)
    setInterval(async () => {
        if (window.adminAuth && window.adminAuth.isAdmin) {
            console.log('🔄 자동 새로고침...');
            await window.adminAuth.refreshData(); // loadUsers 대신 refreshData 사용
        }
    }, 30000); // 10초에서 30초로 변경
});

console.log('✅ Admin Supabase Integration 로드됨');