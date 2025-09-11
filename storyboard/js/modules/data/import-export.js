/**
 * Import/Export 모듈
 * JSON 데이터 가져오기/내보내기 기능
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.DataImportExport = window.DataImportExport || {};
    
    /**
     * JSON 파일을 가져와서 데이터 로드
     */
    window.DataImportExport.importJSON = function(file, callback) {
        if (!file) {
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage('파일을 선택해주세요.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Stage 7 비디오 프롬프트 파일 감지 (특별 처리)
                if (jsonData.stage === 7 && jsonData.video_prompts && Array.isArray(jsonData.video_prompts)) {
                    console.log('🎬 Stage 7 비디오 프롬프트 파일 감지');
                    
                    // 현재 프로젝트 데이터가 있으면 병합, 없으면 기본 구조 생성
                    let mergedData = window.currentData || {
                        project_info: { name: 'Imported_Project' },
                        breakdown_data: { sequences: [], shots: [] }
                    };
                    
                    // Stage 7 데이터를 현재 데이터와 병합
                    if (window.StageConverter?.processStage7VideoPrompts) {
                        mergedData = window.StageConverter.processStage7VideoPrompts(jsonData.video_prompts, mergedData);
                    }
                    
                    // 콜백 함수 실행
                    if (callback && typeof callback === 'function') {
                        callback(mergedData);
                    }
                    
                    const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
                    showMessage(`Stage 7 비디오 프롬프트가 성공적으로 로드되었습니다: ${file.name}`, 'success');
                    return;
                }
                
                // 일반 프로젝트 데이터 검증
                if (!jsonData.project_info || !jsonData.breakdown_data) {
                    throw new Error('잘못된 JSON 형식입니다.');
                }
                
                // 프로젝트 이름 추출 (파일명에서)
                const fileName = file.name;
                if (fileName && fileName.endsWith('.json')) {
                    const projectName = fileName.replace('.json', '');
                    if (!jsonData.project_info.name) {
                        jsonData.project_info.name = projectName;
                    }
                }
                
                // 콜백 함수 실행
                if (callback && typeof callback === 'function') {
                    callback(jsonData);
                }
                
                const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
                showMessage(`JSON 파일이 성공적으로 로드되었습니다: ${file.name}`, 'success');
                
            } catch (error) {
                console.error('JSON 파싱 오류:', error);
                const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
                showMessage('JSON 파일 읽기 실패: ' + error.message, 'error');
            }
        };
        
        reader.onerror = function() {
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage('파일 읽기 중 오류가 발생했습니다.', 'error');
        };
        
        reader.readAsText(file);
    };
    
    /**
     * 현재 데이터를 JSON 파일로 내보내기
     */
    window.DataImportExport.exportJSON = function(data, filename) {
        try {
            if (!data) {
                const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
                showMessage('내보낼 데이터가 없습니다.', 'error');
                return;
            }
            
            // 파일명 생성
            if (!filename) {
                const projectName = data.project_info?.name || 'Film_Production_Manager';
                const timestamp = new Date().toISOString().split('T')[0];
                filename = `${projectName}_${timestamp}.json`;
            }
            
            // JSON 문자열 생성
            const jsonString = JSON.stringify(data, null, 2);
            
            // Blob 생성
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // 다운로드 링크 생성
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // 클릭 이벤트 발생
            document.body.appendChild(link);
            link.click();
            
            // 정리
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage(`JSON 파일이 다운로드되었습니다: ${filename}`, 'success');
            
        } catch (error) {
            console.error('JSON 내보내기 오류:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage('JSON 파일 내보내기 실패: ' + error.message, 'error');
        }
    };
    
    /**
     * Stage 데이터를 특정 형식으로 내보내기
     */
    window.DataImportExport.exportStageData = function(stageNumber, data, format) {
        try {
            let exportData = data;
            let filename = `stage${stageNumber}_export`;
            let mimeType = 'application/json';
            
            // Stage별 특수 처리
            switch(stageNumber) {
                case 4:
                    // Stage 4는 JSON 형식 유지
                    filename += '.json';
                    break;
                    
                case 5:
                    // Stage 5는 JSON 형식 유지
                    filename += '.json';
                    break;
                    
                case 6:
                    // Stage 6 이미지 프롬프트
                    if (format === 'csv') {
                        exportData = window.DataImportExport.convertToCSV(data);
                        filename += '.csv';
                        mimeType = 'text/csv';
                    } else {
                        filename += '.json';
                    }
                    break;
                    
                case 7:
                    // Stage 7 비디오 프롬프트
                    if (format === 'csv') {
                        exportData = window.DataImportExport.convertToCSV(data);
                        filename += '.csv';
                        mimeType = 'text/csv';
                    } else {
                        filename += '.json';
                    }
                    break;
                    
                default:
                    filename += '.json';
            }
            
            // 문자열로 변환
            const dataString = typeof exportData === 'string' ? 
                exportData : JSON.stringify(exportData, null, 2);
            
            // Blob 생성 및 다운로드
            const blob = new Blob([dataString], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage(`Stage ${stageNumber} 데이터가 내보내졌습니다: ${filename}`, 'success');
            
        } catch (error) {
            console.error(`Stage ${stageNumber} 내보내기 오류:`, error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage(`Stage ${stageNumber} 내보내기 실패: ` + error.message, 'error');
        }
    };
    
    /**
     * CSV 형식으로 변환
     */
    window.DataImportExport.convertToCSV = function(data) {
        if (!data || typeof data !== 'object') {
            return '';
        }
        
        // 배열인 경우
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            
            // 헤더 생성
            const headers = Object.keys(data[0]);
            let csv = headers.join(',') + '\n';
            
            // 데이터 행 추가
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    // 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
                    if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                });
                csv += values.join(',') + '\n';
            });
            
            return csv;
        }
        
        // 객체인 경우 key-value 형식으로
        const rows = Object.entries(data).map(([key, value]) => {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            return `${key},"${String(value).replace(/"/g, '""')}"`;
        });
        
        return 'Key,Value\n' + rows.join('\n');
    };
    
    /**
     * 백업 생성
     */
    window.DataImportExport.createBackup = function(data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.json`;
        
        window.DataImportExport.exportJSON(data, filename);
        
        console.log(`✅ 백업 생성: ${filename}`);
    };
    
    /**
     * 자동 백업 설정
     */
    window.DataImportExport.setupAutoBackup = function(intervalMinutes = 10) {
        if (window.autoBackupInterval) {
            clearInterval(window.autoBackupInterval);
        }
        
        window.autoBackupInterval = setInterval(() => {
            if (window.currentData && window.hasUnsavedChanges) {
                window.DataImportExport.createBackup(window.currentData);
                window.hasUnsavedChanges = false;
            }
        }, intervalMinutes * 60 * 1000);
        
        console.log(`✅ 자동 백업 설정: ${intervalMinutes}분마다`);
    };
    
    // 기존 전역 함수와의 호환성 유지
    if (!window.exportJSON) {
        window.exportJSON = function() {
            return window.DataImportExport.exportJSON(window.currentData);
        };
    }
    
})(window);