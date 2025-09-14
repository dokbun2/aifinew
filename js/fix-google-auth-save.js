// Google OAuth 로그인 데이터 저장 수정
class FixedGoogleAuth {
    constructor() {
        this.supabaseUrl = 'https://ocbqffealslwnsybeurj.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYnFmZmVhbHNsd25zeWJldXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjMxMzYsImV4cCI6MjA3MzM5OTEzNn0.EkqrmbUgB3M7U0o_Caf7VMQwbmly7NkkCClynx7eamE';
        this.supabaseClient = null;
        this.initSupabase();
    }

    async initSupabase() {
        // Supabase 클라이언트 초기화
        if (typeof window.supabase !== 'undefined') {
            this.supabaseClient = window.supabase.createClient(
                this.supabaseUrl,
                this.supabaseAnonKey
            );
            console.log('✅ Supabase 초기화 완료');

            // 자동으로 로컬 데이터를 Supabase로 동기화
            await this.syncLocalToSupabase();
        }
    }

    // 로컬 스토리지 데이터를 Supabase로 동기화
    async syncLocalToSupabase() {
        const userInfo = localStorage.getItem('user_info');

        if (!userInfo) {
            console.log('로컬에 저장된 사용자 정보가 없습니다.');
            return;
        }

        try {
            const user = JSON.parse(userInfo);
            console.log('🔄 로컬 데이터를 Supabase로 동기화 중...', user);

            // Supabase에 사용자 데이터 저장/업데이트
            const { data, error } = await this.supabaseClient
                .from('users')
                .upsert({
                    email: user.email,
                    name: user.name || user.email.split('@')[0],
                    nickname: user.nickname || user.name || user.email.split('@')[0],
                    picture: user.picture || '',
                    google_id: user.google_id || user.sub || '',
                    is_approved: false,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                }, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('❌ Supabase 저장 오류:', error);

                // 더 자세한 오류 정보 출력
                console.log('오류 코드:', error.code);
                console.log('오류 메시지:', error.message);
                console.log('오류 상세:', error.details);

                // RLS 오류인 경우 특별 처리
                if (error.code === '42501') {
                    console.warn('⚠️ RLS 정책 문제. 아래 SQL을 Supabase에서 실행하세요:');
                    console.log(`
-- users 테이블 RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 또는 RLS 정책 생성
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON users
FOR SELECT USING (true);
                    `);
                }
            } else {
                console.log('✅ Supabase에 성공적으로 저장됨:', data);

                // 저장 성공 표시
                localStorage.setItem('supabase_sync', 'true');
                localStorage.setItem('supabase_sync_time', new Date().toISOString());
            }

        } catch (error) {
            console.error('❌ 동기화 실패:', error);
        }
    }

    // 수동으로 사용자 데이터 저장
    async saveUserManually(email, name) {
        if (!this.supabaseClient) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        try {
            const { data, error } = await this.supabaseClient
                .from('users')
                .insert({
                    email: email,
                    name: name || email.split('@')[0],
                    nickname: name || email.split('@')[0],
                    is_approved: false,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                });

            if (error) {
                console.error('❌ 수동 저장 실패:', error);
            } else {
                console.log('✅ 수동 저장 성공:', data);
            }
        } catch (error) {
            console.error('❌ 저장 오류:', error);
        }
    }

    // 모든 사용자 조회 (테스트용)
    async getAllUsers() {
        if (!this.supabaseClient) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        try {
            const { data, error } = await this.supabaseClient
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ 조회 오류:', error);
            } else {
                console.log('📋 전체 사용자 목록:', data);
                return data;
            }
        } catch (error) {
            console.error('❌ 조회 실패:', error);
        }
    }

    // 테스트 데이터 생성
    async createTestUser() {
        const testEmail = `test_${Date.now()}@example.com`;
        const testName = `테스트 사용자 ${Date.now()}`;

        console.log('🧪 테스트 사용자 생성 중...');
        await this.saveUserManually(testEmail, testName);
    }
}

// 즉시 실행
const fixedAuth = new FixedGoogleAuth();

// 전역 사용 가능하도록 설정
window.fixedAuth = fixedAuth;

// DOM 로드 완료 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Google Auth 데이터 동기화 시작...');

    // 5초 후 다시 시도 (Supabase 라이브러리 로드 대기)
    setTimeout(() => {
        fixedAuth.initSupabase();
    }, 5000);
});

// 콘솔에서 사용할 수 있는 명령어 안내
console.log(`
=== Google Auth 데이터 동기화 도구 ===
사용 가능한 명령어:

1. 로컬 데이터를 Supabase로 동기화:
   fixedAuth.syncLocalToSupabase()

2. 수동으로 사용자 저장:
   fixedAuth.saveUserManually('email@example.com', '사용자명')

3. 모든 사용자 조회:
   fixedAuth.getAllUsers()

4. 테스트 사용자 생성:
   fixedAuth.createTestUser()
`);