// RLS 문제 해결을 위한 개선된 Auth 모듈
// auth-rls-fix.js

class RLSFixedAuth extends GoogleAuth {
    constructor() {
        super();
        this.testRLSConnection();
    }

    async testRLSConnection() {
        console.log('🔍 RLS 연결 테스트 시작...');

        try {
            // 1. Supabase 클라이언트 테스트
            const clients = await this.getAllSupabaseClients();

            for (const [name, client] of Object.entries(clients)) {
                console.log(`\n📡 테스트: ${name}`);

                // SELECT 테스트
                try {
                    const { data, error } = await client
                        .from('users')
                        .select('count')
                        .limit(1);

                    if (error) {
                        console.error(`❌ ${name} SELECT 실패:`, {
                            message: error.message,
                            code: error.code,
                            details: error.details,
                            hint: error.hint
                        });
                    } else {
                        console.log(`✅ ${name} SELECT 성공`);
                    }
                } catch (e) {
                    console.error(`❌ ${name} SELECT 예외:`, e);
                }

                // INSERT 권한 테스트 (dry run)
                try {
                    const testEmail = `test_${Date.now()}@test.com`;
                    const { data, error } = await client
                        .from('users')
                        .insert({
                            email: testEmail,
                            name: 'RLS Test',
                            status: 'test',
                            created_at: new Date().toISOString()
                        })
                        .select();

                    if (error) {
                        console.error(`❌ ${name} INSERT 실패:`, {
                            message: error.message,
                            code: error.code,
                            details: error.details,
                            hint: error.hint
                        });

                        // RLS 정책 문제 감지
                        if (error.code === '42501' || error.message.includes('row-level security')) {
                            console.error('🚨 RLS 정책 문제 감지! 관리자에게 다음 SQL 실행 요청:');
                            console.log(`
-- Supabase SQL Editor에서 실행:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- 또는
CREATE POLICY "Allow all inserts" ON users FOR INSERT WITH CHECK (true);
                            `);
                        }
                    } else {
                        console.log(`✅ ${name} INSERT 성공`);

                        // 테스트 데이터 삭제
                        await client
                            .from('users')
                            .delete()
                            .eq('email', testEmail);
                    }
                } catch (e) {
                    console.error(`❌ ${name} INSERT 예외:`, e);
                }
            }
        } catch (error) {
            console.error('❌ RLS 연결 테스트 실패:', error);
        }
    }

    async getAllSupabaseClients() {
        const clients = {};

        // 1. ProjectBackup 클라이언트
        if (window.ProjectBackup?.supabase) {
            clients['ProjectBackup'] = window.ProjectBackup.supabase;
        }

        // 2. 직접 생성 (anon key)
        if (window.supabase) {
            try {
                const module = await import('./modules/supabase-config.js');
                if (module.SUPABASE_CONFIG) {
                    clients['Direct-Anon'] = window.supabase.createClient(
                        module.SUPABASE_CONFIG.url,
                        module.SUPABASE_CONFIG.anonKey
                    );

                    // 3. Service Role Key 테스트 (만약 있다면)
                    if (module.SUPABASE_CONFIG.serviceRoleKey) {
                        clients['Direct-Service'] = window.supabase.createClient(
                            module.SUPABASE_CONFIG.url,
                            module.SUPABASE_CONFIG.serviceRoleKey,
                            {
                                auth: {
                                    autoRefreshToken: false,
                                    persistSession: false
                                }
                            }
                        );
                    }
                }
            } catch (e) {
                console.warn('설정 로드 실패:', e);
            }
        }

        return clients;
    }

    async saveUserToSupabase(user) {
        console.log('🔄 RLS 수정된 Supabase 저장 시작...');

        // 먼저 로컬스토리지에 저장
        this.saveToLocalStorageImmediate(user);

        const clients = await this.getAllSupabaseClients();
        let savedSuccessfully = false;
        let lastError = null;

        // 모든 클라이언트로 시도
        for (const [name, client] of Object.entries(clients)) {
            console.log(`\n🔄 ${name} 클라이언트로 저장 시도...`);

            try {
                // 사용자 데이터 준비
                const userData = {
                    email: user.email,
                    name: user.name || user.email.split('@')[0],
                    picture: user.picture || '',
                    google_id: user.id || '',
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                    login_count: 1,
                    metadata: {
                        browser: navigator.userAgent,
                        language: navigator.language,
                        platform: navigator.platform,
                        timestamp: new Date().toISOString()
                    }
                };

                // UPSERT 시도
                const { data, error } = await client
                    .from('users')
                    .upsert(userData, {
                        onConflict: 'email',
                        ignoreDuplicates: false
                    })
                    .select();

                if (error) {
                    console.error(`❌ ${name} 저장 실패:`, {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint,
                        userData: userData
                    });

                    lastError = error;

                    // RLS 에러 특별 처리
                    if (error.code === '42501' || error.message.includes('row-level security')) {
                        this.showRLSErrorMessage();
                    }
                } else {
                    console.log(`✅ ${name} 저장 성공:`, data);
                    savedSuccessfully = true;

                    // 성공하면 로컬 상태 업데이트
                    this.updateLocalSyncStatus(user.email, 'synced');

                    break; // 성공했으므로 다른 클라이언트 시도 중단
                }
            } catch (e) {
                console.error(`❌ ${name} 예외 발생:`, e);
                lastError = e;
            }
        }

        if (!savedSuccessfully) {
            console.error('⚠️ 모든 클라이언트 저장 실패');

            // 오프라인 큐에 저장
            this.addToOfflineQueue(user);

            // 사용자에게 알림
            this.showNotification(
                '⚠️ 서버 연결 문제로 임시 저장되었습니다. RLS 정책을 확인해주세요.',
                'warning'
            );

            // 상세 에러 정보 콘솔 출력
            console.log(`
=====================================
🚨 Supabase 저장 실패 - 해결 방법:
=====================================

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. 다음 SQL 실행:

-- Option 1: RLS 임시 비활성화 (테스트용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: 관대한 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations" ON users;
CREATE POLICY "Allow all operations" ON users
FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

4. 저장 후 다시 시도

=====================================
            `);

            return false;
        }

        return true;
    }

    saveToLocalStorageImmediate(user) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const existingIndex = pendingUsers.findIndex(u => u.email === user.email);

        const userData = {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            picture: user.picture || '',
            requestedAt: new Date().toISOString(),
            status: 'pending',
            syncStatus: 'pending_sync'
        };

        if (existingIndex === -1) {
            pendingUsers.push(userData);
        } else {
            pendingUsers[existingIndex] = userData;
        }

        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        console.log('💾 로컬스토리지 저장 완료');
    }

    addToOfflineQueue(user) {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');

        const queueItem = {
            type: 'user_registration',
            data: user,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        offlineQueue.push(queueItem);
        localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));

        console.log('📦 오프라인 큐에 추가됨');
    }

    updateLocalSyncStatus(email, status) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const user = pendingUsers.find(u => u.email === email);

        if (user) {
            user.syncStatus = status;
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        }
    }

    showRLSErrorMessage() {
        const message = `
🚨 RLS 정책 오류 감지!

Supabase 대시보드에서 다음을 실행해주세요:
1. SQL Editor 열기
2. "ALTER TABLE users DISABLE ROW LEVEL SECURITY;" 실행
3. 또는 RLS 정책 수정

자세한 내용은 콘솔을 확인하세요.
        `;

        alert(message);
        console.error(message);
    }

    async debugRLS() {
        console.log('🔍 RLS 디버그 정보 수집...');

        const info = {
            supabaseUrl: null,
            hasProjectBackup: !!window.ProjectBackup?.supabase,
            hasSupabaseLib: !!window.supabase,
            localStorage: {
                pendingUsers: JSON.parse(localStorage.getItem('pendingUsers') || '[]'),
                offlineQueue: JSON.parse(localStorage.getItem('offlineQueue') || '[]')
            }
        };

        try {
            const module = await import('./modules/supabase-config.js');
            if (module.SUPABASE_CONFIG) {
                info.supabaseUrl = module.SUPABASE_CONFIG.url;
            }
        } catch (e) {
            console.error('설정 로드 실패:', e);
        }

        console.table(info);

        return info;
    }
}

// 기존 auth 교체
if (window.GoogleAuth) {
    window.googleAuth = new RLSFixedAuth();
    console.log('✅ RLS Fixed Auth 모듈 로드됨');

    // 자동 테스트 실행
    setTimeout(() => {
        window.googleAuth.debugRLS();
    }, 2000);
}

// 전역 디버그 함수
window.debugRLS = async function() {
    if (window.googleAuth && window.googleAuth.debugRLS) {
        return await window.googleAuth.debugRLS();
    }
    console.error('Auth 모듈이 로드되지 않았습니다');
};

window.testRLSConnection = async function() {
    if (window.googleAuth && window.googleAuth.testRLSConnection) {
        return await window.googleAuth.testRLSConnection();
    }
    console.error('Auth 모듈이 로드되지 않았습니다');
};