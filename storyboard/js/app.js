// 전역 변수
let currentData = null;
let selectedType = null;
let selectedId = null;
let selectedSceneId = null;
		let hasStage2Structure = false; // Stage 2 구조 로드 여부
		
		// 디버깅용 전역 변수 노출
		window.debugData = {
			getCurrentData: () => currentData,
			updateNavigation: () => updateNavigation(),
			checkSequences: () => {
				return currentData?.breakdown_data?.sequences;
			}
		};
const IMAGE_AI_TOOLS = ['midjourney', 'ideogram', 'leonardo', 'imagefx', 'openart'];

// 동적 파일명 관리
function getProjectFileName() {
    try {
        // 프로젝트 데이터가 있고 파일명이 있으면 사용
        if (currentData && currentData.project_info && currentData.project_info.name) {
            return currentData.project_info.name;
        }
        
        // 기본값: 고정된 파일명 사용 (페이지 이동 시에도 일관성 유지)
        return 'Film_Production_Manager.json';
    } catch (error) {
        return 'Film_Production_Manager.json';
    }
}

function getProjectName() {
    try {
        return getProjectFileName()
            .replace('_Manager.json', '')
            .replace('Film_Production_Manager.json', 'Film Production Manager');
    } catch (error) {
        return 'Film Production Manager';
    }
}

// 메시지 표시
function showMessage(message, type) {
    
    try {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.innerHTML = `
            ${message}
            <button class="close-button" onclick="this.parentElement.remove()">×</button>
        `;
        
        messageContainer.appendChild(messageElement);
        
        if (type !== 'error') {
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 5000);
        }
    } catch (error) {
        alert(message);
    }
}

// 클립보드 복사 함수
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            showMessage('클립보드 복사에 실패했습니다.', 'error');
            return false;
        }
    }
}

  // 빈 데이터 구조 생성 함수 - 씬 단위 지원 추가
			function getEmptyData() {
				try {
					return {
						film_id: 'FILM_NEW',
						current_stage_name: 'scenario_breakdown',
						timestamp: new Date().toISOString(),
						schema_version: '1.1.0', 
						film_metadata: {
							title_working: getProjectName(),
							confirmed_genre: '',
							// 씬 단위 작업을 위한 필드 추가
							current_scene: null,
							total_scenes: 0,
							completed_scenes: []
						},
						breakdown_data: {
							sequences: [],
							scenes: [],
							shots: []
						},
						visual_consistency_info: {},
						concept_art_prompt_data: {}
					};
				} catch (error) {
					return null;
				}
			}

// [DEPRECATED] 테스트용 JSON 데이터 생성 함수 - 더 이상 사용되지 않음
// TODO: 향후 버전에서 제거 예정
function createTestData() {
    
    return {
        "film_id": "FILM_TEST001",
        "current_stage_name": "scenario_breakdown",
        "timestamp": new Date().toISOString(),
        "schema_version": "1.1.0",
        "film_metadata": {
            "title_working": "테스트 영화",
            "confirmed_genre": "SF",
            "project_music_prompts": {
                "main_ost": {
                    "style_prompt": "웅장하고 미래적인 메인 테마 (프로젝트 전체)",
                    "lyrics_structure_prompt": "A-B-A 구조의 기악곡, 반복적인 모티프 사용"
                },
                "sub_ost_1": {
                    "style_prompt": "긴장감 넘치는 추격씬용 음악 스타일 (프로젝트 전체)",
                    "lyrics_structure_prompt": "빠른 템포, 전자음악과 오케스트라 혼합"
                },
                "sub_ost_2": {
                    "style_prompt": "감성적인 장면을 위한 서정적인 피아노 선율 (프로젝트 전체)",
                    "lyrics_structure_prompt": "느린 템포, 미니멀한 구성"
                }
            },
            "project_music_urls": {
                "main_ost": "https://example.com/project_main_theme.mp3",
                "sub_ost_1": "https://example.com/project_tension_theme.mp3",
                "sub_ost_2": ""
            }
        },
        "breakdown_data": {
            "sequences": [
                {
                    "id": "SEQ01",
                    "title": "오프닝 시퀀스",
                    "function": "주인공 소개 및 배경 설정",
                    "description": "레이븐의 일상과 첫 임무",
                    "duration_estimate": "5-7분"
                }
            ],
            "scenes": [
                {
                    "id": "S01",
                    "sequence_id": "SEQ01",
                    "title": "레이븐의 은신처",
                    "description": "어두운 사무실에서 작업하는 레이븐",
                    "visual_consistency_info": {
                        "location_id": "LOC_001",
                        "character_ids": ["CHAR_001"],
                        "prop_ids": ["PROP_001", "PROP_002"]
                    }
                },
                {
                    "id": "S02",
                    "sequence_id": "SEQ01",
                    "title": "긴급 회의",
                    "description": "레이븐과 잭의 만남",
                    "visual_consistency_info": {
                        "location_id": "LOC_002",
                        "character_ids": ["CHAR_001", "CHAR_002"],
                        "prop_ids": []
                    }
                }
            ],
            "shots": [
                {
                    "id": "S01.01",
                    "scene_id": "S01",
                    "title": "레이븐의 첫 등장",
                    "shot_type": "CU",
                    "description": "컴퓨터 화면에 비친 레이븐의 얼굴",
                    "other_info": {
                        "estimated_duration": 5
                    },
                    "camera_framing": {
                        "framing": "Close-up",
                        "angle": "Eye level",
                        "view_direction": "Front",
                        "composition": "Center"
                    },
                    "visual_consistency_info": {
                        "location_id": "LOC_001",
                        "character_ids": ["CHAR_001"],
                        "prop_ids": ["PROP_001"]
                    },
                    "content": {
                        "action": "레이븐이 컴퓨터 앞에 앉아 집중하며 키보드를 타이핑",
                        "dialogue_by_character": {
                            "레이븐": {
                                "character_name": "레이븐",
                                "voice_style": "낮고 빠른 어조, 핵심만 말하는 스타일",
                                "voice_gender": "female",
                                "voice_age": "young",
                                "lines": [
                                    {
                                        "index": 1,
                                        "text": "이번 일은 좀 다르군... 조심해야겠어.",
                                        "text_translated": "This job is different... I need to be careful.",
                                        "emotion": "집중"
                                    }
                                ]
                            }
                        },
                        "dialogue_sequence": [
                            {"character": "레이븐", "line_index": 0}
                        ],
                        "narration": "그녀는 어둠 속에서 빛을 찾고 있었다.",
                        "sound_effects": "키보드 타이핑 소리, 컴퓨터 팬 소리, 빗소리",
                        "audio_urls": {
                            "dialogue": {
                                "레이븐": ["https://example.com/audio/S01.01_dialogue_raven.mp3"]
                            },
                            "narration": "https://example.com/audio/S01.01_narration.mp3",
                            "sound_effects": "https://example.com/audio/S01.01_sfx.mp3"
                        }
                    },
                    "music_memo": "이 샷의 오프닝 시퀀스에는 프로젝트 메인 테마를 사용한다. 긴장감을 서서히 고조시키는 편곡.",
                    "audio_prompts": {
                        "dialogue": {
                            "레이븐": {
                                "prompts": [
                                    {
                                        "line_index": 0,
                                        "prompt": "S01.01 레이븐의 대사: 집중된 감정으로 낮고 빠른 어조, 핵심만 말하는 스타일. 대사: '이번 일은 좀 다르군... 조심해야겠어.'",
                                        "prompt_translated": "S01.01 Raven's dialogue: Focused emotion with low and fast tone, concise speaking style. Line: 'This job is different... I need to be careful.'"
                                    }
                                ],
                                "settings": {
                                    "voice_gender": "female",
                                    "voice_age": "young",
                                    "base_emotion": "focused",
                                    "speed": "fast",
                                    "tone": "low"
                                }
                            }
                        },
                        "narration": {
                            "prompt": "S01.01 나레이션: 신비롭고 차분한 톤. 내용: '그녀는 어둠 속에서 빛을 찾고 있었다.'",
                            "prompt_translated": "S01.01 Narration: Mysterious and calm tone. Content: 'She was searching for light in the darkness.'",
                            "settings": {
                                "voice_style": "narrator",
                                "tone": "mysterious",
                                "speed": "slow"
                            }
                        },
                        "sound_effects": {
                            "prompt_ko": "S01.01 음향: 키보드 타이핑 소리, 컴퓨터 팬 소리, 창밖 빗소리",
                            "prompt_en": "S01.01 SFX: keyboard typing sounds, computer fan noise, rain sounds from window",
                            "settings": {
                                "duration": "5s",
                                "intensity": "medium",
                                "environment": "indoor_office"
                            }
                        }
                    },
                    "original_scenario": {
                        "text": "장면 1. 레이븐의 은신처 - 밤\n\n어두운 사무실. 모니터의 푸른 빛만이 공간을 비춘다.\n레이븐(20대 여성)이 컴퓨터 앞에 앉아 있다.\n\n레이븐\n(집중하며)\n이번 일은 좀 다르군... 조심해야겠어.\n\n창밖으로 비가 내린다. 키보드 타이핑 소리가 리드미컬하게 울린다.",
                        "scene_number": 1,
                        "location": "레이븐의 은신처",
                        "time": "밤"
                    },
                    "image_design_plans": {
                        "plan_a": {
                            "description": "단일 이미지로 전체 샷 표현",
                            "image_count": 1,
                            "complexity": "high",
                            "images": [
                                {
                                    "id": "IMG_A_001",
                                    "description": "모니터 빛에 비친 레이븐의 클로즈업, 집중된 표정",
                                    "csv_attributes": {
                                        "201": "20대 한국인 여성 해커",
                                        "301": "어두운 사무실",
                                        "401": "컴퓨터 모니터, 키보드",
                                        "501": "푸른 모니터 빛",
                                        "502": "16:9"
                                    }
                                }
                            ]
                        },
                        "plan_b": {
                            "description": "2개 이미지로 분할하여 안정적 생성",
                            "image_count": 2,
                            "complexity": "medium",
                            "images": [
                                {
                                    "id": "IMG_B_001",
                                    "description": "어두운 사무실 전경",
                                    "csv_attributes": {
                                        "301": "어두운 사무실 밤",
                                        "401": "컴퓨터 책상",
                                        "501": "어두운 조명",
                                        "502": "16:9"
                                    }
                                },
                                {
                                    "id": "IMG_B_002",
                                    "description": "레이븐 클로즈업",
                                    "csv_attributes": {
                                        "201": "20대 한국인 여성",
                                        "501": "푸른 빛",
                                        "502": "16:9"
                                    }
                                }
                            ]
                        },
                        "plan_c": {
                            "description": "최소한의 이미지로 핵심만 표현",
                            "image_count": 1,
                            "complexity": "low",
                            "images": [
                                {
                                    "id": "IMG_C_001",
                                    "description": "컴퓨터 앞의 실루엣",
                                    "csv_attributes": {
                                        "301": "어두운 방",
                                        "401": "컴퓨터",
                                        "501": "실루엣 조명",
                                        "502": "16:9"
                                    }
                                }
                            ]
                        }
                    },
                    "image_prompts": {
                        "midjourney": {
                            "main_prompt": "Young Korean woman hacker in dark office, blue monitor light on face, focused expression, typing on keyboard, cinematic close-up --ar 16:9 --v 6",
                            "main_prompt_translated": "어두운 사무실의 젊은 한국인 여성 해커, 얼굴에 비친 푸른 모니터 빛, 집중된 표정, 키보드 타이핑, 영화적 클로즈업",
                            "parameters": "--ar 16:9 --v 6 --style raw"
                        },
                        "ideogram": {
                            "main_prompt": "Cinematic close-up of female hacker working late at night",
                            "main_prompt_translated": "밤늦게 작업하는 여성 해커의 영화적 클로즈업",
                            "negative_prompt": "bright lighting, daylight, happy expression",
                            "parameters": "Cinematic style, Dark mood"
                        },
                        "leonardo": {
                            "main_prompt": "Professional hacker woman at computer in dark room",
                            "main_prompt_translated": "어두운 방에서 컴퓨터 앞의 전문 해커 여성",
                            "parameters": "Leonardo Vision XL, Cinematic"
                        },
                        "imagefx": {
                            "main_prompt": "Female programmer in dark office with computer screen glow",
                            "main_prompt_translated": "컴퓨터 화면 빛과 함께 어두운 사무실의 여성 프로그래머",
                            "parameters": "Photorealistic, Moody lighting"
                        }
                    },
                    "image_design": {
                        "aspect_ratio": "16:9",
                        "selected_plan": "plan_a",
                        "ai_generated_images": {
                            "midjourney": [
                                {
                                    "url": "https://example.com/midjourney/shot1_1.jpg",
                                    "description": "메인 샷 - 레이븐 클로즈업"
                                },
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                }
                            ],
                            "ideogram": [
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                }
                            ],
                            "leonardo": [
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                }
                            ],
                            "imagefx": [
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                },
                                {
                                    "url": "",
                                    "description": ""
                                }
                            ]
                        }
                    },
                    "video_prompts": {
                        "luma": {
                            "main_prompt": "Close-up shot of Asian female hacker typing intensely on keyboard in dark room with blue monitor glow on her focused face",
                            "main_prompt_translated": "어두운 방에서 키보드를 집중해서 타이핑하는 아시아 여성 해커의 클로즈업 샷, 집중된 얼굴에 푸른 모니터 빛",
                            "settings": {
                                "duration": "5s",
                                "style": "cinematic"
                            }
                        },
                        "kling": {
                            "main_prompt": "영화적 클로즈업: 밤에 작업하는 여성 프로그래머",
                            "settings": {
                                "mode": "고품질",
                                "duration": "5초"
                            }
                        },
                        "veo2": {
                            "main_prompt": "Cinematic close-up of female developer",
                            "settings": {}
                        },
                        "runway": {
                            "main_prompt": "Dark office hacker scene",
                            "settings": {
                                "motion_amount": 2
                            }
                        }
                    },
                    "video_urls": {
                        "luma": "https://example.com/luma_video.mp4",
                        "kling": "",
                        "veo2": "",
                        "runway": ""
                    },
                    "video_design": {
                        "selected_ai": "luma",
                        "video_url": "https://example.com/luma_video.mp4",
                        "extracted_image_info": [
                            {
                                "image_id": "IMG_A_001",
                                 "description": "키프레임 1: 레이븐의 집중된 표정"
                           }
                       ]
                   },
                   "reference_images": [
                       {
                           "id": "ref_img_1_S01.01",
                           "url": "https://example.com/ref/blade_runner_office.jpg",
                           "description": "블레이드러너 스타일의 어두운 사무실",
                           "type": "mood"
                       },
                       {
                           "id": "ref_img_2_S01.01",
                           "url": "",
                           "description": "",
                           "type": "composition"
                       },
                       {
                           "id": "ref_img_3_S01.01",
                           "url": "",
                           "description": "",
                           "type": "composition"
                       }
                   ]
               },
               {
                   "id": "S01.02",
                   "scene_id": "S01",
                   "title": "화면 클로즈업",
                   "shot_type": "ECU",
                   "description": "모니터에 나타나는 암호화된 메시지",
                   "other_info": {
                       "estimated_duration": 3
                   },
                   "content": {
                       "action": "레이븐의 표정 변화를 클로즈업으로 포착",
                       "dialogue_by_character": {},
                       "dialogue_sequence": [],
                       "narration": "그녀의 눈에는 결의가 담겨 있었다.",
                       "music": "",
                       "audio_urls": {}
                   },
                   "music_memo": "이 샷은 감정씬이므로 프로젝트 서브 OST 2 (서정적 피아노)를 사용. 대사 없이 음악과 표정으로 전달.",
                   "audio_prompts": {},
                   "original_scenario": {
                       "text": "모니터 화면이 클로즈업된다.\n암호화된 메시지가 한 줄씩 나타난다.\n\n레이븐의 눈이 빠르게 움직인다.\n결의에 찬 표정.",
                       "scene_number": 1,
                       "location": "레이븐의 은신처",
                       "time": "계속"
                   },
                   "image_design_plans": {
                       "plan_a": {
                           "description": "모니터와 눈 클로즈업 단일 이미지",
                           "image_count": 1,
                           "complexity": "medium",
                           "images": [
                               {
                                   "id": "IMG_A_001",
                                   "description": "암호 메시지가 뜬 모니터와 그것을 보는 눈",
                                   "csv_attributes": {
                                       "201": "여성의 눈 클로즈업",
                                       "401": "컴퓨터 모니터",
                                       "501": "모니터 빛 반사",
                                       "502": "16:9"
                                   }
                               }
                           ]
                       }
                   },
                   "image_prompts": {
                       "midjourney": {
                           "main_prompt": "Extreme close-up of computer monitor showing encrypted green text messages, reflection in woman's eyes --ar 16:9",
                           "parameters": "--ar 16:9 --v 6"
                       },
                       "ideogram": {
                           "main_prompt": "ECU encrypted computer screen with code",
                           "parameters": "Cyberpunk style"
                       },
                       "leonardo": {
                           "main_prompt": "Close up monitor with encrypted messages",
                           "parameters": "Tech noir style"
                       },
                       "imagefx": {
                           "main_prompt": "Computer screen with green encrypted text",
                           "parameters": "Matrix style"
                       }
                   }
               },
               {
                   "id": "S02.01",
                   "scene_id": "S02",
                   "title": "잭의 등장",
                   "shot_type": "MS",
                   "description": "회의실 문이 열리며 잭이 들어온다",
                   "other_info": {
                       "estimated_duration": 4
                   },
                   "content": {
                       "action": "잭이 급하게 회의실로 들어오며 레이븐을 찾는다",
                       "dialogue_by_character": {
                           "레이븐": {
                               "character_name": "레이븐",
                               "voice_style": "낮고 빠른 어조, 핵심만 말하는 스타일",
                               "voice_gender": "female",
                               "voice_age": "young",
                               "lines": [
                                   {
                                       "index": 1,
                                       "text": "뭐라고? 그게 가능해?",
                                       "text_translated": "What? Is that possible?",
                                       "emotion": "놀람"
                                   },
                                   {
                                       "index": 3,
                                       "text": "그럼 끝까지 가는 거야.",
                                       "text_translated": "Then we go all the way.",
                                       "emotion": "결의"
                                   }
                               ]
                           },
                           "잭": {
                               "character_name": "잭",
                               "voice_style": "깊고 안정적인 목소리, 권위있는 톤",
                               "voice_gender": "male",
                               "voice_age": "middle",
                               "lines": [
                                   {
                                       "index": 2,
                                       "text": "이미 시작됐어. 돌이킬 수 없어.",
                                       "text_translated": "It's already started. There's no turning back.",
                                       "emotion": "차분함"
                                   }
                               ]
                           }
                       },
                       "dialogue_sequence": [
                           {"character": "레이븐", "line_index": 0},
                           {"character": "잭", "line_index": 0},
                           {"character": "레이븐", "line_index": 1}
                       ],
                       "narration": "",
                       "sound_effects": "문 열리는 소리, 발걸음 소리, 의자 끄는 소리",
                       "audio_urls": {
                           "dialogue": {
                               "레이븐": ["", ""],
                               "잭": [""]
                           },
                           "narration": "",
                           "sound_effects": ""
                       }
                   },
                   "original_scenario": {
                       "text": "장면 2. 비밀 회의실 - 밤\n\n문이 급하게 열린다.\n잭(40대 남성)이 들어온다.\n\n레이븐\n(놀라며)\n뭐라고? 그게 가능해?\n\n잭\n(차분하게)\n이미 시작됐어. 돌이킬 수 없어.\n\n레이븐\n(결의에 찬)\n그럼 끝까지 가는 거야.",
                       "scene_number": 2,
                       "location": "비밀 회의실",
                       "time": "밤"
                   }
               }
           ]
       }
   };
       }

       // 데이터 로드 함수 - 씬 단위 지원 추가
		async function loadData() {
			try {
				const jsonFileName = getProjectFileName();
        const savedData = localStorage.getItem(`breakdownData_${jsonFileName}`);
				if (!savedData) {
					// 저장된 데이터가 없는 경우, 임시 데이터를 처리할 수 있도록 처리 플래그 초기화
					const processedFlags = [
						'stage2TempProcessed', 'stage4TempProcessed', 'stage5TempProcessed',
						'stage6TempProcessed', 'stage6TempFilesProcessed',
						'stage7TempProcessed', 'stage8TempProcessed'
					];
					processedFlags.forEach(flag => {
						if (localStorage.getItem(flag)) {
							localStorage.removeItem(flag);
						}
					});
					updateUI();
					return;
				}

				const parsedData = JSON.parse(savedData);
				
				// Stage 6, 7 데이터 복원
				const savedStage6 = localStorage.getItem(`stage6ImagePrompts_${jsonFileName}`);
				if (savedStage6) {
					window.stage6ImagePrompts = JSON.parse(savedStage6);
				}

				const savedStage7 = localStorage.getItem(`stage7VideoPrompts_${jsonFileName}`);
				if (savedStage7) {
					window.stage7VideoPrompts = JSON.parse(savedStage7);
				}
				
				// 오디오 파일 데이터 복원
				const savedAudioFiles = localStorage.getItem(`audioFiles_${jsonFileName}`);
				if (savedAudioFiles) {
					window.localAudioFiles = JSON.parse(savedAudioFiles);
				}

				// 데이터 유효성 검증
				if (!validateLoadedData(parsedData)) {
					throw new Error('저장된 데이터가 유효하지 않습니다.');
				}

				currentData = parsedData;
				// Stage 2 구조 존재 여부 확인 (향상된 체크)
				if (currentData.hasStage2Structure || 
				    (currentData.breakdown_data && currentData.breakdown_data.sequences && currentData.breakdown_data.sequences.length > 0) ||
				    (currentData.stage2_data)) {
					hasStage2Structure = true;
					currentData.hasStage2Structure = true; // 데이터에도 플래그 설정
					console.log('🎬 Stage 2 구조가 복원되었습니다:', hasStage2Structure);
				} else {
					hasStage2Structure = false;
					console.log('⚠️ Stage 2 구조가 없습니다.');
				}
				
				// 시퀀스 데이터 상세 확인
				if (currentData.breakdown_data?.sequences?.length > 0) {
					currentData.breakdown_data.sequences.forEach(seq => {
					});
				}
				
				// 씬 데이터 확인
				if (currentData.breakdown_data?.scenes?.length > 0) {
					const firstScene = currentData.breakdown_data.scenes[0];
				}

				updateUI();
				// Stage 5 다중 파일 업로드가 아닌 경우에만 메시지 표시 - 사용자 요청으로 제거
				// const isStage5MultipleUpload = new URLSearchParams(window.location.search).get('loadStage5JsonMultiple') === 'true';
				// if (!isStage5MultipleUpload) {
				//     showMessage('이전 작업 데이터를 불러왔습니다.', 'success');
				// }

			} catch (error) {
				localStorage.removeItem('filmProductionData');
				currentData = getEmptyData();
				updateUI();
				showMessage('저장된 데이터를 불러올 수 없습니다. 새로 시작합니다.', 'warning');
			}
		}
		// 데이터 유효성 검증 함수 - 씬 단위 지원 추가
			function validateLoadedData(data) {
				if (!data || typeof data !== 'object') return false;

				// 필수 필드 확인
				if (!data.film_metadata || !data.breakdown_data) return false;

				// 씬 단위 데이터인 경우
				if (data.film_metadata.current_scene !== undefined) {
					// 씬 단위 구조 검증
					if (!data.breakdown_data.scenes || !Array.isArray(data.breakdown_data.scenes)) {
						return false;
					}
					// 최소한 하나의 씬이 있어야 함
					if (data.breakdown_data.scenes.length === 0) return false;

					// 현재 씬이 scenes 배열에 존재하는지 확인
					const currentSceneId = data.film_metadata.current_scene;
					const sceneExists = data.breakdown_data.scenes.some(scene => scene.id === currentSceneId);
					if (!sceneExists) {
					}
				}
				// 시퀀스 단위 데이터인 경우 (기존 호환성)
				else if (data.breakdown_data.sequences) {
					if (!Array.isArray(data.breakdown_data.sequences)) return false;
				}
				else {
					return false; // 어느 구조에도 맞지 않음
				}

				return true;
			}

       // 데이터 저장
		function saveDataToLocalStorage() {
			try {
				if (currentData) {
					const jsonFileName = getProjectFileName();
					const dataString = JSON.stringify(currentData);
					
					// localStorage 용량 체크 및 처리
					try {
						localStorage.setItem(`breakdownData_${jsonFileName}`, dataString);
						localStorage.setItem(`lastSaved_${jsonFileName}`, new Date().toISOString());
					} catch (quotaError) {
						if (quotaError.name === 'QuotaExceededError') {
							showMessage('저장 공간이 부족합니다. 이미지 데이터를 정리하거나 JSON으로 백업 후 초기화하세요.', 'error');
							
							// 용량 정보 표시
							const currentSize = new Blob([dataString]).size;
							const mbSize = (currentSize / (1024 * 1024)).toFixed(2);
							
							return false;
						}
						throw quotaError;
					}

					// Stage 6 이미지 프롬프트 저장
					if (window.stage6ImagePrompts) {
						try {
							localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(window.stage6ImagePrompts));
						} catch (e) {
						}
					}

					// Stage 7 영상 프롬프트 저장
					if (window.stage7VideoPrompts) {
						try {
							localStorage.setItem(`stage7VideoPrompts_${jsonFileName}`, JSON.stringify(window.stage7VideoPrompts));
						} catch (e) {
						}
					}

				}
			} catch (error) { 
				showMessage('로컬 저장 실패: ' + error.message, 'error'); 
			}
		}


       // 전체 프로젝트 데이터 백업
       function exportFullData() {
   try {
       if (!currentData) {
           return showMessage('저장할 프로젝트 데이터가 없습니다.', 'error');
       }
       
       // 전체 백업 데이터 구성
       const fullBackup = {
           type: 'full_project_backup',
           version: '2.0',
           timestamp: new Date().toISOString(),
           project_info: {
               name: getProjectFileName(),
               created: localStorage.getItem(`projectCreated_${getProjectFileName()}`) || new Date().toISOString(),
               lastModified: new Date().toISOString()
           },
           data: {
               // 전체 currentData를 포함
               ...currentData,
               // 추가 메타데이터
               backup_metadata: {
                   hasStage2Structure: hasStage2Structure,
                   totalSequences: currentData.breakdown_data?.sequences?.length || 0,
                   totalScenes: currentData.breakdown_data?.scenes?.length || 0,
                   totalShots: currentData.breakdown_data?.shots?.length || 0,
                   stageDataIncluded: {
                       stage2: !!currentData.stage2_data,
                       stage3: !!currentData.stage3_data,
                       stage4: !!currentData.stage4_data,
                       stage5: true, // breakdown_data가 stage5
                       stage6: !!(currentData.breakdown_data?.shots?.some(shot => shot.image_prompts)),
                       stage7: !!(currentData.breakdown_data?.shots?.some(shot => shot.video_prompts)),
                       stage8: !!(currentData.breakdown_data?.shots?.some(shot => shot.content?.audio_urls))
                   }
               }
           },
           // 추가 Stage별 데이터 (localStorage에 저장된 것들)
           additional_stage_data: {}
       };
       
       // localStorage에서 Stage별 데이터 추가
       const jsonFileName = getProjectFileName();
       
       // Stage 6 이미지 프롬프트 데이터
       const stage6Data = localStorage.getItem(`stage6ImagePrompts_${jsonFileName}`);
       if (stage6Data) {
           try {
               fullBackup.additional_stage_data.stage6ImagePrompts = JSON.parse(stage6Data);
           } catch (e) {
               console.warn('Stage 6 데이터 파싱 실패:', e);
           }
       }
       
       // Stage 7 비디오 프롬프트 데이터
       const stage7Data = localStorage.getItem(`stage7VideoPrompts_${jsonFileName}`);
       if (stage7Data) {
           try {
               fullBackup.additional_stage_data.stage7VideoPrompts = JSON.parse(stage7Data);
           } catch (e) {
               console.warn('Stage 7 데이터 파싱 실패:', e);
           }
       }
       
       // Stage 8 오디오 프롬프트 데이터
       const stage8Data = localStorage.getItem(`stage8AudioPrompts_${jsonFileName}`);
       if (stage8Data) {
           try {
               fullBackup.additional_stage_data.stage8AudioPrompts = JSON.parse(stage8Data);
           } catch (e) {
               console.warn('Stage 8 데이터 파싱 실패:', e);
           }
       }
       
       // 수정된 이미지 프롬프트 데이터 병합
       const editedPrompts = JSON.parse(localStorage.getItem('editedImagePrompts') || '{}');
       if (Object.keys(editedPrompts).length > 0) {
           // 수정된 프롬프트를 원본 데이터에 병합
           fullBackup.data.breakdown_data.shots.forEach(shot => {
               if (shot.image_prompts && shot.image_prompts.ai_tools) {
                   shot.image_prompts.ai_tools.forEach(ai => {
                       const aiName = ai.name;
                       if (ai.images && Array.isArray(ai.images)) {
                           ai.images.forEach(image => {
                               const editKey = `${shot.id}_${aiName}_${image.id}`;
                               const editedData = editedPrompts[editKey];
                               if (editedData) {
                                   // 수정된 프롬프트로 덮어쓰기
                                   if (editedData.originalPrompt) {
                                       image.prompt = editedData.originalPrompt;
                                       image.main_prompt = editedData.originalPrompt;
                                   }
                                   if (editedData.translatedPrompt) {
                                       image.prompt_translated = editedData.translatedPrompt;
                                       image.main_prompt_translated = editedData.translatedPrompt;
                                   }
                                   if (editedData.parameters) {
                                       image.parameters = editedData.parameters;
                                   }
                                   // 수정 시간 기록
                                   image.edited_at = editedData.editedAt;
                               }
                           });
                       }
                   });
               }
           });
           
           // 수정된 프롬프트 정보도 백업에 포함
           fullBackup.additional_stage_data.editedImagePrompts = editedPrompts;
       }
       
       // 파일 다운로드
       const backupFileName = getProjectFileName().replace('.json', '_full_backup.json');
       const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = backupFileName;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       
       showMessage(`전체 프로젝트 백업이 ${backupFileName} 파일로 저장되었습니다.`, 'success');
   } catch (error) {
       showMessage(`전체 백업 오류: ${error.message}`, 'error');
       console.error('전체 백업 오류:', error);
   }
       }

       // 실용적 JSON 핸들러
		function practicalJSONHandler(jsonString) {
			try {
				// 1차 시도: 그냥 파싱
				return { success: true, data: JSON.parse(jsonString) };
			} catch (error) {

				
				// 2차 시도: 간단한 오류 자동 수정
				let fixedString = jsonString;

				// 순서가 중요함!
				// 1. 스마트 따옴표 먼저 수정
				fixedString = fixedString.replace(/[""]/g, '"');
				fixedString = fixedString.replace(/['']/g, "'");

				// 2. NaN, undefined, Infinity 처리
				fixedString = fixedString
					.replace(/\bNaN\b/g, 'null')
					.replace(/\bundefined\b/g, 'null')
					.replace(/\bInfinity\b/g, 'null');

				// 3. 후행 쉼표 제거
				fixedString = fixedString.replace(/,(\s*[}\]])/g, '$1');

				// 4. 누락된 쉼표 추가 - 더 정확한 패턴으로 개선
				fixedString = fixedString
					.replace(/}(\s*){/g, '},$1{')                // 중괄호 사이
					.replace(/\](\s*){/g, '],$1{')               // 배열 뒤
					.replace(/}(\s*)\[/g, '},$1[')               // 중괄호 다음 배열
					.replace(/\](\s*)\[/g, '],$1[')              // 배열 다음 배열
					.replace(/"([^",\s]+)"(\s*)"/g, '"$1",$2"'); // 연속된 문자열
				
				try {
					const data = JSON.parse(fixedString);

					// Stage 2 특수 처리: 잘못 배치된 캐릭터 데이터 수정
					if (data.current_stage_name === 'narrative_development' && data.narrative_data) {
						const fixed = fixStage2Structure(data);
						if (fixed.wasFixed) {
							showMessage('Stage 2 JSON 구조를 자동으로 수정했습니다. (캐릭터 데이터 위치 조정)', 'info');
						}
						return { success: true, data: fixed.data, wasFixed: true };
					}

					// 수정된 내용 상세 표시
					const fixes = [];
					if (jsonString.match(/[""'']/)) fixes.push('스마트 따옴표');
					if (jsonString.match(/,(\s*[}\]])/)) fixes.push('후행 쉼표');
					if (fixedString !== jsonString) fixes.push('누락된 쉼표');

					if (fixes.length > 0) {
						showMessage(`JSON 자동 수정 완료: ${fixes.join(', ')} 수정됨`, 'info');
					} else {
						showMessage('JSON의 사소한 문법 오류를 자동으로 수정했습니다.', 'info');
					}
					return { success: true, data, wasFixed: true };

				} catch (stillError) {
					// 3차 시도: 더 공격적인 수정
					try {
						
						// 유니코드 및 특수문자 처리
						fixedString = fixedString
							.replace(/[\u0000-\u001F]+/g, '') // 제어 문자 제거
							.replace(/\\x[0-9a-fA-F]{2}/g, '') // hex 이스케이프 제거
							.replace(/[\u200B-\u200D\uFEFF]/g, ''); // 보이지 않는 문자 제거
						
						// 객체 키 따옴표 추가 (개선된 패턴)
						fixedString = fixedString
							.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":')
							.replace(/""([^"]+)":/g, '"$1":'); // 중복 따옴표 제거
						
						const finalData = JSON.parse(fixedString);
						return { success: true, data: finalData, wasFixed: true };
					} catch (finalError) {
						// 복구 불가능

						// 오류 위치 찾기
						const match = finalError.message.match(/position (\d+)/);
						if (match) {
							const position = parseInt(match[1]);
							const lines = jsonString.substring(0, position).split('\n');
							const lineNumber = lines.length;
							const columnNumber = lines[lines.length - 1].length + 1;

							showMessage(
								`JSON 자동 수정 실패<br>` +
								`오류 위치: ${lineNumber}번째 줄, ${columnNumber}번째 문자<br>` +
								`<small>텍스트 에디터에서 직접 수정해주세요.</small>`,
								'error'
							);
						} else {
							showMessage(`JSON 파싱 오류: ${finalError.message}`, 'error');
						}

						return { success: false, error: finalError };
					}
				}
			}
		}

		// Stage 2 구조 수정 함수
		function fixStage2Structure(data) {
			try {
				if (!data.narrative_data?.treatment_data?.story_summary_by_act_or_sequence) {
					return { data, wasFixed: false };
				}

				const storyArray = data.narrative_data.treatment_data.story_summary_by_act_or_sequence;
				const characterArray = data.narrative_data.treatment_data.character_arcs || [];

				const properStories = [];
				const misplacedCharacters = [];
				let wasFixed = false;

				// 분류
				storyArray.forEach(item => {
					if (item.character_name && (item.backstory_summary_relevant || item.arc_description_full)) {
						misplacedCharacters.push(item);
						wasFixed = true;
					} else if (item.act_or_sequence_number !== undefined) {
						properStories.push(item);
					}
				});

				if (wasFixed) {
					data.narrative_data.treatment_data.story_summary_by_act_or_sequence = properStories;
					data.narrative_data.treatment_data.character_arcs = [...characterArray, ...misplacedCharacters];
				}

				return { data, wasFixed };

			} catch (error) {
				return { data, wasFixed: false };
			}
		}
		// JSON 가져오기
       function importData() {
   document.getElementById('file-input')?.click();
       }
       
      function handleFileSelect(event) {
   const file = event.target.files[0];
   if (!file) { 
       return; 
   }

   const reader = new FileReader();
   reader.onload = function(e) {
       try {
					// 새로운 실용적 JSON 핸들러 사용
					const result = practicalJSONHandler(e.target.result);

					if (!result.success) {
						event.target.value = '';
						return;
					}

					const newData = result.data;
					let updated = false;
					let message = '';

           // 전체 프로젝트 백업 파일 처리
           if (newData.type === 'full_project_backup' && newData.data) {
               const confirmRestore = confirm(
                   '전체 프로젝트 백업 파일입니다.\n' +
                   `프로젝트: ${newData.project_info?.name || '알 수 없음'}\n` +
                   `백업 시간: ${new Date(newData.timestamp).toLocaleString()}\n\n` +
                   '현재 프로젝트 데이터를 모두 대체하시겠습니까?'
               );
               
               if (!confirmRestore) {
                   event.target.value = '';
                   return;
               }
               
               // 전체 데이터 복원
               currentData = newData.data;
               
               // hasStage2Structure 복원
               if (newData.data.backup_metadata?.hasStage2Structure !== undefined) {
                   hasStage2Structure = newData.data.backup_metadata.hasStage2Structure;
               }
               
               // localStorage에 추가 Stage 데이터 복원
               if (newData.additional_stage_data) {
                   const jsonFileName = getProjectFileName();
                   
                   if (newData.additional_stage_data.stage6ImagePrompts) {
                       localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, 
                           JSON.stringify(newData.additional_stage_data.stage6ImagePrompts));
                   }
                   
                   if (newData.additional_stage_data.stage7VideoPrompts) {
                       localStorage.setItem(`stage7VideoPrompts_${jsonFileName}`, 
                           JSON.stringify(newData.additional_stage_data.stage7VideoPrompts));
                   }
                   
                   if (newData.additional_stage_data.stage8AudioPrompts) {
                       localStorage.setItem(`stage8AudioPrompts_${jsonFileName}`, 
                           JSON.stringify(newData.additional_stage_data.stage8AudioPrompts));
                   }
               }
               
               saveDataToLocalStorage();
               updateUI();
               
               const stats = newData.data.backup_metadata || {};
               showMessage(
                   `전체 프로젝트 백업이 성공적으로 복원되었습니다.\n` +
                   `시퀀스: ${stats.totalSequences || 0}개, ` +
                   `씬: ${stats.totalScenes || 0}개, ` +
                   `샷: ${stats.totalShots || 0}개`, 
                   'success'
               );
               
               event.target.value = '';
               return;
           }
           
           // URL 백업 파일 처리
           else if (newData.type === 'urls_backup' && newData.urls) {
               if (!currentData || !currentData.breakdown_data || !currentData.breakdown_data.shots) {
                   showMessage('먼저 프로젝트 데이터를 로드한 후 URL을 가져와주세요.', 'warning');
                   event.target.value = '';
                   return;
               }
               
               let urlUpdateCount = 0;
               Object.keys(newData.urls).forEach(shotId => {
                   const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
                   if (shot) {
                       const shotUrls = newData.urls[shotId];
                       
                       // 이미지 URL 복원
                       if (shotUrls.image_urls) {
                           if (!shot.image_design) shot.image_design = {};
                           shot.image_design.ai_generated_images = shotUrls.image_urls;
                           urlUpdateCount++;
                       }
                       
                       // 비디오 URL 복원
                       if (shotUrls.video_urls) {
                           shot.video_urls = shotUrls.video_urls;
                           urlUpdateCount++;
                       }
                       
                       // 오디오 URL 복원
                       if (shotUrls.audio_urls) {
                           if (!shot.content) shot.content = {};
                           shot.content.audio_urls = shotUrls.audio_urls;
                           urlUpdateCount++;
                       }
                       
                       // 참조 이미지 복원
                       if (shotUrls.reference_images) {
                           shot.reference_images = shotUrls.reference_images;
                           urlUpdateCount++;
                       }
                   }
               });
               
               // 프로젝트 음악 URL 복원
               if (newData.project_music_urls) {
                   if (!currentData.film_metadata) currentData.film_metadata = {};
                   currentData.film_metadata.project_music_urls = newData.project_music_urls;
                   urlUpdateCount++;
               }
               
               saveDataToLocalStorage();
               updateUI();
               showMessage(`URL 데이터를 성공적으로 복원했습니다. (${urlUpdateCount}개 항목)`, 'success');
               event.target.value = '';
               return;
           }

           // 1. 스테이지 8 (오디오 프롬프트 생성) 데이터 병합
           if (newData.stage === 8 && newData.audio_data) {
		             // Stage 2 구조 확인 - 경고만 표시하고 계속 진행 (완화된 체크)
               if (!hasStage2Structure && 
                   (!currentData?.breakdown_data?.sequences || currentData.breakdown_data.sequences.length === 0) &&
                   !currentData?.stage2_data) {
                   console.warn('⚠️ Stage 2 구조가 없어도 Stage 8 데이터를 처리합니다.');
               }
               if (!currentData || !currentData.breakdown_data || !currentData.breakdown_data.shots || currentData.breakdown_data.shots.length === 0) {
                   message = '오디오 데이터를 병합하려면 먼저 유효한 기본 프로젝트 데이터(샷 포함)를 로드해야 합니다.';
                   showMessage(message, 'warning');
                   event.target.value = '';
                   return;
               }

               if (newData.project_info && newData.project_info.film_id) {
                   currentData.film_id = newData.project_info.film_id;
               }

               if (newData.audio_data && newData.audio_data.shots) {
                   
                   newData.audio_data.shots.forEach(newShotData => {
                       const shotIdToFind = newShotData.id;
                       const existingShot = currentData.breakdown_data.shots.find(shot => shot.id === shotIdToFind);

                       if (existingShot) {
                           
                           if (newShotData.content) {
                               if (!existingShot.content) existingShot.content = {};
                               
                               if (newShotData.content.dialogue_by_character) {
                                   existingShot.content.dialogue_by_character = newShotData.content.dialogue_by_character;
                                   updated = true;
                               }
                               if (newShotData.content.dialogue_sequence) {
                                   existingShot.content.dialogue_sequence = newShotData.content.dialogue_sequence;
                                   updated = true;
                               }
                               if (newShotData.content.narration !== undefined) {
                                   existingShot.content.narration = newShotData.content.narration;
                                   updated = true;
                               }
                               if (newShotData.content.narration_translated !== undefined) {
                                   existingShot.content.narration_translated = newShotData.content.narration_translated;
                                   updated = true;
                               }
                               if (newShotData.content.sound_effects !== undefined) {
                                   existingShot.content.sound_effects = newShotData.content.sound_effects;
                                   updated = true;
                               }
                               if (newShotData.content.sound_effects_en !== undefined) {
                                   existingShot.content.sound_effects_en = newShotData.content.sound_effects_en;
                                   updated = true;
                               }
                               if (newShotData.content.audio_urls) {
                                   existingShot.content.audio_urls = newShotData.content.audio_urls;
                                   updated = true;
                               }
                           }
                           
                           if (newShotData.audio_prompts) {
                               existingShot.audio_prompts = newShotData.audio_prompts;
                               updated = true;
                           }
                           
                           if (newShotData.music_memo !== undefined) {
                               existingShot.music_memo = newShotData.music_memo;
                               updated = true;
                           }
                           
                           if (newShotData.title) existingShot.title = newShotData.title;
                           if (newShotData.description) existingShot.description = newShotData.description;
                       } else {
                       }
                   });
               }

               if (updated) {
                   currentData.current_stage_name = "audio_prompt_generation";
                   currentData.timestamp = new Date().toISOString();
                   saveDataToLocalStorage();
                   updateUI();
                   message = '스테이지 8 오디오 정보를 현재 데이터에 성공적으로 병합했습니다.';
                   showMessage(message, 'success');
                   event.target.value = '';
                   return;
               } else {
                   message = '스테이지 8 오디오 병합을 시도했으나, 변경된 내용이 없거나 대상 데이터를 찾지 못했습니다.';
                   showMessage(message, 'info');
                   event.target.value = '';
                   return;
               }
           }
        // Stage 6 데이터를 전역 변수에 저장 (병합 전에 먼저 저장)
						if (newData.stage === 6 && newData.shots) {
							// 기존 데이터가 없으면 새로 만들고, 있으면 유지
							if (!window.stage6ImagePrompts) {
								window.stage6ImagePrompts = {};
							}

							newData.shots.forEach(shotData => {
								const shotId = shotData.shot_id;
								// 기존 데이터를 완전히 대체 (업데이트)
								window.stage6ImagePrompts[shotId] = {};

								shotData.images.forEach(imageData => {
									const imageId = imageData.image_id;
									window.stage6ImagePrompts[shotId][imageId] = imageData;
								});
							});

                    showMessage('Stage 6 이미지 프롬프트 데이터가 로드되었습니다.', 'success');

								// Stage 6 데이터 localStorage에 저장
								const jsonFileName = getProjectFileName();
								localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(window.stage6ImagePrompts));

							// Stage 6만 로드한 경우 메시지 표시
							if (!currentData || !currentData.breakdown_data) {
								showMessage('Stage 6 데이터가 로드되었습니다. Stage 5 데이터를 먼저 가져와주세요.', 'info');
								// Stage 6 데이터만이라도 저장
								const jsonFileName = getProjectFileName();
								localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(window.stage6ImagePrompts));
								event.target.value = '';
								return;
							}
						}

						// 2. 스테이지 6 (샷별 AI 이미지 프롬프트) 병합
						else if (newData.stage === 6 && newData.scene_info && newData.shots) {
                    // Stage 2 구조 확인 (완화된 체크)
                   if (!hasStage2Structure && 
                       (!currentData?.breakdown_data?.sequences || currentData.breakdown_data.sequences.length === 0) &&
                       !currentData?.stage2_data) {
                       showMessage('Stage 6 데이터를 로드하려면 먼저 Stage 2 시나리오 구조를 업로드해야 합니다.', 'warning');
                       event.target.value = '';
                       return;
                   }
							if (!currentData || !currentData.breakdown_data || !currentData.breakdown_data.shots) {
								showMessage('스테이지6 데이터를 병합하려면 먼저 스테이지5 데이터를 로드해야 합니다.', 'warning');
								event.target.value = '';
								return;
							}

							newData.shots.forEach(newShotData => {
								const shotIdToFind = newShotData.shot_id;
								const existingShot = currentData.breakdown_data.shots.find(shot => shot.id === shotIdToFind);

								if (existingShot) {

									// Stage 6의 프롬프트 정보만 가져오기
									if (newShotData.images && newShotData.images.length > 0) {
										// image_design_plans 생성 (없는 경우)
										if (!existingShot.image_design_plans) {
											existingShot.image_design_plans = {
												plan_a: {
													description: `${newShotData.images.length}개 이미지로 전체 표현`,
													image_count: newShotData.images.length,
													complexity: "high",
													images: newShotData.images.map((img, idx) => ({
														id: img.image_id || `IMG_A_${String(idx + 1).padStart(3, '0')}`,
														description: img.image_description || '',
														csv_attributes: img.csv_data || {}
													}))
												},
												plan_b: {
													description: "중간 복잡도 표현",
													image_count: Math.ceil(newShotData.images.length / 2),
													complexity: "medium",
													images: []
												},
												plan_c: {
													description: "단순 표현",
													image_count: 1,
													complexity: "low",
													images: []
												}
											};
										}

										// prompts가 있는 첫 번째 이미지 찾기
										const imageWithPrompts = newShotData.images.find(img => img.prompts);

										if (imageWithPrompts && imageWithPrompts.prompts) {
											// image_prompts 초기화 (기존 데이터가 없을 때만)
											if (!existingShot.image_prompts) {
												existingShot.image_prompts = {};
											}

											// Stage 6에 있는 AI 도구들만 업데이트 (기존 데이터 보존하면서 병합)
											Object.keys(imageWithPrompts.prompts).forEach(aiTool => {
												const promptData = imageWithPrompts.prompts[aiTool];

												if (aiTool === 'midjourney') {
													// 기존 midjourney 데이터와 병합
													existingShot.image_prompts.midjourney = {
														...(existingShot.image_prompts.midjourney || {}),
														main_prompt: promptData.prompt || existingShot.image_prompts.midjourney?.main_prompt || '',
														main_prompt_translated: promptData.prompt_translated || existingShot.image_prompts.midjourney?.main_prompt_translated || '',
														parameters: promptData.parameters || existingShot.image_prompts.midjourney?.parameters || ''
													};
												} else {
													// 다른 AI 도구들도 기존 데이터와 병합
													let parameters = '';
													if (promptData.negative_prompt) {
														parameters = `Negative: ${promptData.negative_prompt}`;
													}
													if (promptData.aspect_ratio) {
														parameters += parameters ? `; Aspect Ratio: ${promptData.aspect_ratio}` : `Aspect Ratio: ${promptData.aspect_ratio}`;
													}

													existingShot.image_prompts[aiTool] = {
														...(existingShot.image_prompts[aiTool] || {}),
														main_prompt: promptData.prompt || existingShot.image_prompts[aiTool]?.main_prompt || '',
														main_prompt_translated: promptData.prompt_translated || existingShot.image_prompts[aiTool]?.main_prompt_translated || '',
														parameters: parameters || existingShot.image_prompts[aiTool]?.parameters || ''
													};
												}
											});
										}
									}

									// 샷 설명 업데이트
									if (newShotData.shot_description) {
										existingShot.title = existingShot.title || newShotData.shot_description;
									}

									updated = true;
								} else {
								}
							});

							if (updated) {
								showMessage('스테이지6 이미지 프롬프트 정보를 현재 데이터에 성공적으로 병합했습니다.', 'success');
							} else {
								showMessage('스테이지6 JSON에서 업데이트할 샷 정보를 찾지 못했거나, 변경사항이 없습니다.', 'info');
							}
                    // Stage 6 데이터 저장
                     saveDataToLocalStorage();
						}
            // 2.5 스테이지 2 (시나리오 구조) 처리
           else if (newData.current_stage_name === 'narrative_development' && newData.narrative_data) {
               handleStage2Data(newData);
               event.target.value = '';
               return;
           }
            // 3.5 스테이지 5 씬 단위 데이터 처리
					else if (newData.film_metadata && newData.film_metadata.current_scene !== undefined && newData.breakdown_data) {
              // Stage 2 구조 확인 (완화된 체크)
               if (!hasStage2Structure && 
                   (!currentData?.breakdown_data?.sequences || currentData.breakdown_data.sequences.length === 0) &&
                   !currentData?.stage2_data) {
                   showMessage('Stage 5 씬 데이터를 로드하려면 먼저 Stage 2 시나리오 구조를 업로드해야 합니다.', 'warning');
                   event.target.value = '';
                   return;
               }
						handleStage5SceneData(newData);
						return;
					}
           // 3. 스테이지 7 (영상 관련 데이터) 병합
					else if (newData.stage === 7 && newData.video_prompts) {
              // Stage 2 구조 확인 (완화된 체크)
                if (!hasStage2Structure && 
                    (!currentData?.breakdown_data?.sequences || currentData.breakdown_data.sequences.length === 0) &&
                    !currentData?.stage2_data) {
                    showMessage('Stage 7 데이터를 로드하려면 먼저 Stage 2 시나리오 구조를 업로드해야 합니다.', 'warning');
                    event.target.value = '';
                    return;
                }
                // Stage 7 데이터를 전역 변수에 저장
						if (!window.stage7VideoPrompts) {
							window.stage7VideoPrompts = {};
						}

						if (Array.isArray(newData.video_prompts)) {
							newData.video_prompts.forEach(promptData => {
								const shotId = promptData.shot_id;
								const imageId = promptData.image_id;

								if (!window.stage7VideoPrompts[shotId]) {
									window.stage7VideoPrompts[shotId] = {};
								}

								window.stage7VideoPrompts[shotId][imageId] = promptData;
							});

						}
                
						if (!currentData || !currentData.breakdown_data || !currentData.breakdown_data.shots || currentData.breakdown_data.shots.length === 0) {
							showMessage('영상 데이터를 병합하려면 먼저 유효한 기본 프로젝트 데이터(샷 포함)를 로드해야 합니다.', 'warning');
							event.target.value = '';
							return;
						}

						let videoDataUpdated = false;

						if (newData.video_prompts && Array.isArray(newData.video_prompts)) {
							newData.video_prompts.forEach(promptData => {
								const shotIdToFind = promptData.shot_id;
								const existingShot = currentData.breakdown_data.shots.find(shot => shot.id === shotIdToFind);

								if (existingShot) {

									// video_prompts 병합
									if (!existingShot.video_prompts) existingShot.video_prompts = {};

									if (promptData.prompts) {
										Object.keys(promptData.prompts).forEach(aiTool => {
											existingShot.video_prompts[aiTool] = {
												main_prompt: promptData.prompts[aiTool].prompt_en || '',
												main_prompt_translated: promptData.prompts[aiTool].prompt_translated || '',
												settings: promptData.prompts[aiTool].settings || {}
											};
										});
										videoDataUpdated = true;
									}

									// video_design의 extracted_image_info 처리
									if (promptData.extracted_data) {
										if (!existingShot.video_design) existingShot.video_design = {};
										existingShot.video_design.extracted_image_info = [{
											image_id: promptData.image_id,
											description: promptData.image_reference?.description || ''
										}];
										videoDataUpdated = true;
									}

									// 제목 업데이트
									if (promptData.image_reference?.title) {
										existingShot.title = existingShot.title || promptData.image_reference.title;
									}
								} else {
								}
							});
						}

						if (videoDataUpdated) {
							currentData.current_stage_name = "video_prompt_generation";
							currentData.timestamp = new Date().toISOString();
							updated = true;
							showMessage('스테이지 7 영상 정보를 현재 데이터에 성공적으로 병합했습니다.', 'success');
						} else {
							showMessage('스테이지 7 영상 병합을 시도했으나, 변경된 내용이 없거나 대상 데이터를 찾지 못했습니다.', 'info');
						}
					}
           // 4. 스테이지 5 또는 전체 프로젝트 구조 로드 (덮어쓰기)
           else if (newData.film_metadata && newData.breakdown_data && newData.breakdown_data.sequences) {
               currentData = newData;
               
               if (currentData.breakdown_data && currentData.breakdown_data.shots) {
                   currentData.breakdown_data.shots.forEach(shot => {
                       if (!shot.image_prompts) shot.image_prompts = {};
                       IMAGE_AI_TOOLS.forEach(toolId => {
                           if (!shot.image_prompts[toolId]) {
                               shot.image_prompts[toolId] = { 
                                   main_prompt: '', 
                                   main_prompt_translated: '',
                                   parameters: '' 
                               };
                           }
                       });
                       
                       if (!shot.image_design) {
                           shot.image_design = { 
                               aspect_ratio: "16:9", 
                               selected_plan: "plan_a",
                               ai_generated_images: {} 
                           };
                       } else if (!shot.image_design.ai_generated_images) {
                           shot.image_design.ai_generated_images = {};
                       }
                       
                       IMAGE_AI_TOOLS.forEach(toolId => {
                           if (!shot.image_design.ai_generated_images[toolId]) {
                               shot.image_design.ai_generated_images[toolId] = [
                                   { url: '', description: '' },
                                   { url: '', description: '' },
                                   { url: '', description: '' }
                               ];
                           }
                       });
                       
                       if (!shot.content) shot.content = {};
                       if (!shot.content.audio_urls) {
                           shot.content.audio_urls = { 
                               dialogue: {}, 
                               narration: "", 
                               sound_effects: "" 
                           };
                       }
                       if (!shot.audio_prompts) {
                           shot.audio_prompts = { 
                               dialogue: {}, 
                               narration: { prompt: "", settings: {} }, 
                               sound_effects: { prompt: "", settings: {} } 
                           };
                       }
                       
                       if (!shot.reference_images) {
                           shot.reference_images = [];
                       }
                   });
               }
               
               updated = true;
               message = (newData.film_metadata.title_working || '프로젝트') + ' 전체 데이터를 로드했습니다.';
               showMessage(message, 'success');
           }
           // 5. 인식할 수 없는 형식
           else {
               message = '가져온 JSON 파일의 구조를 인식할 수 없거나, 현재 데이터와 병합/로드할 수 없습니다.';
               showMessage(message, 'warning');
               event.target.value = '';
               return;
           }

           if (updated) {
               saveDataToLocalStorage();
               updateUI();
               
               if (selectedType === 'shot' && selectedId) {
                   showShotContent(selectedId);
                   const lastActiveTab = localStorage.getItem(`shot_${selectedId}_activeTab`) || 'info';
                   setTimeout(() => switchTab(lastActiveTab, selectedId), 0);
               } else if (selectedType === 'scene' && selectedId) {
                   showSceneContent(selectedId);
               } else if (selectedType === 'sequence' && selectedId) {
                   showSequenceContent(selectedId);
               } else {
                   updateNavigation();
               }
           }

       } catch (parseError) {
           showMessage(`JSON 파싱 오류: ${parseError.message}`, 'error');
       }
   };
   
   reader.onerror = function(error) {
       showMessage('파일 읽기 오류', 'error');
   };
   
   reader.readAsText(file);
   event.target.value = '';
       }
   // 새로운 함수: Stage 2 데이터 처리
			function handleStage2Data(jsonData) {

				try {
					// Stage 2 데이터 검증
					if (!jsonData.narrative_data || !jsonData.narrative_data.treatment_data || !jsonData.narrative_data.scenario_data) {
						throw new Error('Stage 2 데이터 구조가 올바르지 않습니다.');
					}

					// 시퀀스 구조 확인
					const sequences = jsonData.narrative_data.treatment_data.sequence_structure || [];
					const scenes = jsonData.narrative_data.scenario_data.scenes || [];
					

					if (sequences.length === 0 || scenes.length === 0) {
						throw new Error('시퀀스 또는 씬 데이터가 비어있습니다.');
					}

					// 기존 데이터가 없으면 새로 생성
					if (!currentData) {
						currentData = getEmptyData();
					}
					
					// breakdown_data가 없으면 초기화
					if (!currentData.breakdown_data) {
						currentData.breakdown_data = {
							sequences: [],
							scenes: [],
							shots: []
						};
					}

					// Stage 2 데이터 저장
					currentData.stage2_data = jsonData;
					currentData.film_metadata = {
						...currentData.film_metadata,
						...jsonData.film_metadata
					};

					// 시퀀스/씬 구조만 설정 (샷은 제외)
					currentData.breakdown_data.sequences = sequences.map(seq => ({
						id: seq.sequence_id,
						title: seq.title,
						function: seq.function,
						description: seq.description,
						scenes: seq.scene_ids,
						duration_estimate: `${seq.scene_ids.length * 3}-${seq.scene_ids.length * 5}분`,
						scenario_text: seq.sequence_scenario_text || ''
					}));

					currentData.breakdown_data.scenes = scenes.map(scene => ({
						id: scene.scene_id,
						sequence_id: scene.sequence_id,
						title: scene.scene_heading ? 
							`${scene.scene_heading.setting_type} ${scene.scene_heading.location_name} - ${scene.scene_heading.time_of_day}` : 
							`씬 ${scene.scene_number}`,
						description: scene.scene_metadata?.scene_purpose || '',
						source_scene_number: scene.scene_number,
						original_scenario: {
							scene_heading: scene.scene_heading,
							action_lines: scene.action_lines || [],
							dialogue_blocks: scene.dialogue_blocks || [],
							scenario_text: scene.scenario_text || ''
						},
						shot_ids: [] // 샷은 비워둠 (Stage 5에서 추가)
					}));

					// Stage 2 구조 로드 완료 표시
					hasStage2Structure = true;
					currentData.hasStage2Structure = true;


					saveDataToLocalStorage();
					updateUI();
            // 전체 시나리오 다운로드 버튼 표시
					const scenarioExportBtn = document.getElementById('scenario-export-btn');
					if (scenarioExportBtn) {
						scenarioExportBtn.style.display = 'inline-block';
					}


				} catch (error) {
					showMessage(`Stage 2 데이터 처리 오류: ${error.message}`, 'error');
				}
			}
// 새로운 함수: 씬 단위 Stage 5 데이터 처리
		function handleStage5SceneData(jsonData, suppressMessages = false) {

			try {
				// 데이터 구조 검증
				if (!jsonData.film_metadata || !jsonData.breakdown_data) {
					throw new Error('필수 필드가 없습니다: film_metadata, breakdown_data');
				}

				// 현재 데이터가 없으면 새로 생성
				if (!currentData || !currentData.breakdown_data) {
					currentData = getEmptyData();
					currentData.film_metadata = jsonData.film_metadata;
				}

				// film_metadata 업데이트
				currentData.film_metadata = {
					...currentData.film_metadata,
					...jsonData.film_metadata
				};

				// breakdown_data 초기화 (필요시)
				if (!currentData.breakdown_data.sequences) {
					currentData.breakdown_data.sequences = [];
				}
				if (!currentData.breakdown_data.scenes) {
					currentData.breakdown_data.scenes = [];
				}
				if (!currentData.breakdown_data.shots) {
					currentData.breakdown_data.shots = [];
				}

				// 씬 데이터 병합 또는 추가
				const newScenes = jsonData.breakdown_data.scenes || [];
				const newShots = jsonData.breakdown_data.shots || [];
				const newSequences = jsonData.breakdown_data.sequences || [];


        // 공통 CSV 데이터 처리 (Stage 5 v2.1)
				if (newScenes.length > 0 && newScenes[0].common_csv) {
					newScenes.forEach(scene => {
						const existingScene = currentData.breakdown_data.scenes.find(s => s.id === scene.id);
						if (existingScene && scene.common_csv) {
							existingScene.common_csv = scene.common_csv;
						}
					});
				}
				// Stage 5에서는 샷 정보만 병합 (시퀀스/씬 구조는 Stage 2에서만)
				const sceneId = jsonData.film_metadata.current_scene;
				let currentScene = currentData.breakdown_data.scenes.find(scene => scene.id === sceneId);
				
				if (!currentScene) {
					// Stage 2가 없는 경우 Stage 5 데이터에서 씬 정보 가져오기
					
					if (newScenes.length > 0) {
						// Stage 5에서 제공한 씬 정보 추가
						newScenes.forEach(scene => {
							const existingScene = currentData.breakdown_data.scenes.find(s => s.id === scene.id);
							if (!existingScene) {
								// shot_ids 배열이 없으면 초기화
								if (!scene.shot_ids) {
									scene.shot_ids = [];
								}
								currentData.breakdown_data.scenes.push(scene);
							}
						});
						
						// 시퀀스 정보도 필요한 경우 추가
						if (newSequences.length > 0) {
							newSequences.forEach(seq => {
								const existingSeq = currentData.breakdown_data.sequences.find(s => s.id === seq.id);
								if (!existingSeq) {
									currentData.breakdown_data.sequences.push(seq);
								}
							});
						}
						
						// 다시 씬 찾기
						currentScene = currentData.breakdown_data.scenes.find(scene => scene.id === sceneId);
					}
					
					if (!currentScene) {
						// 여전히 없으면 기본 씬 생성
						const newScene = {
							id: sceneId,
							title: `씬 ${sceneId}`,
							description: '',
							shots: [],
							shot_ids: []  // shot_ids 배열 추가
						};
						currentData.breakdown_data.scenes.push(newScene);
						currentScene = newScene;
					}
				}

				// 해당 씬의 샷만 병합 (기존 데이터 보존)
				newShots.forEach(newShot => {
					if (newShot.scene_id === sceneId) {
						const existingIndex = currentData.breakdown_data.shots.findIndex(
							shot => shot.id === newShot.id
						);
						if (existingIndex >= 0) {
							// 기존 샷의 데이터를 보존하면서 새로운 데이터 병합
							const existingShot = currentData.breakdown_data.shots[existingIndex];
							
							// 깊은 병합: 기존 데이터를 유지하면서 새 데이터 추가
							currentData.breakdown_data.shots[existingIndex] = {
								...existingShot,
								...newShot,
								// 중요한 필드들은 깊은 병합 수행
								content: {
									...existingShot.content,
									...newShot.content,
									// audio_urls도 깊은 병합
									audio_urls: {
										...existingShot.content?.audio_urls,
										...newShot.content?.audio_urls
									}
								},
								image_prompts: {
									...existingShot.image_prompts,
									...newShot.image_prompts,
									// 각 AI 도구별로 깊은 병합
									...(function() {
										const merged = {};
										const allTools = new Set([
											...Object.keys(existingShot.image_prompts || {}),
											...Object.keys(newShot.image_prompts || {})
										]);
										allTools.forEach(tool => {
											if (existingShot.image_prompts?.[tool] || newShot.image_prompts?.[tool]) {
												merged[tool] = {
													...existingShot.image_prompts?.[tool],
													...newShot.image_prompts?.[tool]
												};
											}
										});
										return merged;
									})()
								},
								video_prompts: {
									...existingShot.video_prompts,
									...newShot.video_prompts
								},
								video_design: {
									...existingShot.video_design,
									...newShot.video_design
								},
								image_design: {
									...existingShot.image_design,
									...newShot.image_design,
									// ai_generated_images도 깊은 병합
									ai_generated_images: {
										...existingShot.image_design?.ai_generated_images,
										...newShot.image_design?.ai_generated_images
									}
								},
								// images 배열은 중복 제거하면서 병합
								images: existingShot.images && newShot.images ? 
									[...existingShot.images, ...newShot.images].filter((img, index, self) => 
										index === self.findIndex(i => i.image_id === img.image_id)
									) : (existingShot.images || newShot.images || []),
								// reference_images 배열도 병합
								reference_images: existingShot.reference_images && newShot.reference_images ? 
									[...existingShot.reference_images, ...newShot.reference_images].filter((img, index, self) => 
										index === self.findIndex(i => i.id === img.id)
									) : (existingShot.reference_images || newShot.reference_images || [])
							};
						} else {
							currentData.breakdown_data.shots.push(newShot);
						}
						
                // csv_mapping 추가 (개별 CSV - Stage 5 v2.1)
						if (newShot.csv_mapping) {
							if (existingIndex >= 0) {
								currentData.breakdown_data.shots[existingIndex].csv_mapping = newShot.csv_mapping;
							} else {
								// 새 샷인 경우 이미 csv_mapping이 포함되어 있음
							}
						}
						// 씬의 shot_ids 업데이트 (안전 체크 추가)
						if (!currentScene.shot_ids) {
							currentScene.shot_ids = [];
						}
						if (!currentScene.shot_ids.includes(newShot.id)) {
							currentScene.shot_ids.push(newShot.id);
						}
					}
				});

				// visual_consistency_info와 concept_art_prompt_data 병합
				if (jsonData.visual_consistency_info) {
					currentData.visual_consistency_info = jsonData.visual_consistency_info;
				}
				if (jsonData.concept_art_prompt_data) {
					currentData.concept_art_prompt_data = jsonData.concept_art_prompt_data;
				}

				// 타임스탬프 업데이트
				currentData.timestamp = new Date().toISOString();
				currentData.current_stage_name = "scenario_breakdown";

				// 저장 및 UI 업데이트
				saveDataToLocalStorage();
				updateUI();

				const currentSceneId = jsonData.film_metadata.current_scene;
				// suppressMessages가 false인 경우에만 개별 메시지 표시
				if (!suppressMessages) {
					showMessage(`씬 ${currentSceneId} 데이터를 성공적으로 로드했습니다.`, 'success');
				}

				// 로드된 씬으로 자동 이동
				if (currentSceneId) {
					selectedId = currentSceneId;
					selectedType = 'scene';
					showSceneContent(currentSceneId);
				}

			} catch (error) {
				showMessage(`데이터 처리 오류: ${error.message}`, 'error');
			}
		}

       // 검색 기능
       function searchNavigation() {
   const searchInput = document.getElementById('search-input');
   const searchTerm = searchInput.value.toLowerCase();
   if (!currentData || !currentData.breakdown_data) return;
   
   const sequenceItems = document.querySelectorAll('.sequence-item');
   sequenceItems.forEach(item => {
       const sequenceText = item.textContent.toLowerCase();
       const isVisible = searchTerm === '' || sequenceText.includes(searchTerm);
       item.style.display = isVisible ? 'block' : 'none';
       
       if (isVisible && searchTerm !== '') {
           const scenesContainer = item.querySelector('.scenes-container');
           if (scenesContainer && scenesContainer.classList.contains('collapsed')) {
               item.querySelector('.sequence-header').click();
           }
       }
   });
       }

       // 전체 펼치기/접기
       // [DEPRECATED] 모두 펼치기 기능 - 더 이상 사용되지 않음
       // TODO: 향후 버전에서 제거 예정
       function expandAll() {
   document.querySelectorAll('.sequence-header').forEach(header => {
       const sequenceId = header.dataset.sequenceId;
       const scenesContainer = document.getElementById(`scenes-${sequenceId}`);
       if (scenesContainer && scenesContainer.classList.contains('collapsed')) {
           header.click();
       }
   });
   
   setTimeout(() => {
       document.querySelectorAll('.scene-header').forEach(header => {
           const sceneId = header.dataset.sceneId;
           const shotsContainer = document.getElementById(`shots-${sceneId}`);
           if (shotsContainer && shotsContainer.classList.contains('collapsed')) {
               header.click();
           }
       });
   }, 400);
       }

       // [DEPRECATED] 모두 접기 기능 - 더 이상 사용되지 않음
       // TODO: 향후 버전에서 제거 예정
       function collapseAll() {
   // 샷 먼저 접기
   document.querySelectorAll('.scene-header').forEach(header => {
       const sceneId = header.dataset.sceneId;
       const shotsContainer = document.getElementById(`shots-${sceneId}`);
       if (shotsContainer && !shotsContainer.classList.contains('collapsed')) {
           header.click();
       }
   });
   
   // 시퀀스 접기
   setTimeout(() => {
       document.querySelectorAll('.sequence-header').forEach(header => {
           const sequenceId = header.dataset.sequenceId;
           const scenesContainer = document.getElementById(`scenes-${sequenceId}`);
           if (scenesContainer && !scenesContainer.classList.contains('collapsed')) {
               header.click();
           }
       });
   }, 400);
       }

       // UI 업데이트
       function updateUI() {
   try {
       updateHeaderInfo();
       updateNavigation();
       
       if (selectedId && selectedType) {
           if (selectedType === 'shot') showShotContent(selectedId);
           else if (selectedType === 'scene') showSceneContent(selectedId);
           else if (selectedType === 'sequence') showSequenceContent(selectedId);
       } else {
           document.getElementById('content-area').innerHTML = `
               <div class="empty-state">
                   <div class="empty-state-icon">🎬</div>
                   <div>시퀀스, 씬, 또는 샷을 선택하여 상세 정보를 확인하세요</div>
               </div>`;
       }
		       // 전체 시나리오 다운로드 버튼 표시 여부 결정
				const scenarioExportBtn = document.getElementById('scenario-export-btn');
				if (scenarioExportBtn) {
					// Stage 2 구조가 있거나 시나리오 텍스트가 있는 씬이 하나라도 있으면 표시
					const hasScenarioData = hasStage2Structure || 
						(currentData?.breakdown_data?.scenes?.some(scene => 
							scene.original_scenario?.scenario_text?.trim()
						) || false);

					scenarioExportBtn.style.display = hasScenarioData ? 'inline-block' : 'none';
				}
   } catch (error) {
       showMessage('화면 업데이트 오류: ' + error.message, 'error');
   }
       }

       // 헤더 정보 업데이트
       function updateHeaderInfo() {
   try {
       const projectName = getProjectName();
       const jsonFileName = getProjectFileName();
       const projectTitleEl = document.getElementById('project-title');
       const projectFileEl = document.getElementById('project-file');
       const navProjectTitleEl = document.getElementById('nav-project-title');
       const navProjectFileEl = document.getElementById('nav-project-file');
       
       if (projectTitleEl) projectTitleEl.textContent = currentData?.film_metadata?.title_working || projectName;
       if (projectFileEl) projectFileEl.textContent = `파일: ${jsonFileName}`;
       if (navProjectTitleEl) navProjectTitleEl.textContent = currentData?.film_metadata?.title_working || projectName;
       const navProjectDescEl = document.getElementById('nav-project-description');
			if (navProjectDescEl) {
				const genre = currentData?.film_metadata?.confirmed_genre || '';
				const description = genre ? `장르: ${genre}` : '프로젝트 설명이 여기에 표시됩니다';
				navProjectDescEl.textContent = description;
			}
   } catch (error) {
   }
       }

       // 네비게이션 업데이트
       function updateNavigation() {
   try {
       const navContent = document.getElementById('navigation-content');
       if (!navContent) return;
       
       if (!currentData || !currentData.breakdown_data) {
					navContent.innerHTML = `
						<div class="empty-state" id="nav-empty">
							<div class="empty-state-icon">📁</div>
							<div>데이터가 없습니다</div>
							<div style="font-size: 0.9rem; margin-top: 10px;">JSON 가져오기를 사용해 데이터를 로드해주세요</div>
						</div>`;
					return;
				}

				// 시퀀스 구조가 있는지 확인
				if (currentData.breakdown_data.sequences?.length > 0) {
				}
				
				// 시퀀스가 있는 경우와 없는 경우를 구분
				const hasSequences = currentData.breakdown_data.sequences && 
									 Array.isArray(currentData.breakdown_data.sequences) && 
									 currentData.breakdown_data.sequences.length > 0;
				
				if (!hasSequences) {
					// 씬 단위 데이터인 경우 (시퀀스 없이 씬만 있는 경우)

					// 씬들을 임시 시퀀스로 그룹화
					const scenes = currentData.breakdown_data.scenes || [];
					if (scenes.length > 0) {
						let html = '<div class="sequence-item">';
						html += '<div class="sequence-header" data-sequence-id="TEMP_SEQ">';
						html += '<span class="toggle-icon">▼</span>';
						html += '<span>씬 단위 작업</span>';
						html += '</div>';
						html += '<div class="scenes-container" id="scenes-TEMP_SEQ">';

						scenes.forEach(scene => {
							html += `
								<div class="scene-item">
									<div class="scene-header" data-scene-id="${scene.id}">
										<span class="toggle-icon">▷</span>
										<span>${scene.id}: ${scene.title || '제목 없음'}</span>
									</div>
									<div class="shots-container collapsed" id="shots-${scene.id}"></div>
								</div>`;
						});

						html += '</div></div>';
						navContent.innerHTML = html;

						// 씬 이벤트 리스너 설정
						navContent.querySelectorAll('.scene-header').forEach(header => {
							header.addEventListener('click', function(e) {
								e.stopPropagation();
								selectScene(this.dataset.sceneId, this);
							});
						});

						return;
					}
				} else {
					// 시퀀스 기반 네비게이션
					
					let html = '';
					currentData.breakdown_data.sequences.forEach(sequence => {
						// 각 시퀀스에 속한 씬 개수 계산
						const sceneCount = currentData.breakdown_data.scenes.filter(
							scene => scene.sequence_id === sequence.id
						).length;
						
						html += `
							<div class="sequence-item">
								<div class="sequence-header" data-sequence-id="${sequence.id}">
									<span class="toggle-icon">▶</span>
									<span>${sequence.id}: ${sequence.title}</span>
								</div>
								<div class="scenes-container collapsed" id="scenes-${sequence.id}"></div>
							</div>`;
					});
					
					navContent.innerHTML = html;
					setupSequenceEventListeners();
				}
   } catch (error) {
       showMessage('네비게이션 업데이트 오류: ' + error.message, 'error');
   }
       }

       // 시퀀스 이벤트 리스너 설정
       function setupSequenceEventListeners() {
   try {
       document.querySelectorAll('.sequence-header[data-sequence-id]').forEach(header => {
           const newHeader = header.cloneNode(true);
           header.parentNode.replaceChild(newHeader, header);
           newHeader.addEventListener('click', function(e) {
               e.preventDefault();
               selectSequence(this.getAttribute('data-sequence-id'), this);
           });
       });
   } catch (error) {
   }
       }

       // 시퀀스 선택 및 토글
       function selectSequence(sequenceId, headerElement = null) {
   try {
       const newlySelected = selectedId !== sequenceId || selectedType !== 'sequence';
       selectedType = 'sequence';
       selectedId = sequenceId;
       
       document.querySelectorAll('.sequence-header.active, .scene-header.active, .shot-item.active').forEach(el => el.classList.remove('active'));
       
       const currentHeader = headerElement || document.querySelector(`.sequence-header[data-sequence-id="${sequenceId}"]`);
       if (currentHeader) currentHeader.classList.add('active');
       
       showSequenceContent(sequenceId);
       toggleSequenceScenes(sequenceId, newlySelected);
   } catch (error) {
       showMessage('시퀀스 선택 오류: ' + error.message, 'error');
   }
       }

       // 시퀀스의 씬들 토글
       function toggleSequenceScenes(sequenceId, forceOpen = false) {
   try {
       const scenesContainer = document.getElementById(`scenes-${sequenceId}`);
       if (!scenesContainer) return;
       
       const toggleIcon = scenesContainer.previousElementSibling.querySelector('.toggle-icon');
       if (!toggleIcon) return;
       
       if (forceOpen || scenesContainer.classList.contains('collapsed')) {
           scenesContainer.classList.remove('collapsed');
           toggleIcon.classList.add('expanded');
           toggleIcon.textContent = '▼';
           loadScenesForSequence(sequenceId, scenesContainer);
       } else {
           scenesContainer.classList.add('collapsed');
           toggleIcon.classList.remove('expanded');
           toggleIcon.textContent = '▶';
       }
   } catch (error) {
   }
       }

       // 시퀀스의 씬들 로드
       function loadScenesForSequence(sequenceId, container) {
   try {
       if (!currentData || !currentData.breakdown_data) return;
       
       const scenes = currentData.breakdown_data.scenes.filter(scene => scene.sequence_id === sequenceId);
       if (scenes.length === 0) {
           container.innerHTML = '<div style="padding: 15px 40px; color: #ccc; font-size: 0.9rem;">씬이 없습니다</div>';
           return;
       }
       
       let html = '';
       scenes.forEach(scene => {
           const hasShots = scene.shot_ids && scene.shot_ids.length > 0;
           const statusIndicator = hasShots ? 
               '<span class="status-indicator" style="color: #4caf50; font-size: 0.8rem; margin-left: 5px;" data-tooltip="Stage 5 완료 (샷 ' + scene.shot_ids.length + '개)">●</span>' : 
               '<span class="status-indicator" style="color: #ff9800; font-size: 0.8rem; margin-left: 5px;" data-tooltip="Stage 5 대기">○</span>';
           
           html += `
               <div class="scene-item">
                   <div class="scene-header" data-scene-id="${scene.id}">
                       <span class="toggle-icon">▷</span>
                       <span>${scene.id}: ${scene.title}${statusIndicator}</span>
                   </div>
                   <div class="shots-container collapsed" id="shots-${scene.id}"></div>
               </div>`;
       });
       
       container.innerHTML = html;
       
       container.querySelectorAll('.scene-header').forEach(header => {
           const newHeader = header.cloneNode(true);
           header.parentNode.replaceChild(newHeader, header);
           newHeader.addEventListener('click', function(e) {
               e.stopPropagation();
               selectScene(this.dataset.sceneId, this);
           });
       });
   } catch (error) {
   }
       }

       // 씬 선택
       function selectScene(sceneId, headerElement = null) {
   try {
       const newlySelected = selectedId !== sceneId || selectedType !== 'scene';
       selectedType = 'scene';
       selectedId = sceneId;
       selectedSceneId = sceneId;
       
       document.querySelectorAll('.scene-header.active, .shot-item.active').forEach(el => el.classList.remove('active'));
       
       const scene = currentData.breakdown_data.scenes.find(s => s.id === sceneId);
       if (scene) {
           document.querySelector(`.sequence-header[data-sequence-id="${scene.sequence_id}"]`)?.classList.add('active');
       }
       
       const currentHeader = headerElement || document.querySelector(`.scene-header[data-scene-id="${sceneId}"]`);
       if (currentHeader) currentHeader.classList.add('active');
       
       showSceneContent(sceneId);
       toggleSceneShots(sceneId, newlySelected);
   } catch (error) {
       showMessage('씬 선택 오류: ' + error.message, 'error');
   }
       }

       // 씬의 샷들 토글
       function toggleSceneShots(sceneId, forceOpen = false) {
   try {
       const shotsContainer = document.getElementById(`shots-${sceneId}`);
       if (!shotsContainer) return;
       
       const toggleIcon = shotsContainer.previousElementSibling.querySelector('.toggle-icon');
       if (!toggleIcon) return;
       
       if (forceOpen || shotsContainer.classList.contains('collapsed')) {
           shotsContainer.classList.remove('collapsed');
           toggleIcon.classList.add('expanded');
           toggleIcon.textContent = '▽';
           loadShotsForScene(sceneId, shotsContainer);
       } else {
           shotsContainer.classList.add('collapsed');
           toggleIcon.classList.remove('expanded');
           toggleIcon.textContent = '▷';
       }
   } catch (error) {
   }
       }

       // 씬의 샷들 로드
       function loadShotsForScene(sceneId, container) {
   try {
       if (!currentData || !currentData.breakdown_data) return;
       
       const shots = currentData.breakdown_data.shots.filter(shot => shot.scene_id === sceneId);
       if (shots.length === 0) {
           container.innerHTML = '<div style="padding: 15px 60px; color: #ccc; font-size: 0.9rem;">샷이 없습니다</div>';
           return;
       }
       
       let html = '';
       shots.forEach(shot => {
           html += `
               <div class="shot-item" data-shot-id="${shot.id}">
                   <span>${shot.id}: ${shot.title}</span>
               </div>`;
       });
       
       container.innerHTML = html;
       
       container.querySelectorAll('.shot-item').forEach(item => {
           const newItem = item.cloneNode(true);
           item.parentNode.replaceChild(newItem, item);
           newItem.addEventListener('click', function(e) {
               e.stopPropagation();
               selectShot(this.dataset.shotId, this);
           });
       });
   } catch (error) {
   }
       }

       // 샷 선택
       function selectShot(shotId, element = null) {
   try {
       selectedType = 'shot';
       selectedId = shotId;
       
       document.querySelectorAll('.shot-item.active').forEach(el => el.classList.remove('active'));
       
       const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
       if (shot) {
           const scene = currentData.breakdown_data.scenes.find(sc => sc.id === shot.scene_id);
           if (scene) {
               document.querySelector(`.scene-header[data-scene-id="${scene.id}"]`)?.classList.add('active');
               document.querySelector(`.sequence-header[data-sequence-id="${scene.sequence_id}"]`)?.classList.add('active');
           }
       }
       
       const currentElement = element || document.querySelector(`.shot-item[data-shot-id="${shotId}"]`);
       if (currentElement) currentElement.classList.add('active');
       
       showShotContent(shotId);
   } catch (error) {
       showMessage('샷 선택 오류: ' + error.message, 'error');
   }
       }

       // 시퀀스 내용 표시
       function showSequenceContent(sequenceId) {
   try {
       const sequence = currentData.breakdown_data.sequences.find(s => s.id === sequenceId);
       if (!sequence) return;
       
       document.getElementById('content-title').textContent = `시퀀스: ${sequence.title}`;
       document.getElementById('content-subtitle').textContent = `ID: ${sequence.id}`;
       document.getElementById('content-actions').style.display = 'none';
       
       // 시퀀스에 속한 씬들 확인
				const sequenceScenes = currentData.breakdown_data.scenes.filter(
					scene => scene.sequence_id === sequenceId
				);

				// 씬들의 시나리오 텍스트가 있는지 확인
				const hasScenarioInScenes = sequenceScenes.some(scene => 
					scene.original_scenario?.scenario_text && 
					scene.original_scenario.scenario_text.trim() !== ''
				);
       
       document.getElementById('content-area').innerHTML = `
           <div class="info-section">
               <h3>시퀀스 정보</h3>
               <table class="info-table">
                   <tr><th>ID</th><td>${sequence.id}</td></tr>
                   <tr><th>제목</th><td>${sequence.title}</td></tr>
                   <tr><th>기능</th><td>${sequence.function || '-'}</td></tr>
                   <tr><th>설명</th><td>${sequence.description || '-'}</td></tr>
                   <tr><th>예상 길이</th><td>${sequence.duration_estimate || '-'}</td></tr>
               </table>
           </div>
           ${hasScenarioInScenes ? `
           <div class="info-section">
               <h3>시퀀스 시나리오</h3>
               <div style="margin-bottom: 15px;">
                   <button class="btn btn-success" onclick="viewSequenceScenario('${sequenceId}')">
                       시나리오 보기
                   </button>
                   <button class="btn btn-warning" onclick="downloadSequenceScenario('${sequenceId}', 'txt')">
                       TXT 다운로드
                   </button>
                  <!--<button class="btn btn-warning" onclick="downloadSequenceScenario('${sequenceId}', 'pdf')">
                       PDF 다운로드
                   </button>-->
               </div>
               <!--<div class="scenario-preview" style="background: #f8f9fa; padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                   <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.9rem;">시나리오 미리보기...</pre>
               </div>-->
           </div>` : ''}`;
   } catch (error) {
       showMessage('시퀀스 내용 표시 오류: ' + error.message, 'error');
   }
       }

       // 씬 내용 표시
       function showSceneContent(sceneId) {
   try {
       const scene = currentData.breakdown_data.scenes.find(s => s.id === sceneId);
       if (!scene) return;
       
       // Stage 5 작업 완료 여부 확인
       const hasShots = scene.shot_ids && scene.shot_ids.length > 0;
       const statusBadge = hasShots ? 
           '<span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; margin-left: 10px;">Stage 5 완료</span>' : 
           '<span style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; margin-left: 10px;">Stage 5 대기</span>';
       
       document.getElementById('content-title').innerHTML = `씬: ${scene.title} ${statusBadge}`;
       document.getElementById('content-subtitle').textContent = `ID: ${scene.id}`;
       document.getElementById('content-actions').style.display = 'none';
       
       const scenarioText = scene.original_scenario?.scenario_text || '';
       const hasScenarioText = scenarioText.trim() !== '';
       
       document.getElementById('content-area').innerHTML = `
           <div class="tabs">
						<div class="tab-buttons">
							<button class="tab-button active" onclick="switchSceneTab('info', '${scene.id}')">정보</button>
							<button class="tab-button" onclick="switchSceneTab('images', '${scene.id}')">이미지 갤러리</button>
					        <button class="tab-button" onclick="switchSceneTab('videos', '${scene.id}')">영상 갤러리</button>
						</div>
						<div id="tab-info" class="tab-content active">
							<div class="info-section">
								<h3>씬 정보</h3>
								<table class="info-table">
									<tr><th>ID</th><td>${scene.id}</td></tr>
									<tr><th>제목</th><td>${scene.title}</td></tr>
									<tr><th>소속 시퀀스</th><td>${scene.sequence_id || '-'}</td></tr>
									<tr><th>설명</th><td>${scene.description || '-'}</td></tr>
									<tr><th>샷 개수</th><td>${scene.shot_ids?.length || 0}개 ${!hasShots ? '(Stage 5 업로드 필요)' : ''}</td></tr>
								</table>
							</div>
							${hasScenarioText ? `
							<div class="info-section">
								<h3>씬 시나리오</h3>
								<div class="scenario-preview" style="background: #000000; padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto;">
									<pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.9rem;">${scenarioText}</pre>
								</div>
							</div>` : ''}
							${scene.visual_consistency_info ? `
							<div class="info-section">
								<h3>비주얼 정보</h3>
								<table class="info-table">
									<tr><th>장소 ID</th><td>${scene.visual_consistency_info.location_id || '-'}</td></tr>
									<tr><th>캐릭터 ID</th><td>${(scene.visual_consistency_info.character_ids || []).join(', ') || '-'}</td></tr>
									<tr><th>소품 ID</th><td>${(scene.visual_consistency_info.prop_ids || []).join(', ') || '-'}</td></tr>
								</table>
							</div>` : ''}
						</div>
						<div id="tab-images" class="tab-content" style="display: none;">
							${createSceneImageGallery(scene.id)}
						</div>
					   <div id="tab-videos" class="tab-content" style="display: none;">
							${createSceneVideoGallery(scene.id)}
						</div>
					</div>`;
   } catch (error) {
       showMessage('씬 내용 표시 오류: ' + error.message, 'error');
   }
       }
	   // 씬 탭 전환 함수
		function switchSceneTab(tabName, sceneId) {
			try {
				document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
				document.querySelectorAll('.tab-content').forEach(content => {
					content.style.display = 'none';
					content.classList.remove('active');
				});

				const activeButton = document.querySelector(`[onclick*="switchSceneTab('${tabName}'"]`);
				const activeContent = document.getElementById(`tab-${tabName}`);

				if (activeButton) activeButton.classList.add('active');
				if (activeContent) {
					activeContent.style.display = 'block';
					activeContent.classList.add('active');
				}
			} catch (error) {
			}
		}
			   
       // 씬 이미지 갤러리 생성 함수
		function createSceneImageGallery(sceneId) {
			const scene = currentData.breakdown_data.scenes.find(s => s.id === sceneId);
			const sceneShots = currentData.breakdown_data.shots.filter(shot => shot.scene_id === sceneId);

			if (sceneShots.length === 0) {
				return '<div class="empty-state"><div class="empty-state-icon">🖼️</div><div>이 씬에 샷이 없습니다</div></div>';
			}

			let html = '<div style="padding: 20px;">';

			// 각 샷별로 처리
			sceneShots.forEach(shot => {
				let shotHasImages = false;
				let shotHtml = `<h4 style="margin-top: 20px; color: #333;">${shot.id}: ${shot.title}</h4>`;
				shotHtml += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">';

				// AI 생성 이미지
				const aiImages = shot.image_design?.ai_generated_images || {};
				Object.keys(aiImages).forEach(ai => {
					const images = aiImages[ai];
					if (images) {
						Object.entries(images).forEach(([imageId, imageData]) => {
							if (imageData.url) {
								shotHasImages = true;
								shotHtml += `
									<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden;">
										<img src="${imageData.url}" 
											 style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
											 onclick="window.open('${imageData.url}', '_blank')"
											 onerror="this.src=''; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding:20px;text-align:center;color:#999;\\'>로드 실패</div>'">
										<div style="padding: 10px; font-size: 0.85rem;">
											<strong>${ai}</strong><br>
											${imageId}
										</div>
									</div>`;
							}
						});
					}
				});

				// 참조 이미지
				if (shot.reference_images) {
					shot.reference_images.forEach((ref, idx) => {
						if (ref.url) {
							shotHasImages = true;
							shotHtml += `
								<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden;">
									<img src="${ref.url}" 
										 style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
										 onclick="window.open('${ref.url}', '_blank')"
										 onerror="this.src=''; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding:20px;text-align:center;color:#999;\\'>로드 실패</div>'">
									<div style="padding: 10px; font-size: 0.85rem;">
										<strong>${shot.id}</strong><br>
										참조 ${idx + 1}: ${ref.type || 'reference'}
									</div>
								</div>`;
						}
					});
				}

				shotHtml += '</div>';

				if (shotHasImages) {
					html += shotHtml;
				}
			});

			html += '</div>';
			return html;
}

		// 씬 영상 갤러리 생성 함수
		function createSceneVideoGallery(sceneId) {
			const scene = currentData.breakdown_data.scenes.find(s => s.id === sceneId);
			const sceneShots = currentData.breakdown_data.shots.filter(shot => shot.scene_id === sceneId);

			if (sceneShots.length === 0) {
				return '<div class="empty-state"><div class="empty-state-icon">🎬</div><div>이 씬에 샷이 없습니다</div></div>';
			}

			let html = '<div style="padding: 20px;">';

			// 각 샷별로 처리
			sceneShots.forEach(shot => {
				let shotHasVideos = false;
				let shotHtml = `<h4 style="margin-top: 20px; color: #333;">${shot.id}: ${shot.title}</h4>`;
				shotHtml += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">';

				// 영상 URLs 확인
				const videoUrls = shot.video_urls || {};

				// AI별 영상
				['luma', 'kling', 'veo2', 'runway'].forEach(ai => {
					// 기본 URL 확인
					if (videoUrls[ai]) {
						shotHasVideos = true;
						const processedUrl = processVideoUrl(videoUrls[ai]);
						if (processedUrl.includes('drive.google.com')) {
							shotHtml += `
								<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #1a1a1a;">
									<div style="padding: 10px; background: #e9ecef;">
										<strong>${ai.toUpperCase()}</strong>
									</div>
									<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: #000;">
										<iframe style="width: 100%; height: 100%; border: none;" src="${processedUrl}" allowfullscreen></iframe>
									</div>
								</div>`;
						} else {
							shotHtml += `
								<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #1a1a1a;">
									<div style="padding: 10px; background: #e9ecef;">
										<strong>${ai.toUpperCase()}</strong>
									</div>
									<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: #000;">
										<video controls style="max-width: 100%; max-height: 100%;" src="${processedUrl}">
											<source src="${processedUrl}" type="video/mp4">
											브라우저가 비디오를 지원하지 않습니다.
										</video>
									</div>
								</div>`;
						}
					}

					// 이미지별 영상 확인 (새로운 구조)
					Object.keys(videoUrls).forEach(key => {
						if (key.startsWith(`${ai}_`)) {
							const imageId = key.replace(`${ai}_`, '');
							shotHasVideos = true;
							const processedUrl = processVideoUrl(videoUrls[key]);
							if (processedUrl.includes('drive.google.com')) {
								shotHtml += `
									<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #1a1a1a;">
										<div style="padding: 10px; background: #2a2a2a;">
											<strong>${ai.toUpperCase()}</strong><br>
											<small>${imageId}</small>
										</div>
										<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: #000;">
											<iframe style="width: 100%; height: 100%; border: none;" src="${processedUrl}" allowfullscreen></iframe>
										</div>
									</div>`;
							} else {
								shotHtml += `
									<div style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #1a1a1a;">
										<div style="padding: 10px; background: #2a2a2a;">
											<strong>${ai.toUpperCase()}</strong><br>
											<small>${imageId}</small>
										</div>
										<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: #000;">
											<video controls style="max-width: 100%; max-height: 100%;" src="${processedUrl}">
												<source src="${processedUrl}" type="video/mp4">
												브라우저가 비디오를 지원하지 않습니다.
											</video>
										</div>
									</div>`;
							}
						}
					});
				});

				shotHtml += '</div>';

				if (shotHasVideos) {
					html += shotHtml;
				}
			});

			html += '</div>';
			return html;
		}

		// 안전한 iframe 생성 함수
		function createSafeIframe(url, styles = '') {
			try {
				if (!url) return '<div style="color:#ccc;font-size:0.9rem;">URL이 없습니다.</div>';
				
				// URL 처리 (Google Drive, 드롭박스 등)
				const processedUrl = processVideoUrl(url);
				
				// 드롭박스 URL인 경우 video 태그 사용
				if (processedUrl.includes('dropbox.com')) {
					return `<video controls style="${styles}" src="${processedUrl}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'color:#ff6b6b;font-size:0.9rem;\\'>영상 로드 실패</div>';"></video>`;
				}
				
				// Google Drive가 아닌 일반 URL인 경우 video 태그 사용
				if (!processedUrl.includes('drive.google.com') && !processedUrl.includes('googleusercontent.com')) {
					return `<video controls style="${styles}" src="${processedUrl}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'color:#ff6b6b;font-size:0.9rem;\\'>영상 로드 실패</div>';"></video>`;
				}
				
				// 안전한 iframe 생성
				const iframe = document.createElement('iframe');
				iframe.src = processedUrl;
				iframe.style.cssText = styles || 'max-width:100%;max-height:250px;border-radius:4px;border:none;';
				iframe.allowFullscreen = true;
				iframe.setAttribute('loading', 'lazy');
				iframe.onerror = function() {
					this.style.display = 'none';
					this.parentElement.innerHTML = '<div style="color:#ff6b6b;font-size:0.9rem;">Google Drive 영상 로드 실패<br><small>파일이 공개로 설정되어 있는지 확인하세요.</small></div>';
				};
				
				return iframe.outerHTML;
			} catch (e) {
				return '<div style="color:#ff6b6b;font-size:0.9rem;">iframe 생성 중 오류가 발생했습니다.</div>';
			}
		}

		// 씬 영상 갤러리 재렌더링 (현재 활성화된 경우)
		// 실행 가드를 위한 전역 변수
		window.refreshSceneVideoGalleryRunning = false;
		
		function refreshSceneVideoGalleryIfActive(sceneId) {
			// 이미 실행 중이면 중복 실행 방지
			if (window.refreshSceneVideoGalleryRunning) {
				return;
			}
			
			try {
				// 실행 플래그 설정
				window.refreshSceneVideoGalleryRunning = true;
				
				// sceneId 유효성 검사
				if (!sceneId) {
					return;
				}

				// currentData 확인
				if (!window.currentData || !window.currentData.breakdown_data) {
					return;
				}

				// 안전한 방식으로 영상 갤러리 탭 찾기
				const videoTab = document.getElementById('tab-videos');
				if (!videoTab) {
					// 영상 갤러리 탭이 존재하지 않으면 종료
					return;
				}

				// 탭이 현재 활성화되어 있는지 확인 (display: block 또는 display 속성이 없음)
				const computedStyle = window.getComputedStyle(videoTab);
				const isVisible = computedStyle.display !== 'none';
				
				if (!isVisible) {
					// 영상 갤러리 탭이 비활성화되어 있으면 종료
					return;
				}

				// 영상 갤러리 재렌더링
				const newContent = createSceneVideoGallery(sceneId);
				if (newContent && typeof newContent === 'string') {
					videoTab.innerHTML = newContent;
				}
			} catch (e) {
			} finally {
				// 실행 플래그 해제
				window.refreshSceneVideoGalleryRunning = false;
			}
		}

      // 시퀀스 시나리오 보기
		function viewSequenceScenario(sequenceId) {
			try {
				const sequence = currentData.breakdown_data.sequences.find(s => s.id === sequenceId);
				if (!sequence) {
					showMessage('시퀀스를 찾을 수 없습니다.', 'error');
					return;
				}

				// 해당 시퀀스의 씬들을 찾아서 조합
				const seqScenes = currentData.breakdown_data.scenes.filter(
					scene => scene.sequence_id === sequenceId
				);

				let sequenceText = '';
				seqScenes.forEach(scene => {
					if (scene.original_scenario?.scenario_text) {
						sequenceText += scene.original_scenario.scenario_text + '\n\n';
					}
				});

				if (!sequenceText.trim()) {
					showMessage('시나리오 텍스트를 찾을 수 없습니다.', 'error');
					return;
				}

				const newWindow = window.open('', '_blank', 'width=800,height=600');
				newWindow.document.write(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>${sequence.title} - 시나리오</title>
						<style>
							body { font-family: 'Courier New', monospace; padding: 20px; line-height: 1.6; }
							h1 { font-size: 1.5rem; margin-bottom: 20px; }
							pre { white-space: pre-wrap; font-size: 1rem; }
						</style>
					</head>
					<body>
						<h1>${sequence.title}</h1>
						<pre>${sequenceText}</pre>
					</body>
					</html>
				`);
				newWindow.document.close();
			} catch (error) {
				showMessage('시나리오를 표시할 수 없습니다.', 'error');
			}
		}

       // 시퀀스 시나리오 다운로드
       function downloadSequenceScenario(sequenceId, format) {
   try {
       const sequence = currentData.breakdown_data.sequences.find(s => s.id === sequenceId);
       // 해당 시퀀스의 씬들에서 시나리오 텍스트 조합
				const seqScenes = currentData.breakdown_data.scenes.filter(
					scene => scene.sequence_id === sequenceId
				);

				let sequenceText = '';
				seqScenes.forEach(scene => {
					if (scene.original_scenario?.scenario_text) {
						sequenceText += scene.original_scenario.scenario_text + '\n\n';
					}
				});

				if (!sequenceText.trim()) {
					showMessage('시나리오 텍스트를 찾을 수 없습니다.', 'error');
					return;
				}
       if (!sequence) {
           showMessage('시나리오 텍스트를 찾을 수 없습니다.', 'error');
           return;
       }
       
       const fileName = `${sequence.id}_${sequence.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`;
       
       if (format === 'txt') {
           const blob = new Blob([sequenceText], { type: 'text/plain;charset=utf-8' });
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `${fileName}.txt`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           URL.revokeObjectURL(url);
           showMessage('텍스트 파일로 다운로드되었습니다.', 'success');
       } else if (format === 'pdf') {
           // 간단한 PDF 생성 (실제로는 jsPDF 라이브러리 사용 권장)
           showMessage('PDF 다운로드 기능은 준비 중입니다. TXT 파일을 사용해주세요.', 'info');
       }
   } catch (error) {
       showMessage('다운로드 중 오류가 발생했습니다.', 'error');
   }
       }
       // 샷 내용 표시 (모듈화된 탭 시스템 사용)
       function showShotContent(shotId) {
   try {
       const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
       if (!shot) return;
       
       document.getElementById('content-title').textContent = `샷: ${shot.title}`;
       document.getElementById('content-subtitle').textContent = `ID: ${shot.id}`;
       document.getElementById('content-actions').style.display = 'none';
       
       // 데이터 어댑터에 현재 데이터 설정
       if (window.dataAdapter) {
           window.dataAdapter.setCurrentData(currentData);
           // dataManager에도 adapter 설정
           if (window.dataManager) {
               window.dataManager.setAdapter(window.dataAdapter);
           }
       }
       
       // 모듈화된 버전 호출 - 정보 탭 문제로 인해 임시 비활성화
       // if (window.showShotContentModular) {
       //     window.showShotContentModular(shotId);
       // } else {
       //     // 폴백: 기존 방식 사용
       //     console.warn('Modular system not loaded, using fallback');
       //     showShotContentFallback(shotId);
       // }
       
       // 항상 폴백 시스템 사용
       showShotContentFallback(shotId);
   } catch (error) {
       showMessage('샷 내용 표시 오류: ' + error.message, 'error');
   }
       }
       
       // 폴백 함수 (모듈 로드 실패 시)
       function showShotContentFallback(shotId) {
   const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
   if (!shot) return;
   
   const lastActiveTab = localStorage.getItem(`shot_${shotId}_activeTab`) || 'info';
   
   // 각 탭 컨텐츠를 개별적으로 생성하여 격리 보장
   const infoContent = createShotInfoTab(shot);
   const imageContent = createShotImageTab(shot);
   const videoContent = createShotVideoTab(shot);
   const audioContent = createShotAudioTab(shot);
   const musicContent = createShotMusicTab(shot);
   
   // 각 탭 컨텐츠를 안전하게 래핑
   const wrappedInfoContent = `<div class="tab-inner-wrapper">${infoContent}</div>`;
   const wrappedImageContent = `<div class="tab-inner-wrapper">${imageContent}</div>`;
   const wrappedVideoContent = `<div class="tab-inner-wrapper">${videoContent}</div>`;
   const wrappedAudioContent = `<div class="tab-inner-wrapper">${audioContent}</div>`;
   const wrappedMusicContent = `<div class="tab-inner-wrapper">${musicContent}</div>`;
   
   document.getElementById('content-area').innerHTML = `
       <div class="tabs">
           <div class="tab-buttons">
               <button class="tab-button ${lastActiveTab === 'info' ? 'active' : ''}" onclick="switchTab('info', '${shotId}')">정보</button>
               <button class="tab-button ${lastActiveTab === 'image' ? 'active' : ''}" onclick="switchTab('image', '${shotId}')">이미지</button>
               <button class="tab-button ${lastActiveTab === 'video' ? 'active' : ''}" onclick="switchTab('video', '${shotId}')">영상</button>
               <button class="tab-button ${lastActiveTab === 'audio' ? 'active' : ''}" onclick="switchTab('audio', '${shotId}')">오디오</button>
               <button class="tab-button ${lastActiveTab === 'music' ? 'active' : ''}" onclick="switchTab('music', '${shotId}')">음악</button>
           </div>
           <div id="tab-info" class="tab-content ${lastActiveTab === 'info' ? 'active' : ''}" style="display: ${lastActiveTab === 'info' ? 'block' : 'none'}; visibility: ${lastActiveTab === 'info' ? 'visible' : 'hidden'};">${wrappedInfoContent}</div>
           <div id="tab-image" class="tab-content ${lastActiveTab === 'image' ? 'active' : ''}" style="display: ${lastActiveTab === 'image' ? 'block' : 'none'}; visibility: ${lastActiveTab === 'image' ? 'visible' : 'hidden'};">${wrappedImageContent}</div>
           <div id="tab-video" class="tab-content ${lastActiveTab === 'video' ? 'active' : ''}" style="display: ${lastActiveTab === 'video' ? 'block' : 'none'}; visibility: ${lastActiveTab === 'video' ? 'visible' : 'hidden'};">${wrappedVideoContent}</div>
           <div id="tab-audio" class="tab-content ${lastActiveTab === 'audio' ? 'active' : ''}" style="display: ${lastActiveTab === 'audio' ? 'block' : 'none'}; visibility: ${lastActiveTab === 'audio' ? 'visible' : 'hidden'};">${wrappedAudioContent}</div>
           <div id="tab-music" class="tab-content ${lastActiveTab === 'music' ? 'active' : ''}" style="display: ${lastActiveTab === 'music' ? 'block' : 'none'}; visibility: ${lastActiveTab === 'music' ? 'visible' : 'hidden'};">${wrappedMusicContent}</div>
       </div>`;
   
   // 초기 로드 시 디버깅
   console.log('🔍 샷 컨텐츠 로드 완료. 디버깅을 위해 debugTabContent() 실행...');
   setTimeout(() => {
       if (window.debugTabContent) window.debugTabContent();
       // 오디오 섹션 강제 숨김
       document.querySelectorAll('.tab-content:not(#tab-audio) .audio-section').forEach(section => {
           section.style.display = 'none';
           section.style.visibility = 'hidden';
           console.warn('⚠️ 오디오 섹션이 잘못된 위치에서 발견되어 숨김 처리:', section.parentElement.id);
       });
       // 음악 섹션 강제 숨김
       document.querySelectorAll('.tab-content:not(#tab-music) .music-ost-section').forEach(section => {
           section.style.display = 'none';
           section.style.visibility = 'hidden';
           console.warn('⚠️ 음악 섹션이 잘못된 위치에서 발견되어 숨김 처리:', section.parentElement.id);
       });
   }, 100);
       }

       // 탭 전환
       function switchTab(tabName, shotId = null) {
   try {
       const tabContainer = document.querySelector('.tabs');
       if (!tabContainer) return;
       
       // 디버깅용 로그
       console.log(`🔄 탭 전환 시작: ${tabName}`);
       
       // 모든 탭 버튼 비활성화
       tabContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
       
       // 모든 탭 컨텐츠 숨기기 - 더 확실하게
       tabContainer.querySelectorAll('.tab-content').forEach(content => {
           content.style.display = 'none';
           content.classList.remove('active');
           // 추가 보안 - visibility도 hidden으로
           content.style.visibility = 'hidden';
           
           // 오디오 섹션이 있는 경우 특별 처리
           content.querySelectorAll('.audio-section').forEach(audioSection => {
               audioSection.style.display = 'none';
               audioSection.style.visibility = 'hidden';
           });
           
           // 음악 섹션이 있는 경우 특별 처리
           content.querySelectorAll('.music-ost-section').forEach(musicSection => {
               musicSection.style.display = 'none';
               musicSection.style.visibility = 'hidden';
           });
           
           // 나레이션 관련 요소 명시적 숨김
           content.querySelectorAll('[class*="narration"], [class*="sound-effect"]').forEach(elem => {
               elem.style.display = 'none';
               elem.style.visibility = 'hidden';
           });
       });
       
       // 선택된 탭 활성화
       const activeButton = tabContainer.querySelector(`[onclick*="switchTab('${tabName}'"]`);
       const activeContent = document.getElementById(`tab-${tabName}`);
       
       if (activeButton) activeButton.classList.add('active');
       if (activeContent) {
           // 활성 탭 표시 전에 한 번 더 확인
           activeContent.style.display = 'none';
           activeContent.style.visibility = 'hidden';
           
           // 잠시 후 표시 (DOM 업데이트 보장)
           setTimeout(() => {
               activeContent.style.display = 'block';
               activeContent.style.visibility = 'visible';
               activeContent.classList.add('active');
               
               // 오디오 탭인 경우에만 오디오 섹션 표시
               if (tabName === 'audio') {
                   activeContent.querySelectorAll('.audio-section').forEach(audioSection => {
                       audioSection.style.display = 'block';
                       audioSection.style.visibility = 'visible';
                   });
               }
               
               // 음악 탭인 경우에만 음악 섹션 표시
               if (tabName === 'music') {
                   activeContent.querySelectorAll('.music-ost-section').forEach(musicSection => {
                       musicSection.style.display = 'block';
                       musicSection.style.visibility = 'visible';
                   });
               }
               
               // 디버깅: 활성 탭의 오디오 섹션 확인
               const audioSections = activeContent.querySelectorAll('.audio-section');
               console.log(`✅ ${tabName} 탭 활성화 완료. 오디오 섹션 수: ${audioSections.length}`);
           }, 10);
       }
       
       if (shotId) {
           localStorage.setItem(`shot_${shotId}_activeTab`, tabName);
       }
   } catch (error) {
       console.error('탭 전환 오류:', error);
       showMessage('탭 전환 중 오류가 발생했습니다.', 'error');
   }
       }
       
       // 탭 컨텐츠 디버깅 함수
       window.debugTabContent = function() {
   console.log('===== 탭 컨텐츠 디버깅 시작 =====');
   const tabs = document.querySelectorAll('.tab-content');
   
   tabs.forEach(tab => {
       const audioSections = tab.querySelectorAll('.audio-section');
       const musicSections = tab.querySelectorAll('.music-ost-section');
       const narrationElements = tab.querySelectorAll('[class*="narration"]');
       const soundEffectElements = tab.querySelectorAll('[class*="sound-effect"]');
       const allTextContaining = Array.from(tab.querySelectorAll('*')).filter(el => 
           el.textContent.includes('나레이션 오디오') || 
           el.textContent.includes('음향 효과') ||
           el.textContent.includes('📖 나레이션') ||
           el.textContent.includes('🔊 음향') ||
           el.textContent.includes('메인 OST') ||
           el.textContent.includes('서브 OST') ||
           el.textContent.includes('🎼') ||
           el.textContent.includes('🎵') ||
           el.textContent.includes('🎶')
       );
       
       console.log(`
📋 탭: ${tab.id}
- display: ${window.getComputedStyle(tab).display}
- visibility: ${window.getComputedStyle(tab).visibility}
- active 클래스: ${tab.classList.contains('active')}
- 오디오 섹션 수: ${audioSections.length}
- 음악 섹션 수: ${musicSections.length}
- 나레이션 요소 수: ${narrationElements.length}
- 음향효과 요소 수: ${soundEffectElements.length}
- 음악/오디오 텍스트 포함 요소: ${allTextContaining.length}
       `);
       
       // 오디오 섹션이 잘못된 탭에 있는지 확인
       if (tab.id !== 'tab-audio' && audioSections.length > 0) {
           console.error(`❌ 오류: ${tab.id}에 오디오 섹션이 발견됨!`);
           audioSections.forEach((section, i) => {
               console.log(`  - 오디오 섹션 ${i+1}:`, section);
               console.log(`    HTML:`, section.outerHTML.substring(0, 200) + '...');
           });
       }
       
       // 음악 섹션이 잘못된 탭에 있는지 확인
       if (tab.id !== 'tab-music' && musicSections.length > 0) {
           console.error(`❌ 오류: ${tab.id}에 음악 섹션이 발견됨!`);
           musicSections.forEach((section, i) => {
               console.log(`  - 음악 섹션 ${i+1}:`, section);
               console.log(`    HTML:`, section.outerHTML.substring(0, 200) + '...');
           });
       }
       
       // 나레이션/음향/음악 텍스트가 잘못된 탭에 있는지 확인
       if (tab.id !== 'tab-audio' && tab.id !== 'tab-info' && tab.id !== 'tab-music' && allTextContaining.length > 0) {
           console.error(`❌ 오류: ${tab.id}에 오디오/음악 관련 텍스트 발견!`);
           allTextContaining.slice(0, 3).forEach((el, i) => {
               console.log(`  - 요소 ${i+1}:`, el.tagName, el.className);
               console.log(`    텍스트:`, el.textContent.substring(0, 100) + '...');
           });
       }
   });
   
   console.log('===== 탭 컨텐츠 디버깅 종료 =====');
   return '디버깅 완료 - 콘솔 확인';
       };

     // 샷 정보 탭 생성
function createShotInfoTab(shot) {
    const originalScenario = shot.original_scenario || {};
    
    return `
        <div class="info-section">
            <h3>기본 정보</h3>
            <table class="info-table">
                <tr><th>ID</th><td>${shot.id}</td></tr>
                <tr><th>제목</th><td>${shot.title}</td></tr>
                <tr><th>소속 씬</th><td>${shot.scene_id || '-'}</td></tr>
                <tr><th>샷 유형</th><td>${shot.shot_type || '-'}</td></tr>
                <tr><th>설명</th><td>${shot.description || '-'}</td></tr>
                <tr><th>예상 길이</th><td>${shot.other_info?.estimated_duration || '-'}초</td></tr>
            </table>
        </div>
        
        ${originalScenario.text ? `
        <div class="info-section original-scenario-section">
            <h4>📜 원본 시나리오</h4>
            <div class="scenario-text">${originalScenario.text || ''}</div>
            <div class="scenario-metadata">
                ${originalScenario.scene_number ? `장면 번호: ${originalScenario.scene_number}` : ''}
                ${originalScenario.location ? ` | 장소: ${originalScenario.location}` : ''}
                ${originalScenario.time ? ` | 시간: ${originalScenario.time}` : ''}
            </div>
        </div>` : ''}
        
        <div class="info-section">
            <h3>메모</h3>
            <textarea class="form-textarea" placeholder="이 샷에 대한 메모..." onchange="updateShotMemo('${shot.id}', this.value)">${getShotMemo(shot.id)}</textarea>
            <small style="color:#666;font-size:0.85rem;">메모는 자동으로 저장됩니다.</small>
        </div>
        
        ${shot.visual_consistency_info ? `
        <div class="info-section">
            <h3>비주얼 일관성 정보</h3>
            <table class="info-table">
                <tr><th>장소 ID</th><td>${shot.visual_consistency_info.location_id || '-'}</td></tr>
                <tr><th>캐릭터 ID</th><td>${(shot.visual_consistency_info.character_ids || []).join(', ') || '-'}</td></tr>
                <tr><th>소품 ID</th><td>${(shot.visual_consistency_info.prop_ids || []).join(', ') || '-'}</td></tr>
            </table>
        </div>` : ''}
        
        ${shot.camera_framing ? `
        <div class="info-section">
            <h3>카메라 정보</h3>
            <table class="info-table">
                <tr><th>프레이밍</th><td>${shot.camera_framing.framing || '-'}</td></tr>
                <tr><th>앵글</th><td>${shot.camera_framing.angle || '-'}</td></tr>
                <tr><th>시점 방향</th><td>${shot.camera_framing.view_direction || '-'}</td></tr>
                <tr><th>구도</th><td>${shot.camera_framing.composition || '-'}</td></tr>
            </table>
        </div>` : ''}
        
        ${shot.content ? `
        <div class="info-section">
            <h3>콘텐츠</h3>
            <table class="info-table">
                <tr><th>액션</th><td>${shot.content.action || '-'}</td></tr>
                <tr><th>음향 효과</th><td>${shot.content.sound_effects || '-'}</td></tr>
                <tr><th>나레이션</th><td>${shot.content.narration || '-'}</td></tr>
            </table>
        </div>` : ''}`;
}

       // 샷 이미지 탭 생성 (이미지 설계 플랜 방식)

	function createShotImageTab(shot) {
    console.log('🖼️ createShotImageTab 시작 (이미지별 프롬프트 표시)');
    try {
const imageDesign = shot.image_design || {};
const imageDesignPlans = imageDesign.plans || {};
const selectedPlan = imageDesign.selected_plan || 'A';
const complexity = imageDesign.complexity || 'complex';
const aiGeneratedImages = imageDesign.ai_generated_images || {};
const referenceImagesData = shot.reference_images || [];

// Stage 6 데이터에서 이미지별 프롬프트 가져오기
const stage6Data = window.stage6ImagePrompts || {};
const shotStage6Data = stage6Data[shot.id] || {};

let planSelectorHtml = '';
let selectedPlanData = null;

// Simple 샷인 경우
if (complexity === 'simple' && imageDesignPlans.single) {
    selectedPlanData = imageDesignPlans.single;
    planSelectorHtml = `
        <div class="image-design-plan-selector">
            <h4>🎨 이미지 설계 (Simple - 단일 이미지)</h4>
            <div class="plan-info">
                <h5>${selectedPlanData.description || '단일 이미지로 표현'}</h5>
                <div class="plan-metadata">
                    <span>이미지 수: ${selectedPlanData.images?.length || 1}개</span>
                </div>
            </div>
        </div>
    `;
} 
// Complex 샷인 경우
else {
    selectedPlanData = imageDesignPlans[selectedPlan] || imageDesignPlans.A || {};
    planSelectorHtml = `
        <div class="image-design-plan-selector">
            <h4>🎨 이미지 설계 플랜 선택</h4>
            <div class="plan-tabs">
                ${['A', 'B', 'C'].map(planId => {
                    const plan = imageDesignPlans[planId];
                    if (!plan) return '';
                    return `
                        <div class="plan-tab ${selectedPlan === planId ? 'active' : ''}" 
                             onclick="selectImagePlan('${shot.id}', '${planId}')">
                            Plan ${planId} - ${plan.description || '설명 없음'}
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${['A', 'B', 'C'].map(planId => {
                const plan = imageDesignPlans[planId];
                if (!plan) return '';
                const isActive = selectedPlan === planId;
                return `
                    <div class="plan-content ${isActive ? 'active' : ''}" 
                         id="plan-content-${planId}" 
                         style="display: ${isActive ? 'block' : 'none'};">
                        <div class="plan-info">
                            <h5>Plan ${planId}: ${plan.description || '설명 없음'}</h5>
                            <div class="plan-metadata">
                                <span>이미지 수: ${plan.images?.length || 0}개</span>
                            </div>
                            ${plan.images && plan.images.length > 0 ? `
                                <div style="margin-top: 15px;">
                                    <h6>이미지 구성:</h6>
                                    ${plan.images.map((img, idx) => `
                                        <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                            <strong>${img.id}:</strong> ${img.description || '설명 없음'}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p style="color: #999;">이미지 정보가 없습니다.</p>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// AI별 프롬프트 및 생성된 이미지 섹션
const imageAIs = [
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'ideogram', name: 'Ideogram' },
    { id: 'leonardo', name: 'Leonardo' },
    { id: 'imagefx', name: 'Image-Fx' },
			{ id: 'openart', name: 'OpenArt' }
];

let aiSectionsHtml = '';

   // 선택된 플랜의 이미지들에 대해 처리
			if (selectedPlanData && selectedPlanData.images) {
				// AI별로 그룹화
				imageAIs.forEach(ai => {
					let aiHasContent = false;
					let aiContentHtml = '';

					selectedPlanData.images.forEach((planImage, imgIdx) => {
						const imageId = planImage.id;
						const imageStage6Data = shotStage6Data[imageId] || {};
						const imagePrompts = imageStage6Data.prompts?.[ai.id] || {};
						const hasPrompt = imagePrompts.prompt || imagePrompts.main_prompt;

						//if (!hasPrompt) return;

						aiHasContent = true;
						let mainPrompt = imagePrompts.prompt || imagePrompts.main_prompt || '';
						let translatedPrompt = imagePrompts.prompt_translated || imagePrompts.main_prompt_translated || '';
						let parameters = imagePrompts.parameters || '';
						
						// 수정된 프롬프트가 있는지 확인
						const editedPrompt = getEditedPrompt(shot.id, ai.name, imageId);
						if (editedPrompt) {
							mainPrompt = editedPrompt.originalPrompt || mainPrompt;
							translatedPrompt = editedPrompt.translatedPrompt || translatedPrompt;
							parameters = editedPrompt.parameters || parameters;
						}

						// AI별 생성된 이미지 데이터
						const imageData = aiGeneratedImages[ai.id]?.[imageId] || { url: '', description: '' };

						aiContentHtml += `
							<div style="margin-bottom: 30px; padding: 15px; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px;">
								<h5 style="color: #ccc; margin-bottom: 10px;">📸 ${imageId}: ${planImage.description || '설명 없음'} ${editedPrompt ? '<span style="background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">수정됨</span>' : ''}</h5>
								<div class="ai-image-prompt-details">
									<div class="prompt-original">
										<label class="prompt-text-label">프롬프트:</label>
										<div class="ai-image-prompt-full-text">${mainPrompt}</div>
									</div>
									${translatedPrompt ? `
										<div class="prompt-translated">
											<label class="prompt-text-label">번역:</label>
											<div class="ai-image-prompt-full-text">${translatedPrompt}</div>
										</div>
									` : ''}
									${parameters ? `<div style="margin-top: 5px; font-size: 0.9em; color: #666;">Parameters: ${parameters}</div>` : ''}
									<button class="copy-btn" onclick="copyImagePrompt('${mainPrompt.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${ai.name}', '${imageId}')">
										프롬프트 복사
									</button>
									<button class="edit-btn" onclick="editImagePrompt('${shot.id}', '${ai.name}', '${imageId}', '${mainPrompt.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${(translatedPrompt || '').replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${(parameters || '').replace(/'/g, "\\'").replace(/"/g, '\\"')}')" style="margin-left: 8px;">
										프롬프트 수정
									</button>
									<button class="ai-edit-btn" onclick="aiEditImagePrompt('${shot.id}', '${ai.name}', '${imageId}', '${mainPrompt.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" style="margin-left: 8px; background-color: #8b5cf6;">
										AI 수정
									</button>
								</div>

								<div style="margin-top: 15px;">
									<h6>생성된 이미지</h6>
									<div class="image-slot-card">
										<div class="image-slot-preview">
											${imageData.url ? 
												`<img src="${imageData.url}" alt="${ai.name} - ${imageId}" 
												style="cursor: pointer;" 
												onclick="openImageModal('${imageData.url}')"
												onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#999;font-size:0.8rem;&quot;>로드 실패</div>';">` :
												`<div style="color:#ccc;font-size:0.8rem;">URL 입력</div>`
											}
										</div>
										<div class="form-group">
											<label class="form-label">URL:</label>
											<div style="display: flex; gap: 8px; align-items: center;">
												<input type="text" class="form-input" 
													   value="${imageData.url || ''}" 
													   placeholder="${ai.name} URL" 
													   onchange="updateImageUrl('${shot.id}', '${ai.id}', '${imageId}', this.value)"
													   style="flex: 1;">
												<button type="button" class="btn btn-secondary btn-small" 
														onclick="uploadImageForShot('${shot.id}', '${ai.id}', '${imageId}')" 
														title="로컬 파일 업로드">
													📁 파일 업로드
												</button>
											</div>
										</div>
										<div class="form-group">
											<label class="form-label">설명:</label>
											<textarea class="form-textarea" 
													  placeholder="${ai.name} 설명" 
													  onchange="updateImageDescription('${shot.id}', '${ai.id}', '${imageId}', this.value)">${imageData.description || ''}</textarea>
										</div>
									</div>
								</div>
							</div>
						`;
					});

					if (aiHasContent) {
						aiSectionsHtml += `
							<div class="ai-image-section ${ai.id}" style="margin-bottom: 40px;">
								<div class="ai-card-header">${ai.name}</div>
								${aiContentHtml}
							</div>
						`;
					}
				});
			}

// 참조 이미지 섹션
let referenceSlotsHtml = '';
for (let i = 0; i < 3; i++) {
    const refData = referenceImagesData[i] || { url: '', description: '', type: 'composition' };
    const uniqueRefId = `${shot.id}-ref${i}`;
    referenceSlotsHtml += `
        <div class="reference-image-slot">
            <div class="reference-preview" id="ref-preview-${uniqueRefId}">
                ${refData.url ? 
                    `<img src="${refData.url}" alt="참조 ${i+1}" style="cursor: pointer;" onclick="openImageModal('${refData.url}')">` : 
                    `<div style="color:#ccc;font-size:0.8rem;">참조 ${i+1} URL</div>`
                }
            </div>
            <div class="form-group">
                <label class="form-label">URL:</label>
                <input type="text" class="form-input" 
                       value="${refData.url || ''}" 
                       placeholder="참조 ${i+1} URL" 
                       onchange="updateReferenceImage('${shot.id}', ${i}, 'url', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">설명:</label>
                <textarea class="form-textarea" 
                          onchange="updateReferenceImage('${shot.id}', ${i}, 'description', this.value)">${refData.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">유형:</label>
                <select class="form-select" 
                        onchange="updateReferenceImage('${shot.id}', ${i}, 'type', this.value)">
                    <option value="composition" ${refData.type === 'composition' ? 'selected' : ''}>구도</option>
                    <option value="style" ${refData.type === 'style' ? 'selected' : ''}>스타일</option>
                    <option value="lighting" ${refData.type === 'lighting' ? 'selected' : ''}>조명</option>
                    <option value="mood" ${refData.type === 'mood' ? 'selected' : ''}>분위기</option>
                </select>
            </div>
        </div>`;
}

return `
    ${planSelectorHtml}
    <div class="info-section">
        <h3>🎨 AI 이미지 생성 및 관리</h3>
        <p style="font-size:0.9em;color:#ccc;margin-bottom:20px;">
            각 이미지별로 AI 도구의 프롬프트를 확인하고 생성된 이미지를 관리하세요.
        </p>
        ${aiSectionsHtml || '<p style="color:#ccc;">프롬프트 데이터가 없습니다.</p>'}
    </div>
    <div class="info-section reference-image-slots-container">
        <h3>🖼️ 참조 이미지</h3>
        <div class="reference-image-slots-grid">${referenceSlotsHtml}</div>
    </div>`;
    
    } catch (error) {
console.error('❌ createShotImageTab 오류:', error);
return `<div class="info-section"><h3>이미지 탭 로드 오류</h3><p>${error.message}</p></div>`;
    }
}	

    // 이미지 플랜 선택 함수
    function selectImagePlan(shotId, planId) {
    try {
const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');

if (!shot.image_design) shot.image_design = {};
shot.image_design.selected_plan = planId; // 이제 'A', 'B', 'C'가 들어옴

saveDataToLocalStorage();
showShotContent(shotId); // 전체 재렌더링
setTimeout(() => switchTab('image', shotId), 0); // 이미지 탭 유지

showMessage(`Plan ${planId}이(가) 선택되었습니다.`, 'success');
    } catch (error) {
showMessage('이미지 플랜 선택 중 오류가 발생했습니다.', 'error');
    }
}
    // AI 이미지 프롬프트 복사
    function copyImageAIPrompt(fullPrompt, aiName) {
const actualFullPrompt = fullPrompt.replace(/\\n/g, "\n");
if (!actualFullPrompt || actualFullPrompt.trim() === '프롬프트가 없습니다.') {
    return showMessage(`${aiName} 프롬프트가 비어 있어 복사할 수 없습니다.`, 'warning');
}
copyToClipboard(actualFullPrompt).then(ok => {
    if (ok) showMessage(`${aiName} 전체 프롬프트가 복사되었습니다.`, 'success');
});
    }

    // AI별 생성 이미지 URL 업데이트
    function updateAIGeneratedImageUrl(shotId, aiType, imageIndex, newUrl) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    if (!shot.image_design) shot.image_design = { aspect_ratio: "16:9", selected_plan: "plan_a" };
    if (!shot.image_design.ai_generated_images) shot.image_design.ai_generated_images = {};
    if (!shot.image_design.ai_generated_images[aiType]) {
        shot.image_design.ai_generated_images[aiType] = [
            { url: '', description: '' },
            { url: '', description: '' },
            { url: '', description: '' }
        ];
    }
    
    if (imageIndex < 3) {
        shot.image_design.ai_generated_images[aiType][imageIndex].url = newUrl;
    }
    
    saveDataToLocalStorage();
    
    // UI 업데이트
    const uid = `${shotId}-${aiType}-img${imageIndex}`;
    const preview = document.getElementById(`slot-preview-${uid}`);
    const viewBtn = document.querySelector(`#slot-card-${uid} .image-slot-actions button`);
    
    if (preview) {
        if (newUrl) {
          preview.innerHTML = `<img src="${newUrl}" alt="${aiType} ${imageIndex+1}" style="cursor: pointer;" onclick="openImageModal('${newUrl}')" onerror="(function(event){this.style.display='none';this.parentElement.innerHTML='<div style=&quot;color:#999;font-size:0.8rem;&quot;>로드 실패</div>';}).call(this, event)">`;
            if (viewBtn) viewBtn.disabled = false;
        } else {
            preview.innerHTML = `<div style="color:#ccc;font-size:0.8rem;">URL 입력</div>`;
            if (viewBtn) viewBtn.disabled = true;
        }
    }
} catch (e) {
    showMessage('URL 업데이트 중 오류가 발생했습니다.', 'error');
}
    }

    // AI별 생성 이미지 설명 업데이트
    function updateAIGeneratedImageDescription(shotId, aiType, imageIndex, newDescription) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    if (!shot.image_design) shot.image_design = { aspect_ratio: "16:9", selected_plan: "plan_a" };
    if (!shot.image_design.ai_generated_images) shot.image_design.ai_generated_images = {};
    if (!shot.image_design.ai_generated_images[aiType]) {
        shot.image_design.ai_generated_images[aiType] = [
            { url: '', description: '' },
            { url: '', description: '' },
            { url: '', description: '' }
        ];
    }
    
    if (imageIndex < 3) {
        shot.image_design.ai_generated_images[aiType][imageIndex].description = newDescription;
        saveDataToLocalStorage();
    }
} catch (e) {
    showMessage('설명 업데이트 중 오류가 발생했습니다.', 'error');
}
    }
    
    // 드롭박스 URL을 raw 형식으로 변환하는 함수
    function convertDropboxUrl(url) {
        if (!url) return url;
        
        // 드롭박스 URL인지 확인
        if (url.includes('dropbox.com')) {
            // dl=0을 raw=1로 변경
            if (url.includes('dl=0')) {
                return url.replace('dl=0', 'raw=1');
            }
            // dl 파라미터가 없으면 raw=1 추가
            else if (!url.includes('dl=') && !url.includes('raw=')) {
                const separator = url.includes('?') ? '&' : '?';
                return url + separator + 'raw=1';
            }
        }
        
        return url;
    }
    
    // 이미지별 URL 업데이트 (새로운 구조)
	function updateImageUrl(shotId, aiType, imageId, newUrl) {
		try {
			const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
			if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');

			// 드롭박스 URL 자동 변환
			const processedUrl = convertDropboxUrl(newUrl);

			if (!shot.image_design) shot.image_design = {};
			if (!shot.image_design.ai_generated_images) shot.image_design.ai_generated_images = {};
			if (!shot.image_design.ai_generated_images[aiType]) {
				shot.image_design.ai_generated_images[aiType] = {};
			}

			// 이미지 ID별로 저장
			if (!shot.image_design.ai_generated_images[aiType][imageId]) {
				shot.image_design.ai_generated_images[aiType][imageId] = { url: '', description: '' };
			}

			shot.image_design.ai_generated_images[aiType][imageId].url = processedUrl;
			saveDataToLocalStorage();

			// 미리보기 업데이트 - ID 기반으로 찾기
			updateImagePreview(shotId, aiType, imageId, processedUrl);
		} catch (e) {
			showMessage('URL 업데이트 중 오류가 발생했습니다.', 'error');
		}
	}

	// 이미지 미리보기 업데이트 함수
	function updateImagePreview(shotId, aiType, imageId, newUrl) {
		try {
			// 해당 이미지 슬롯의 미리보기 영역을 찾기
			const inputElement = document.querySelector(`input[onchange*="updateImageUrl('${shotId}', '${aiType}', '${imageId}',"]`);
			if (!inputElement) {
				return;
			}
			
			const card = inputElement.closest('.image-slot-card');
			if (!card) {
				return;
			}
			
			const preview = card.querySelector('.image-slot-preview');
			if (!preview) {
				return;
			}
			
			if (newUrl && newUrl.trim() !== '') {
				// blob URL 감지 및 경고
				if (newUrl.startsWith('blob:')) {
					preview.innerHTML = `<div style="color:#ff9800;font-size:0.8rem;">임시 이미지 - 다시 업로드해주세요</div>`;
				} else {
					preview.innerHTML = `<img src="${newUrl}" alt="${aiType} - ${imageId}" 
					style="cursor: pointer;" 
					onclick="openImageModal('${newUrl}')"
					onerror="(function(event){this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#999;font-size:0.8rem;&quot;>로드 실패</div>';}).call(this, event)">`;
				}
			} else {
				preview.innerHTML = `<div style="color:#ccc;font-size:0.8rem;">URL 입력</div>`;
			}
		} catch (e) {
		}
	}

	// 이미지 리사이징 함수
	function resizeImage(file, maxWidth, maxHeight, quality = 0.85) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = function(event) {
				const img = new Image();
				img.onload = function() {
					// 캔버스 생성
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					
					// 비율 유지하며 크기 계산
					let width = img.width;
					let height = img.height;
					
					if (width > maxWidth || height > maxHeight) {
						const ratio = Math.min(maxWidth / width, maxHeight / height);
						width = Math.floor(width * ratio);
						height = Math.floor(height * ratio);
					}
					
					canvas.width = width;
					canvas.height = height;
					
					// 이미지 그리기
					ctx.drawImage(img, 0, 0, width, height);
					
					// base64로 변환 (JPEG로 압축)
					canvas.toBlob((blob) => {
						if (!blob) {
							reject(new Error('이미지 변환 실패'));
							return;
						}
						const reader = new FileReader();
						reader.onloadend = () => resolve(reader.result);
						reader.onerror = reject;
						reader.readAsDataURL(blob);
					}, 'image/jpeg', quality);
				};
				img.onerror = () => reject(new Error('이미지 로드 실패'));
				img.src = event.target.result;
			};
			reader.onerror = () => reject(new Error('파일 읽기 실패'));
			reader.readAsDataURL(file);
		});
	}

	// 로컬 이미지 파일 업로드 함수
	function uploadImageForShot(shotId, aiType, imageId) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.style.display = 'none';
		
		input.onchange = async function(e) {
			const file = e.target.files[0];
			if (!file) return;
			
			try {
				// 파일 크기 확인
				const fileSizeMB = file.size / 1024 / 1024;
				
				if (fileSizeMB > 10) {
					showMessage('파일 크기가 큽니다. 리사이징을 진행합니다...', 'info');
				}
				
				// 이미지 리사이징 (최대 1200x1200, 품질 0.85)
				const resizedDataUrl = await resizeImage(file, 1200, 1200, 0.85);
				
				// 리사이징된 크기 확인
				const resizedSize = (resizedDataUrl.length * 0.75) / 1024 / 1024; // 대략적인 MB 계산
				
				// 데이터 저장
				const shot = currentData?.breakdown_data?.shots?.find(s => s.id === shotId);
				if (!shot) {
					return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
				}

				if (!shot.image_design) shot.image_design = {};
				if (!shot.image_design.ai_generated_images) shot.image_design.ai_generated_images = {};
				if (!shot.image_design.ai_generated_images[aiType]) {
					shot.image_design.ai_generated_images[aiType] = {};
				}
				if (!shot.image_design.ai_generated_images[aiType][imageId]) {
					shot.image_design.ai_generated_images[aiType][imageId] = { url: '', description: '' };
				}

				shot.image_design.ai_generated_images[aiType][imageId].url = resizedDataUrl;
				
				// localStorage 저장 시도
				try {
					saveDataToLocalStorage();
					showMessage('이미지가 성공적으로 저장되었습니다.', 'success');
				} catch (saveError) {
					if (saveError.name === 'QuotaExceededError') {
						showMessage('저장 공간이 부족합니다. 이미지 품질을 낮춰서 다시 시도하거나 기존 데이터를 정리해주세요.', 'error');
					} else {
						showMessage('저장 중 오류가 발생했습니다.', 'error');
					}
				}

				// UI 업데이트
				const inputElement = document.querySelector(`input[onchange*="updateImageUrl('${shotId}', '${aiType}', '${imageId}',"]`);
				if (inputElement) {
					inputElement.value = resizedDataUrl;
				}
				
				updateImagePreview(shotId, aiType, imageId, resizedDataUrl);
				
			} catch (error) {
				showMessage('이미지 처리 중 오류가 발생했습니다: ' + error.message, 'error');
			}
			
			// input 요소 정리
			document.body.removeChild(input);
		};
		
		input.oncancel = function() {
			document.body.removeChild(input);
		};
		
		document.body.appendChild(input);
		input.click();
	}

	// 이미지별 설명 업데이트 (새로운 구조)
	function updateImageDescription(shotId, aiType, imageId, newDescription) {
		try {
			const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
			if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');

			if (!shot.image_design) shot.image_design = {};
			if (!shot.image_design.ai_generated_images) shot.image_design.ai_generated_images = {};
			if (!shot.image_design.ai_generated_images[aiType]) {
				shot.image_design.ai_generated_images[aiType] = {};
			}

			if (!shot.image_design.ai_generated_images[aiType][imageId]) {
				shot.image_design.ai_generated_images[aiType][imageId] = { url: '', description: '' };
			}

			shot.image_design.ai_generated_images[aiType][imageId].description = newDescription;
			saveDataToLocalStorage();
		} catch (e) {
			showMessage('설명 업데이트 중 오류가 발생했습니다.', 'error');
		}
	}

	// 이미지 프롬프트 복사 (이미지 ID 포함)
	function copyImagePrompt(prompt, aiName, imageId) {
		if (!prompt || prompt.trim() === '') {
			return showMessage(`${aiName} 프롬프트가 비어 있습니다.`, 'warning');
		}
		copyToClipboard(prompt).then(ok => {
			if (ok) showMessage(`${aiName} 프롬프트 (${imageId})가 복사되었습니다.`, 'success');
		});
	}

    // 참조 이미지 업데이트
    function updateReferenceImage(shotId, refIndex, field, value) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    if (!shot.reference_images) shot.reference_images = [];
    
    while (shot.reference_images.length <= refIndex) {
        shot.reference_images.push({
            id: `ref_img_${shot.reference_images.length + 1}_${shotId}`,
            url: '',
            description: '',
            type: 'composition'
        });
    }
    
    // URL 필드인 경우 드롭박스 URL 변환
    if (field === 'url') {
        value = convertDropboxUrl(value);
    }
    
    shot.reference_images[refIndex][field] = value;
    if (!shot.reference_images[refIndex].id) {
        shot.reference_images[refIndex].id = `ref_img_${refIndex + 1}_${shotId}`;
    }
    
    saveDataToLocalStorage();
    
    if (field === 'url') {
        const uid = `${shotId}-ref${refIndex}`;
        const preview = document.getElementById(`ref-preview-${uid}`);
        if (preview) {
            if (value) {
             preview.innerHTML = `<img src="${value}" alt="참조 ${refIndex+1}" style="cursor: pointer;" onclick="openImageModal('${value}')" onerror="(function(event){this.style.display='none';this.parentElement.innerHTML='<div style=&quot;color:#999;font-size:0.8rem;&quot;>로드 실패</div>';}).call(this, event)">`;
            } else {
                preview.innerHTML = `<div style="color:#ccc;font-size:0.8rem;">참조 ${refIndex+1} URL</div>`;
            }
        }
    }
} catch (e) {
    showMessage('참조 이미지 업데이트 중 오류가 발생했습니다.', 'error');
}
    }

    // 참조 이미지 슬롯 비우기
    function clearReferenceImageSlot(shotId, refIndex) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (shot && shot.reference_images && shot.reference_images[refIndex]) {
        shot.reference_images[refIndex] = {
            id: `ref_img_${refIndex + 1}_${shotId}`,
            url: '',
            description: '',
            type: 'composition'
        };
        saveDataToLocalStorage();
    }
    
    const uid = `${shotId}-ref${refIndex}`;
    const urlInput = document.getElementById(`ref-url-${uid}`);
    const descInput = document.getElementById(`ref-desc-${uid}`);
    const typeSelect = document.getElementById(`ref-type-${uid}`);
    const preview = document.getElementById(`ref-preview-${uid}`);
    
    if (urlInput) urlInput.value = '';
    if (descInput) descInput.value = '';
    if (typeSelect) typeSelect.value = 'composition';
    if (preview) preview.innerHTML = `<div style="color:#ccc;font-size:0.8rem;">참조 ${refIndex+1} URL</div>`;
    
    showMessage(`참조 이미지 슬롯 ${refIndex+1}이 비워졌습니다.`, 'success');
} catch (e) {
    showMessage('참조 슬롯을 비우는 중 오류가 발생했습니다.', 'error');
}
    }

    // 이미지 크게 보기 모달
    function openImageModal(imageUrl) {
const modal = document.getElementById('imageDisplayModal');
const modalImg = document.getElementById('modalImageContent');

if (modal && modalImg && imageUrl && imageUrl.trim() !== '') {
    modalImg.src = imageUrl;
    modal.style.display = "flex";
} else if (!imageUrl || imageUrl.trim() === '') {
    showMessage('이미지 URL이 없어 크게 볼 수 없습니다.', 'warning');
}
    }

    function closeImageModal(event) {
const modal = document.getElementById('imageDisplayModal');
if (modal && (
    (event && event.target === modal) ||
    (event && event.target.classList.contains('image-modal-close')) ||
    !event
)) {
    modal.style.display = "none";
    document.getElementById('modalImageContent').src = "";
}
    }

    // 샷 영상 탭 생성 (추출된 이미지 정보 포함)
    function createShotVideoTab(shot) {
    console.log('🎥 createShotVideoTab 시작 (이미지별 영상 프롬프트 표시)');
    try {
const imageDesign = shot.image_design || {};
		const imageDesignPlans = imageDesign.plans || {};

		// 영상 탭에서 선택된 플랜 확인 (없으면 이미지 탭의 선택 사용)
		const videoSelectedPlan = window.videoTabSelectedPlans?.[shot.id];
		const selectedPlan = videoSelectedPlan || imageDesign.selected_plan || 'A';

		const complexity = imageDesign.complexity || 'complex';
		const videoPrompts = shot.video_prompts || {};
		const videoUrls = shot.video_urls || {};

let planSelectorHtml = '';
let selectedPlanData = null;

// Simple 샷인 경우
if (complexity === 'simple' && imageDesignPlans.single) {
    selectedPlanData = imageDesignPlans.single;
    planSelectorHtml = `
        <div class="image-design-plan-selector">
            <h4>🎬 영상 설계 (Simple - 단일 이미지)</h4>
            <div class="plan-info">
                <h5>${selectedPlanData.description || '단일 이미지로 표현'}</h5>
                <div class="plan-metadata">
                    <span>이미지 수: ${selectedPlanData.images?.length || 1}개</span>
                </div>
            </div>
        </div>
    `;
} 
// Complex 샷인 경우
else {
    selectedPlanData = imageDesignPlans[selectedPlan] || imageDesignPlans.A || {};
    planSelectorHtml = `
        <div class="image-design-plan-selector">
            <h4>🎬 영상 설계 플랜 선택</h4>
            <div class="plan-tabs">
                ${['A', 'B', 'C'].map(planId => {
                    const plan = imageDesignPlans[planId];
                    if (!plan) return '';
                    return `
                        <div class="plan-tab ${selectedPlan === planId ? 'active' : ''}" 
                             onclick="selectVideoPlan('${shot.id}', '${planId}')">
                            <h5>플랜 ${planId}</h5>
                            <p>${plan.description || '설명 없음'}</p>
                            <span class="image-count">이미지 ${plan.images?.length || 0}개</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// AI별로 영상 프롬프트 그룹화하여 표시
let aiGroupedHtml = '';
if (selectedPlanData && selectedPlanData.images) {
			const aiTools = [
				{ id: 'luma', name: 'Luma AI', color: '#FF8C00' },
				{ id: 'kling', name: 'Kling AI', color: '#1E90FF' },
				{ id: 'veo2', name: 'Google Veo 2', color: '#9370DB' },
				{ id: 'runway', name: 'Runway ML', color: '#3CB371' }
			];

			aiGroupedHtml = '<div class="video-ai-container">';

			aiTools.forEach(ai => {
				let aiHasContent = false;
				let aiImagesHtml = '';

				selectedPlanData.images.forEach((image, index) => {
					const imageId = image.id || `IMG_${index + 1}`;
					const videoPromptsForImage = findVideoPromptsForImage(shot.id, imageId, videoPrompts);
					const promptData = videoPromptsForImage[ai.id];

					if (promptData) {
						aiHasContent = true;
						const prompt = promptData.prompt_en || promptData.main_prompt || '';
						const promptTranslated = promptData.prompt_translated || promptData.main_prompt_translated || '';
						const settings = promptData.settings || {};
						const url = videoUrls[`${ai.id}_${imageId}`] || '';

						aiImagesHtml += `
							<div class="ai-video-image-item" style="background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
								<h6 style="color: #ccc; margin-bottom: 10px;">📸 ${imageId}: ${image.description || '설명 없음'}</h6>
								<div class="prompt-section" style="margin-bottom: 10px;">
									<div class="prompt-text" style="background: #242424; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 10px; font-family: 'Courier New', monospace; font-size: 0.85rem; max-height: 120px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; line-height: 1.4; color: #e0e0e0;">${prompt || '프롬프트가 없습니다.'}</div>
									${promptTranslated ? `<div style="margin-top: 5px; font-size: 0.85rem; color: #999;">번역: ${promptTranslated}</div>` : ''}
									${Object.keys(settings).length > 0 ? `
										<div style="margin-top: 5px; font-size: 0.8rem; color: #999;">
											${Object.entries(settings).map(([key, value]) => `${key}: ${value}`).join(', ')}
										</div>
									` : ''}
									<button class="copy-btn btn-small" style="margin-top: 8px;" 
											onclick="copyVideoPrompt('${prompt.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n")}', '${ai.name}', '${imageId}')">
										프롬프트 복사
									</button>
								</div>
								<div class="video-url-section">
									<label style="font-size: 0.85rem; color: #ccc;">생성된 영상 URL:</label>
									<input type="url" class="form-input" style="font-size: 0.9rem;"
										   placeholder="영상 URL 입력" 
										   value="${url}"
										   onchange="updateVideoUrl('${shot.id}', '${ai.id}', '${imageId}', this.value)">
								</div>
								<div class="video-preview-section" style="margin-top: 10px;">
									<div id="video-preview-${shot.id}-${ai.id}-${imageId}" class="ai-video-preview">
										${(function(){
											if (!url) return `<div style="color:#ccc;font-size:0.85rem;">영상 미리보기</div>`;
											const videoUrl = processVideoUrl(url);
											if (videoUrl.includes('drive.google.com')) {
												return `<iframe style="max-width:100%;max-height:200px;border-radius:4px;border:none;" src="${videoUrl}" allowfullscreen onerror="console.error('Google Drive 비디오 로드 실패:', '${videoUrl}'); this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#ff6b6b;font-size:0.85rem;&quot;>Google Drive 영상 로드 실패<br><small>파일이 공개로 설정되어 있는지 확인하세요.</small></div>';"></iframe>`;
											} else {
												return `<video controls style="max-width:100%;max-height:200px;border-radius:4px;" src="${videoUrl}" onerror="console.error('비디오 로드 실패:', '${videoUrl}'); this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#ff6b6b;font-size:0.85rem;&quot;>영상 로드 실패<br><small>로컬 파일은 브라우저 보안 정책으로 인해 제한될 수 있습니다.</small></div>';"></video>`;
											}
										})()}
									</div>
								</div>
							</div>
						`;
					}
				});

				if (aiHasContent) {
					aiGroupedHtml += `
						<div class="ai-video-section" style="background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(255,255,255,0.05);">
							<div class="ai-section-header" style="font-size: 1.3rem; font-weight: 600; color: ${ai.color}; border-bottom: 2px solid ${ai.color}; padding-bottom: 10px; margin-bottom: 20px;">
								${ai.name}
							</div>
							${aiImagesHtml}
						</div>
					`;
				}
			});

			aiGroupedHtml += '</div>';
		}

return `
    <div class="info-section">
        <h3>🎬 AI 영상 생성 관리</h3>
        <p style="font-size:0.9em;color:#ccc;margin-bottom:20px;">
            AI 도구별로 각 이미지의 영상 프롬프트를 확인하고, 생성된 영상 URL을 입력하여 관리하세요.
        </p>
    </div>
    ${planSelectorHtml}
    ${aiGroupedHtml}
`;
    } catch (e) {
console.error('❌ createShotVideoTab 오류:', e);
return `<div class="info-section"><h3>영상 탭 로드 오류</h3><p>${e.message}</p></div>`;
    }
}

    // 샷 오디오 탭 생성 (dialogue_by_character 구조 대응)
    function createShotAudioTab(shot) {
console.log('🔊 createShotAudioTab 시작 (dialogue_by_character 구조)');
try {
    const audioUrls = shot.content?.audio_urls || {};
    const dialogueByCharacter = shot.content?.dialogue_by_character || {};
    const dialogueSequence = shot.content?.dialogue_sequence || [];
    const narration = shot.content?.narration || '';
    const narrationTranslated = shot.content?.narration_translated || '';
    const soundEffects = shot.content?.sound_effects || '';
    const soundEffectsEn = shot.content?.sound_effects_en || '';
    const audioPrompts = shot.audio_prompts || {};

    // 대화 오디오 섹션
    let dialogueContentHtml = '';
    let fullDialogueForCopy = '';
    
    if (dialogueSequence.length > 0) {
        // 원본 순서대로 대사 표시
        dialogueContentHtml = dialogueSequence.map(seq => {
            const character = seq.character;
            const lineData = dialogueByCharacter[character]?.lines[seq.line_index];
            if (lineData) {
                const displayText = `<strong>${character}:</strong> ${lineData.text || ''} <em>(감정: ${lineData.emotion || '-'})</em>`;
                fullDialogueForCopy += `${character}: ${lineData.text || ''} (감정: ${lineData.emotion || '-'})\\n`;
                return displayText;
            }
            return '';
        }).filter(text => text !== '').join('<br>');
    } else {
        dialogueContentHtml = '대화 내용이 없습니다.';
    }
    
    // Stage 8 audio_urls 구조 확인 및 처리

    // 캐릭터 선택 옵션 생성
    let characterOptionsHtml = Object.keys(dialogueByCharacter).map(charName => 
        `<option value="${charName}">${charName}</option>`
    ).join('');
    
    // TTS용 초기 표시 텍스트
    let initialTtsDialogueText = '';
    if (Object.keys(dialogueByCharacter).length > 0) {
        const firstChar = Object.keys(dialogueByCharacter)[0];
        const firstCharLines = dialogueByCharacter[firstChar]?.lines || [];
        initialTtsDialogueText = firstCharLines.map(line => line.text).join('\n');
    }

    const dialogueHtml = `
        <div class="audio-section">
            <h4>🎤 대화 오디오</h4>
            ${(function() {
                // Stage 8 구조 확인 (dialogue가 객체인 경우)
                if (audioUrls.dialogue && typeof audioUrls.dialogue === 'object') {
                    // 캐릭터별 오디오 URL 처리
                    let characterAudioHtml = '';
                    for (const [character, urls] of Object.entries(audioUrls.dialogue)) {
                        const url = Array.isArray(urls) ? urls[0] : urls; // 배열인 경우 첫 번째 URL 사용
                        characterAudioHtml += `
                            <div class="character-audio-section" style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                                <h5 style="margin: 0 0 10px 0;">${character}</h5>
                                <div class="audio-player-area">
                                    ${url ? 
                                        `<audio controls style="width: 100%;" src="${processAudioUrl(url)}"></audio>` :
                                        `<div style="color: #ccc;">오디오 URL 입력 대기</div>`
                                    }
                                </div>
                                <div class="form-group" style="margin-top: 10px;">
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="text" class="form-input" 
                                               value="${url || ''}" 
                                               placeholder="https://example.com/${character.replace(/\s/g, '_')}_dialogue.mp3" 
                                               onchange="updateCharacterAudioUrl('${shot.id}', '${character}', this.value)"
                                               onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
                                               style="flex: 1;">
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    return characterAudioHtml || '<div style="color: #999;">캐릭터별 오디오 URL 입력</div>';
                } else {
                    // 기존 구조 (단일 dialogue URL)
                    return `
                        <div class="audio-player-area">
                            ${audioUrls.dialogue && typeof audioUrls.dialogue === 'string' ? 
                                `<audio controls style="width: 100%;" src="${processAudioUrl(audioUrls.dialogue)}"></audio>` :
                                `<div style="color: #ccc;">대화 오디오 URL 입력</div>`
                            }
                        </div>
                        <div class="form-group">
                            <label class="form-label">대화 오디오 URL (전체 통합 파일)</label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="text" class="form-input" 
                                       value="${typeof audioUrls.dialogue === 'string' ? audioUrls.dialogue : ''}" 
                                       placeholder="https://example.com/dialogue.mp3" 
                                       onchange="updateAudioUrl('${shot.id}', 'dialogue', this.value)"
                                       onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
                                       style="flex: 1;">
                            </div>
                        </div>
                    `;
                }
            })()}
            </div>

            <div class="info-section" style="padding:15px; background-color:#1a1a1a;">
                <h5>대화 내용 (검토용)</h5>
                <div class="audio-content-display" style="min-height:80px; white-space:normal;">${dialogueContentHtml}</div>
                <button class="copy-btn btn-small" style="margin-top:5px;" 
                        onclick="copyToClipboard('${fullDialogueForCopy}').then(ok => ok && showMessage('전체 대화 내용이 복사되었습니다.', 'success'))">
                    전체 대화 내용 복사
                </button>
            </div>

            <div class="info-section" style="padding:15px; background-color:#1a1a1a; margin-top:15px;">
                <h5>TTS용 캐릭터별 대사</h5>
                <div class="form-group">
                    <label for="tts-char-select-${shot.id}" class="form-label">캐릭터 선택:</label>
                    <select id="tts-char-select-${shot.id}" class="form-select" 
                            onchange="updateTtsDialogueDisplay('${shot.id}')" 
                            ${Object.keys(dialogueByCharacter).length === 0 ? 'disabled' : ''}>
                        <option value="_all">전체 대사 (순서대로)</option>
                        ${characterOptionsHtml || '<option value="">선택할 캐릭터 없음</option>'}
                    </select>
                </div>
                <div class="audio-content-display" id="tts-dialogue-text-${shot.id}" style="min-height:60px;">
                    ${dialogueContentHtml}
                </div>
                <button class="copy-btn btn-small" style="margin-top:5px;" onclick="copyTtsDialogue('${shot.id}')">
                    선택한 대사 복사
                </button>
                ${audioPrompts.dialogue && Object.keys(audioPrompts.dialogue).length > 0 ? 
                    `<div style="margin-top:10px; padding:10px; background:#2a2a2a; border-radius:4px;">
                        <small style="color:#ccc;">참고: 캐릭터별 오디오 프롬프트가 존재합니다.</small>
                    </div>` : ''
                }
            </div>
        </div>
    `;

    // 나레이션 오디오 섹션
    const narrationForCopy = (narration || '').replace(/'/g, "&#39;").replace(/\n/g, "\\n");
    const narrationTranslatedForCopy = (narrationTranslated || '').replace(/'/g, "&#39;").replace(/\n/g, "\\n");

    const narrationHtml = `
        <div class="audio-section">
            <h4>📖 나레이션 오디오</h4>
            <div class="audio-player-area">
                ${audioUrls.narration ? 
                    `<audio controls style="width: 100%;" src="${processAudioUrl(audioUrls.narration)}"></audio>` : 
                    `<div style="color: #ccc;">나레이션 오디오 URL 입력</div>`
                }
            </div>
            <div class="form-group">
                <label class="form-label">나레이션 오디오 URL</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" class="form-input" value="${audioUrls.narration || ''}" 
                           placeholder="https://example.com/narration.mp3" 
                           onchange="updateAudioUrl('${shot.id}', 'narration', this.value)"
                           onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
                           style="flex: 1;">
                </div>
            </div>

            <div class="info-section" style="padding:15px; background-color:#1a1a1a;">
                <h5>나레이션 내용</h5>
                <div class="audio-content-display" style="min-height:60px;">${narration || '나레이션이 없습니다.'}</div>
                ${narrationTranslated ? `
                    <div style="margin-top:10px;">
                        <label style="font-weight:500;">번역된 나레이션:</label>
                        <div class="audio-content-display" style="min-height:40px;">${narrationTranslated}</div>
                    </div>
                ` : ''}
                <button class="copy-btn btn-small" style="margin-top:5px;" 
                        onclick="copyToClipboard('${narrationForCopy}').then(ok => ok && showMessage('나레이션이 복사되었습니다.', 'success'))">
                    나레이션 복사
                </button>
                ${narrationTranslated ? `
                    <button class="copy-btn btn-small" style="margin-top:5px; margin-left:5px;" 
                            onclick="copyToClipboard('${narrationTranslatedForCopy}').then(ok => ok && showMessage('번역된 나레이션이 복사되었습니다.', 'success'))">
                        번역본 복사
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // 음향 효과 섹션
    const soundEffectsForCopy = (soundEffects || '').replace(/'/g, "&#39;").replace(/\n/g, "\\n");
    const soundEffectsEnForCopy = (soundEffectsEn || '').replace(/'/g, "&#39;").replace(/\n/g, "\\n");

    const soundEffectsHtml = `
        <div class="audio-section">
            <h4>🔊 음향 효과</h4>
            <div class="audio-player-area">
                ${audioUrls.sound_effects ? 
                    `<audio controls style="width: 100%;" src="${processAudioUrl(audioUrls.sound_effects)}"></audio>` : 
                    `<div style="color: #ccc;">음향 효과 URL 입력</div>`
                }
            </div>
            <div class="form-group">
                <label class="form-label">음향 효과 URL</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" class="form-input" value="${audioUrls.sound_effects || ''}" 
                           placeholder="https://example.com/sound.mp3" 
                           onchange="updateAudioUrl('${shot.id}', 'sound_effects', this.value)"
                           onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
                           style="flex: 1;">
                </div>
            </div>
            ${soundEffects ? `
            <div class="form-group">
                <label class="form-label">음향 효과 설명</label>
                <div class="audio-content-display">${soundEffects}</div>
                ${soundEffectsEn ? `
                    <div style="margin-top:10px;">
                        <label style="font-weight:500;">영문 설명:</label>
                        <div class="audio-content-display">${soundEffectsEn}</div>
                    </div>
                ` : ''}
                <button class="copy-btn btn-small" style="margin-top:5px;" 
                        onclick="copyToClipboard('${soundEffectsForCopy}').then(ok => ok && showMessage('음향 설명이 복사되었습니다.', 'success'))">
                    한글 설명 복사
                </button>
                ${soundEffectsEn ? `
                    <button class="copy-btn btn-small" style="margin-top:5px; margin-left:5px;" 
                            onclick="copyToClipboard('${soundEffectsEnForCopy}').then(ok => ok && showMessage('영문 음향 설명이 복사되었습니다.', 'success'))">
                        영문 설명 복사
                    </button>
                ` : ''}
            </div>` : ''}
        </div>`;

    console.log('✅ createShotAudioTab 완료');
    return `${dialogueHtml}${narrationHtml}${soundEffectsHtml}`;
} catch (error) {
    console.error('❌ createShotAudioTab 오류:', error);
    return `<div class="info-section"><h3>오디오 탭 로드 오류</h3><p>오류: ${error.message}</p></div>`;
}
    }

    // 특정 이미지에 대한 영상 프롬프트 찾기
		function findVideoPromptsForImage(shotId, imageId, videoPrompts) {
		// Stage 7 형식의 영상 프롬프트 데이터가 있는 경우
		if (window.stage7VideoPrompts && window.stage7VideoPrompts[shotId]) {
			const imagePromptData = window.stage7VideoPrompts[shotId][imageId];
			if (imagePromptData && imagePromptData.prompts) {
				return imagePromptData.prompts;
			}
		}

		// Stage 7 데이터가 없으면 빈 객체 반환
		return {};
	 }

	// 이미지별 AI 카드 생성
	function createVideoAICards(shotId, imageId, videoPromptsForImage, videoUrls) {
		const aiTools = [
			{ id: 'luma', name: 'Luma AI' },
			{ id: 'kling', name: 'Kling AI' },
			{ id: 'veo2', name: 'Google Veo 2' },
			{ id: 'runway', name: 'Runway ML' }
		];

		return aiTools.map(ai => {
			const promptData = videoPromptsForImage[ai.id] || {};
			const prompt = promptData.prompt_en || promptData.main_prompt || '';
			const promptTranslated = promptData.prompt_translated || promptData.main_prompt_translated || '';
			const settings = promptData.settings || {};
			const url = videoUrls[`${ai.id}_${imageId}`] || videoUrls[ai.id] || '';

			const promptForCopy = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n");

			let settingsHtml = '';
			if (Object.keys(settings).length > 0) {
				settingsHtml = `
					<div class="video-settings">
						${Object.entries(settings).map(([key, value]) => 
							`<span class="setting-item">${key}: ${value}</span>`
						).join(' ')}
					</div>
				`;
			}

			return `
				<div class="video-ai-card">
					<div class="ai-header ${ai.id}">
						<h5>${ai.name}</h5>
					</div>
					<div class="prompt-section">
						<div class="prompt-text">${prompt || '프롬프트가 없습니다.'}</div>
						${promptTranslated ? `<div class="prompt-translated">${promptTranslated}</div>` : ''}
						${settingsHtml}
						<button class="copy-btn" onclick="copyVideoPrompt('${promptForCopy}', '${ai.name}', '${imageId}')">
							프롬프트 복사
						</button>
					</div>
					<div class="video-url-section">
						<label>생성된 영상 URL:</label>
						<input type="url" 
							   placeholder="영상 URL 입력" 
							   value="${url}"
							   onchange="updateVideoUrl('${shotId}', '${ai.id}', '${imageId}', this.value)">
              </div>
            <div class="video-preview-section" style="margin-top: 10px;">
                <div id="video-preview-${shotId}-${ai.id}-${imageId}" class="ai-video-preview">
                    ${(function(){
                        if (!url) return `<div style="color:#ccc;font-size:0.9rem;">영상 미리보기</div>`;
                        const videoUrl = processVideoUrl(url);
                        if (videoUrl.includes('drive.google.com')) {
                            return `<iframe style="max-width:100%;max-height:250px;border-radius:4px;border:none;" src="${videoUrl}" allowfullscreen onerror="console.error('Google Drive 비디오 로드 실패:', '${videoUrl}'); this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#ff6b6b;font-size:0.9rem;&quot;>Google Drive 영상 로드 실패<br><small>파일이 공개로 설정되어 있는지 확인하세요.</small></div>';"></iframe>`;
                        } else {
                            return `<video controls style="max-width:100%;max-height:250px;border-radius:4px;" src="${videoUrl}" onerror="console.error('비디오 로드 실패:', '${videoUrl}'); this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;color:#ff6b6b;font-size:0.9rem;&quot;>영상 로드 실패<br><small>로컬 파일은 브라우저 보안 정책으로 인해 제한될 수 있습니다.</small></div>';"></video>`;
                        }
                    })()}
                </div>
            </div>
        </div>
				
			`;
		}).join('');
	}

	// 영상 플랜 선택 함수
		function selectVideoPlan(shotId, planId) {
			try {
				const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
				if (!shot) return;

				// 영상 탭을 위한 임시 선택 상태 저장
				if (!window.videoTabSelectedPlans) {
					window.videoTabSelectedPlans = {};
				}
				window.videoTabSelectedPlans[shotId] = planId;

				showMessage(`플랜 ${planId}의 영상 프롬프트를 표시합니다.`, 'info');

				// 영상 탭 다시 렌더링
				const videoTab = document.getElementById('tab-video');
				if (videoTab) {
					videoTab.innerHTML = createShotVideoTab(shot);
				}
			} catch (e) {
				showMessage('플랜 선택 중 오류가 발생했습니다.', 'error');
			}
		}

	// 영상 프롬프트 복사
	function copyVideoPrompt(prompt, aiName, imageId) {
		const actualPromptText = prompt.replace(/\\n/g, "\n");
		if (!actualPromptText || actualPromptText.trim() === '프롬프트가 없습니다.') {
			return showMessage(`${aiName} 프롬프트가 비어 있습니다.`, 'warning');
		}
		copyToClipboard(actualPromptText).then(success => {
			if (success) {
				showMessage(`${aiName} 영상 프롬프트 (${imageId})가 복사되었습니다.`, 'success');
			}
		});
	}

	// 로컬 파일 경로를 file:// URL로 변환하고 Google Drive URL 처리
	function processVideoUrl(url) {
		if (!url) return url;
		
		// 드롭박스 URL 처리
		if (url.includes('dropbox.com')) {
			// dl=0을 dl=1로 변경하여 직접 다운로드 URL로 변환
			if (url.includes('dl=0')) {
				return url.replace('dl=0', 'raw=1');
			} else if (!url.includes('raw=')) {
				// raw 파라미터가 없으면 추가
				const separator = url.includes('?') ? '&' : '?';
				return url + separator + 'raw=1';
			}
			return url;
		}
		
		// Google Drive URL 처리
		if (url.includes('drive.google.com')) {
			const fileId = extractGoogleDriveFileId(url);
			if (fileId) {
				// Google Drive 임베드 URL로 변환
				return `https://drive.google.com/file/d/${fileId}/preview`;
			}
		}
		
		// Windows 경로 형식 (C:\path\to\file.mp4) 처리
		if (url.match(/^[A-Za-z]:\\/)) {
			return 'file:///' + url.replace(/\\/g, '/');
		}
		// Mac/Linux 절대 경로 (/path/to/file.mp4) 처리
		else if (url.startsWith('/') && !url.startsWith('//')) {
			return 'file://' + url;
		}
		
		return url;
	}
	
	// Google Drive 파일 ID 추출 함수
	function extractGoogleDriveFileId(url) {
		const patterns = [
			/\/file\/d\/([a-zA-Z0-9-_]+)/,
			/[?&]id=([a-zA-Z0-9-_]+)/,
			/\/d\/([a-zA-Z0-9-_]+)/,
			/\/view\?id=([a-zA-Z0-9-_]+)/
		];
		
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) {
				return match[1];
			}
		}
		
		return null;
	}

	// 이미지별 영상 URL 업데이트
	function updateVideoUrl(shotId, aiType, imageId, url) {
		try {
			const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
			if (!shot) return;

			if (!shot.video_urls) shot.video_urls = {};

			// 이미지별 URL 저장 (ai_imageId 형식)
			shot.video_urls[`${aiType}_${imageId}`] = url;

			saveDataToLocalStorage();

			// 미리보기 업데이트 - 안전한 방식 사용
			const previewElement = document.getElementById(`video-preview-${shotId}-${aiType}-${imageId}`);
			if (previewElement) {
				try {
					if (url) {
						const safeContent = createSafeIframe(url, 'max-width:100%;max-height:250px;border-radius:4px;border:none;');
						previewElement.innerHTML = safeContent;
					} else {
						previewElement.innerHTML = `<div style="color:#ccc;font-size:0.9rem;">영상 미리보기</div>`;
					}
				} catch (e) {
					previewElement.innerHTML = `<div style="color:#ff6b6b;font-size:0.9rem;">미리보기 업데이트 실패</div>`;
				}
			}

			// 씬 영상 갤러리 재렌더링 (현재 활성화된 경우) - debounce 적용
			setTimeout(() => {
				refreshSceneVideoGalleryIfActive(shot.scene_id);
			}, 100);

			showMessage(`${aiType.toUpperCase()} 영상 URL (${imageId})이 저장되었습니다.`, 'success');
		} catch (e) {
			showMessage('영상 URL 업데이트 중 오류가 발생했습니다.', 'error');
		}
	}
    // AI 영상 프롬프트 복사
    function copyAIPrompt(promptText, aiName) {
const actualPromptText = promptText.replace(/\\n/g, "\n");
if (!actualPromptText || actualPromptText.trim() === '프롬프트가 없습니다.') {
    return showMessage(`${aiName} 프롬프트가 비어 있어 복사할 수 없습니다.`, 'warning');
}
copyToClipboard(actualPromptText).then(ok => {
    if (ok) showMessage(`${aiName} 영상 프롬프트가 복사되었습니다.`, 'success');
});
    }

    // AI별 영상 URL 업데이트
    function updateAIVideoUrl(shotId, aiType, newUrl) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    if (!shot.video_urls) shot.video_urls = {};
    shot.video_urls[aiType] = newUrl;
    
    if (!shot.video_design) shot.video_design = { ai_tool: '', video_url: '', selected_ai: null };
    
    if (shot.video_design.selected_ai === aiType) {
        shot.video_design.video_url = newUrl;
        const legacyUrlCell = document.getElementById(`legacy-video-url-${shot.id}`);
        if (legacyUrlCell) legacyUrlCell.textContent = newUrl || '-';
        
        const legacyAiToolCell = document.getElementById(`legacy-ai-tool-${shot.id}`);
        if (legacyAiToolCell) legacyAiToolCell.textContent = aiType || '-';
    }
    
    saveDataToLocalStorage();
    
    const preview = document.getElementById(`video-preview-${shot.id}-${aiType}`);
    if (preview) {
        try {
            if (newUrl) {
                const safeContent = createSafeIframe(newUrl, 'max-width:100%;max-height:200px;border-radius:6px;border:none;');
                preview.innerHTML = safeContent;
            } else {
                preview.innerHTML = `<div style="color:#ccc;font-size:0.9rem;">URL 입력</div>`;
            }
        } catch (e) {
            preview.innerHTML = `<div style="color:#ff6b6b;font-size:0.9rem;">미리보기 업데이트 실패</div>`;
        }
    }

    // 씬 영상 갤러리 재렌더링 (현재 활성화된 경우) - debounce 적용
    setTimeout(() => {
        refreshSceneVideoGalleryIfActive(shot.scene_id);
    }, 100);
    
} catch (e) {
    showMessage('영상 URL 업데이트 중 오류가 발생했습니다.', 'error');
}
    }

    // 최종 AI 선택
    function selectFinalAI(shotId, aiType) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    if (!shot.video_design) {
        shot.video_design = { ai_tool: aiType, video_url: '', selected_ai: aiType };
    } else {
        shot.video_design.selected_ai = aiType;
        shot.video_design.ai_tool = aiType;
    }
    
    if (!shot.video_urls) shot.video_urls = {};
    shot.video_design.video_url = shot.video_urls[aiType] || '';
    
    saveDataToLocalStorage();
    
    // UI 업데이트
    ['luma', 'kling', 'veo2', 'runway'].forEach(id => {
        const card = document.getElementById(`ai-card-${shot.id}-${id}`);
        const btn = document.getElementById(`select-btn-${shot.id}-${id}`);
        
        if (card && btn) {
            if (id === aiType) {
                card.classList.add('selected-ai-card');
                btn.classList.add('selected');
                btn.textContent = '✓ 최종 선택됨';
            } else {
                card.classList.remove('selected-ai-card');
                btn.classList.remove('selected');
                btn.textContent = `이 AI로 최종 선택`;
            }
        }
    });
    
    const legacyUrlCell = document.getElementById(`legacy-video-url-${shot.id}`);
    if (legacyUrlCell) legacyUrlCell.textContent = shot.video_design.video_url || '-';
    
    const legacyAiToolCell = document.getElementById(`legacy-ai-tool-${shot.id}`);
    if (legacyAiToolCell) legacyAiToolCell.textContent = aiType || '-';
    
    showMessage(`${aiType}이(가) 최종 영상으로 선택되었습니다.`, 'success');
} catch (e) {
    showMessage('최종 AI 선택 중 오류가 발생했습니다.', 'error');
}
    }

    // TTS용 대화 표시 업데이트
    function updateTtsDialogueDisplay(shotId) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    const selectElement = document.getElementById(`tts-char-select-${shotId}`);
    const displayElement = document.getElementById(`tts-dialogue-text-${shotId}`);

    if (shot && selectElement && displayElement && shot.content) {
        const selectedValue = selectElement.value;
        
        if (selectedValue === '_all') {
            // 전체 대사를 순서대로 표시
            const dialogueSequence = shot.content.dialogue_sequence || [];
            const dialogueByCharacter = shot.content.dialogue_by_character || {};
            
            const allDialogueText = dialogueSequence.map(seq => {
                const character = seq.character;
                const lineData = dialogueByCharacter[character]?.lines[seq.line_index];
                if (lineData) {
                    return lineData.text || '';
                }
                return '';
            }).filter(text => text !== '').join('\n');
            
            displayElement.innerHTML = allDialogueText.replace(/\n/g, "<br>");
        } else {
            // 특정 캐릭터의 대사만 표시
            const dialogueByCharacter = shot.content.dialogue_by_character || {};
            const characterData = dialogueByCharacter[selectedValue];
            
            if (characterData && characterData.lines) {
                const characterLines = characterData.lines.map(line => line.text || '').join('\n');
                displayElement.innerHTML = characterLines.replace(/\n/g, "<br>");
            } else {
                displayElement.innerHTML = '선택된 캐릭터의 대사가 없습니다.';
            }
        }
    }
} catch (error) {
}
    }

    // TTS용 대사 복사
    function copyTtsDialogue(shotId) {
try {
    const selectElement = document.getElementById(`tts-char-select-${shotId}`);
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);

    if (selectElement && shot && shot.content) {
        const selectedValue = selectElement.value;
        let dialogueText = '';
        
        if (selectedValue === '_all') {
            // 전체 대사를 순서대로
            const dialogueSequence = shot.content.dialogue_sequence || [];
            const dialogueByCharacter = shot.content.dialogue_by_character || {};
            
            dialogueText = dialogueSequence.map(seq => {
                const character = seq.character;
                const lineData = dialogueByCharacter[character]?.lines[seq.line_index];
                return lineData ? lineData.text || '' : '';
            }).filter(text => text !== '').join('\n');
        } else {
            // 특정 캐릭터의 대사만
            const dialogueByCharacter = shot.content.dialogue_by_character || {};
            const characterData = dialogueByCharacter[selectedValue];
            
            if (characterData && characterData.lines) {
                dialogueText = characterData.lines.map(line => line.text || '').join('\n');
            }
        }
        
        if (dialogueText.trim() === '') {
            showMessage('복사할 대사가 없습니다.', 'warning');
            return;
        }
        
        copyToClipboard(dialogueText).then(ok => {
            if (ok) {
                const message = selectedValue === '_all' ? 
                    '전체 대사가 복사되었습니다.' : 
                    `${selectedValue}의 대사가 복사되었습니다.`;
                showMessage(message, 'success');
            }
        });
    } else {
        showMessage('복사할 대사를 찾을 수 없습니다.', 'warning');
    }
} catch (error) {
    showMessage('TTS 대사 복사 중 오류가 발생했습니다.', 'error');
}
    }

    // 샷 음악 탭 생성
    function createShotMusicTab(shot) {
console.log('🎵 createShotMusicTab 시작');
try {
    const projectMusicPrompts = currentData.film_metadata?.project_music_prompts || {};
    const projectMusicUrls = currentData.film_metadata?.project_music_urls || {};
    const shotMusicMemo = shot.music_memo || '';

    const createProjectOstSection = (ostType, title, emoji) => {
    const ostPromptData = projectMusicPrompts[ostType];
    const ostUrl = projectMusicUrls[ostType] || '';

    if (!ostPromptData) {
return `
    <div class="music-ost-section">
        <h4>${emoji} ${title} (프로젝트)</h4>
        <div style="text-align:center;padding:20px;color:#ccc;">
            ${title} 프롬프트 정보가 없습니다.
        </div>
    </div>`;
    }

    const stylePrompt = ostPromptData.style_prompt || '스타일 프롬프트가 없습니다.';
    const lyricsPrompt = ostPromptData.lyrics_structure_prompt || '가사&구조 프롬프트가 없습니다.';
    const stylePromptForCopy = stylePrompt.replace(/'/g, "&#39;").replace(/\n/g, "\\n");
    const lyricsPromptForCopy = lyricsPrompt.replace(/'/g, "&#39;").replace(/\n/g, "\\n");

    return `
<div class="music-ost-section">
    <h4>${emoji} ${title} (프로젝트 전체)</h4>
    <div class="audio-player-area" style="margin-bottom:15px;">
        ${ostUrl ? 
            `<audio controls style="width: 100%;" src="${processAudioUrl(ostUrl)}"></audio>` : 
            `<div style="color: #ccc;">${title} URL 입력 (프로젝트 레벨)</div>`
        }
    </div>
    <div class="form-group">
        <label class="form-label">${title} URL (프로젝트 전체)</label>
        <input type="text" class="form-input" value="${ostUrl}" 
               placeholder="https://example.com/${ostType}.mp3" 
               onchange="updateProjectMusicUrl('${ostType}', this.value)">
    </div>
    <div class="ost-prompt-grid">
        <div class="ost-prompt-item">
            <div class="prompt-title">스타일 프롬프트</div>
            <div class="prompt-text">${stylePrompt}</div>
            <button class="copy-btn btn-small" 
                    onclick="copyToClipboard('${stylePromptForCopy}').then(ok => ok && showMessage('${title} 스타일 프롬프트가 복사되었습니다.', 'success'))">
                복사
            </button>
        </div>
        <div class="ost-prompt-item">
            <div class="prompt-title">가사 & 구조 프롬프트</div>
            <div class="prompt-text">${lyricsPrompt}</div>
            <button class="copy-btn btn-small" 
                    onclick="copyToClipboard('${lyricsPromptForCopy}').then(ok => ok && showMessage('${title} 가사/구조 프롬프트가 복사되었습니다.', 'success'))">
                복사
            </button>
        </div>
    </div>
</div>`;
};
const mainOstHtml = createProjectOstSection('main_ost', '메인 OST', '🎼');
    const subOst1Html = createProjectOstSection('sub_ost_1', '서브 OST 1', '🎵');
    const subOst2Html = createProjectOstSection('sub_ost_2', '서브 OST 2', '🎶');
    
    const shotMusicMemoHtml = `
        <div class="info-section">
            <h3>📝 이 샷의 음악 관련 메모</h3>
            <div class="form-group">
                <label class="form-label">샷 음악 적용 노트 (예: 이 샷부터 메인 테마 사용):</label>
                <textarea class="form-textarea" 
                          style="min-height: 100px;"
                          placeholder="이 샷에 적용될 음악에 대한 구체적인 지시사항이나 아이디어를 입력하세요..."
                          onchange="updateShotMusicMemo('${shot.id}', this.value)">${shotMusicMemo}</textarea>
                <small style="color:#ccc; font-size:0.85em;">이 메모는 현재 선택된 샷(${shot.id})에만 해당됩니다.</small>
            </div>
        </div>`;

    return `${mainOstHtml}${subOst1Html}${subOst2Html}${shotMusicMemoHtml}`;
} catch (error) {
    console.error('❌ createShotMusicTab 오류:', error);
    return `<div class="info-section"><h3>음악 탭 로드 오류</h3><p>오류 메시지: ${error.message}</p></div>`;
}
    }

    // 프로젝트 레벨 음악 URL 업데이트
    function updateProjectMusicUrl(ostType, newUrl) {
try {
    if (!currentData.film_metadata) currentData.film_metadata = {};
    if (!currentData.film_metadata.project_music_urls) currentData.film_metadata.project_music_urls = {};
    
    currentData.film_metadata.project_music_urls[ostType] = newUrl;
    saveDataToLocalStorage();
    
    // 현재 탭이 음악 탭이라면 UI 즉시 갱신
    const activeTabId = document.querySelector('.tab-button.active')?.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (activeTabId === 'music' && selectedType === 'shot' && selectedId) {
        showShotContent(selectedId);
        setTimeout(() => switchTab('music', selectedId), 0);
    }
    showMessage(`프로젝트 ${ostType} URL이 업데이트되었습니다.`, 'success');
} catch (error) {
    showMessage('프로젝트 음악 URL 업데이트 중 오류가 발생했습니다.', 'error');
}
    }

    // 샷별 음악 메모 업데이트
    function updateShotMusicMemo(shotId, memo) {
try {
    const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
    if (!shot) return showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
    
    shot.music_memo = memo;
    saveDataToLocalStorage();
    showMessage(`샷 ${shotId}의 음악 메모가 업데이트되었습니다.`, 'success');
} catch (error) {
    showMessage('샷 음악 메모 업데이트 중 오류가 발생했습니다.', 'error');
}
    }
    
    // 메모 관리 함수들
    function getShotMemo(shotId) {
try {
    const memos = JSON.parse(localStorage.getItem('shotMemos') || '{}');
    return memos[shotId] || '';
} catch (e) {
    return '';
}
    }

    function updateShotMemo(shotId, memo) {
try {
    const memos = JSON.parse(localStorage.getItem('shotMemos') || '{}');
    memos[shotId] = memo;
    localStorage.setItem('shotMemos', JSON.stringify(memos));
} catch (e) {
    showMessage('메모 저장에 실패했습니다.', 'error');
}
    }
    
    // 오디오 URL 업데이트
    // 파일명을 안전하게 인코딩하는 함수
    function encodeFileName(fileName) {
return encodeURIComponent(fileName).replace(/'/g, '%27').replace(/"/g, '%22');
    }

    // 파일명을 디코딩하는 함수
    function decodeFileName(encodedFileName) {
return decodeURIComponent(encodedFileName);
    }

    // 오디오 URL 처리 함수
    function processAudioUrl(url) {
if (!url || typeof url !== 'string') return '';

// [로컬 파일] 접두사가 있는 경우 실제 Base64 데이터 반환
if (url.startsWith('[로컬 파일]')) {
    const fileName = url.replace('[로컬 파일] ', '');
    
    // 메모리에서 찾기
    if (window.localAudioFiles && window.localAudioFiles[fileName]) {
        return window.localAudioFiles[fileName];
    }
    
    // localStorage에서 찾기
    try {
        const jsonFileName = getProjectFileName();
        const audioFilesKey = `audioFiles_${jsonFileName}`;
        const audioFiles = JSON.parse(localStorage.getItem(audioFilesKey) || '{}');
        if (audioFiles[fileName]) {
            // 메모리에도 캐시
            if (!window.localAudioFiles) window.localAudioFiles = {};
            window.localAudioFiles[fileName] = audioFiles[fileName];
            return audioFiles[fileName];
        }
    } catch (e) {
    }
    
    // 파일을 찾을 수 없는 경우
    return '';
}

// 드롭박스 URL 처리
if (url.includes('dropbox.com')) {
    // dl=0을 dl=1로 변경하여 직접 다운로드 URL로 변환
    if (url.includes('dl=0')) {
        return url.replace('dl=0', 'dl=1');
    } else if (!url.includes('dl=')) {
        // dl 파라미터가 없으면 추가
        const separator = url.includes('?') ? '&' : '?';
        return url + separator + 'dl=1';
    }
    return url;
}

// URL이 이미 완전한 형태라면 그대로 반환
if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
}

// 일반 파일 경로의 경우 인코딩
return encodeURI(url);
    }

    function updateAudioUrl(shotId, audioType, newUrl) {
try {
    const shot = currentData.breakdown_data.shots.find(sh => sh.id === shotId);
    if (!shot) return;
    
    if (!shot.content) shot.content = {};
    if (!shot.content.audio_urls) shot.content.audio_urls = {};
    
    // dialogue의 경우 객체일 수 있으므로 특별 처리
    if (audioType === 'dialogue') {
        // 전체 통합 파일 URL로 저장
        shot.content.audio_urls.dialogue = newUrl;
    } else {
        shot.content.audio_urls[audioType] = newUrl;
    }
    
    saveDataToLocalStorage();
    
    // 현재 스크롤 위치 저장
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 현재 탭 유지
    const tab = document.querySelector('.tab-button.active')?.getAttribute('onclick').match(/'([^']+)'/)[1];
    showShotContent(shotId);
    
    // 즉시 스크롤 위치 복원
    requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollTop);
        
        if (tab) {
            switchTab(tab, shotId);
            // 탭 전환 후에도 다시 스크롤 위치 복원
            requestAnimationFrame(() => {
                window.scrollTo(0, currentScrollTop);
            });
        }
    });
    
    showMessage(`${audioType} 오디오 URL이 업데이트되었습니다.`, 'success');
} catch (e) {
    showMessage('오디오 URL 업데이트에 실패했습니다.', 'error');
}
    }
    
    // 캐릭터별 오디오 URL 업데이트 함수 (Stage 8 지원)
    function updateCharacterAudioUrl(shotId, character, newUrl) {
try {
    const shot = currentData.breakdown_data.shots.find(sh => sh.id === shotId);
    if (!shot) return;
    
    if (!shot.content) shot.content = {};
    if (!shot.content.audio_urls) shot.content.audio_urls = {};
    if (!shot.content.audio_urls.dialogue || typeof shot.content.audio_urls.dialogue === 'string') {
        // 기존이 문자열이면 객체로 변환
        shot.content.audio_urls.dialogue = {};
    }
    
    // 캐릭터별 URL 저장 (배열 형태 유지)
    shot.content.audio_urls.dialogue[character] = [newUrl];
    
    saveDataToLocalStorage();
    
    // 현재 탭 유지
    const tab = document.querySelector('.tab-button.active')?.getAttribute('onclick').match(/'([^']+)'/)[1];
    showShotContent(shotId);
    if (tab) setTimeout(() => switchTab(tab, shotId), 0);
    
    showMessage(`${character} 오디오 URL이 업데이트되었습니다.`, 'success');
} catch (e) {
    showMessage('캐릭터 오디오 URL 업데이트에 실패했습니다.', 'error');
}
    }
    
    // 캐릭터별 오디오 파일 업로드 함수
    function uploadAudioForCharacter(shotId, character) {
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.onchange = function(event) {
    const file = event.target.files[0];
    if (file) {
        // 파일 업로드 로직 (실제 구현 필요)
        showMessage(`${character} 오디오 파일 업로드 기능은 추가 구현이 필요합니다.`, 'info');
    }
};
fileInput.click();
    }
    
    // 오디오 파일 업로드 함수
    function uploadAudioForShot(shotId, audioType) {
const input = document.createElement('input');
input.type = 'file';
input.accept = 'audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac';
input.style.display = 'none';

input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('파일 크기가 50MB를 초과합니다.', 'error');
        return;
    }
    
    // 파일 형식 검증
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/flac'];
    const isValidType = allowedTypes.includes(file.type) || 
                      file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg|aac|flac)$/);
    
    if (!isValidType) {
        showMessage('지원하지 않는 오디오 파일 형식입니다. (mp3, wav, m4a, ogg, aac, flac 지원)', 'error');
        return;
    }
    
    showMessage('오디오 파일을 처리 중입니다...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Base64 데이터를 [로컬 파일] 접두사와 함께 저장
            const base64Data = e.target.result;
            const localFileUrl = `[로컬 파일] ${file.name}`;
            
            // 데이터 저장
            const shot = currentData?.breakdown_data?.shots?.find(s => s.id === shotId);
            if (!shot) {
                showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
                return;
            }
            
            if (!shot.content) shot.content = {};
            if (!shot.content.audio_urls) shot.content.audio_urls = {};
            
            // Base64 데이터를 별도 저장소에 저장
            if (!window.localAudioFiles) window.localAudioFiles = {};
            window.localAudioFiles[file.name] = base64Data;
            
            // localStorage에 오디오 파일 데이터 저장
            try {
                const jsonFileName = getProjectFileName();
                const audioFilesKey = `audioFiles_${jsonFileName}`;
                const existingAudioFiles = JSON.parse(localStorage.getItem(audioFilesKey) || '{}');
                existingAudioFiles[file.name] = base64Data;
                localStorage.setItem(audioFilesKey, JSON.stringify(existingAudioFiles));
            } catch (storageError) {
                showMessage('파일이 너무 커서 완전히 저장되지 않을 수 있습니다.', 'warning');
            }
            
            // URL 업데이트
            if (audioType === 'dialogue') {
                shot.content.audio_urls.dialogue = localFileUrl;
            } else {
                shot.content.audio_urls[audioType] = localFileUrl;
            }
            
            saveDataToLocalStorage();
            
            // UI 즉시 업데이트
            const tab = document.querySelector('.tab-button.active')?.getAttribute('onclick').match(/'([^']+)'/)[1];
            showShotContent(shotId);
            if (tab) setTimeout(() => switchTab(tab, shotId), 0);
            
            showMessage(`${file.name} 파일이 성공적으로 업로드되었습니다.`, 'success');
            
        } catch (error) {
            showMessage('오디오 파일 처리 중 오류가 발생했습니다.', 'error');
        }
    };
    
    reader.onerror = function() {
        showMessage('파일 읽기 중 오류가 발생했습니다.', 'error');
    };
    
    reader.readAsDataURL(file);
};

document.body.appendChild(input);
input.click();
document.body.removeChild(input);
    }
    
    // 데이터 초기화
    // [DEPRECATED] 데이터 초기화 기능 - 더 이상 사용되지 않음
    // TODO: 향후 버전에서 제거 예정
		function resetData() {
			if (confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
				try {
					// 모든 localStorage 데이터 삭제
					const keysToRemove = [];
					for (let i = 0; i < localStorage.length; i++) {
						const key = localStorage.key(i);
						if (key && (key.includes('breakdownData') || 
								   key.includes('lastSaved') || 
								   key.includes('shotMemos') ||
								   key.includes('shot_') ||
								   key.includes('filmProduction') ||
								   key.includes('stage6ImagePrompts') ||  // 추가
								   key.includes('stage7VideoPrompts') ||  // 추가
								   key.includes('audioFiles_') ||  // 오디오 파일 추가
								   key.includes('editedImagePrompts'))) {  // 수정된 이미지 프롬프트 추가
							keysToRemove.push(key);
						}
					}

					keysToRemove.forEach(key => localStorage.removeItem(key));

					// 전역 변수 초기화
					window.stage6ImagePrompts = null;
					window.localAudioFiles = null;
					currentData = null;
					selectedType = null;
					selectedId = null;
					selectedSceneId = null;
            hasStage2Structure = false;

					// 빈 데이터로 재설정
					currentData = getEmptyData();
					updateUI();

					showMessage('모든 데이터가 완전히 초기화되었습니다.', 'success');

					// 페이지 새로고침 (완전한 초기화)
					setTimeout(() => {
						location.reload();
					}, 1000);

				} catch (error) {
					showMessage('초기화 중 오류가 발생했습니다.', 'error');
				}
			}
		}
    // 전체 시나리오 다운로드
    // [DEPRECATED] 전체 시나리오 다운로드 기능 - 더 이상 사용되지 않음
    // TODO: 향후 버전에서 제거 예정
		function downloadFullScenario() {
			try {
				if (!currentData?.stage2_data?.narrative_data?.scenario_data) {
					showMessage('시나리오 데이터가 없습니다.', 'error');
					return;
				}

				const scenarioData = currentData.stage2_data.narrative_data.scenario_data;
				const title = scenarioData.scenario_title || '시나리오';
				let fullText = `${title}\n${'='.repeat(50)}\n\n`;

				// 시퀀스별로 씬들의 scenario_text를 조합
				const sequences = currentData.breakdown_data.sequences || [];
				sequences.forEach(seq => {
					fullText += `\n\n${seq.title}\n${'-'.repeat(40)}\n\n`;

					// 해당 시퀀스의 씬들 찾기
					const seqScenes = currentData.breakdown_data.scenes.filter(
						scene => scene.sequence_id === seq.id
					);

					// 각 씬의 scenario_text 추가
					seqScenes.forEach(scene => {
						if (scene.original_scenario?.scenario_text) {
							fullText += scene.original_scenario.scenario_text + '\n\n';
						}
					});
				});

				// 텍스트 파일로 다운로드
				const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_전체시나리오.txt`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				showMessage('전체 시나리오가 다운로드되었습니다.', 'success');
			} catch (error) {
				showMessage('시나리오 다운로드 중 오류가 발생했습니다.', 'error');
			}
		}


    // 컨셉아트 보기
    // 컨셉아트 페이지 열기
    function openConceptArt() {
try {
    // 컨셉아트 페이지로 직접 이동 (동일한 창에서)
    window.location.href = '../your_title_storyboard_v9.4_c.html';
    
} catch (e) {
    showMessage('컨셉아트 열기 중 오류가 발생했습니다: ' + e.message, 'error');
}
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
document.getElementById('import-btn')?.addEventListener('click', importData);
// export-btn은 인라인 onclick 사용으로 변경
document.getElementById('concept-art-btn')?.addEventListener('click', openConceptArt);
document.getElementById('expand-all-btn')?.addEventListener('click', expandAll);
document.getElementById('collapse-all-btn')?.addEventListener('click', collapseAll);
document.getElementById('search-input')?.addEventListener('input', searchNavigation);
document.getElementById('file-input')?.addEventListener('change', handleFileSelect);
document.getElementById('reset-btn')?.addEventListener('click', resetData);
document.getElementById('scenario-export-btn')?.addEventListener('click', downloadFullScenario);
    }

    // 페이지 로드 시 실행
    document.addEventListener('DOMContentLoaded', async function() {
try {
    setupEventListeners();
    await loadData();
    updateUI();
    
    // URL 파라미터 체크 및 자동 JSON 처리
    const urlParams = new URLSearchParams(window.location.search);
    
    // Stage 2에서 임시 저장된 JSON 파일 자동 로드
    if (urlParams.get('loadTempJson') === 'true') {
        setTimeout(() => {
            const tempJson = localStorage.getItem('stage2TempJson');
            const tempFileName = localStorage.getItem('stage2TempFileName');
            
            if (tempJson && tempFileName) {
                // 중복 처리 방지 체크 - 이미 currentData에 데이터가 있는 경우만 건너뛰기
                if (localStorage.getItem('stage2TempProcessed') === 'true' && 
                    currentData && currentData.breakdown_data && 
                    currentData.breakdown_data.sequences && currentData.breakdown_data.sequences.length > 0) {
                    // showMessage 제거 - 콘솔에만 표시
                    return;
                }
                
                try {
                    
                    // practicalJSONHandler를 사용하여 JSON 처리
                    const result = practicalJSONHandler(tempJson);
                    
                    if (result.success) {
                        const newData = result.data;
                        let updated = false;
                        
                        // 기존 handleFileSelect 로직과 동일하게 처리
                        if (newData.current_stage_name === 'narrative_development' && newData.narrative_data) {
                                         handleStage2Data(newData);
                        } else {
                            showMessage('Stage 2 형식의 JSON 파일이 아닙니다.', 'warning');
                        }
                    } else {
                        showMessage('JSON 파일 처리 중 오류가 발생했습니다.', 'error');
                    }
                    
                    // 처리 완료 플래그 설정 (임시 데이터는 유지)
                    localStorage.setItem('stage2TempProcessed', 'true');
                    
                } catch (error) {
                    console.error('임시 JSON 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                showMessage('임시 저장된 파일을 찾을 수 없습니다.', 'warning');
            }
        }, 1000);
    }
    // Stage 5에서 여러 임시 저장된 JSON 파일들 자동 로드
    if (urlParams.get('loadStage5JsonMultiple') === 'true') {
        // Stage 2 로드 후 충분한 시간 후에 실행
        setTimeout(() => {
            const tempJsonFiles = localStorage.getItem('stage5TempJsonFiles');
            const tempFileNames = localStorage.getItem('stage5TempFileNames');
            
            if (tempJsonFiles && tempFileNames) {
                // stage5TempProcessed 플래그는 제거되었으므로 항상 처리
                
                try {
                    const jsonFiles = JSON.parse(tempJsonFiles);
                    const fileNames = JSON.parse(tempFileNames);
                    
                    
                    let processedCount = 0;
                    let successCount = 0;
                    
                    // 각 파일을 순차적으로 처리
                    jsonFiles.forEach((jsonContent, index) => {
                        try {
                            const result = practicalJSONHandler(jsonContent);
                            
                            if (result.success) {
                                const newData = result.data;
                                
                                // Stage 5 데이터 처리
                                if (newData.film_metadata && newData.film_metadata.current_scene !== undefined && newData.breakdown_data) {
                                    handleStage5SceneData(newData, true); // 메시지 숨김
                                    successCount++;
                                } 
                                // 전체 프로젝트 구조 (Stage 5 전체)
                                else if (newData.film_metadata && newData.breakdown_data && newData.breakdown_data.sequences) {
                                    currentData = newData;
                                    
                                    // Stage 2 구조 존재 여부 확인
                                    if (currentData.breakdown_data.sequences && currentData.breakdown_data.sequences.length > 0) {
                                        hasStage2Structure = true;
                                        currentData.hasStage2Structure = true;
                                    }
                                    
                                    saveDataToLocalStorage();
                                    updateUI();
                                    successCount++;
                                } else {
                                    console.warn(`Stage 5 형식이 아닌 파일: ${fileNames[index]}`);
                                }
                            } else {
                                console.error(`JSON 파일 처리 실패: ${fileNames[index]}`);
                            }
                        } catch (error) {
                            console.error(`파일 처리 오류 (${fileNames[index]}):`, error);
                        }
                        
                        processedCount++;
                        
                        // 모든 파일 처리 완료시 메시지 표시
                        if (processedCount === jsonFiles.length) {
                            if (successCount > 0) {
                                console.log(`✅ ${successCount}개의 Stage 5 파일을 성공적으로 로드했습니다. (총 ${jsonFiles.length}개 중)`);
                            } else {
                                showMessage('Stage 5 형식의 JSON 파일을 찾을 수 없습니다.', 'warning');
                            }
                        }
                    });
                    
                    // 처리 완료 후 임시 데이터 정리
                    localStorage.removeItem('stage5TempJsonFiles');
                    localStorage.removeItem('stage5TempFileNames');
                    
                } catch (error) {
                    console.error('Stage 5 여러 임시 JSON 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일들을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                showMessage('임시 저장된 파일들을 찾을 수 없습니다.', 'warning');
            }
        }, 2000);
    }
    // Stage 6에서 임시 저장된 JSON 파일 자동 로드
    if (urlParams.get('loadStage6Json') === 'true') {
        setTimeout(() => {
            const tempJson = localStorage.getItem('stage6TempJson');
            const tempFileName = localStorage.getItem('stage6TempFileName');
            
            if (tempJson && tempFileName) {
                // 중복 처리 방지 체크 - 이미 Stage 6 데이터가 처리된 경우만 건너뛰기
                if (localStorage.getItem('stage6TempProcessed') === 'true' && 
                    window.stage6ImagePrompts && Object.keys(window.stage6ImagePrompts).length > 0) {
                    // showMessage 제거 - 콘솔에만 표시
                    return;
                }
                
                try {
                    
                    // practicalJSONHandler를 사용하여 JSON 처리
                    const result = practicalJSONHandler(tempJson);
                    
                    if (result.success) {
                        const newData = result.data;
                        
                        // Stage 6 데이터 처리
                        if (newData.stage === 6 && (newData.shots || (newData.scene_info && newData.shots))) {
                            
                            // 기존 handleFileSelect 로직 재사용
                            const fakeEvent = { target: { value: '', files: [new File([tempJson], tempFileName, { type: 'application/json' })] }};
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                const result = practicalJSONHandler(e.target.result);
                                if (result.success) {
                                    const newData = result.data;
                                    
                                    // Stage 6 데이터를 전역 변수에 저장
                                    if (newData.stage === 6 && newData.shots) {
                                        if (!window.stage6ImagePrompts) {
                                            window.stage6ImagePrompts = {};
                                        }
                                        newData.shots.forEach(shotData => {
                                            const shotId = shotData.shot_id;
                                            window.stage6ImagePrompts[shotId] = {};
                                            shotData.images.forEach(imageData => {
                                                const imageId = imageData.image_id;
                                                window.stage6ImagePrompts[shotId][imageId] = imageData;
                                            });
                                        });
                                        
                                        const jsonFileName = getProjectFileName();
                                        localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(window.stage6ImagePrompts));
                                        
                                        // Stage 6 데이터를 현재 shots에 병합
                                        if (currentData && currentData.breakdown_data && currentData.breakdown_data.shots) {
                                            let mergedCount = 0;
                                            
                                            // 각 shot에 Stage 6 데이터 병합
                                            currentData.breakdown_data.shots.forEach(shot => {
                                                const shotId = shot.id;
                                                const stage6Data = window.stage6ImagePrompts[shotId];
                                                
                                                if (stage6Data) {
                                                    // 첫 번째 이미지의 프롬프트 데이터 찾기
                                                    const firstImageData = Object.values(stage6Data)[0];
                                                    
                                                    if (firstImageData && firstImageData.prompts) {
                                                        // image_prompts 초기화
                                                        if (!shot.image_prompts) {
                                                            shot.image_prompts = {};
                                                        }
                                                        
                                                        // AI 도구별 프롬프트 병합
                                                        Object.keys(firstImageData.prompts).forEach(aiTool => {
                                                            const promptData = firstImageData.prompts[aiTool];
                                                            
                                                            if (aiTool === 'midjourney') {
                                                                shot.image_prompts.midjourney = {
                                                                    main_prompt: promptData.prompt || '',
                                                                    main_prompt_translated: promptData.prompt_translated || '',
                                                                    parameters: promptData.parameters || ''
                                                                };
                                                            } else {
                                                                let parameters = '';
                                                                if (promptData.negative_prompt) {
                                                                    parameters = `Negative: ${promptData.negative_prompt}`;
                                                                }
                                                                if (promptData.aspect_ratio) {
                                                                    parameters += parameters ? `; Aspect Ratio: ${promptData.aspect_ratio}` : `Aspect Ratio: ${promptData.aspect_ratio}`;
                                                                }
                                                                
                                                                shot.image_prompts[aiTool] = {
                                                                    main_prompt: promptData.prompt || '',
                                                                    main_prompt_translated: promptData.prompt_translated || '',
                                                                    parameters: parameters
                                                                };
                                                            }
                                                        });
                                                        
                                                        mergedCount++;
                                                    }
                                                }
                                            });
                                            
                                            if (mergedCount > 0) {
                                                console.log(`✅ ${mergedCount}개의 샷에 Stage 6 이미지 프롬프트를 병합했습니다.`);
                                                // showMessage(`Stage 6 이미지 프롬프트가 ${mergedCount}개의 샷에 성공적으로 적용되었습니다.`, 'success');
                                                
                                                // 데이터 저장
                                                saveDataToLocalStorage();
                                            } else {
                                                console.log('⚠️ 병합할 수 있는 Stage 6 데이터를 찾지 못했습니다.');
                                            }
                                        }
                                        
                                        // UI 업데이트
                                        updateUI();
                                    }
                                }
                            };
                            reader.readAsText(new File([tempJson], tempFileName, { type: 'application/json' }));
                        } else {
                            showMessage('Stage 6 형식의 JSON 파일이 아닙니다.', 'warning');
                        }
                    } else {
                        showMessage('JSON 파일 처리 중 오류가 발생했습니다.', 'error');
                    }
                    
                    // 처리 완료 플래그 설정 (임시 데이터는 유지)
                    localStorage.setItem('stage6TempProcessed', 'true');
                    
                } catch (error) {
                    console.error('Stage 6 임시 JSON 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                showMessage('임시 저장된 파일을 찾을 수 없습니다.', 'warning');
            }
        }, 3000);
    }
    // Stage 6에서 임시 저장된 여러 JSON 파일들 자동 로드
    if (urlParams.get('loadStage6JsonMultiple') === 'true') {
        setTimeout(() => {
            const tempJsonFiles = localStorage.getItem('stage6TempJsonFiles');
            const tempFileNames = localStorage.getItem('stage6TempFileNames');
            
            if (tempJsonFiles && tempFileNames) {
                // 중복 처리 방지 체크
                if (localStorage.getItem('stage6TempFilesProcessed') === 'true') {
                    // showMessage 제거 - 콘솔에만 표시
                    return;
                }
                
                try {
                    const jsonFiles = JSON.parse(tempJsonFiles);
                    const fileNames = JSON.parse(tempFileNames);
                    
                    
                    let processedCount = 0;
                    let successCount = 0;
                    
                    // 각 파일을 순차적으로 처리
                    jsonFiles.forEach((jsonContent, index) => {
                        try {
                            const result = practicalJSONHandler(jsonContent);
                            
                            if (result.success) {
                                const newData = result.data;
                                
                                // Stage 6 데이터 처리
                                if (newData.stage === 6 && newData.shots) {
                                    
                                    // Stage 6 데이터를 전역 변수에 저장
                                    if (!window.stage6ImagePrompts) {
                                        window.stage6ImagePrompts = {};
                                    }
                                    
                                    newData.shots.forEach(shotData => {
                                        const shotId = shotData.shot_id;
                                        // 기존 데이터를 완전히 대체 (업데이트)
                                        window.stage6ImagePrompts[shotId] = {};
                                        shotData.images.forEach(imageData => {
                                            const imageId = imageData.image_id;
                                            window.stage6ImagePrompts[shotId][imageId] = imageData;
                                        });
                                    });
                                    
                                    successCount++;
                                } else {
                                    console.warn(`Stage 6 형식이 아닌 파일: ${fileNames[index]}`);
                                }
                            } else {
                                console.error(`JSON 파일 처리 실패: ${fileNames[index]}`);
                            }
                        } catch (error) {
                            console.error(`파일 처리 오류 (${fileNames[index]}):`, error);
                        }
                        
                        processedCount++;
                        
                        // 모든 파일 처리 완료
                        if (processedCount === jsonFiles.length) {
                            
                            if (successCount > 0) {
                                // localStorage에 Stage 6 데이터 저장
                                const jsonFileName = getProjectFileName();
                                localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(window.stage6ImagePrompts));
                                
                                console.log(`✅ ${successCount}개의 Stage 6 파일을 성공적으로 로드했습니다. (총 ${jsonFiles.length}개 중)`);
                                
                                // Stage 6 데이터를 현재 shots에 병합
                                if (currentData && currentData.breakdown_data && currentData.breakdown_data.shots) {
                                    let mergedCount = 0;
                                    
                                    // 각 shot에 Stage 6 데이터 병합
                                    currentData.breakdown_data.shots.forEach(shot => {
                                        const shotId = shot.id;
                                        const stage6Data = window.stage6ImagePrompts[shotId];
                                        
                                        if (stage6Data) {
                                            // 첫 번째 이미지의 프롬프트 데이터 찾기
                                            const firstImageData = Object.values(stage6Data)[0];
                                            
                                            if (firstImageData && firstImageData.prompts) {
                                                // image_prompts 초기화
                                                if (!shot.image_prompts) {
                                                    shot.image_prompts = {};
                                                }
                                                
                                                // AI 도구별 프롬프트 병합
                                                Object.keys(firstImageData.prompts).forEach(aiTool => {
                                                    const promptData = firstImageData.prompts[aiTool];
                                                    
                                                    if (aiTool === 'midjourney') {
                                                        shot.image_prompts.midjourney = {
                                                            main_prompt: promptData.prompt || '',
                                                            main_prompt_translated: promptData.prompt_translated || '',
                                                            parameters: promptData.parameters || ''
                                                        };
                                                    } else {
                                                        let parameters = '';
                                                        if (promptData.negative_prompt) {
                                                            parameters = `Negative: ${promptData.negative_prompt}`;
                                                        }
                                                        if (promptData.aspect_ratio) {
                                                            parameters += parameters ? `; Aspect Ratio: ${promptData.aspect_ratio}` : `Aspect Ratio: ${promptData.aspect_ratio}`;
                                                        }
                                                        
                                                        shot.image_prompts[aiTool] = {
                                                            main_prompt: promptData.prompt || '',
                                                            main_prompt_translated: promptData.prompt_translated || '',
                                                            parameters: parameters
                                                        };
                                                    }
                                                });
                                                
                                                mergedCount++;
                                            }
                                        }
                                    });
                                    
                                    if (mergedCount > 0) {
                                        console.log(`✅ ${mergedCount}개의 샷에 Stage 6 이미지 프롬프트를 병합했습니다.`);
                                        // showMessage(`Stage 6 이미지 프롬프트가 ${mergedCount}개의 샷에 성공적으로 적용되었습니다.`, 'success');
                                        
                                        // 데이터 저장
                                        saveDataToLocalStorage();
                                    } else {
                                        console.log('⚠️ 병합할 수 있는 Stage 6 데이터를 찾지 못했습니다.');
                                    }
                                }
                                
                                // UI 업데이트
                                updateUI();
                            } else {
                                showMessage('처리할 수 있는 Stage 6 형식의 파일이 없습니다.', 'warning');
                            }
                            
                            // 처리 완료 플래그 설정 (임시 데이터는 유지)
                            localStorage.setItem('stage6TempFilesProcessed', 'true');
                        }
                    });
                    
                } catch (error) {
                    console.error('Stage 6 임시 JSON 파일들 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일들을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                showMessage('임시 저장된 파일들을 찾을 수 없습니다.', 'warning');
            }
        }, 3500);
    }
    // Stage 7에서 임시 저장된 JSON 파일들 자동 로드
    if (urlParams.get('loadStage7JsonMultiple') === 'true') {
        console.log('🔄 Stage 7 임시 저장된 JSON 파일들 자동 로드 실행...');
        setTimeout(() => {
            const tempJsonFiles = localStorage.getItem('stage7TempJsonFiles');
            const tempFileNames = localStorage.getItem('stage7TempFileNames');
            
            if (tempJsonFiles && tempFileNames) {
                // 중복 처리 방지 체크
                if (localStorage.getItem('stage7TempProcessed') === 'true') {
                    console.log('⚠️ Stage 7 데이터가 이미 처리되었습니다. 중복 처리를 방지합니다.');
                    // showMessage 제거 - 콘솔에만 표시
                    return;
                }
                
                try {
                    const jsonFiles = JSON.parse(tempJsonFiles);
                    const fileNames = JSON.parse(tempFileNames);
                    
                    console.log(`📁 Stage 7 임시 JSON 파일들 로드: ${fileNames.length}개`);
                    
                    let processedCount = 0;
                    let successCount = 0;
                    
                    // Stage 7 데이터를 전역 변수에 저장 (초기화)
                    if (!window.stage7VideoPrompts) {
                        window.stage7VideoPrompts = {};
                    }
                    
                    // 각 파일을 순차적으로 처리
                    jsonFiles.forEach((jsonContent, index) => {
                        try {
                            const result = practicalJSONHandler(jsonContent);
                            
                            if (result.success) {
                                const newData = result.data;
                                
                                // Stage 7 데이터 처리
                                if (newData.stage === 7 && newData.video_prompts) {
                                    console.log(`📚 Stage 7 영상 프롬프트 데이터 감지: ${fileNames[index]}`);
                                    
                                    if (Array.isArray(newData.video_prompts)) {
                                        newData.video_prompts.forEach(promptData => {
                                            const shotId = promptData.shot_id;
                                            const imageId = promptData.image_id;
                                            if (!window.stage7VideoPrompts[shotId]) {
                                                window.stage7VideoPrompts[shotId] = {};
                                            }
                                            window.stage7VideoPrompts[shotId][imageId] = promptData;
                                        });
                                        successCount++;
                                    }
                                } else {
                                    console.warn(`Stage 7 형식이 아닌 파일: ${fileNames[index]}`);
                                }
                            } else {
                                console.error(`JSON 파일 처리 실패: ${fileNames[index]}`);
                            }
                        } catch (error) {
                            console.error(`파일 처리 오류 (${fileNames[index]}):`, error);
                        }
                        
                        processedCount++;
                        
                        // 모든 파일 처리 완료시 메시지 표시 및 저장
                        if (processedCount === jsonFiles.length) {
                            if (successCount > 0) {
                                const jsonFileName = getProjectFileName();
                                localStorage.setItem(`stage7VideoPrompts_${jsonFileName}`, JSON.stringify(window.stage7VideoPrompts));
                                console.log(`✅ ${successCount}개의 Stage 7 파일을 성공적으로 로드했습니다. (총 ${jsonFiles.length}개 중)`);
                            } else {
                                showMessage('Stage 7 형식의 JSON 파일을 찾을 수 없습니다.', 'warning');
                            }
                        }
                    });
                    
                    // 처리 완료 플래그 설정 (임시 데이터는 유지)
                    localStorage.setItem('stage7TempProcessed', 'true');
                    
                } catch (error) {
                    console.error('Stage 7 여러 임시 JSON 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일들을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                console.log('임시 저장된 Stage 7 JSON 데이터들을 찾을 수 없습니다.');
                showMessage('임시 저장된 파일들을 찾을 수 없습니다.', 'warning');
            }
        }, 4500);
    }
    // Stage 8에서 임시 저장된 JSON 파일들 자동 로드
    if (urlParams.get('loadStage8JsonMultiple') === 'true') {
        console.log('🔄 Stage 8 임시 저장된 JSON 파일들 자동 로드 실행...');
        setTimeout(() => {
            const tempJsonFiles = localStorage.getItem('stage8TempJsonFiles');
            const tempFileNames = localStorage.getItem('stage8TempFileNames');
            
            if (tempJsonFiles && tempFileNames) {
                // 중복 처리 방지 체크
                if (localStorage.getItem('stage8TempProcessed') === 'true') {
                    console.log('⚠️ Stage 8 데이터가 이미 처리되었습니다. 중복 처리를 방지합니다.');
                    // showMessage 제거 - 콘솔에만 표시
                    return;
                }
                
                try {
                    const jsonFiles = JSON.parse(tempJsonFiles);
                    const fileNames = JSON.parse(tempFileNames);
                    
                    console.log(`📁 Stage 8 임시 JSON 파일들 로드: ${fileNames.length}개`);
                    
                    let processedCount = 0;
                    let successCount = 0;
                    let audioDataUpdated = false;
                    
                    // 각 파일을 순차적으로 처리
                    jsonFiles.forEach((jsonContent, index) => {
                        try {
                            const result = practicalJSONHandler(jsonContent);
                            
                            if (result.success) {
                                const newData = result.data;
                                
                                // Stage 8 데이터 처리
                                if (newData.stage === 8 && newData.audio_data) {
                                    console.log(`📚 Stage 8 오디오 프롬프트 데이터 감지: ${fileNames[index]}`);
                                    
                                    // 기존 handleFileSelect 로직에서 Stage 8 처리 부분 재사용
                                    if (currentData && currentData.breakdown_data && currentData.breakdown_data.shots && currentData.breakdown_data.shots.length > 0) {
                                        console.log(`🔍 현재 프로젝트의 shot 개수: ${currentData.breakdown_data.shots.length}`);
                                        console.log(`🔍 현재 프로젝트의 shot IDs:`, currentData.breakdown_data.shots.map(s => s.id));
                                        
                                        // Stage 8 JSON 구조: audio_data.shots 배열 접근
                                        const audioShots = newData.audio_data && newData.audio_data.shots ? newData.audio_data.shots : [];
                                        console.log(`🔍 처리할 오디오 shot 개수: ${audioShots.length}`);
                                        console.log(`🔍 오디오 shot IDs:`, audioShots.map(s => s.id));
                                        
                                        let matchedCount = 0;
                                        audioShots.forEach((audioShot, audioIndex) => {
                                            console.log(`🔍 오디오 Shot ${audioIndex + 1}:`, audioShot);
                                            
                                            const shotId = audioShot.id;
                                            console.log(`🔍 찾는 shot_id: ${shotId}`);
                                            
                                            if (shotId) {
                                                const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
                                                
                                                if (shot) {
                                                    console.log(`✅ Shot 매치됨: ${shotId}`);
                                                    
                                                    // shot.content가 없으면 생성
                                                    if (!shot.content) {
                                                        shot.content = {};
                                                    }
                                                    
                                                    // Stage 8 JSON 구조에서 오디오 정보 추출 및 병합
                                                    if (audioShot.content) {
                                                        // dialogue_by_character, dialogue_sequence, narration 등을 병합
                                                        Object.assign(shot.content, audioShot.content);
                                                        console.log(`✅ content 병합됨:`, audioShot.content);
                                                        console.log(`✅ 병합 후 shot.content:`, shot.content);
                                                        console.log(`✅ dialogue_by_character:`, shot.content.dialogue_by_character);
                                                        console.log(`✅ dialogue_sequence:`, shot.content.dialogue_sequence);
                                                    }
                                                    
                                                    // audio_prompts 병합 및 한글 음향효과 설명 처리
                                                    if (audioShot.audio_prompts) {
                                                        shot.audio_prompts = audioShot.audio_prompts;
                                                        console.log(`✅ audio_prompts 병합됨`);
                                                        
                                                        // Stage 8에서 한글 음향효과 설명 추출 (개선된 로직)
                                                        // 이미 sound_effects가 있으면 덮어쓰지 않음
                                                        if (audioShot.audio_prompts.sound_effects && !shot.content.sound_effects) {
                                                            if (audioShot.audio_prompts.sound_effects.prompt_ko) {
                                                                // prompt_ko에서 한글 설명 추출
                                                                const promptKo = audioShot.audio_prompts.sound_effects.prompt_ko;
                                                                let koDescription = '';
                                                                
                                                                // 여러 패턴으로 시도
                                                                // 패턴 1: "음향:" 다음 부분 추출
                                                                const pattern1 = promptKo.match(/음향:\s*(.+?)(?:\.|$)/);
                                                                if (pattern1) {
                                                                    koDescription = pattern1[1].trim();
                                                                }
                                                                
                                                                // 패턴 2: 샷 번호와 "음향:" 제거 (원본 로직)
                                                                if (!koDescription) {
                                                                    koDescription = promptKo.replace(/^[^\s]+\s+음향:\s*/, '');
                                                                }
                                                                
                                                                // 패턴 3: 콜론 앞부분만 추출
                                                                if (!koDescription && promptKo.includes(':')) {
                                                                    const colonIndex = promptKo.indexOf(':');
                                                                    koDescription = promptKo.substring(0, colonIndex).trim();
                                                                }
                                                                
                                                                // 패턴 4: 전체 문자열 사용 (샷 번호만 제거)
                                                                if (!koDescription) {
                                                                    koDescription = promptKo.replace(/^S\d+\.\d+\s*/, '').trim();
                                                                }
                                                                
                                                                shot.content.sound_effects = koDescription;
                                                                console.log(`✅ 한글 음향효과 설명 추출됨:`, koDescription);
                                                            } else if (audioShot.audio_prompts.sound_effects.description) {
                                                                // fallback: description 사용
                                                                shot.content.sound_effects = audioShot.audio_prompts.sound_effects.description;
                                                                console.log(`✅ 음향효과 description 사용:`, shot.content.sound_effects);
                                                            }
                                                        }
                                                    }
                                                    
                                                    // music_memo 병합
                                                    if (audioShot.music_memo) {
                                                        shot.music_memo = audioShot.music_memo;
                                                        console.log(`✅ music_memo 병합됨`);
                                                    }
                                                    
                                                    audioDataUpdated = true;
                                                    matchedCount++;
                                                } else {
                                                    console.warn(`❌ Shot을 찾을 수 없음: ${shotId}`);
                                                }
                                            } else {
                                                console.warn(`❌ shot_id가 없는 오디오 Shot:`, audioShot);
                                            }
                                        });
                                        
                                        console.log(`📊 매치된 오디오 데이터: ${matchedCount}/${audioShots.length}`);
                                        successCount++;
                                    } else {
                                        console.warn(`기본 프로젝트 데이터 부족으로 파일 건너뜀: ${fileNames[index]}`);
                                    }
                                } else {
                                    console.warn(`Stage 8 형식이 아닌 파일: ${fileNames[index]}`);
                                }
                            } else {
                                console.error(`JSON 파일 처리 실패: ${fileNames[index]}`);
                            }
                        } catch (error) {
                            console.error(`파일 처리 오류 (${fileNames[index]}):`, error);
                        }
                        
                        processedCount++;
                        
                        // 모든 파일 처리 완료시 메시지 표시 및 저장
                        if (processedCount === jsonFiles.length) {
                            if (successCount > 0 && audioDataUpdated) {
                                saveDataToLocalStorage();
                                updateUI();
                                console.log(`✅ ${successCount}개의 Stage 8 파일을 성공적으로 로드했습니다. (총 ${jsonFiles.length}개 중)`);
                            } else if (successCount > 0) {
                                showMessage('오디오 데이터 병합 중 문제가 발생했습니다.', 'warning');
                            } else if (processedCount > 0) {
                                showMessage('Stage 8 데이터를 로드하려면 먼저 기본 프로젝트 데이터를 로드해야 합니다.', 'warning');
                            } else {
                                showMessage('Stage 8 형식의 JSON 파일을 찾을 수 없습니다.', 'warning');
                            }
                        }
                    });
                    
                    // 처리 완료 플래그 설정 (임시 데이터는 유지)
                    localStorage.setItem('stage8TempProcessed', 'true');
                    
                } catch (error) {
                    console.error('Stage 8 여러 임시 JSON 로드 오류:', error);
                    showMessage('임시 저장된 JSON 파일들을 로드할 수 없습니다.', 'error');
                    // 오류 시에도 임시 데이터 유지 (재시도 가능하도록)
                }
            } else {
                console.log('임시 저장된 Stage 8 JSON 데이터들을 찾을 수 없습니다.');
                showMessage('임시 저장된 파일들을 찾을 수 없습니다.', 'warning');
            }
        }, 5000);
    }
    // 기존 autoImport 파라미터 처리
    else if (urlParams.get('autoImport') === 'true') {
        console.log('🔄 자동 JSON 가져오기 실행...');
        setTimeout(() => {
            // 파일 입력 요소 직접 클릭하여 파일 선택 대화상자 열기
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.click();
                showMessage('JSON 파일을 선택해주세요.', 'info');
                console.log('✅ 파일 선택 대화상자가 열렸습니다.');
            } else {
                console.error('❌ 파일 입력 요소를 찾을 수 없습니다.');
                showMessage('파일 입력 요소를 찾을 수 없습니다.', 'error');
            }
        }, 1500); // 1.5초 지연으로 페이지가 완전히 로드된 후 실행
    }
    
    console.log('✅ 초기화 완료');
} catch (error) {
    console.error('❌ 초기화 오류:', error);
    showMessage(`초기화 오류: ${error.message}`, 'error');
}
    });
    
    console.log('✅ JavaScript 로딩 완료');

// 프롬프트 수정 기능 관련 코드
let editedPrompts = JSON.parse(localStorage.getItem('editedImagePrompts') || '{}');

// 프롬프트 수정 버튼 클릭 시 호출되는 함수
function editImagePrompt(shotId, aiName, imageId, originalPrompt, translatedPrompt, parameters) {
    // 수정 모달 HTML 생성
    const modalHtml = `
        <div id="prompt-edit-modal" class="modal-overlay" onclick="closePromptEditModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>프롬프트 수정 - ${aiName} ${imageId}</h3>
                    <button class="modal-close-btn" onclick="closePromptEditModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>원본 프롬프트:</label>
                        <textarea id="edit-original-prompt" class="prompt-textarea" rows="4">${originalPrompt}</textarea>
                    </div>
                    ${translatedPrompt ? `
                    <div class="form-group">
                        <label>번역된 프롬프트:</label>
                        <textarea id="edit-translated-prompt" class="prompt-textarea" rows="4">${translatedPrompt}</textarea>
                    </div>
                    ` : ''}
                    ${parameters ? `
                    <div class="form-group">
                        <label>파라미터:</label>
                        <input type="text" id="edit-parameters" class="prompt-input" value="${parameters}">
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closePromptEditModal()">취소</button>
                    <button class="btn btn-primary" onclick="saveEditedPrompt('${shotId}', '${aiName}', '${imageId}')">저장</button>
                </div>
            </div>
        </div>
    `;
    
    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 모달 스타일 추가 (없으면)
    addPromptEditModalStyles();
}

// 수정된 프롬프트 저장
function saveEditedPrompt(shotId, aiName, imageId) {
    const originalPrompt = document.getElementById('edit-original-prompt').value;
    const translatedPromptEl = document.getElementById('edit-translated-prompt');
    const parametersEl = document.getElementById('edit-parameters');
    
    const editKey = `${shotId}_${aiName}_${imageId}`;
    
    // 수정된 프롬프트 데이터 구성
    const editedData = {
        shotId,
        aiName,
        imageId,
        originalPrompt,
        translatedPrompt: translatedPromptEl ? translatedPromptEl.value : null,
        parameters: parametersEl ? parametersEl.value : null,
        editedAt: new Date().toISOString()
    };
    
    // localStorage에 저장
    editedPrompts[editKey] = editedData;
    localStorage.setItem('editedImagePrompts', JSON.stringify(editedPrompts));
    
    // 모달 닫기
    closePromptEditModal();
    
    // UI 업데이트
    updateUI();
    
    showMessage('프롬프트가 수정되었습니다.', 'success');
}

// 프롬프트 수정 모달 닫기
function closePromptEditModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('prompt-edit-modal');
    if (modal) {
        modal.remove();
    }
}

// 프롬프트 수정 모달 스타일 추가
function addPromptEditModalStyles() {
    if (!document.getElementById('prompt-edit-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'prompt-edit-modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .modal-content {
                background: var(--bg-secondary, #2a2a2a);
                border-radius: 8px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--text-primary, #fff);
            }
            
            .modal-close-btn {
                background: none;
                border: none;
                color: var(--text-secondary, #999);
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-close-btn:hover {
                color: var(--text-primary, #fff);
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text-primary, #fff);
                font-weight: 500;
            }
            
            .prompt-textarea, .prompt-input {
                width: 100%;
                background: var(--bg-tertiary, #1a1a1a);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-primary, #fff);
                padding: 10px;
                border-radius: 4px;
                font-size: 14px;
                resize: vertical;
            }
            
            .prompt-textarea:focus, .prompt-input:focus {
                outline: none;
                border-color: var(--accent-purple, #a855f7);
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .btn {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: var(--accent-purple, #a855f7);
                color: white;
            }
            
            .btn-primary:hover {
                background: var(--accent-purple-hover, #9333ea);
            }
            
            .btn-secondary {
                background: var(--bg-tertiary, #1a1a1a);
                color: var(--text-primary, #fff);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .btn-secondary:hover {
                background: var(--bg-hover, #333);
            }
        `;
        document.head.appendChild(style);
    }
}

// 수정된 프롬프트 가져오기
function getEditedPrompt(shotId, aiName, imageId) {
    const editKey = `${shotId}_${aiName}_${imageId}`;
    return editedPrompts[editKey];
}

// AI 수정 버튼 클릭 시 호출되는 함수
function aiEditImagePrompt(shotId, aiName, imageId, originalPrompt) {
    try {
        // 수정된 프롬프트가 있는지 확인
        const editedPrompt = getEditedPrompt(shotId, aiName, imageId);
        let promptToTransfer = originalPrompt;
        
        if (editedPrompt && editedPrompt.originalPrompt) {
            promptToTransfer = editedPrompt.originalPrompt;
            console.log('수정된 프롬프트 사용:', promptToTransfer);
        } else {
            console.log('원본 프롬프트 사용:', promptToTransfer);
        }
        
        // 프롬프트를 localStorage에 저장
        localStorage.setItem('aiEditPrompt', promptToTransfer);
        
        // 이미지 프롬프트 생성기 페이지로 이동
        window.location.href = '../image_prompt_generator.html';
    } catch (error) {
        console.error('AI 수정 버튼 처리 중 오류:', error);
        showMessage('프롬프트 전달 중 오류가 발생했습니다.', 'error');
    }
}
