// Enhanced Auth Module with Offline Queue and Retry Mechanism
// auth-enhanced.js - 크로스 디바이스 및 네트워크 문제 해결

class EnhancedGoogleAuth extends GoogleAuth {
    constructor() {
        super();

        // 오프라인 큐 시스템
        this.offlineQueue = [];
        this.retryAttempts = new Map();
        this.maxRetries = 5;
        this.retryDelay = 2000; // 2초부터 시작하여 exponential backoff

        // 네트워크 상태 모니터링
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();

        // 초기화 시 저장된 큐 처리
        this.loadOfflineQueue();

        // 자동 재시도 타이머
        this.retryTimer = null;
        this.startRetryTimer();
    }

    setupNetworkListeners() {
        // 온라인/오프라인 이벤트 리스너
        window.addEventListener('online', () => {
            console.log('🌐 네트워크 연결됨 - 오프라인 큐 처리 시작');
            this.isOnline = true;
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            console.log('📴 네트워크 연결 끊김 - 오프라인 모드 활성화');
            this.isOnline = false;
        });

        // 페이지 가시성 변경 감지 (모바일 백그라운드/포그라운드)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                console.log('📱 앱이 포그라운드로 돌아옴 - 큐 처리');
                this.processOfflineQueue();
            }
        });
    }

    async saveUserToSupabaseEnhanced(user) {
        console.log('🔄 향상된 Supabase 저장 시작...');

        // 먼저 로컬스토리지에 저장 (즉시 반영)
        this.saveToLocalStorageFirst(user);

        // Supabase 저장 시도
        const result = await this.attemptSupabaseSave(user);

        if (!result.success) {
            // 실패 시 오프라인 큐에 추가
            this.addToOfflineQueue({
                type: 'user_registration',
                data: user,
                timestamp: new Date().toISOString(),
                deviceInfo: this.getDeviceInfo()
            });

            // 사용자에게 상태 알림
            this.showNotification(
                '⚠️ 서버 연결 문제로 임시 저장되었습니다. 자동으로 재시도됩니다.',
                'warning'
            );

            return false;
        }

        return true;
    }

    async attemptSupabaseSave(user, retryCount = 0) {
        try {
            // 다중 Supabase 클라이언트 시도
            const clients = await this.getSupabaseClients();

            for (const client of clients) {
                try {
                    const result = await this.saveWithClient(client, user);
                    if (result.success) {
                        console.log(`✅ Supabase 저장 성공 (시도 ${retryCount + 1})`);
                        return result;
                    }
                } catch (clientError) {
                    console.warn(`⚠️ 클라이언트 ${clients.indexOf(client) + 1} 실패:`, clientError);
                }
            }

            throw new Error('모든 Supabase 클라이언트 시도 실패');

        } catch (error) {
            console.error(`❌ Supabase 저장 실패 (시도 ${retryCount + 1}):`, error);

            // 재시도 로직
            if (retryCount < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
                console.log(`⏳ ${delay/1000}초 후 재시도...`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return this.attemptSupabaseSave(user, retryCount + 1);
            }

            return { success: false, error };
        }
    }

    async getSupabaseClients() {
        const clients = [];

        // 1. ProjectBackup 클라이언트
        if (window.ProjectBackup?.supabase) {
            clients.push(window.ProjectBackup.supabase);
        }

        // 2. 직접 생성 클라이언트
        if (window.supabase) {
            try {
                const module = await import('./modules/supabase-config.js');
                if (module.SUPABASE_CONFIG) {
                    const directClient = window.supabase.createClient(
                        module.SUPABASE_CONFIG.url,
                        module.SUPABASE_CONFIG.anonKey
                    );
                    clients.push(directClient);
                }
            } catch (e) {
                console.warn('직접 클라이언트 생성 실패:', e);
            }
        }

        // 3. 백업 클라이언트 (다른 엔드포인트)
        try {
            const backupClient = await this.createBackupClient();
            if (backupClient) clients.push(backupClient);
        } catch (e) {
            console.warn('백업 클라이언트 생성 실패:', e);
        }

        return clients;
    }

    async saveWithClient(client, user) {
        // 기존 사용자 확인
        const { data: existingUser, error: fetchError } = await client
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

        const userData = {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            picture: user.picture || '',
            google_id: user.id || '',
            last_login: new Date().toISOString(),
            device_info: this.getDeviceInfo(),
            metadata: {
                browser: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screen: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                connection_type: navigator.connection?.effectiveType || 'unknown'
            }
        };

        if (!existingUser) {
            userData.created_at = new Date().toISOString();
            userData.status = 'pending';
            userData.login_count = 1;
        } else {
            userData.login_count = (existingUser.login_count || 0) + 1;
            userData.status = existingUser.status;
        }

        const { data, error } = await client
            .from('users')
            .upsert(userData, {
                onConflict: 'email',
                ignoreDuplicates: false
            })
            .select();

        if (error) throw error;

        return { success: true, data };
    }

    saveToLocalStorageFirst(user) {
        // 즉시 로컬스토리지에 저장하여 UI 반영
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const existingIndex = pendingUsers.findIndex(u => u.email === user.email);

        const userData = {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            picture: user.picture || '',
            requestedAt: new Date().toISOString(),
            status: 'pending',
            syncStatus: 'pending_sync', // 동기화 상태 표시
            deviceInfo: this.getDeviceInfo()
        };

        if (existingIndex === -1) {
            pendingUsers.push(userData);
        } else {
            pendingUsers[existingIndex] = userData;
        }

        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        console.log('💾 로컬스토리지에 즉시 저장 완료');
    }

    addToOfflineQueue(item) {
        // 오프라인 큐에 추가
        this.offlineQueue.push(item);

        // 로컬스토리지에도 저장 (페이지 새로고침 대비)
        const savedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        savedQueue.push(item);
        localStorage.setItem('offlineQueue', JSON.stringify(savedQueue));

        console.log(`📦 오프라인 큐에 추가됨 (총 ${this.offlineQueue.length}개 대기중)`);
    }

    loadOfflineQueue() {
        // 저장된 오프라인 큐 로드
        const savedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        this.offlineQueue = savedQueue;

        if (this.offlineQueue.length > 0) {
            console.log(`📦 저장된 오프라인 큐 로드: ${this.offlineQueue.length}개 항목`);

            // 네트워크가 연결되어 있으면 즉시 처리
            if (this.isOnline) {
                setTimeout(() => this.processOfflineQueue(), 3000);
            }
        }
    }

    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        console.log(`🔄 오프라인 큐 처리 시작 (${this.offlineQueue.length}개 항목)`);

        const processedItems = [];
        const failedItems = [];

        for (const item of this.offlineQueue) {
            try {
                if (item.type === 'user_registration') {
                    const result = await this.attemptSupabaseSave(item.data);

                    if (result.success) {
                        processedItems.push(item);
                        console.log(`✅ 큐 항목 처리 성공: ${item.data.email}`);

                        // 로컬스토리지 동기화 상태 업데이트
                        this.updateSyncStatus(item.data.email, 'synced');
                    } else {
                        failedItems.push(item);
                    }
                }
            } catch (error) {
                console.error(`❌ 큐 항목 처리 실패:`, error);
                failedItems.push(item);
            }
        }

        // 처리된 항목 제거
        this.offlineQueue = failedItems;
        localStorage.setItem('offlineQueue', JSON.stringify(failedItems));

        if (processedItems.length > 0) {
            this.showNotification(
                `✅ ${processedItems.length}개 항목이 서버와 동기화되었습니다.`,
                'success'
            );
        }

        if (failedItems.length > 0) {
            console.log(`⚠️ ${failedItems.length}개 항목 처리 실패 - 나중에 재시도`);
        }
    }

    updateSyncStatus(email, status) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const userIndex = pendingUsers.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            pendingUsers[userIndex].syncStatus = status;
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        }
    }

    startRetryTimer() {
        // 30초마다 오프라인 큐 재시도
        this.retryTimer = setInterval(() => {
            if (this.isOnline && this.offlineQueue.length > 0) {
                console.log('⏰ 자동 재시도 타이머 실행');
                this.processOfflineQueue();
            }
        }, 30000);
    }

    getDeviceInfo() {
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString(),
            connectionType: navigator.connection?.effectiveType || 'unknown'
        };
    }

    async createBackupClient() {
        // 백업 Supabase 인스턴스 생성 (다른 리전 또는 백업 프로젝트)
        // 실제 프로덕션에서는 다른 Supabase 프로젝트 URL 사용
        return null; // 현재는 비활성화
    }

    // 수동 동기화 메서드
    async manualSync() {
        console.log('🔄 수동 동기화 시작...');
        this.showNotification('동기화 중...', 'info');

        try {
            await this.processOfflineQueue();

            // 로컬 데이터와 서버 데이터 병합
            await this.syncLocalWithServer();

            this.showNotification('✅ 동기화 완료', 'success');
            return true;
        } catch (error) {
            console.error('❌ 동기화 실패:', error);
            this.showNotification('❌ 동기화 실패', 'error');
            return false;
        }
    }

    async syncLocalWithServer() {
        const localPending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');

        for (const user of localPending) {
            if (user.syncStatus === 'pending_sync') {
                await this.attemptSupabaseSave(user);
            }
        }
    }

    // 디버그 정보 제공
    getDebugInfo() {
        return {
            isOnline: this.isOnline,
            offlineQueueSize: this.offlineQueue.length,
            retryAttempts: Array.from(this.retryAttempts.entries()),
            deviceInfo: this.getDeviceInfo(),
            localStorage: {
                pendingUsers: JSON.parse(localStorage.getItem('pendingUsers') || '[]').length,
                offlineQueue: JSON.parse(localStorage.getItem('offlineQueue') || '[]').length
            }
        };
    }
}

// 기존 GoogleAuth를 대체
window.googleAuth = new EnhancedGoogleAuth();

// 수동 동기화 버튼을 위한 전역 함수
window.syncAuthData = async function() {
    return await window.googleAuth.manualSync();
};

console.log('✅ Enhanced Auth Module loaded with offline support');