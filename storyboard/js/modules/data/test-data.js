/**
 * Test Data 모듈
 * 개발 및 테스트용 샘플 데이터
 * IIFE 패턴으로 전역 네임스페이스 오염 방지
 */
(function(window) {
    'use strict';

    // 네임스페이스 생성
    window.TestData = window.TestData || {};

    /**
     * 테스트 데이터 생성 함수
     * app.js의 createTestData 함수를 모듈화
     */
    window.TestData.createTestData = 
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
				// 이미지 캐시 로드
				loadImageCacheFromLocalStorage();
				
				// localStorage에서 데이터 찾기 - 여러 가능한 키를 확인
				let savedData = null;
				const possibleKeys = [
					'breakdownData_storyboard_project',  // v1.1.0 기본값
					'breakdownData_Film_Production_Manager.json',  // 기본값
				];
				
				// 실제 프로젝트명이 있으면 추가
				const jsonFileName = getProjectFileName();
				if (jsonFileName && !possibleKeys.includes(`breakdownData_${jsonFileName}`)) {
					possibleKeys.unshift(`breakdownData_${jsonFileName}`);
				}
				
				// 가능한 키들을 순서대로 확인
				for (const key of possibleKeys) {
					const data = localStorage.getItem(key);
					if (data) {
						debugLog(`📂 localStorage에서 데이터 발견: ${key}`);
						savedData = data;
						break;
					}
				}
				
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
				
				// Universal 이미지 데이터 확인 및 배열 구조 보장
				debugLog('🔍 로드된 데이터에서 Universal 이미지 확인 및 정규화:');
				parsedData.breakdown_data?.shots?.forEach(shot => {
					// image_design 구조 초기화 (ai_generated_images는 따로 처리)
					if (!shot.image_design) {
						shot.image_design = { 
							aspect_ratio: "16:9", 
							selected_plan: "plan_a"
							// ai_generated_images는 여기서 초기화하지 않음! 기존 데이터 보존
						};
					}
					
					// ai_generated_images가 없을 때만 초기화
					if (!shot.image_design.ai_generated_images) {
						shot.image_design.ai_generated_images = {};
					}
					
					// 각 AI 도구별 배열 구조 보장 (모든 AI 도구 포함)
					const aiTools = ['universal', 'nanobana', 'midjourney', 'ideogram', 'leonardo', 'imagefx', 'luma', 'kling', 'veo2', 'runway', 'minimax', 'cogvideo', 'pika', 'haiper', 'pixverse', 'morph', 'hotshot', 'hunyuan', 'pika2', 'haiper2', 'lightricks', 'genmo'];
					aiTools.forEach(aiId => {
						if (!shot.image_design.ai_generated_images[aiId]) {
							shot.image_design.ai_generated_images[aiId] = [];
						} else if (!Array.isArray(shot.image_design.ai_generated_images[aiId])) {
							// 객체를 배열로 변환
							const oldData = shot.image_design.ai_generated_images[aiId];
							const newArray = [];
							for (let i = 0; i < 3; i++) {
								const key = String(i);
								newArray.push(oldData[key] || { url: '', description: '' });
							}
							shot.image_design.ai_generated_images[aiId] = newArray;
						}
						
						// 배열 크기 및 요소 검증
						while (shot.image_design.ai_generated_images[aiId].length < 3) {
							shot.image_design.ai_generated_images[aiId].push({ url: '', description: '' });
						}
						
						// 각 요소가 올바른 객체인지 확인
						for (let i = 0; i < shot.image_design.ai_generated_images[aiId].length; i++) {
							if (!shot.image_design.ai_generated_images[aiId][i] || typeof shot.image_design.ai_generated_images[aiId][i] !== 'object') {
								shot.image_design.ai_generated_images[aiId][i] = { url: '', description: '' };
							}
						}
					});
					
					// Universal 및 다른 AI 도구 데이터 확인
					if (shot.image_design?.ai_generated_images?.universal) {
						const universalData = shot.image_design.ai_generated_images.universal;
						const urlCount = universalData.filter(img => img && img.url).length;
						if (urlCount > 0) {
							debugLog(`✅ 샷 ${shot.id} Universal 데이터 로드: ${urlCount}개 URL`, universalData);
						}
					}
				});
				
				// Stage 6, 7 데이터 복원
				const savedStage6 = localStorage.getItem(`stage6ImagePrompts_${jsonFileName}`);
				if (savedStage6) {
					window.stage6ImagePrompts = JSON.parse(savedStage6);
				}

				const savedStage7 = localStorage.getItem(`stage7VideoPrompts_${jsonFileName}`);
				if (savedStage7) {
					window.stage7VideoPrompts = JSON.parse(savedStage7);
					debugLog('✅ localStorage에서 stage7VideoPrompts 복원:', Object.keys(window.stage7VideoPrompts).length, '개 샷');
				} else {
					debugLog('⚠️ localStorage에 stage7VideoPrompts 데이터 없음');
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
				window.currentData = currentData;
				// Stage 2 구조 존재 여부 확인 (향상된 체크)
				if (currentData.hasStage2Structure || 
				    (currentData.breakdown_data && currentData.breakdown_data.sequences && currentData.breakdown_data.sequences.length > 0) ||
				    (currentData.stage2_data)) {
					hasStage2Structure = true;
					currentData.hasStage2Structure = true; // 데이터에도 플래그 설정
					debugLog('🎬 Stage 2 구조가 복원되었습니다:', hasStage2Structure);
				} else {
					hasStage2Structure = false;
					debugLog('⚠️ Stage 2 구조가 없습니다.');
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
				window.currentData = currentData;
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
					
					// Universal/Nanobana 데이터 저장 확인
					const universalNanobanaData = currentData.breakdown_data?.shots?.map(shot => ({
						shotId: shot.id,
						universal: shot.image_design?.ai_generated_images?.universal,
						nanobana: shot.image_design?.ai_generated_images?.nanobana,
						universalPrompt: shot.image_prompts?.universal,
						nanobanaPrompt: shot.image_prompts?.nanobana
					})).filter(item => 
						item.universal?.some(img => img?.url) || 
						item.nanobana?.some(img => img?.url) ||
						item.universalPrompt?.main_prompt ||
						item.nanobanaPrompt?.main_prompt
					);
					
					if (universalNanobanaData.length > 0) {
						debugLog('💾 Universal/Nanobana 데이터 저장 중:', universalNanobanaData);
					}
					
					const dataString = JSON.stringify(currentData);
					
					// localStorage 용량 체크 및 처리
					try {
						localStorage.setItem(`breakdownData_${jsonFileName}`, dataString);
						localStorage.setItem(`lastSaved_${jsonFileName}`, new Date().toISOString());
						return true; // 성공 시 true 반환
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

					return true; // 저장 성공
				}
				return false; // currentData가 없음
			} catch (error) { 
				showMessage('로컬 저장 실패: ' + error.message, 'error'); 
				return false; // 오류 발생
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
               debugWarn('Stage 6 데이터 파싱 실패:', e);
           }
       }
       
       // Stage 7 비디오 프롬프트 데이터
       const stage7Data = localStorage.getItem(`stage7VideoPrompts_${jsonFileName}`);
       if (stage7Data) {
           try {
               fullBackup.additional_stage_data.stage7VideoPrompts = JSON.parse(stage7Data);
           } catch (e) {
               debugWarn('Stage 7 데이터 파싱 실패:', e);
           }
       }
       
       // Stage 8 오디오 프롬프트 데이터
       const stage8Data = localStorage.getItem(`stage8AudioPrompts_${jsonFileName}`);
       if (stage8Data) {
           try {
               fullBackup.additional_stage_data.stage8AudioPrompts = JSON.parse(stage8Data);
           } catch (e) {
               debugWarn('Stage 8 데이터 파싱 실패:', e);
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
				const parsedData = JSON.parse(jsonString);
				
				// Stage 5 형식 체크 및 변환 (v5.0.0, v3.0.0, v1.1.0, v6.0 지원)
				if ((parsedData.stage === 5 && parsedData.schema_version === "5.0.0") || 
				    (parsedData.schema_version === "3.0.0" && parsedData.breakdown_data) ||
				    (parsedData.schema_version === "1.1.0" && parsedData.breakdown_data) ||
				    (parsedData.stage === 5 && parsedData.version === "6.0" && parsedData.breakdown_data)) {
					debugLog('🔍 Stage 5 형식 감지됨:', parsedData.schema_version || parsedData.version);
					
					// v1.1.0 형식은 이미 올바른 형식이므로 scene_id 매핑 확인 후 반환
					if (parsedData.schema_version === "1.1.0" && 
					    parsedData.breakdown_data && 
					    parsedData.breakdown_data.sequences && 
					    parsedData.breakdown_data.scenes && 
					    parsedData.breakdown_data.shots) {
						debugLog('✅ v1.1.0 형식 확인 - 호환 가능');
						
						// 샷의 scene_id 확인 및 정규화
						parsedData.breakdown_data.shots.forEach(shot => {
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
						parsedData.breakdown_data.scenes.forEach(scene => {
							if (!scene.shot_ids) {
								scene.shot_ids = [];
							}
							// 해당 씬에 속하는 샷들의 ID 수집
							const sceneShots = parsedData.breakdown_data.shots.filter(shot => shot.scene_id === scene.id);
							sceneShots.forEach(shot => {
								if (!scene.shot_ids.includes(shot.id)) {
									scene.shot_ids.push(shot.id);
								}
							});
							debugLog(`  씬 ${scene.id}의 shot_ids: ${scene.shot_ids.join(', ')}`);
						});
						
						parsedData.hasStage2Structure = true;
						return { success: true, data: parsedData };
					}
					
					const convertedData = convertStage5V5Format(parsedData);
					if (convertedData) {
						if (parsedData.schema_version === "5.0.0") {
							showMessage('Stage 5 v5.0.0 형식을 자동으로 변환했습니다.', 'success');
						} else if (parsedData.version === "6.0") {
							showMessage('Stage 5 v6.0 형식(CF 프로젝트)을 자동으로 변환했습니다.', 'success');
						} else if (parsedData.schema_version === "3.0.0") {
							// showMessage('Stage 5 v3.0.0 형식을 확인했습니다.', 'success'); // 메시지 표시 비활성화
						}
						return { success: true, data: convertedData };
					}
				}
				
				return { success: true, data: parsedData };
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
					
					// Stage 5 형식 체크 및 변환 (오류 수정 후에도 시도, v6.0 포함)
					if ((data.stage === 5 && data.schema_version === "5.0.0") || 
					    (data.schema_version === "3.0.0" && data.breakdown_data) ||
					    (data.stage === 5 && data.version === "6.0" && data.breakdown_data)) {
						debugLog('🔍 Stage 5 형식 감지됨 (수정 후):', data.schema_version || data.version);
						const convertedData = convertStage5V5Format(data);
						if (convertedData) {
							if (data.schema_version === "5.0.0") {
								showMessage('Stage 5 v5.0.0 형식을 자동으로 변환했습니다.', 'success');
							} else if (data.version === "6.0") {
								showMessage('Stage 5 v6.0 형식(CF 프로젝트)을 자동으로 변환했습니다.', 'success');
							} else if (data.schema_version === "3.0.0") {
								// showMessage('Stage 5 v3.0.0 형식을 확인했습니다.', 'success'); // 메시지 표시 비활성화
							}
							return { success: true, data: convertedData, wasFixed: true };
						}
					}

					// Stage 2 특수 처리: 잘못 배치된 캐릭터 데이터 수정
					if ((data.current_stage_name === 'narrative_development' || data.current_stage_name === 'scenario_development') && (data.narrative_data || data.scenario_data)) {
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

           // v1.1.0 형식은 바로 처리 (디버깅 강화)
           debugLog('📌 업로드된 파일 분석 중...');
           debugLog('  - schema_version:', newData.schema_version);
           debugLog('  - breakdown_data 존재:', !!newData.breakdown_data);
           debugLog('  - video_prompts 존재:', !!newData.video_prompts, typeof newData.video_prompts);
           
           // Stage 5 데이터를 로드할 때 Stage 7 캐시 초기화
           if (newData.stage === 5 || (newData.breakdown_data && !newData.video_prompts)) {
               debugLog('🧹 Stage 5 데이터 로드 - Stage 7 캐시 초기화');
               window.stage7VideoPrompts = {};
               const jsonFileName = getProjectFileName();
               if (jsonFileName) {
                   localStorage.removeItem(`stage7VideoPrompts_${jsonFileName}`);
               }
           }
           if (newData.video_prompts) {
               if (Array.isArray(newData.video_prompts)) {
                   debugLog('  - video_prompts 배열:', newData.video_prompts.length, '개');
               } else if (typeof newData.video_prompts === 'object') {
                   debugLog('  - video_prompts 객체:', Object.keys(newData.video_prompts).length, '개');
                   debugLog('  - video_prompts 키들:', Object.keys(newData.video_prompts).slice(0, 5));
               }
           }
           if (newData.breakdown_data) {
               debugLog('  - sequences 존재:', !!newData.breakdown_data.sequences, newData.breakdown_data.sequences?.length || 0, '개');
               debugLog('  - scenes 존재:', !!newData.breakdown_data.scenes, newData.breakdown_data.scenes?.length || 0, '개');
               debugLog('  - shots 존재:', !!newData.breakdown_data.shots, newData.breakdown_data.shots?.length || 0, '개');
               
               // shots 배열이 없으면 빈 배열로 초기화
               if (!newData.breakdown_data.shots) {
                   debugLog('⚠️ shots 배열이 없어서 빈 배열로 초기화');
                   newData.breakdown_data.shots = [];
               }
               // shots가 null이거나 배열이 아닌 경우도 처리
               if (!Array.isArray(newData.breakdown_data.shots)) {
                   debugLog('⚠️ shots가 배열이 아니어서 빈 배열로 초기화');
                   newData.breakdown_data.shots = [];
               }
               
               // 각 shot의 video_prompts 존재 여부 확인
               if (newData.breakdown_data.shots && newData.breakdown_data.shots.length > 0) {
                   let videoPromptsCount = 0;
                   newData.breakdown_data.shots.forEach(shot => {
                       if (shot.video_prompts && Object.keys(shot.video_prompts).length > 0) {
                           videoPromptsCount++;
                           debugLog(`  🎬 Shot ${shot.id}에 video_prompts 발견:`, Object.keys(shot.video_prompts).slice(0, 3));
                       }
                   });
                   debugLog(`  - video_prompts가 있는 shots: ${videoPromptsCount}개`);
               }
           }
           
           if (newData.schema_version === "1.1.0" && newData.breakdown_data && 
               newData.breakdown_data.sequences && newData.breakdown_data.scenes && newData.breakdown_data.shots) {
               debugLog('✅ v1.1.0 형식 조건 매치! 파일 처리 시작...');
               
               // v1.1.0 형식은 그 자체가 완전한 데이터
               // AppState 모듈 호환성 처리
               if (window.AppState && typeof window.AppState.set === 'function') {
                   AppState.set('currentData', newData);
                   AppState.set('hasStage2Structure', true);
               } else {
                   currentData = newData;
                   window.currentData = currentData;
                   hasStage2Structure = true;
               }
               
               // 각 shot의 video_prompts 확인 및 처리
               if (currentData.breakdown_data.shots && currentData.breakdown_data.shots.length > 0) {
                   debugLog('🎬 각 shot의 video_prompts 확인 중...');
                   let processedCount = 0;
                   
                   currentData.breakdown_data.shots.forEach(shot => {
                       // video_prompts가 있는 경우 그대로 사용
                       if (shot.video_prompts && Object.keys(shot.video_prompts).length > 0) {
                           processedCount++;
                           debugLog(`  ✅ Shot ${shot.id}: ${Object.keys(shot.video_prompts).length}개의 video_prompts 보존`);
                       }
                   });
                   
                   debugLog(`🎬 총 ${processedCount}개의 shot에서 video_prompts 확인됨`);
               }
               
               // breakdown_data에 별도의 video_prompts 객체가 있는 경우 (레거시 지원)
               if (currentData.breakdown_data.video_prompts && typeof currentData.breakdown_data.video_prompts === 'object') {
                   debugLog('🎬 breakdown_data.video_prompts 발견 (레거시 형식)');
                   const videoPromptsData = currentData.breakdown_data.video_prompts;
                   
                   // 각 shot에 대해 매칭되는 video_prompts 찾기
                   currentData.breakdown_data.shots.forEach(shot => {
                       if (!shot.video_prompts) {
                           shot.video_prompts = {};
                       }
                       
                       // shot.id와 관련된 모든 video_prompts 찾기
                       Object.keys(videoPromptsData).forEach(key => {
                           if (key.startsWith(shot.id)) {
                               // 이미지 ID 추출 (예: S01.01-A-01 -> A-01)
                               const imageId = key.replace(shot.id + '-', '');
                               shot.video_prompts[imageId] = videoPromptsData[key];
                               debugLog(`  ✅ ${shot.id}에 ${imageId} 영상 프롬프트 병합 (레거시)`);
                           }
                       });
                   });
               }
               
               // project_info가 없으면 기본값 설정
               // Film_Production_Manager.json을 사용하여 기본 키와 일치시킴
               if (!currentData.project_info) {
                   currentData.project_info = {
                       name: 'Film_Production_Manager.json',
                       created_at: new Date().toISOString()
                   };
               }
               
               debugLog('🔄 데이터 저장 시도...');
               saveDataToLocalStorage();
               debugLog('🔄 UI 업데이트 시도...');
               updateUI();
               
               const totalShots = currentData.breakdown_data.shots ? currentData.breakdown_data.shots.length : 0;
               const totalScenes = currentData.breakdown_data.scenes ? currentData.breakdown_data.scenes.length : 0;
               const totalSequences = currentData.breakdown_data.sequences ? currentData.breakdown_data.sequences.length : 0;
               
               showMessage(
                   `✅ v1.1.0 프로젝트 데이터가 성공적으로 로드되었습니다!\n` +
                   `시퀀스: ${totalSequences}개, ` +
                   `씬: ${totalScenes}개, ` +
                   `샷: ${totalShots}개`, 
                   'success'
               );
               
               event.target.value = '';
               return;
           }
           
           // 일반 전체 프로젝트 백업 파일 처리
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
               // AppState 모듈 호환성 처리
               if (window.AppState && typeof window.AppState.set === 'function') {
                   AppState.set('currentData', newData.data);
               } else {
                   currentData = newData.data;
               }
               window.currentData = currentData;
               
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
               
               // 시퀀스 데이터 확인 및 디버깅 (상세)
               if (currentData.breakdown_data && currentData.breakdown_data.sequences) {
                   const totalShots = currentData.breakdown_data.shots ? currentData.breakdown_data.shots.length : 0;
                   const totalScenes = currentData.breakdown_data.scenes ? currentData.breakdown_data.scenes.length : 0;
                   const totalSequences = currentData.breakdown_data.sequences.length;
                   
                   debugLog(`✅ 백업 복원 완료: ${totalSequences}개 시퀀스, ${totalScenes}개 씬, ${totalShots}개 샷`);
                   debugLog('📁 전체 데이터 구조:', currentData);
                   
                   // 샷 데이터 상세 확인
                   if (currentData.breakdown_data.shots && currentData.breakdown_data.shots.length > 0) {
                       debugLog('📊 Shots 데이터 확인:');
                       currentData.breakdown_data.shots.slice(0, 5).forEach(shot => {
                           debugLog(`  - ${shot.id}: "${shot.title}" (scene_id: ${shot.scene_id})`);
                       });
                       if (currentData.breakdown_data.shots.length > 5) {
                           debugLog(`  ... 외 ${currentData.breakdown_data.shots.length - 5}개`);
                       }
                   } else {
                       debugWarn('⚠️ shots 배열이 비어있거나 없습니다!');
                       
                       // shot_ids 확인
                       if (currentData.breakdown_data.scenes) {
                           const totalShotIds = currentData.breakdown_data.scenes.reduce((acc, scene) => {
                               return acc + (scene.shot_ids ? scene.shot_ids.length : 0);
                           }, 0);
                           
                           if (totalShotIds > 0) {
                               debugWarn(`⚠️ ${totalShotIds}개의 shot_id가 있지만 shots 데이터가 없습니다.`);
                               currentData.breakdown_data.scenes.forEach(scene => {
                                   if (scene.shot_ids && scene.shot_ids.length > 0) {
                                       debugLog(`  ${scene.id}: shot_ids = [${scene.shot_ids.join(', ')}]`);
                                   }
                               });
                           }
                       }
                   }
               }
               
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
                       
                       // 메인 이미지 복원
                       if (shotUrls.main_images) {
                           shot.main_images = shotUrls.main_images;
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
                   debugWarn('⚠️ Stage 2 구조가 없어도 Stage 8 데이터를 처리합니다.');
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

							// generation_settings 저장 (선택된 AI 도구 정보 포함)
							if (newData.generation_settings) {
								window.stage6ImagePrompts.generation_settings = newData.generation_settings;
								debugLog('📌 Stage 6 generation_settings:', newData.generation_settings);
							}

							newData.shots.forEach(shotData => {
								const shotId = shotData.shot_id;
								// 기존 데이터를 완전히 대체 (업데이트)
								window.stage6ImagePrompts[shotId] = {};

								shotData.images.forEach(imageData => {
									const imageId = imageData.image_id;
									window.stage6ImagePrompts[shotId][imageId] = imageData;
									
									// 디버깅: Universal과 Nanobana 프롬프트 확인
									if (imageData.prompts) {
										if (imageData.prompts.universal) {
											debugLog(`✅ Stage 6 Universal 프롬프트 발견: ${shotId} - ${imageId}`);
										}
										if (imageData.prompts.nanobana) {
											debugLog(`✅ Stage 6 Nanobana 프롬프트 발견: ${shotId} - ${imageId}`);
										}
									}
								});
								
								debugLog(`📌 Stage 6 샷 ${shotId} 저장 완료:`, Object.keys(window.stage6ImagePrompts[shotId]).length, '개 이미지');
							});

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
							
							// currentData가 있으면 Stage 6 데이터를 shots에 병합
							if (currentData && currentData.breakdown_data && currentData.breakdown_data.shots) {
								let mergedCount = 0;
								
								currentData.breakdown_data.shots.forEach(shot => {
									const shotId = shot.id;
									const stage6Data = window.stage6ImagePrompts[shotId];
									
									if (stage6Data) {
										// 모든 이미지 데이터를 처리 (첫 번째만이 아닌)
										const allImageData = Object.values(stage6Data);
										
										if (allImageData.length > 0) {
											// 첫 번째 이미지의 프롬프트를 기본값으로 사용 (하위 호환성)
											const firstImageData = allImageData[0];
											
											if (firstImageData && firstImageData.prompts) {
												if (!shot.image_prompts) {
													shot.image_prompts = {};
												}
												
												// AI 도구별 프롬프트 처리 (첫 번째 이미지 기준)
												Object.keys(firstImageData.prompts).forEach(aiTool => {
													const promptData = firstImageData.prompts[aiTool];
													
													if (aiTool === 'universal') {
														const universalPrompt = typeof promptData === 'string' ? promptData : (promptData.prompt || promptData);
														const universalTranslated = firstImageData.prompts.universal_translated || '';
														const csvParams = firstImageData.csv_data?.PARAMETERS || '';
														
														shot.image_prompts.universal = {
															main_prompt: universalPrompt,
															main_prompt_translated: universalTranslated,
															parameters: csvParams
														};
														
														// 호환성을 위해 다른 AI 도구 형식으로도 저장
														shot.image_prompts.midjourney = {
															main_prompt: universalPrompt,
															main_prompt_translated: universalTranslated,
															parameters: csvParams
														};
														shot.image_prompts.dalle3 = {
															main_prompt: universalPrompt,
															main_prompt_translated: universalTranslated,
															parameters: ''
														};
														shot.image_prompts.stable_diffusion = {
															main_prompt: universalPrompt,
															main_prompt_translated: universalTranslated,
															parameters: ''
														};
													} else if (aiTool === 'nanobana') {
														const nanobanaPrompt = typeof promptData === 'string' ? promptData : (promptData.prompt || promptData);
														const nanobanaTranslated = firstImageData.prompts.nanobana_translated || '';
														
														shot.image_prompts.nanobana = {
															main_prompt: nanobanaPrompt,
															main_prompt_translated: nanobanaTranslated,
															parameters: ''
														};
													} else if (aiTool !== 'universal_translated' && aiTool !== 'nanobana_translated') {
														// 기존 형식 처리
														let parameters = '';
														if (promptData && typeof promptData === 'object') {
															if (promptData.negative_prompt) {
																parameters = `Negative: ${promptData.negative_prompt}`;
															}
															if (promptData.aspect_ratio) {
																parameters += parameters ? `; Aspect Ratio: ${promptData.aspect_ratio}` : `Aspect Ratio: ${promptData.aspect_ratio}`;
															}
														}
														
														shot.image_prompts[aiTool] = {
															main_prompt: promptData.prompt || '',
															main_prompt_translated: promptData.prompt_translated || '',
															parameters: promptData.parameters || parameters
														};
													}
												});
												
												mergedCount++;
											}
										}
									}
								});
								
								if (mergedCount > 0) {
									showMessage(`Stage 6 이미지 프롬프트가 ${mergedCount}개의 샷에 성공적으로 적용되었습니다.`, 'success');
									saveDataToLocalStorage();
									updateUI();
								} else {
									showMessage('Stage 6 이미지 프롬프트 데이터가 로드되었습니다.', 'success');
								}
							}
						}

						// 2. 스테이지 6 (샷별 AI 이미지 프롬프트) 병합
						else if (newData.stage === 6 && newData.scene_info && newData.shots) {
							debugLog('📌 Stage 6 데이터 감지됨');
							debugLog('Stage 6 shots 개수:', newData.shots.length);
							
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

							// 현재 로드된 샷 ID 확인
							debugLog('🔍 현재 로드된 Stage 5 샷 ID 목록:');
							currentData.breakdown_data.shots.forEach(shot => {
								debugLog(`  - ${shot.id}`);
							});

							let missingShots = [];
							let successCount = 0;
							
							newData.shots.forEach(newShotData => {
								const shotIdToFind = newShotData.shot_id;
								debugLog(`🔎 Stage 6 샷 매칭 시도: ${shotIdToFind}`);
								
								// 정확한 ID 매칭 시도
								let existingShot = currentData.breakdown_data.shots.find(shot => shot.id === shotIdToFind);
								
								// 매칭 실패 시 다양한 형식 시도
								if (!existingShot) {
									// 공백 제거 후 재시도
									existingShot = currentData.breakdown_data.shots.find(shot => 
										shot.id.trim() === shotIdToFind.trim()
									);
									
									if (existingShot) {
										debugLog(`  ✅ 공백 제거 후 매칭 성공: ${existingShot.id}`);
									}
								}

								// Stage 5 데이터가 없는 샷은 병합하지 않음
								if (!existingShot) {
									missingShots.push(shotIdToFind);
									return; // 이 샷은 건너뛰기
								}

								if (existingShot) {
									successCount++;
									debugLog(`  ✅ 매칭 성공: ${shotIdToFind} → ${existingShot.id}`);

									// Stage 6의 프롬프트 정보만 가져오기
									if (newShotData.images && newShotData.images.length > 0) {
										debugLog(`    📝 이미지 프롬프트 병합 중... (${newShotData.images.length}개 이미지)`);
										
										// image_design_plans 생성 (없는 경우)
										if (!existingShot.image_design_plans) {
											// Stage 6에는 이미 Plan별로 구분된 ID가 있으므로 Plan별로 필터링만 수행
											
											// single 플랜 이미지: -single- 패턴을 가진 이미지들 (Simple 샷용)
											const singleImages = newShotData.images
												.filter(img => img.image_id && img.image_id.includes('-single-'))
												.map(img => ({
													id: img.image_id,
													description: img.image_description || '',
													csv_attributes: img.csv_data || {}
												}));
											
											// Plan A 이미지: -A- 패턴을 가진 이미지들
											const planAImages = newShotData.images
												.filter(img => img.image_id && img.image_id.includes('-A-'))
												.map(img => ({
													id: img.image_id,
													description: img.image_description || '',
													csv_attributes: img.csv_data || {}
												}));
											
											// Plan B 이미지: -B- 패턴을 가진 이미지들
											const planBImages = newShotData.images
												.filter(img => img.image_id && img.image_id.includes('-B-'))
												.map(img => ({
													id: img.image_id,
													description: img.image_description || '',
													csv_attributes: img.csv_data || {}
												}));
											
											// Plan C 이미지: -C- 패턴을 가진 이미지들
											const planCImages = newShotData.images
												.filter(img => img.image_id && img.image_id.includes('-C-'))
												.map(img => ({
													id: img.image_id,
													description: img.image_description || '',
													csv_attributes: img.csv_data || {}
												}));
											
											// 객체 생성
											existingShot.image_design_plans = {};
											
											// single 플랜이 있으면 추가
											if (singleImages.length > 0) {
												existingShot.image_design_plans.single = {
													description: `단일 이미지 (${singleImages.length}개 이미지)`,
													image_count: singleImages.length,
													complexity: "simple",
													images: singleImages
												};
											}
											
											// Complex 플랜들 추가
											if (planAImages.length > 0 || planBImages.length > 0 || planCImages.length > 0) {
												existingShot.image_design_plans.plan_a = {
													description: `단순 표현 (${planAImages.length}개 이미지)`,
													image_count: planAImages.length,
													complexity: "low",
													images: planAImages
												};
												existingShot.image_design_plans.plan_b = {
													description: `중간 복잡도 표현 (${planBImages.length}개 이미지)`,
													image_count: planBImages.length,
													complexity: "medium",
													images: planBImages
												};
												existingShot.image_design_plans.plan_c = {
													description: `전체 표현 (${planCImages.length}개 이미지)`,
													image_count: planCImages.length,
													complexity: "high",
													images: planCImages
												};
											}
										}

										// Stage 6 프롬프트 데이터를 각 이미지별로 저장
										// 각 플랜의 이미지에 프롬프트 할당
										
										// 기존 shot_stage6_data가 없으면 생성
										if (!existingShot.shot_stage6_data) {
											existingShot.shot_stage6_data = {};
										}
										
										// 각 이미지의 데이터를 shot_stage6_data에 저장
										// JSON 파일의 이미지 ID를 그대로 사용 (이미 플랜별로 구분되어 있음)
										newShotData.images.forEach((img, idx) => {
											const imageId = img.image_id || `IMG_${String(idx + 1).padStart(3, '0')}`;
											const imageData = {
												image_title: img.image_title || '',
												image_description: img.image_description || '',
												csv_data: img.csv_data || {},
												prompts: img.prompts || {}
											};
											
											// 원본 ID 그대로 저장
											existingShot.shot_stage6_data[imageId] = imageData;
											
											// CSV 데이터도 병합 저장 (29개 블록 시스템)
											if (!existingShot.csv_mapping) {
												existingShot.csv_mapping = {};
											}
											if (img.csv_data) {
												existingShot.csv_mapping[imageId] = img.csv_data;
											}
										});
										
										// image_prompts 초기화 (기존 데이터가 없을 때만)
										if (!existingShot.image_prompts) {
											existingShot.image_prompts = {};
										}
										
										// 첫 번째 이미지의 프롬프트를 기본 프롬프트로 저장 (호환성)
										if (newShotData.images.length > 0 && newShotData.images[0].prompts) {
											const firstImage = newShotData.images[0];
											const universalPrompt = firstImage.prompts.universal || '';
											const universalTranslated = firstImage.prompts.universal_translated || '';
											
											existingShot.image_prompts.universal = {
												main_prompt: universalPrompt,
												main_prompt_translated: universalTranslated,
												parameters: '--ar 16:9'
											};
											
											existingShot.image_prompts.midjourney = {
												main_prompt: universalPrompt,
												main_prompt_translated: universalTranslated,
												parameters: '--ar 16:9'
											};
											
											existingShot.image_prompts.dalle3 = {
												main_prompt: universalPrompt,
												main_prompt_translated: universalTranslated,
												parameters: ''
											};
											
											existingShot.image_prompts.stable_diffusion = {
												main_prompt: universalPrompt,
												main_prompt_translated: universalTranslated,
												parameters: ''
											};
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

							// 병합 결과 메시지 표시
							if (missingShots.length > 0) {
								const missingScenes = [...new Set(missingShots.map(id => id.split('.')[0]))];
								showMessage(
									`Stage 6 데이터 중 일부만 병합되었습니다.\n` +
									`병합 성공: ${successCount}개 샷\n` +
									`병합 실패: ${missingShots.length}개 샷 (${missingScenes.join(', ')} 씬)\n\n` +
									`누락된 씬의 Stage 5 데이터를 먼저 로드해주세요.`,
									successCount > 0 ? 'warning' : 'error'
								);
							} else if (updated) {
								showMessage('스테이지6 이미지 프롬프트 정보를 현재 데이터에 성공적으로 병합했습니다.', 'success');
							} else {
								showMessage('스테이지6 JSON에서 업데이트할 샷 정보를 찾지 못했거나, 변경사항이 없습니다.', 'info');
							}
                    // Stage 6 데이터 저장
                     saveDataToLocalStorage();
						}
            // 3.5 스테이지 5 씬 단위 데이터 처리 (Stage 2보다 먼저 체크)
            // v1.1.0이 아닌 경우에만 Stage 5로 처리
					else if (newData.schema_version !== "1.1.0" && // v1.1.0은 여기서 처리하지 않음
                    newData.film_metadata && newData.film_metadata.current_scene !== undefined && newData.breakdown_data && 
                    newData.breakdown_data.shots) { // shots 배열이 있으면 Stage 5
               debugLog('📌 Stage 5 씬 데이터로 인식됨 (v1.1.0이 아님)');
               // Stage 2 구조 확인 (일반적인 Stage 5 데이터의 경우)
               // v1.1.0은 이미 완전한 구조를 가지고 있으므로 위에서 이미 처리됨
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
            // 2.5 스테이지 2 (시나리오 구조) 처리 (Stage 5 체크 이후)
           else if ((newData.current_stage_name === 'narrative_development' || newData.current_stage_name === 'scenario_development') && 
                    (newData.narrative_data || newData.scenario_data) && 
                    !newData.breakdown_data?.shots) { // shots가 없을 때만 Stage 2로 처리
               handleStage2Data(newData);
               event.target.value = '';
               return;
           }
           // 3. 스테이지 7 (영상 관련 데이터) 병합
					else if (newData.stage === 7 || (newData.version && newData.version.includes('7.') && newData.video_prompts)) {
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

						// video_prompts가 배열이거나 객체인 경우 처리
						if (Array.isArray(newData.video_prompts)) {
							newData.video_prompts.forEach(promptData => {
								const shotId = promptData.shot_id;
								const imageId = promptData.image_id;

								if (!window.stage7VideoPrompts[shotId]) {
									window.stage7VideoPrompts[shotId] = {};
								}

								window.stage7VideoPrompts[shotId][imageId] = promptData;
							});
						} else if (typeof newData.video_prompts === 'object' && newData.video_prompts !== null) {
							// video_prompts가 객체 형태인 경우
							Object.values(newData.video_prompts).forEach(promptData => {
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

						// video_prompts가 배열이거나 객체인 경우 처리
						if (newData.video_prompts) {
							let videoPromptsToProcess = [];
							
							if (Array.isArray(newData.video_prompts)) {
								videoPromptsToProcess = newData.video_prompts;
							} else if (typeof newData.video_prompts === 'object' && newData.video_prompts !== null) {
								videoPromptsToProcess = Object.values(newData.video_prompts);
							}
							
							videoPromptsToProcess.forEach(promptData => {
								const shotIdToFind = promptData.shot_id;
								const existingShot = currentData.breakdown_data.shots.find(shot => shot.id === shotIdToFind);

								if (existingShot) {

									// video_prompts 병합
									if (!existingShot.video_prompts) existingShot.video_prompts = {};

									if (promptData.prompts) {
										Object.keys(promptData.prompts).forEach(aiTool => {
											// 각 AI 도구의 모든 필드를 보존 (kling_structured_prompt 포함)
											existingShot.video_prompts[`${aiTool}_${promptData.image_id}`] = {
												...promptData.prompts[aiTool]
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
							// Stage 7 데이터를 localStorage에 저장
							const jsonFileName = getProjectFileName();
							localStorage.setItem(`stage7VideoPrompts_${jsonFileName}`, JSON.stringify(window.stage7VideoPrompts));
							debugLog('✅ Stage 7 데이터를 localStorage에 저장했습니다.');
							
							currentData.current_stage_name = "video_prompt_generation";
							currentData.timestamp = new Date().toISOString();
							updated = true;
							showMessage('스테이지 7 영상 정보를 현재 데이터에 성공적으로 병합했습니다.', 'success');
						} else {
							showMessage('스테이지 7 영상 병합을 시도했으나, 변경된 내용이 없거나 대상 데이터를 찾지 못했습니다.', 'info');
						}
					}
           // 4. 스테이지 5 또는 전체 프로젝트 구조 로드 - 가장 우선 순위 높게 (덮어쓰기)
           // v6.0 형식도 포함하기 위해 sequences 조건을 선택적으로 변경
           else if (newData.film_metadata && newData.breakdown_data && 
                    (newData.breakdown_data.sequences || newData.version === "6.0") && 
                    newData.breakdown_data.shots) { // shots 배열이 있으면 전체 Stage 5 데이터
               
               // schema_version 확인 로그
               debugLog('📚 JSON 버전 정보:', {
                   schema_version: newData.schema_version,
                   version: newData.version,
                   current_stage_name: newData.current_stage_name,
                   sequences: newData.breakdown_data.sequences?.length || 0,
                   scenes: newData.breakdown_data.scenes?.length || 0,
                   shots: newData.breakdown_data.shots?.length || 0
               });
               
               // v6.0 형식은 먼저 변환
               if (newData.version === "6.0" && !newData.breakdown_data.sequences) {
                   debugLog('🔄 v6.0 형식 감지 - 변환 필요');
                   const convertedData = convertStage5V5Format(newData);
                   if (convertedData) {
                       newData = convertedData;
                       debugLog('✅ v6.0 형식 변환 완료');
                   }
               }
               
               // v1.1.0 형식 명시적 처리
               if (newData.schema_version === "1.1.0") {
                   debugLog('✅ v1.1.0 형식 JSON 파일 감지 - 직접 로드');
                   newData.hasStage2Structure = true;
               }
               
               // AppState 모듈 호환성 처리
               if (window.AppState && typeof window.AppState.set === 'function') {
                   AppState.set('currentData', newData);
               } else {
                   currentData = newData;
                   window.currentData = currentData;
               }

               // ⭐ 중요 디버깅: currentData 설정 후 확인
               console.log('🔴 currentData 설정 완료:', {
                   sequences: currentData.breakdown_data.sequences?.length || 0,
                   scenes: currentData.breakdown_data.scenes?.length || 0,
                   shots: currentData.breakdown_data.shots?.length || 0,
                   sceneDetails: currentData.breakdown_data.scenes?.map(s => ({
                       id: s.id,
                       title: s.title,
                       sequence_id: s.sequence_id
                   }))
               });
               
               // 데이터 구조 정합성 검증
               validateDataIntegrity(currentData);
               
               // video_prompts 데이터가 있으면 stage7VideoPrompts에 저장
               if (newData.video_prompts) {
                   if (!window.stage7VideoPrompts) {
                       window.stage7VideoPrompts = {};
                   }
                   
                   let videoPromptsToProcess = [];
                   if (Array.isArray(newData.video_prompts)) {
                       videoPromptsToProcess = newData.video_prompts;
                   } else if (typeof newData.video_prompts === 'object' && newData.video_prompts !== null) {
                       videoPromptsToProcess = Object.values(newData.video_prompts);
                   }
                   
                   videoPromptsToProcess.forEach(promptData => {
                       const shotId = promptData.shot_id;
                       const imageId = promptData.image_id;
                       if (!window.stage7VideoPrompts[shotId]) {
                           window.stage7VideoPrompts[shotId] = {};
                       }
                       window.stage7VideoPrompts[shotId][imageId] = promptData;
                   });
                   
                   debugLog('✅ video_prompts 데이터를 stage7VideoPrompts에 저장:', Object.keys(window.stage7VideoPrompts).length, '개 샷');
               }
               
               // 시퀀스 데이터 확인
               debugLog('📂 Stage 5 데이터 로드 - 시퀀스 개수:', currentData.breakdown_data.sequences.length);
               debugLog('📂 시퀀스 목록:', currentData.breakdown_data.sequences.map(s => `${s.id}: ${s.title}`));
               
               // shots 배열 확인 및 디버깅
               if (currentData.breakdown_data.shots && currentData.breakdown_data.shots.length > 0) {
                   debugLog('✅ shots 배열 발견:', currentData.breakdown_data.shots.length + '개');
                   debugLog('📊 샷 샘플 (처음 5개):');
                   currentData.breakdown_data.shots.slice(0, 5).forEach(shot => {
                       debugLog(`  - ${shot.id}: "${shot.title}" (scene_id: ${shot.scene_id})`);
                   });
               } else {
                   debugWarn('⚠️ shots 배열이 없습니다!');
               }
               
               // 각 시퀀스의 샷 정보 디버깅
               currentData.breakdown_data.sequences.forEach(seq => {
                   const seqScenes = currentData.breakdown_data.scenes.filter(scene => scene.sequence_id === seq.id);
                   debugLog(`🎬 시퀀스 ${seq.id}의 씬과 샷 정보:`);
                   seqScenes.forEach(scene => {
                       const shots = scene.shot_ids || [];
                       debugLog(`  - ${scene.id}: ${shots.length}개 샷`);
                       shots.forEach(shotId => {
                           const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
                           if (shot) {
                               const hasImagePrompts = shot.image_prompts && Object.keys(shot.image_prompts).some(key => 
                                   shot.image_prompts[key].main_prompt || shot.image_prompts[key].main_prompt_translated
                               );
                               debugLog(`    - ${shotId}: 이미지프롬프트=${hasImagePrompts}`);
                           }
                       });
                   });
               });
               
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
                       
                       // 메인 이미지 초기화 (없는 경우)
                       if (!shot.main_images) {
                           shot.main_images = [];
                       }
                       
                       // 참조 이미지 초기화 (없는 경우)
                       if (!shot.reference_images) {
                           shot.reference_images = [];
                       }
                   });
               }
               
               // Stage 2 구조 존재 여부 확인  
               if (currentData.breakdown_data.sequences && currentData.breakdown_data.sequences.length > 0) {
                   hasStage2Structure = true;
                   currentData.hasStage2Structure = true;
               }
               
               saveDataToLocalStorage();
               updateUI();
               
               const totalShots = currentData.breakdown_data.shots ? currentData.breakdown_data.shots.length : 0;
               const totalScenes = currentData.breakdown_data.scenes ? currentData.breakdown_data.scenes.length : 0;
               const totalSequences = currentData.breakdown_data.sequences.length;
               
               // Stage 5 + 6 통합 데이터임을 명확히 표시
               message = `✅ 스토리보드 데이터가 성공적으로 로드되었습니다!\n` +
                        `📊 시퀀스: ${totalSequences}개, 씬: ${totalScenes}개, 샷: ${totalShots}개`;
               showMessage(message, 'success');
               
               updated = true;
               event.target.value = '';
               return;
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
       
   // 데이터 구조 정합성 검증 함수
   function validateDataIntegrity(data) {
       if (!data || !data.breakdown_data) {
           console.error('❌ 데이터 구조가 없음');
           return false;
       }
       
       const bd = data.breakdown_data;
       const errors = [];
       const warnings = [];
       
       // 1. 필수 배열 확인
       if (!Array.isArray(bd.sequences)) bd.sequences = [];
       if (!Array.isArray(bd.scenes)) bd.scenes = [];
       if (!Array.isArray(bd.shots)) bd.shots = [];
       
       // 2. 중복 ID 검사
       const sequenceIds = new Set();
       const sceneIds = new Set();
       const shotIds = new Set();
       
       // 시퀀스 중복 검사 및 정규화
       bd.sequences = bd.sequences.filter((seq, index) => {
           // sequence_id를 id로 정규화
           if (seq.sequence_id && !seq.id) {
               seq.id = seq.sequence_id;
               delete seq.sequence_id;
           }
           
           // title이 없으면 name 필드를 title로 복사
           if (!seq.title && seq.name) {
               seq.title = seq.name;
           }
           
           if (!seq.id) {
               warnings.push(`시퀀스 ${index}에 ID가 없음`);
               return false;
           }
           
           if (sequenceIds.has(seq.id)) {
               warnings.push(`중복 시퀀스 ID: ${seq.id}`);
               return false;
           }
           sequenceIds.add(seq.id);
           return true;
       });
       
       // 씬 중복 검사 및 정규화
       bd.scenes = bd.scenes.filter((scene, index) => {
           // scene_id를 id로 정규화
           if (scene.scene_id && !scene.id) {
               scene.id = scene.scene_id;
               delete scene.scene_id;
           }
           
           if (!scene.id) {
               warnings.push(`씬 ${index}에 ID가 없음`);
               return false;
           }
           
           if (sceneIds.has(scene.id)) {
               warnings.push(`중복 씬 ID: ${scene.id}`);
               return false;
           }
           sceneIds.add(scene.id);
           
           // sequence_id 검증
           if (!scene.sequence_id) {
               // 시퀀스가 1개뿐이면 자동 할당
               if (bd.sequences.length === 1) {
                   scene.sequence_id = bd.sequences[0].id;
                   warnings.push(`씬 ${scene.id}에 시퀀스 자동 할당: ${scene.sequence_id}`);
               } else {
                   errors.push(`씬 ${scene.id}에 sequence_id가 없음`);
               }
           } else if (!sequenceIds.has(scene.sequence_id)) {
               // 잘못된 sequence_id 수정
               if (bd.sequences.length === 1) {
                   const oldId = scene.sequence_id;
                   scene.sequence_id = bd.sequences[0].id;
                   warnings.push(`씬 ${scene.id}의 sequence_id 수정: ${oldId} → ${scene.sequence_id}`);
               } else {
                   errors.push(`씬 ${scene.id}의 sequence_id가 유효하지 않음: ${scene.sequence_id}`);
               }
           }
           
           return true;
       });
       
       // 샷 중복 검사 및 정규화
       bd.shots = bd.shots.filter((shot, index) => {
           // shot_id를 id로 정규화
           if (shot.shot_id && !shot.id) {
               shot.id = shot.shot_id;
               delete shot.shot_id;
           }
           
           if (!shot.id) {
               warnings.push(`샷 ${index}에 ID가 없음`);
               return false;
           }
           
           if (shotIds.has(shot.id)) {
               warnings.push(`중복 샷 ID: ${shot.id}`);
               return false;
           }
           shotIds.add(shot.id);
           
           // scene_id 검증
           if (!shot.scene_id) {
               // 씬이 1개뿐이면 자동 할당
               if (bd.scenes.length === 1) {
                   shot.scene_id = bd.scenes[0].id;
                   warnings.push(`샷 ${shot.id}에 씬 자동 할당: ${shot.scene_id}`);
               } else {
                   errors.push(`샷 ${shot.id}에 scene_id가 없음`);
               }
           } else if (!sceneIds.has(shot.scene_id)) {
               // 잘못된 scene_id 수정
               if (bd.scenes.length === 1) {
                   const oldId = shot.scene_id;
                   shot.scene_id = bd.scenes[0].id;
                   warnings.push(`샷 ${shot.id}의 scene_id 수정: ${oldId} → ${shot.scene_id}`);
               } else {
                   errors.push(`샷 ${shot.id}의 scene_id가 유효하지 않음: ${shot.scene_id}`);
               }
           }
           
           return true;
       });
       
       // 3. 씬의 샷 배열 재구성
       bd.scenes.forEach(scene => {
           scene.shots = bd.shots
               .filter(shot => shot.scene_id === scene.id)
               .map(shot => shot.id);
           
           console.log(`📝 씬 ${scene.id}에 ${scene.shots.length}개 샷 연결:`, scene.shots);
       });
       
       // 4. 시퀀스의 씬 배열 재구성
       bd.sequences.forEach(seq => {
           seq.scenes = bd.scenes
               .filter(scene => scene.sequence_id === seq.id)
               .map(scene => ({
                   id: scene.id,
                   sequence_id: seq.id,
                   name: scene.name || scene.title || '',
                   description: scene.description || ''
               }));
           
           console.log(`📂 시퀀스 ${seq.id}에 ${seq.scenes.length}개 씬 연결:`, seq.scenes.map(s => s.id));
       });
       
       // 5. 결과 출력
       if (errors.length > 0) {
           console.error('❌ 데이터 정합성 오류:', errors);
       }
       
       if (warnings.length > 0) {
           console.warn('⚠️ 데이터 정합성 경고:', warnings);
       }
       
       console.log('✅ 데이터 정합성 검증 완료:', {
           sequences: bd.sequences.length,
           scenes: bd.scenes.length,
           shots: bd.shots.length,
           errors: errors.length,
           warnings: warnings.length
       });
       
       return errors.length === 0;
   }
       
   // 새로운 함수: Stage 2 데이터 처리
			function handleStage2Data(jsonData) {

				try {
					// 광고 프레임워크 처리 추가 - scenario_data를 narrative_data로 매핑
					if (jsonData.scenario_data && !jsonData.narrative_data) {
						debugLog('🎯 광고 프레임워크 데이터 감지 - 자동 변환 시작');
						jsonData.narrative_data = jsonData.scenario_data;
						
						// screenplay_data를 scenario_data로 매핑
						if (jsonData.narrative_data.screenplay_data && !jsonData.narrative_data.scenario_data) {
							jsonData.narrative_data.scenario_data = jsonData.narrative_data.screenplay_data;
						}
					}
					
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
				window.currentData = currentData;
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
				window.currentData = currentData;
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
				const sceneIdParam = jsonData.film_metadata.current_scene;
				
				// CF 프로젝트 타입 처리: "S01-S09" 형식의 범위 처리
				const isCFProject = jsonData.project_info?.project_type === 'cf' || 
								   (sceneIdParam && sceneIdParam.includes('-'));
				
				// CF 프로젝트인 경우 모든 씬 데이터를 처리
				if (isCFProject) {
					debugLog('CF 프로젝트 타입 감지: 모든 씬 데이터 처리');
					
					// Stage 5에서 제공한 모든 씬 정보 추가
					if (newScenes.length > 0) {
						newScenes.forEach(scene => {
							const existingScene = currentData.breakdown_data.scenes.find(s => s.id === scene.id);
							if (!existingScene) {
								// shot_ids 배열이 없으면 초기화
								if (!scene.shot_ids) {
									scene.shot_ids = [];
								}
								currentData.breakdown_data.scenes.push(scene);
							} else {
								// 기존 씬 업데이트
								Object.assign(existingScene, scene);
								if (!existingScene.shot_ids) {
									existingScene.shot_ids = [];
								}
							}
						});
					}
					
					// 시퀀스 정보도 필요한 경우 추가
					if (newSequences.length > 0) {
						newSequences.forEach(seq => {
							const existingSeq = currentData.breakdown_data.sequences.find(s => s.id === seq.id);
							if (!existingSeq) {
								currentData.breakdown_data.sequences.push(seq);
							} else {
								// 기존 시퀀스 업데이트
								Object.assign(existingSeq, seq);
							}
						});
					}
				} else {
					// 기존 로직: 단일 씬 처리
					const sceneId = sceneIdParam;
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
				}

				// 샷 데이터 병합 처리
				newShots.forEach(newShot => {
					// CF 프로젝트인 경우 모든 샷 처리, 그렇지 않으면 특정 씬의 샷만 처리
					const shouldProcessShot = isCFProject || newShot.scene_id === sceneIdParam;
					
					if (shouldProcessShot) {
						// CF 프로젝트인 경우 해당 씬 찾기
						let targetScene = null;
						if (isCFProject) {
							targetScene = currentData.breakdown_data.scenes.find(scene => scene.id === newShot.scene_id);
						} else {
							targetScene = currentData.breakdown_data.scenes.find(scene => scene.id === sceneIdParam);
						}
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
						if (targetScene) {
							if (!targetScene.shot_ids) {
								targetScene.shot_ids = [];
							}
							if (!targetScene.shot_ids.includes(newShot.id)) {
								targetScene.shot_ids.push(newShot.id);
							}
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
				
				// 데이터 정합성 검증
				validateDataIntegrity(currentData);

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
       // 전체 펼치기 기능
       function expandAll() {
   debugLog('Expand all called');
   debugLog('Found scenes-container:', document.querySelectorAll('.scenes-container').length);
   debugLog('Found shots-container:', document.querySelectorAll('.shots-container').length);
   
   // 모든 시퀀스 컨테이너 펼치기
   document.querySelectorAll('.scenes-container').forEach(container => {
       debugLog('Expanding scene container:', container);
       container.classList.remove('collapsed');
       container.style.maxHeight = 'none';
       container.style.overflow = 'visible';
       
       // 관련 토글 아이콘 업데이트
       const sequenceHeader = container.previousElementSibling;
       if (sequenceHeader) {
           const toggleIcon = sequenceHeader.querySelector('.toggle-icon');
           if (toggleIcon) {
               toggleIcon.classList.add('expanded');
               toggleIcon.textContent = '▼';
           }
       }
   });
   
   // 모든 샷 컨테이너 펼치기
   setTimeout(() => {
       document.querySelectorAll('.shots-container').forEach(container => {
           debugLog('Expanding shots container:', container);
           container.classList.remove('collapsed');
           container.style.maxHeight = 'none';
           container.style.overflow = 'visible';
           
           // 관련 토글 아이콘 업데이트
           const sceneHeader = container.previousElementSibling;
           if (sceneHeader) {
               const toggleIcon = sceneHeader.querySelector('.toggle-icon');
               if (toggleIcon) {
                   toggleIcon.classList.add('expanded');
                   toggleIcon.textContent = '▼';
               }
           }
       });
   }, 100);
       }
       
       // 글로벌 스코프에 노출
       window.expandAll = expandAll;

       // 전체 접기 기능
       function collapseAll() {
   debugLog('Collapse all called');
   debugLog('Found scenes-container:', document.querySelectorAll('.scenes-container').length);
   debugLog('Found shots-container:', document.querySelectorAll('.shots-container').length);
   
   // 모든 샷 컨테이너 접기 먼저
   document.querySelectorAll('.shots-container').forEach(container => {
       debugLog('Collapsing shots container:', container);
       container.classList.add('collapsed');
       container.style.maxHeight = '0';
       container.style.overflow = 'hidden';
       
       // 관련 토글 아이콘 업데이트
       const sceneHeader = container.previousElementSibling;
       if (sceneHeader) {
           const toggleIcon = sceneHeader.querySelector('.toggle-icon');
           if (toggleIcon) {
               toggleIcon.classList.remove('expanded');
               toggleIcon.textContent = '▶';
           }
       }
   });
   
   // 모든 씬 컨테이너 접기
   setTimeout(() => {
       document.querySelectorAll('.scenes-container').forEach(container => {
           debugLog('Collapsing scene container:', container);
           container.classList.add('collapsed');
           container.style.maxHeight = '0';
           container.style.overflow = 'hidden';
           
           // 관련 토글 아이콘 업데이트
           const sequenceHeader = container.previousElementSibling;
           if (sequenceHeader) {
               const toggleIcon = sequenceHeader.querySelector('.toggle-icon');
               if (toggleIcon) {
                   toggleIcon.classList.remove('expanded');
                   toggleIcon.textContent = '▶';
               }
           }
       });
   }, 100);
       }
       
       // 글로벌 스코프에 노출
       window.collapseAll = collapseAll;

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
                   <div class="empty-state-icon">▶️</div>
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
							<div class="empty-state-icon">📂</div>
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
						
						// title이 없는 경우 name이나 id를 사용
						const sequenceTitle = sequence.title || sequence.name || sequence.id;
						html += `
							<div class="sequence-item">
								<div class="sequence-header" data-sequence-id="${sequence.id}">
									<span class="toggle-icon">▶</span>
									<span>${sequence.id}: ${sequenceTitle}</span>
								</div>
								<div class="scenes-container collapsed" id="scenes-${sequence.id}"></div>
							</div>`;
					});
					
					navContent.innerHTML = html;
					setupSequenceEventListeners();
					
					// 백업 파일 로드 후 첫 번째 시퀀스 자동 확장
					if (currentData.breakdown_data.sequences.length > 0) {
						const firstSequenceId = currentData.breakdown_data.sequences[0].id;
						const firstSequenceHeader = document.querySelector(`.sequence-header[data-sequence-id="${firstSequenceId}"]`);
						if (firstSequenceHeader) {
							// 첫 번째 시퀀스를 자동으로 확장
							setTimeout(() => {
								selectSequence(firstSequenceId, firstSequenceHeader);
							}, 100);
						}
					}
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
       
       debugLog(`\n🔍 loadScenesForSequence 호출 - 시퀀스: ${sequenceId}`);
       debugLog('현재 shots 배열 상태:', currentData.breakdown_data.shots ? currentData.breakdown_data.shots.length + '개' : '없음');
       
       const scenes = currentData.breakdown_data.scenes.filter(scene => scene.sequence_id === sequenceId);
       
       // ⭐ 중요 디버깅: scenes 배열 확인
       console.log('🔴 scenes 배열 상태:', {
           total: scenes.length,
           scenes: scenes.map(s => ({
               id: s.id,
               title: s.title,
               sequence_id: s.sequence_id,
               hasScenarioText: !!s.original_scenario?.scenario_text
           }))
       });
       
       if (scenes.length === 0) {
           container.innerHTML = '<div style="padding: 15px 40px; color: #ccc; font-size: 0.9rem;">씬이 없습니다</div>';
           return;
       }
       
       let html = '';
       scenes.forEach(scene => {
           const hasShots = scene.shot_ids && Array.isArray(scene.shot_ids) && scene.shot_ids.length > 0;
           const shotCount = hasShots ? scene.shot_ids.length : 0;
           const statusIndicator = hasShots ? 
               '<span class="status-indicator" style="color: #4caf50; font-size: 0.8rem; margin-left: 5px; vertical-align: middle; display: inline-block; line-height: 1;" data-tooltip="Stage 5 완료 (샷 ' + shotCount + '개)">●</span>' : 
               '<span class="status-indicator" style="color: #ff9800; font-size: 0.8rem; margin-left: 5px; vertical-align: middle; display: inline-block; line-height: 1;" data-tooltip="Stage 5 대기">○</span>';
           
           // 샷 HTML을 미리 생성
           let shotsHtml = '';
           if (hasShots) {
               // 샷 데이터 가져오기
               let shots = [];
               
               // 방법 1: shots 배열에서 scene_id로 필터링
               if (currentData.breakdown_data.shots && Array.isArray(currentData.breakdown_data.shots) && currentData.breakdown_data.shots.length > 0) {
                   // trim()을 사용하여 공백 제거하고 비교
                   shots = currentData.breakdown_data.shots.filter(shot => {
                       const shotSceneId = (shot.scene_id || '').toString().trim();
                       const currentSceneId = (scene.id || '').toString().trim();
                       return shotSceneId === currentSceneId;
                   });
                   
                   if (shots.length > 0) {
                       debugLog(`✅ ${scene.id}: shots 배열에서 ${shots.length}개 샷 찾음`);
                       shots.forEach(s => {
                           debugLog(`    - ${s.id}: "${s.title}"`);
                       });
                   } else {
                       debugLog(`❌ ${scene.id}: shots 배열에서 매칭되는 샷을 찾지 못함`);
                       // 디버깅을 위한 상세 정보
                       debugLog(`   scene.id: "${scene.id}" (type: ${typeof scene.id}, length: ${scene.id.length})`);
                       // shots 배열이 있을 때만 map 수행
                       if (currentData.breakdown_data.shots && Array.isArray(currentData.breakdown_data.shots) && currentData.breakdown_data.shots.length > 0) {
                           const sceneIds = currentData.breakdown_data.shots.map(s => s.scene_id);
                           debugLog(`   첫 번째 shot의 scene_id: "${sceneIds[0]}" (type: ${typeof sceneIds[0]}, length: ${sceneIds[0] ? sceneIds[0].length : 0})`);
                           debugLog(`   shots의 scene_id 목록:`, [...new Set(sceneIds)]);
                       } else {
                           debugLog(`   shots 배열이 비어있거나 null입니다.`);
                       }
                   }
               } else {
                   debugLog(`⚠️ ${scene.id}: shots 배열이 없거나 비어있음`);
               }
               
               // 방법 2: scene.shot_ids 사용
               if (shots.length === 0 && scene.shot_ids && Array.isArray(scene.shot_ids) && scene.shot_ids.length > 0) {
                   debugLog(`⚠️ ${scene.id}: shot_ids로 샷 생성 중 (${scene.shot_ids.join(', ')})`);
                   shots = scene.shot_ids.map((shotId, index) => {
                       const existingShot = currentData.breakdown_data.shots?.find(s => s.id === shotId);
                       if (existingShot) {
                           debugLog(`  ✅ ${shotId}: "${existingShot.title}" 찾음`);
                           return existingShot;
                       }
                       
                       // 샷 데이터가 없으면 shotId로부터 의미있는 제목 생성
                       let shotTitle = `샷 ${index + 1}`;
                       if (shotId && shotId.includes('.')) {
                           const parts = shotId.split('.');
                           if (parts.length === 2) {
                               shotTitle = `샷 ${parts[1]}`;
                           }
                       }
                       
                       debugLog(`  ❌ ${shotId}: 기본 제목 "${shotTitle}" 사용`);
                       return {
                           id: shotId,
                           title: shotTitle,
                           scene_id: scene.id
                       };
                   });
               }
               
               // 샷 HTML 생성
               if (shots.length > 0) {
                   shots.forEach(shot => {
                       shotsHtml += `
                           <div class="shot-item" data-shot-id="${shot.id}">
                               <span>${shot.id}: ${shot.title || '샷'}</span>
                           </div>`;
                   });
               }
           }
           
           html += `
               <div class="scene-item">
                   <div class="scene-header" data-scene-id="${scene.id}">
                       <span class="toggle-icon">▷</span>
                       <span>${scene.id}: ${scene.title}${statusIndicator}</span>
                   </div>
                   <div class="shots-container collapsed" id="shots-${scene.id}">${shotsHtml}</div>
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
       
       // 샷 아이템에 클릭 이벤트 리스너 추가
       container.querySelectorAll('.shot-item').forEach(item => {
           const newItem = item.cloneNode(true);
           item.parentNode.replaceChild(newItem, item);
           newItem.addEventListener('click', function(e) {
               e.stopPropagation();
               selectShot(this.dataset.shotId, this);
           });
       });
   } catch (error) {
       console.error('loadScenesForSequence 오류:', error);
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
           
           // 샷들이 이미 로드되어 있는지 확인
           if (!shotsContainer.innerHTML.trim() || shotsContainer.innerHTML.includes('샷이 없습니다')) {
               // 샷이 없으면 loadShotsForScene 호출
               loadShotsForScene(sceneId, shotsContainer);
           }
       } else {
           shotsContainer.classList.add('collapsed');
           toggleIcon.classList.remove('expanded');
           toggleIcon.textContent = '▷';
       }
   } catch (error) {
       console.error('toggleSceneShots 오류:', error);
   }
       }

       // 씬의 샷들 로드
       function loadShotsForScene(sceneId, container) {
   try {
       if (!currentData || !currentData.breakdown_data) return;
       
       // 두 가지 데이터 구조 모두 지원
       let shots = [];
       
       // 방법 1: shots 배열에서 scene_id로 필터링
       if (currentData.breakdown_data.shots) {
           shots = currentData.breakdown_data.shots.filter(shot => shot.scene_id === sceneId);
       }
       
       // 방법 2: 씬의 shot_ids를 사용하여 샷 찾기
       if (shots.length === 0) {
           const scene = currentData.breakdown_data.scenes.find(s => s.id === sceneId);
           if (scene && scene.shot_ids && scene.shot_ids.length > 0) {
               // shot_ids 배열을 사용하여 샷 생성
               shots = scene.shot_ids.map((shotId, index) => {
                   // 실제 샷 데이터가 있으면 사용
                   const existingShot = currentData.breakdown_data.shots?.find(s => s.id === shotId);
                   if (existingShot) {
                       return existingShot;
                   }
                   
                   // 샷 데이터가 없으면 shotId로부터 더 의미있는 제목 생성
                   // 예: "S01.01" -> "S01 샷 01"
                   let shotTitle = `샷 ${index + 1}`;
                   if (shotId && shotId.includes('.')) {
                       const parts = shotId.split('.');
                       if (parts.length === 2) {
                           shotTitle = `샷 ${parts[1]}`;
                       }
                   }
                   
                   return {
                       id: shotId,
                       title: shotTitle,
                       scene_id: sceneId
                   };
               });
           }
       }
       
       if (shots.length === 0) {
           container.innerHTML = '<div style="padding: 15px 60px; color: #ccc; font-size: 0.9rem;">샷이 없습니다</div>';
           return;
       }
       
       let html = '';
       shots.forEach(shot => {
           html += `
               <div class="shot-item" data-shot-id="${shot.id}">
                   <span>${shot.id}: ${shot.title || '샷'}</span>
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
       debugLog('🎯 selectShot 호출됨 - shotId:', shotId);
       
       if (!currentData || !currentData.breakdown_data || !currentData.breakdown_data.shots) {
           console.error('❌ selectShot: currentData 또는 shots 데이터 없음');
           showMessage('샷 데이터를 찾을 수 없습니다.', 'error');
           return;
       }
       
       selectedType = 'shot';
       selectedId = shotId;
       
       document.querySelectorAll('.shot-item.active').forEach(el => el.classList.remove('active'));
       
       const shot = currentData.breakdown_data.shots.find(s => s.id === shotId);
       if (shot) {
           debugLog('✅ selectShot: 샷 찾음:', shot);
           const scene = currentData.breakdown_data.scenes.find(sc => sc.id === shot.scene_id);
           if (scene) {
               document.querySelector(`.scene-header[data-scene-id="${scene.id}"]`)?.classList.add('active');
               document.querySelector(`.sequence-header[data-sequence-id="${scene.sequence_id}"]`)?.classList.add('active');
           }
       } else {
           debugWarn('⚠️ selectShot: 샷을 찾을 수 없음 - shotId:', shotId);
       }
       
       const currentElement = element || document.querySelector(`.shot-item[data-shot-id="${shotId}"]`);
       if (currentElement) currentElement.classList.add('active');
       
       showShotContent(shotId);
   } catch (error) {
       console.error('❌ selectShot 오류:', error);
       showMessage('샷 선택 오류: ' + error.message, 'error');
   }
       }

       // 시퀀스 내용 표시
       function showSequenceContent(sequenceId) {
   try {
       const sequence = currentData.breakdown_data.sequences.find(s => s.id === sequenceId);
       if (!sequence) return;
       
       const contentTitle = document.getElementById('content-title');
       const contentSubtitle = document.getElementById('content-subtitle');
       if (contentTitle) contentTitle.textContent = `시퀀스: ${sequence.title}`;
       if (contentSubtitle) contentSubtitle.textContent = `ID: ${sequence.id}`;
       const contentActions = document.getElementById('content-actions');
       if (contentActions) {
           contentActions.style.display = 'none';
       }
       
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
       
       const contentTitle = document.getElementById('content-title');
       const contentSubtitle = document.getElementById('content-subtitle');
       if (contentTitle) contentTitle.innerHTML = `씬: ${scene.title} ${statusBadge}`;
       if (contentSubtitle) contentSubtitle.textContent = `ID: ${scene.id}`;
       const contentActions = document.getElementById('content-actions');
       if (contentActions) {
           contentActions.style.display = 'none';
       }
       
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
				return '<div class="empty-state"><div class="empty-state-icon">🎞️</div><div>이 씬에 샷이 없습니다</div></div>';
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

    // 기존 전역 함수와의 호환성 유지 (점진적 마이그레이션)
    if (!window.createTestData) {
        window.createTestData = window.TestData.createTestData;
    }

})(window);
