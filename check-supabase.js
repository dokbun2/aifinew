// Supabase 연결 및 상태 변경 테스트 스크립트

const SUPABASE_URL = 'https://mnnbrsmkmnysdmtewuha.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubmJyc21rbW55c2RtdGV3dWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjcxMTIsImV4cCI6MjA3MzQ0MzExMn0.HZBpA_RLn_1Jew9jou1APUApBVfLIyq-wIM-kujtyuc';

async function testSupabase() {
    console.log('🔌 Supabase 연결 테스트 시작...\n');

    // 1. Users 테이블 조회
    console.log('📋 사용자 목록 조회...');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        console.log(`✅ ${users.length}명의 사용자 조회됨\n`);

        users.forEach(user => {
            console.log(`- ${user.email} (${user.name}) - 상태: ${user.status}`);
        });

        // 2. 상태 변경 테스트 (test@example.com이 있다면)
        const testEmail = 'test@example.com';
        const testUser = users.find(u => u.email === testEmail);

        if (testUser) {
            console.log(`\n🔄 ${testEmail} 사용자 상태 변경 테스트...`);

            const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${testEmail}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: 'admin@test.com'
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
            }

            const updatedUsers = await updateResponse.json();
            console.log('✅ 상태 변경 성공:', updatedUsers);
        } else {
            console.log(`\n⚠️ ${testEmail} 사용자를 찾을 수 없습니다`);
        }

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        console.error('상세 오류:', error);
    }
}

// Node.js 환경에서 실행하는 경우
if (typeof window === 'undefined') {
    // Node.js fetch polyfill
    const fetch = require('node-fetch');
    global.fetch = fetch;
}

testSupabase();