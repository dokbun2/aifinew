/**
 * 프로젝트 백업 및 복원 모듈
 * localStorage 데이터를 Supabase에 백업하고 복원하는 기능
 */

// Supabase 프로젝트 백업 시스템
class ProjectBackupSystem {
    constructor() {
        this.supabase = null;
        this.initSupabase();
    }

    // Supabase 초기화
    async initSupabase() {
        // CDN에서 로드된 Supabase 사용
        if (window.supabase) {
            const config = await this.loadSupabaseConfig();
            if (config) {
                this.supabase = window.supabase.createClient(config.url, config.anonKey);
                console.log('✅ Project Backup System initialized');
            }
        }
    }

    // Supabase 설정 로드
    async loadSupabaseConfig() {
        try {
            const module = await import('./supabase-config.js');
            return module.SUPABASE_CONFIG;
        } catch (error) {
            console.error('Failed to load Supabase config:', error);
            return null;
        }
    }

    // 현재 사용자 정보 가져오기
    getCurrentUser() {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            try {
                return JSON.parse(userInfo);
            } catch (e) {
                console.error('사용자 정보를 불러올 수 없습니다:', e);
            }
        }
        return null;
    }

    // 모든 localStorage 데이터 수집
    collectProjectData() {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('사용자 인증이 필요합니다.');
        }

        const projectData = {
            user_email: user.email,
            user_name: user.name,
            backup_date: new Date().toISOString(),
            data: {}
        };

        // localStorage에서 프로젝트 관련 데이터 수집
        const keysToBackup = [
            'breakdownData_',
            'conceptArt_',
            'conceptArtManagerData_', // 컨셉아트 매니저 데이터 추가
            'editedConceptPrompts',   // 편집된 컨셉 프롬프트
            'editedKoreanTranslations', // 편집된 한국어 번역
            'stage',
            'imageUrlCache_',
            'videoPrompts_',
            'currentProject'
        ];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            // 백업할 키인지 확인
            if (keysToBackup.some(prefix => key.includes(prefix))) {
                try {
                    const value = localStorage.getItem(key);
                    // JSON 파싱 시도
                    try {
                        projectData.data[key] = JSON.parse(value);
                    } catch {
                        // 파싱 실패시 문자열로 저장
                        projectData.data[key] = value;
                    }
                } catch (e) {
                    console.warn(`Failed to backup key: ${key}`, e);
                }
            }
        }

        // 스토리보드 페이지의 현재 데이터도 수집
        if (window.currentData) {
            projectData.data['currentStoryboardData'] = window.currentData;
        }

        return projectData;
    }

    // Supabase에 프로젝트 백업
    async backupToSupabase(projectName = 'Untitled Project') {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            if (!this.supabase) {
                await this.initSupabase();
                if (!this.supabase) {
                    throw new Error('프로젝트 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
                }
            }

            // 프로젝트 데이터 수집
            const projectData = this.collectProjectData();

            // Supabase에 저장할 데이터 구조
            const backupData = {
                user_id: user.email, // Google 로그인 이메일을 ID로 사용
                user_email: user.email,
                user_name: user.name,
                project_name: projectName,
                project_type: projectData.data.currentProject?.type || 'movie',
                backup_data: projectData.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: false,
                metadata: {
                    backup_size: JSON.stringify(projectData).length,
                    keys_count: Object.keys(projectData.data).length,
                    source: 'web_app'
                }
            };

            // project_backups 테이블에 저장 (projects 테이블에 backup_data 컬럼이 없을 경우를 대비)
            const { data, error } = await this.supabase
                .from('project_backups')
                .upsert(backupData, {
                    onConflict: 'user_email,project_name'
                })
                .select();

            if (error) {
                console.error('Backup error:', error);
                throw new Error('백업 실패: ' + error.message);
            }

            console.log('✅ Project backed up successfully:', data);
            return data;
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }

    // Supabase에서 프로젝트 복원
    async restoreFromSupabase(projectId) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            if (!this.supabase) {
                await this.initSupabase();
                if (!this.supabase) {
                    throw new Error('프로젝트 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
                }
            }

            // 프로젝트 데이터 가져오기
            const { data, error } = await this.supabase
                .from('project_backups')
                .select('*')
                .eq('id', projectId)
                .eq('user_email', user.email)
                .single();

            if (error) {
                console.error('Restore error:', error);
                throw new Error('복원 실패: ' + error.message);
            }

            if (!data || !data.backup_data) {
                throw new Error('백업 데이터를 찾을 수 없습니다.');
            }

            // localStorage에 복원
            const backupData = data.backup_data;
            Object.keys(backupData).forEach(key => {
                try {
                    const value = typeof backupData[key] === 'object'
                        ? JSON.stringify(backupData[key])
                        : backupData[key];
                    localStorage.setItem(key, value);
                } catch (e) {
                    console.warn(`Failed to restore key: ${key}`, e);
                }
            });

            // 현재 데이터 업데이트
            if (backupData.currentStoryboardData && window.currentData !== undefined) {
                window.currentData = backupData.currentStoryboardData;
            }

            console.log('✅ Project restored successfully');
            return data;
        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        }
    }

    // 백업 파일 다운로드
    downloadBackup(projectName = 'AIFI_Project') {
        try {
            const projectData = this.collectProjectData();

            // JSON 파일 생성
            const dataStr = JSON.stringify(projectData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${projectName}_backup_${new Date().toISOString().split('T')[0]}.json`;

            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Backup downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    }

    // 백업 파일 업로드 및 복원
    async uploadAndRestore(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);

                    if (!projectData.data) {
                        throw new Error('올바른 백업 파일이 아닙니다.');
                    }

                    // localStorage에 복원
                    Object.keys(projectData.data).forEach(key => {
                        try {
                            const value = typeof projectData.data[key] === 'object'
                                ? JSON.stringify(projectData.data[key])
                                : projectData.data[key];
                            localStorage.setItem(key, value);
                        } catch (err) {
                            console.warn(`Failed to restore key: ${key}`, err);
                        }
                    });

                    console.log('✅ Backup restored from file');
                    resolve(projectData);
                } catch (error) {
                    console.error('Failed to parse backup file:', error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file);
        });
    }

    // 프로젝트 목록 가져오기
    async getProjectList() {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            if (!this.supabase) {
                await this.initSupabase();
                if (!this.supabase) {
                    throw new Error('프로젝트 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
                }
            }

            const { data, error } = await this.supabase
                .from('project_backups')
                .select('*')
                .eq('user_email', user.email)
                .eq('is_deleted', false)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Failed to get project list:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Failed to get project list:', error);
            return [];
        }
    }

    // 프로젝트 삭제 (soft delete)
    async deleteProject(projectId) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            if (!this.supabase) {
                await this.initSupabase();
                if (!this.supabase) {
                    throw new Error('프로젝트 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
                }
            }

            const { error } = await this.supabase
                .from('project_backups')
                .update({ is_deleted: true, updated_at: new Date().toISOString() })
                .eq('id', projectId)
                .eq('user_email', user.email);

            if (error) {
                console.error('Delete error:', error);
                throw error;
            }

            console.log('✅ Project deleted successfully');
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성 (module로 로드되지 않은 경우에만)
if (typeof window !== 'undefined' && !window.ProjectBackup) {
    window.ProjectBackup = new ProjectBackupSystem();
    console.log('✅ ProjectBackup 전역 인스턴스 생성됨');
}

// Export for module usage
export default ProjectBackupSystem;