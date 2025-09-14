/**
 * Stage Converter 모듈
 * 다양한 Stage 형식 간 데이터 변환 처리
 * IIFE 패턴으로 전역 네임스페이스 오염 방지
 */
(function(window) {
    'use strict';

    // 네임스페이스 생성
    window.StageConverter = window.StageConverter || {};

    // 디버그 로그 헬퍼
    const debugLog = function(message, ...args) {
        if (window.DEBUG_MODE || localStorage.getItem('debugMode') === 'true') {
            console.log(message, ...args);
        }
    };

    /**
     * Stage 5 v5.0.0 및 v3.0.0 형식 변환 함수 (Stage 2 호환성 개선)
     * 기존 app.js의 convertStage5V5Format 함수를 모듈화
     */
    window.StageConverter.convertStage5V5Format = function(data) {
        try {
            // v1.1.0 형식 체크 (이미 올바른 형식)
            if (data.schema_version === "1.1.0" && data.breakdown_data) {
                debugLog('🔄 v1.1.0 형식 감지');

                // 이미 올바른 형식이지만 scene_id 매핑 확인 필요
                if (data.breakdown_data.sequences && data.breakdown_data.scenes && data.breakdown_data.shots) {
                    debugLog('✅ v1.1.0 형식은 이미 호환 가능한 상태입니다');

                    // 샷의 scene_id 확인 및 정규화
                    data.breakdown_data.shots.forEach(shot => {
                        if (!shot.scene_id && shot.id) {
                            // 샷 ID에서 씬 ID 추출 (예: "S01.01" -> "S01")
                            const parts = shot.id.split('.');
                            if (parts.length >= 1) {
                                shot.scene_id = parts[0];
                                debugLog(`  샷 ${shot.id}에 scene_id 설정: ${shot.scene_id}`);
                            }
                        }
                    });

                    // 씬의 shot_ids 배열 확인 및 생성
                    data.breakdown_data.scenes.forEach(scene => {
                        if (!scene.shot_ids) {
                            scene.shot_ids = [];
                        }
                        // 해당 씬에 속하는 샷들의 ID 수집
                        const sceneShots = data.breakdown_data.shots.filter(shot => shot.scene_id === scene.id);
                        sceneShots.forEach(shot => {
                            if (!scene.shot_ids.includes(shot.id)) {
                                scene.shot_ids.push(shot.id);
                            }
                        });
                        debugLog(`  씬 ${scene.id}의 shot_ids: ${scene.shot_ids.join(', ')}`);
                    });

                    data.hasStage2Structure = true;
                    return data;
                }
            }

            // v3.0.0 형식 체크 (이미 변환된 형식)
            if (data.schema_version === "3.0.0" && data.breakdown_data) {
                debugLog('🔄 Stage 5 v3.0.0 형식 감지');

                // 이미 올바른 형식이므로 바로 반환
                if (data.breakdown_data.sequences && data.breakdown_data.scenes && data.breakdown_data.shots) {
                    debugLog('✅ Stage 5 v3.0.0 형식은 이미 호환 가능한 상태입니다');
                    data.hasStage2Structure = true;
                    return data;
                }
            }

            // v6.0 형식 체크 (CF 프로젝트 등에서 사용)
            if (data.stage === 5 && data.version === "6.0" && data.breakdown_data) {
                debugLog('🔄 Stage 5 v6.0 형식 감지 (CF 프로젝트)');

                // 이미 sequences가 있으면 그대로 사용
                if (data.breakdown_data.sequences && data.breakdown_data.sequences.length > 0) {
                    debugLog('✅ v6.0 형식: 기존 sequences 데이터 사용');

                    // sequences 데이터 정리 - sequence_id를 id로 정규화
                    data.breakdown_data.sequences = data.breakdown_data.sequences.map(seq => {
                        // sequence_id를 id로 변환하고 원본 필드 제거
                        if (seq.sequence_id && !seq.id) {
                            seq.id = seq.sequence_id;
                            delete seq.sequence_id;
                            debugLog(`  시퀀스 ID 정규화: sequence_id → id (${seq.id})`);
                        }
                        // title이 없으면 name 필드를 title로 복사
                        if (!seq.title && seq.name) {
                            seq.title = seq.name;
                        }
                        return seq;
                    });

                    debugLog('📦 sequences:', data.breakdown_data.sequences.length + '개');
                    debugLog('📦 scenes:', data.breakdown_data.scenes?.length + '개');
                    debugLog('📦 shots:', data.breakdown_data.shots?.length + '개');

                } else if (!data.breakdown_data.sequences) {
                    // sequences가 없으면 자동 생성
                    debugLog('📦 sequences 자동 생성 중...');

                    const sequences = [];
                    const sequenceMap = {};

                    // scenes 데이터에서 sequence 정보 추출
                    if (data.breakdown_data.scenes && data.breakdown_data.scenes.length > 0) {
                        data.breakdown_data.scenes.forEach(scene => {
                            const sequenceId = scene.sequence_id || 'SEQ_DEFAULT';

                            // 여러 시퀀스 ID가 쉼표로 구분된 경우 첫 번째만 사용
                            const primarySeqId = sequenceId.split(',')[0].trim();

                            if (!sequenceMap[primarySeqId]) {
                                sequenceMap[primarySeqId] = {
                                    id: primarySeqId,
                                    title: `Sequence ${primarySeqId}`,
                                    description: '',
                                    scene_ids: []
                                };
                            }

                            // 씬 ID를 시퀀스에 추가
                            if (scene.id && !sequenceMap[primarySeqId].scene_ids.includes(scene.id)) {
                                sequenceMap[primarySeqId].scene_ids.push(scene.id);
                            }
                        });

                        // 맵을 배열로 변환
                        data.breakdown_data.sequences = Object.values(sequenceMap);
                        debugLog(`  ${data.breakdown_data.sequences.length}개의 시퀀스 자동 생성 완료`);
                    } else {
                        // scenes가 없으면 기본 시퀀스 생성
                        data.breakdown_data.sequences = [{
                            id: 'SEQ_001',
                            title: 'Main Sequence',
                            description: 'Auto-generated sequence',
                            scene_ids: []
                        }];
                        debugLog('  기본 시퀀스 생성 완료');
                    }
                }

                data.hasStage2Structure = true;
                return data;
            }

            // 나머지 v5.0.0 형식 처리 로직은 추후 이동 예정
            debugLog('⚠️ 알 수 없는 Stage 5 형식');
            return data;

        } catch (error) {
            console.error('Stage 5 형식 변환 중 오류:', error);
            return data;
        }
    };

    /**
     * Stage 형식 자동 감지 및 변환
     */
    window.StageConverter.detectAndProcessStage = function(data) {
        if (!data) return null;

        // Stage 5 형식 감지
        if (data.stage === 5 || data.schema_version) {
            debugLog('🔍 Stage 5 데이터 감지, 변환 시작...');
            return window.StageConverter.convertStage5V5Format(data);
        }

        // Stage 2 형식 감지
        if (data.stage === 2 || (data.sequences && !data.breakdown_data)) {
            debugLog('🔍 Stage 2 데이터 감지');
            // Stage 2는 이미 호환 가능한 형식
            return data;
        }

        // Stage 7 형식 감지
        if (data.stage === 7 && data.video_prompts) {
            debugLog('🔍 Stage 7 비디오 프롬프트 데이터 감지');
            return data;
        }

        return data;
    };

    /**
     * Stage 7 비디오 프롬프트 처리
     */
    window.StageConverter.processStage7VideoPrompts = function(videoPrompts, existingData) {
        try {
            debugLog('🎬 Stage 7 비디오 프롬프트 처리 시작');

            const mergedData = existingData || {
                project_info: { name: 'Imported_Project' },
                breakdown_data: { sequences: [], shots: [] }
            };

            // 비디오 프롬프트를 샷 데이터에 병합
            if (Array.isArray(videoPrompts)) {
                videoPrompts.forEach((prompt, index) => {
                    debugLog(`  프롬프트 ${index + 1}: ${prompt.shot_id || 'unknown'}`);

                    // 해당 샷 찾기
                    if (prompt.shot_id && mergedData.breakdown_data.shots) {
                        const shot = mergedData.breakdown_data.shots.find(s => s.id === prompt.shot_id);
                        if (shot) {
                            // 비디오 프롬프트 데이터 추가
                            shot.video_prompt = prompt;
                            debugLog(`    ✅ 샷 ${shot.id}에 비디오 프롬프트 추가`);
                        }
                    }
                });
            }

            return mergedData;

        } catch (error) {
            console.error('Stage 7 비디오 프롬프트 처리 오류:', error);
            return existingData;
        }
    };

    // 기존 전역 함수와의 호환성 유지 (점진적 마이그레이션)
    if (!window.convertStage5V5Format) {
        window.convertStage5V5Format = window.StageConverter.convertStage5V5Format;
    }

})(window);