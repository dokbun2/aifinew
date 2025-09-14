// 업로드 후 이동할 URL을 저장할 전역 변수
let pendingNavigationUrl = null;

// 사용자 접근 권한 확인 함수
function checkUserAccess() {
    const userInfo = localStorage.getItem('user_info');
    const token = localStorage.getItem('auth_token');

    // 로그인하지 않은 경우
    if (!token || !userInfo) {
        // 보호된 콘텐츠 비활성화
        disableProtectedContent();
        return false;
    }

    try {
        const user = JSON.parse(userInfo);

        // 승인되지 않은 사용자
        if (user.status !== 'approved') {
            disableProtectedContent();
            showAccessDeniedMessage(user.status);
            return false;
        }

        // 승인된 사용자 - 전체 접근 허용
        enableProtectedContent();

        // 관리자 링크 표시 여부 확인
        checkAdminAccess(user);
        return true;

    } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
        disableProtectedContent();
        return false;
    }
}

// 관리자 접근 권한 확인 함수
function checkAdminAccess(user) {
    const adminLink = document.getElementById('admin-link');

    if (adminLink) {
        if (user && user.role === 'admin') {
            adminLink.style.display = 'inline-block';
            console.log('관리자 권한 확인됨:', user.email);
        } else {
            adminLink.style.display = 'none';
        }
    }
}

// 보호된 콘텐츠 비활성화
function disableProtectedContent() {
    // 스테이지 카드들 비활성화
    const stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.5';
        card.style.filter = 'grayscale(100%)';
    });

    // 네비게이션 메뉴 비활성화
    const navLinks = document.querySelectorAll('.nav-link[href^="storyboard"], .nav-link[href^="concept-art"], .nav-link[href^="prompt-generator"], .nav-link[href^="media-gallery"]');
    navLinks.forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
    });
}

// 보호된 콘텐츠 활성화
function enableProtectedContent() {
    // 스테이지 카드들 활성화
    const stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(card => {
        card.style.pointerEvents = '';
        card.style.opacity = '';
        card.style.filter = '';
    });

    // 네비게이션 메뉴 활성화
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.style.pointerEvents = '';
        link.style.opacity = '';
    });
}

// 접근 거부 메시지 표시
function showAccessDeniedMessage(status) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.access-denied-overlay');
    if (existingMessage) {
        existingMessage.remove();
    }

    let message = '';
    let icon = '';

    if (status === 'pending') {
        icon = '⏳';
        message = `
            <h2>승인 대기 중</h2>
            <p>회원가입이 완료되었습니다!</p>
            <p>관리자의 승인을 기다리고 있습니다.</p>
            <p class="note">승인이 완료되면 모든 기능을 사용하실 수 있습니다.</p>
        `;
    } else if (status === 'rejected') {
        icon = '🚫';
        message = `
            <h2>접근 제한</h2>
            <p>귀하의 계정이 차단되었습니다.</p>
            <p>자세한 사항은 관리자에게 문의하세요.</p>
        `;
    } else {
        icon = '🔒';
        message = `
            <h2>로그인 필요</h2>
            <p>이 서비스를 이용하려면 로그인이 필요합니다.</p>
            <button onclick="authSystem.showLoginModal()" class="login-prompt-btn">로그인</button>
        `;
    }

    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'access-denied-overlay';
    overlay.innerHTML = `
        <div class="access-denied-content">
            <div class="access-denied-icon">${icon}</div>
            ${message}
        </div>
    `;

    // 메인 콘텐츠 영역에 추가
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.position = 'relative';
        mainContent.appendChild(overlay);
    }

    // 스타일 추가
    if (!document.querySelector('#access-denied-styles')) {
        const style = document.createElement('style');
        style.id = 'access-denied-styles';
        style.textContent = `
            .access-denied-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100;
                background: rgba(29, 29, 31, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 18px;
                padding: 48px;
                max-width: 420px;
                width: 90%;
                text-align: center;
                box-shadow: 0 44px 80px rgba(0, 0, 0, 0.5);
            }

            .access-denied-icon {
                font-size: 60px;
                margin-bottom: 24px;
            }

            .access-denied-content h2 {
                color: #f5f5f7;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 16px;
            }

            .access-denied-content p {
                color: #86868b;
                font-size: 15px;
                line-height: 1.5;
                margin-bottom: 12px;
            }

            .access-denied-content .note {
                color: #0066CC;
                font-size: 13px;
                margin-top: 20px;
            }

            .login-prompt-btn {
                margin-top: 24px;
                padding: 16px 32px;
                background: linear-gradient(135deg, #0066CC, #0055B3);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .login-prompt-btn:hover {
                background: linear-gradient(135deg, #0055B3, #004499);
                transform: translateY(-1px);
                box-shadow: 0 12px 32px rgba(0, 102, 204, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

// 개별 스테이지 업로드 상태 초기화 함수
function resetIndividualUploadState() {
    // uploadStatus가 아직 정의되지 않았다면 먼저 정의
    if (typeof uploadStatus === 'undefined') {
        window.uploadStatus = {
            stage2: false,
            stage4: false,
            stage5: false,
            stage6: false,
            stage7: false,
            stage8: false
        };
    } else {
        // 업로드 상태 초기화
        Object.keys(uploadStatus).forEach(key => {
            uploadStatus[key] = false;
        });
    }
    
    // 업로드 상태 리스트 초기화
    const statusList = document.getElementById('upload-status-list');
    if (statusList) {
        statusList.innerHTML = '';
    }
    
    // pendingNavigationUrl 초기화
    pendingNavigationUrl = null;
}

// 스테이지 카드 업로드 상태 체크 및 업데이트
function checkAndUpdateStageCards() {
    // Stage 2 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage2Uploaded') === 'true' || localStorage.getItem('stage2TempJson')) {
        const stage2Card = document.querySelector('.stage-upload-card[title="시나리오"]');
        if (stage2Card) {
            stage2Card.classList.add('uploaded');
        }
    }
    
    // Stage 4 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage4Uploaded') === 'true' || localStorage.getItem('stage4TempJson')) {
        const stage4Card = document.querySelector('.stage-upload-card[title="컨셉아트"]');
        if (stage4Card) {
            stage4Card.classList.add('uploaded');
        }
    }
    
    // Stage 5 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage5Uploaded') === 'true' || localStorage.getItem('stage5TempJsonFiles')) {
        const stage5Card = document.querySelector('.stage-upload-card[title="장면분할"]');
        if (stage5Card) {
            stage5Card.classList.add('uploaded');
        }
    }
    
    // Stage 6 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage6Uploaded') === 'true' || localStorage.getItem('stage6TempJsonFiles')) {
        const stage6Card = document.querySelector('.stage-upload-card[title="샷이미지"]');
        if (stage6Card) {
            stage6Card.classList.add('uploaded');
        }
    }
    
    // Stage 7 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage7Uploaded') === 'true' || localStorage.getItem('stage7TempJsonFiles')) {
        const stage7Card = document.querySelector('.stage-upload-card[title="영상"]');
        if (stage7Card) {
            stage7Card.classList.add('uploaded');
        }
    }
    
    // Stage 8 체크 - 업로드 플래그 또는 데이터 존재 여부 확인
    if (localStorage.getItem('stage8Uploaded') === 'true' || localStorage.getItem('stage8TempJsonFiles')) {
        const stage8Card = document.querySelector('.stage-upload-card[title="오디오"]');
        if (stage8Card) {
            stage8Card.classList.add('uploaded');
        }
    }
}

// 개별 스테이지 업로드 카드 상태 업데이트
function updateStageUploadCard(stageNumber) {
    let selector = '';
    
    switch(stageNumber) {
        case 2:
            selector = '.stage-upload-card[title="시나리오"]';
            break;
        case 4:
            selector = '.stage-upload-card[title="컨셉아트"]';
            break;
        case 5:
            selector = '.stage-upload-card[title="장면분할"]';
            break;
        case 6:
            selector = '.stage-upload-card[title="샷이미지"]';
            break;
        case 7:
            selector = '.stage-upload-card[title="영상"]';
            break;
        case 8:
            selector = '.stage-upload-card[title="오디오"]';
            break;
    }
    
    if (selector) {
        const card = document.querySelector(selector);
        if (card && !card.classList.contains('uploaded')) {
            card.classList.add('uploaded');
        }
    }
}

// 기존에 저장된 스테이지 데이터 파라미터를 URL에 추가
function appendExistingStageParams(baseUrl) {
    try {
        // 로컬 파일 시스템에서 실행 중인 경우 처리
        let url;
        if (window.location.protocol === 'file:') {
            // 파일 프로토콜인 경우 상대 경로 사용
            const separator = baseUrl.includes('?') ? '&' : '?';
            let params = [];
            
            // Stage 2 데이터 확인
            if (localStorage.getItem('stage2TempJson')) {
                params.push('loadTempJson=true');
            }
            
            // Stage 4 데이터 확인
            if (localStorage.getItem('stage4TempJson')) {
                params.push('loadStage4Json=true');
            }
            
            // Stage 5 데이터 확인
            if (localStorage.getItem('stage5TempJsonFiles')) {
                params.push('loadStage5JsonMultiple=true');
            }
            
            // Stage 6 데이터 확인
            if (localStorage.getItem('stage6TempJsonFiles')) {
                params.push('loadStage6JsonMultiple=true');
            }
            
            // Stage 7 데이터 확인
            if (localStorage.getItem('stage7TempJsonFiles')) {
                params.push('loadStage7JsonMultiple=true');
            }
            
            // Stage 8 데이터 확인
            if (localStorage.getItem('stage8TempJsonFiles')) {
                params.push('loadStage8JsonMultiple=true');
            }
            
            return params.length > 0 ? baseUrl + separator + params.join('&') : baseUrl;
        } else {
            // HTTP(S) 프로토콜인 경우 URL 객체 사용
            url = new URL(baseUrl, window.location.origin);
            
            // Stage 2 데이터 확인
            if (localStorage.getItem('stage2TempJson')) {
                url.searchParams.set('loadTempJson', 'true');
            }
            
            // Stage 4 데이터 확인
            if (localStorage.getItem('stage4TempJson')) {
                url.searchParams.set('loadStage4Json', 'true');
            }
            
            // Stage 5 데이터 확인
            if (localStorage.getItem('stage5TempJsonFiles')) {
                url.searchParams.set('loadStage5JsonMultiple', 'true');
            }
            
            // Stage 6 데이터 확인
            if (localStorage.getItem('stage6TempJsonFiles')) {
                url.searchParams.set('loadStage6JsonMultiple', 'true');
            }
            
            // Stage 7 데이터 확인
            if (localStorage.getItem('stage7TempJsonFiles')) {
                url.searchParams.set('loadStage7JsonMultiple', 'true');
            }
            
            // Stage 8 데이터 확인
            if (localStorage.getItem('stage8TempJsonFiles')) {
                url.searchParams.set('loadStage8JsonMultiple', 'true');
            }
            
            return url.toString();
        }
    } catch (error) {
        console.error('URL 파라미터 추가 중 오류:', error);
        return baseUrl;
    }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 사용자 접근 권한 확인 (미승인 사용자 차단)
        checkUserAccess();
        
        // 업로드 알림 섹션 숨기기
        const notificationSection = document.getElementById('upload-notification-section');
        if (notificationSection) {
            notificationSection.style.display = 'none';
        }
        
        // 각 함수가 존재하는지 확인 후 실행
        if (typeof initializeAnimations === 'function') {
            initializeAnimations();
        }
        
        if (typeof setupCardClickHandlers === 'function') {
            setupCardClickHandlers();
        }
        
        // 비디오 import 기능은 해당 요소가 있는 페이지에서만 실행
        if (document.getElementById('google-drive-url') && typeof setupVideoImport === 'function') {
            setupVideoImport();
        }
        
        if (typeof updateProjectCardStatus === 'function') {
            updateProjectCardStatus(); // 페이지 로드 시 카드 상태 초기화
        }
        
        if (typeof restoreCompletedStages === 'function') {
            restoreCompletedStages(); // 완료된 Stage 카드 표시 복원
        }
        
        // 초기화 시 Stage 2 버튼 활성화
        if (typeof enableStageButton === 'function') {
            enableStageButton(2);
        }
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
    
    // Stage 2 파일 입력 이벤트 리스너 추가
    const stage2FileInput = document.getElementById('stage2-json-input');
    if (stage2FileInput) {
        stage2FileInput.addEventListener('change', handleStage2FileSelect);
    }
    
    // Stage 4 파일 입력 이벤트 리스너 추가
    const stage4FileInput = document.getElementById('stage4-json-input');
    if (stage4FileInput) {
        stage4FileInput.addEventListener('change', handleStage4FileSelect);
    }
    
    // Stage 5 파일 입력 이벤트 리스너 추가
    const stage5FileInput = document.getElementById('stage5-json-input');
    if (stage5FileInput) {
        stage5FileInput.addEventListener('change', handleStage5FileSelect);
    }
    
    // Stage 6 파일 입력 이벤트 리스너 추가
    const stage6FileInput = document.getElementById('stage6-json-input');
    if (stage6FileInput) {
        stage6FileInput.addEventListener('change', handleStage6FileSelect);
    }
    
    // Stage 7 파일 입력 이벤트 리스너 추가
    const stage7FileInput = document.getElementById('stage7-json-input');
    if (stage7FileInput) {
        stage7FileInput.addEventListener('change', handleStage7FileSelect);
    }
    
    // Stage 8 파일 입력 이벤트 리스너 추가
    const stage8FileInput = document.getElementById('stage8-json-input');
    if (stage8FileInput) {
        stage8FileInput.addEventListener('change', handleStage8FileSelect);
    }
});

// Initialize page load animations
function initializeAnimations() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach((card, index) => {
        card.classList.add('fade-in');
        
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 200);
    });
}

// Setup smooth page transitions for project cards
function setupCardClickHandlers() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', handleCardClick);
    });
}

// Handle card click with smooth transition
function handleCardClick(event) {
    event.preventDefault();
    
    const link = this.querySelector('a');
    let href = link ? link.getAttribute('href') : null;
    
    if (!href) return;
    
    // 스토리보드 카드인 경우 업로드된 JSON 데이터에 따라 URL 파라미터 추가
    if (href.includes('storyboard/index.html')) {
        const urlParams = new URLSearchParams();
        
        // Stage 2 데이터가 있으면 최우선으로 로드 (다른 Stage들의 기반이 됨)
        if (localStorage.getItem('stage2TempJson')) {
            urlParams.set('loadTempJson', 'true');
        }
        
        // Stage 5 데이터가 있으면 자동 로드 파라미터 추가 (Stage 2 이후)
        if (localStorage.getItem('stage5TempJsonFiles')) {
            urlParams.set('loadStage5JsonMultiple', 'true');
        }
        
        // Stage 6 데이터가 있으면 자동 로드 파라미터 추가
        if (localStorage.getItem('stage6TempJson') || localStorage.getItem('stage6TempJsonFiles')) {
            if (localStorage.getItem('stage6TempJson')) {
                urlParams.set('loadStage6Json', 'true');
            }
            if (localStorage.getItem('stage6TempJsonFiles')) {
                urlParams.set('loadStage6JsonMultiple', 'true');
            }
        }
        
        // Stage 7 데이터가 있으면 자동 로드 파라미터 추가
        if (localStorage.getItem('stage7TempJsonFiles')) {
            urlParams.set('loadStage7JsonMultiple', 'true');
        }
        
        // Stage 8 데이터가 있으면 자동 로드 파라미터 추가
        if (localStorage.getItem('stage8TempJsonFiles')) {
            urlParams.set('loadStage8JsonMultiple', 'true');
        }
        
        // URL 파라미터가 있으면 추가
        if (urlParams.toString()) {
            href += '?' + urlParams.toString();
        }
        
        // Stage 5 이상의 데이터가 있지만 Stage 2가 없는 경우 경고
        const hasAdvancedStages = localStorage.getItem('stage5TempJsonFiles') || 
                                 localStorage.getItem('stage6TempJson') || 
                                 localStorage.getItem('stage6TempJsonFiles') ||
                                 localStorage.getItem('stage7TempJsonFiles') || 
                                 localStorage.getItem('stage8TempJsonFiles');
        
        if (hasAdvancedStages && !localStorage.getItem('stage2TempJson')) {
            if (!confirm('Stage 5-8 데이터를 로드하려면 먼저 Stage 2 시나리오 구조가 필요합니다.\n\nStage 2 없이 계속 진행하시겠습니까? (일부 데이터가 로드되지 않을 수 있습니다)')) {
                return; // 사용자가 취소하면 이동하지 않음
            }
        }
    }
    
    // 컨셉아트 카드인 경우 Stage 4 데이터 확인
    else if (href.includes('your_title_storyboard_v9.4_c.html')) {
        if (localStorage.getItem('stage4TempJson')) {
            href += '?loadStage4Json=true';
        }
    }
    
    // Add fade out effect
    document.body.classList.add('fade-out');
    
    setTimeout(() => {
        window.location.href = href;
    }, 300);
}

// Utility function for smooth scrolling (if needed in future)
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// 프로젝트 카드 상태 업데이트
function updateProjectCardStatus() {
    const storyboardCard = document.querySelector('.project-card a[href*="storyboard/index.html"]')?.closest('.project-card');
    const conceptCard = document.querySelector('.project-card a[href*="your_title_storyboard_v9.4_c.html"]')?.closest('.project-card');
    
    // 스토리보드 카드 상태 업데이트
    if (storyboardCard) {
        const hasStage2 = localStorage.getItem('stage2TempJson');
        const hasStage5 = localStorage.getItem('stage5TempJsonFiles');
        const hasStage6 = localStorage.getItem('stage6TempJson') || localStorage.getItem('stage6TempJsonFiles');
        const hasStage7 = localStorage.getItem('stage7TempJsonFiles');
        const hasStage8 = localStorage.getItem('stage8TempJsonFiles');
        
        // 업로드된 스테이지 개수 계산
        let uploadedStages = [];
        if (hasStage2) uploadedStages.push('2');
        if (hasStage5) uploadedStages.push('5');
        if (hasStage6) uploadedStages.push('6');
        if (hasStage7) uploadedStages.push('7');
        if (hasStage8) uploadedStages.push('8');
        
        const statusElement = storyboardCard.querySelector('.project-status');
        
        // 애니메이션 클래스 추가
        statusElement.classList.add('updating');
        setTimeout(() => {
            statusElement.classList.remove('updating');
        }, 500);
        
        if (uploadedStages.length === 5) {
            // 모든 스테이지 업로드 완료
            statusElement.textContent = '✅ 전체 데이터 준비 완료';
            statusElement.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            statusElement.style.color = 'white';
            statusElement.style.fontWeight = 'bold';
            storyboardCard.style.opacity = '1';
            storyboardCard.style.cursor = 'pointer';
            storyboardCard.style.transform = 'scale(1.02)';
            storyboardCard.style.boxShadow = '0 8px 16px rgba(76, 175, 80, 0.3)';
        } else if (uploadedStages.length > 0) {
            // 일부 스테이지 업로드됨
            const stageText = uploadedStages.join(', ');
            statusElement.textContent = `📊 Stage ${stageText} 업로드됨 (${uploadedStages.length}/5)`;
            
            // 진행도에 따른 색상 변경
            const progress = uploadedStages.length / 5;
            if (progress >= 0.8) {
                statusElement.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            } else if (progress >= 0.6) {
                statusElement.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
            } else if (progress >= 0.4) {
                statusElement.style.background = 'linear-gradient(135deg, #03A9F4 0%, #0288D1 100%)';
            } else {
                statusElement.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
            }
            
            statusElement.style.color = 'white';
            statusElement.style.fontWeight = '600';
            storyboardCard.style.opacity = '0.95';
            storyboardCard.style.cursor = 'pointer';
            storyboardCard.style.transform = 'scale(1.01)';
            storyboardCard.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        } else {
            // 업로드된 데이터 없음
            statusElement.textContent = '📁 활성 프로젝트';
            statusElement.style.background = 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
            statusElement.style.color = 'white';
            statusElement.style.fontWeight = 'normal';
            storyboardCard.style.opacity = '0.85';
            storyboardCard.style.transform = 'scale(1)';
            storyboardCard.style.boxShadow = '';
        }
    }
    
    // 컨셉아트 카드 상태 업데이트
    if (conceptCard) {
        const hasConceptData = localStorage.getItem('stage4TempJson');
        
        const statusElement = conceptCard.querySelector('.project-status');
        
        // 애니메이션 클래스 추가
        statusElement.classList.add('updating');
        setTimeout(() => {
            statusElement.classList.remove('updating');
        }, 500);
        
        if (hasConceptData) {
            statusElement.textContent = '✅ Stage 4 데이터 준비됨';
            statusElement.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            statusElement.style.color = 'white';
            statusElement.style.fontWeight = 'bold';
            conceptCard.style.opacity = '1';
            conceptCard.style.cursor = 'pointer';
            conceptCard.style.transform = 'scale(1.02)';
            conceptCard.style.boxShadow = '0 8px 16px rgba(76, 175, 80, 0.3)';
        } else {
            statusElement.textContent = '🎨 활성 프로젝트';
            statusElement.style.background = 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
            statusElement.style.color = 'white';
            statusElement.style.fontWeight = 'normal';
            conceptCard.style.opacity = '0.85';
            conceptCard.style.transform = 'scale(1)';
            conceptCard.style.boxShadow = '';
        }
    }
}

// 임시 데이터 초기화 함수
function clearAllTempData() {
    const message = '모든 데이터를 초기화하시겠습니까?\n\n' +
                   '다음 항목들이 삭제됩니다:\n' +
                   '• 임시 업로드 데이터\n' +
                   '• 스토리보드 데이터\n' +
                   '• 컨셉아트 데이터\n' +
                   '• 수정된 프롬프트\n\n' +
                   '이 작업은 되돌릴 수 없습니다.';
    
    if (!confirm(message)) {
        return;
    }
    
    // 임시 JSON 데이터 삭제
    const tempDataKeys = [
        'stage2TempJson', 'stage2TempFileName',
        'stage4TempJson', 'stage4TempFileName', 
        'stage5TempJsonFiles', 'stage5TempFileNames',
        'stage6TempJson', 'stage6TempFileName',
        'stage6TempJsonFiles', 'stage6TempFileNames',
        'stage7TempJsonFiles', 'stage7TempFileNames',
        'stage8TempJsonFiles', 'stage8TempFileNames'
    ];
    
    // 처리 완료 플래그 삭제
    const processedFlags = [
        'stage2TempProcessed', 'stage4TempProcessed', 'stage5TempProcessed',
        'stage6TempProcessed', 'stage6TempFilesProcessed',
        'stage7TempProcessed', 'stage8TempProcessed'
    ];
    
    // 업로드 완료 플래그 삭제
    const uploadedFlags = [
        'stage2Uploaded', 'stage4Uploaded', 'stage5Uploaded',
        'stage6Uploaded', 'stage7Uploaded', 'stage8Uploaded'
    ];
    
    let deletedCount = 0;
    
    // 임시 데이터 삭제
    tempDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            deletedCount++;
        }
    });
    
    // 처리 완료 플래그 삭제
    processedFlags.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            deletedCount++;
        }
    });
    
    // 업로드 완료 플래그 삭제
    uploadedFlags.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            deletedCount++;
        }
    });
    
    // 완료된 스테이지 목록 삭제
    if (localStorage.getItem('completedStages')) {
        localStorage.removeItem('completedStages');
        deletedCount++;
    }
    
    // 스토리보드 관련 데이터 삭제
    const storyboardKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('breakdownData') || 
                   key.includes('lastSaved') || 
                   key.includes('shotMemos') ||
                   key.includes('shot_') ||
                   key.includes('filmProduction') ||
                   key.includes('stage6ImagePrompts') ||
                   key.includes('stage7VideoPrompts') ||
                   key.includes('stage8AudioPrompts') ||
                   key.includes('audioFiles_') ||
                   key.includes('editedImagePrompts'))) {
            storyboardKeys.push(key);
        }
    }
    
    storyboardKeys.forEach(key => {
        localStorage.removeItem(key);
        deletedCount++;
    });
    
    // 컨셉아트 관련 데이터 삭제
    const conceptArtKeys = ['conceptArtManagerData_v1.2', 'editedConceptPrompts'];
    conceptArtKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            deletedCount++;
        }
    });
    
    // 업로드 상태 초기화
    Object.keys(uploadStatus).forEach(key => {
        uploadStatus[key] = false;
    });
    
    // Stage 카드의 완료 표시 제거
    const stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(card => {
        card.classList.remove('stage-completed');
        const checkIcon = card.querySelector('.stage-check-icon');
        if (checkIcon) {
            checkIcon.remove();
        }
    });
    
    // Stage 업로드 카드의 uploaded 클래스 제거 (녹색 완료 상태 제거)
    const stageUploadCards = document.querySelectorAll('.stage-upload-card');
    stageUploadCards.forEach(card => {
        card.classList.remove('uploaded');
    });
    
    // 프로젝트 카드 상태 업데이트
    updateProjectCardStatus();
    
    // 업로드 상태 리스트 초기화
    const statusList = document.getElementById('upload-status-list');
    if (statusList) {
        statusList.innerHTML = '';
    }
    
    // 완료 메시지 표시
    if (deletedCount > 0) {
        alert(`모든 데이터가 초기화되었습니다.\n\n` +
              `삭제된 항목 수: ${deletedCount}개\n` +
              `• 임시 업로드 데이터\n` +
              `• 스토리보드 데이터\n` +
              `• 컨셉아트 데이터\n` +
              `• 수정된 프롬프트\n\n` +
              `이제 새로운 프로젝트를 시작할 수 있습니다.`);
        
        // 페이지 새로고침으로 상태 완전 초기화
        location.reload();
    } else {
        alert('초기화할 데이터가 없습니다.');
    }
}

// Add keyboard navigation support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        
        if (focusedElement.classList.contains('project-card') || 
            focusedElement.classList.contains('tool-btn')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});

// Navigate to storyboard with auto-import trigger (Stage 2)
window.goToStoryboardWithImport = function() {
    console.log('🎬 goToStoryboardWithImport 함수 호출됨');
    
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage2-json-input');
    if (fileInput) {
        console.log('📂 Stage 2 파일 선택 대화상자 열기');
        
        // 이벤트 리스너가 없는 경우 추가
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', handleStage2FileSelect);
            fileInput.setAttribute('data-listener-added', 'true');
            console.log('✅ Stage 2 이벤트 리스너 추가됨');
        }
        
        fileInput.click();
    } else {
        console.log('⚠️ Stage 2 파일 입력 요소를 찾을 수 없음');
        // 폴백: 바로 스토리보드로 이동 (기존 스테이지 데이터도 함께 로드)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            let url = 'storyboard/index.html?autoImport=true';
            url = appendExistingStageParams(url);
            window.location.href = url;
        }, 300);
    }
}

// Navigate to concept art with auto-import trigger (Stage 4)
window.goToConceptArtWithStage4Import = function() {
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage4-json-input');
    if (fileInput) {
        fileInput.click();
    } else {
        // 폴백: 바로 컨셉아트 페이지로 이동
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = 'concept-art/index.html?autoImport=true';
        }, 300);
    }
}

// Navigate to storyboard with auto-import trigger (Stage 5)
window.goToStoryboardWithStage5Import = function() {
    console.log('🎬 goToStoryboardWithStage5Import 함수 호출됨');
    
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage5-json-input');
    if (fileInput) {
        console.log('📂 Stage 5 파일 선택 대화상자 열기');
        
        // 이벤트 리스너가 없는 경우 추가
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', handleStage5FileSelect);
            fileInput.setAttribute('data-listener-added', 'true');
            console.log('✅ Stage 5 이벤트 리스너 추가됨');
        }
        
        fileInput.click();
    } else {
        console.log('⚠️ Stage 5 파일 입력 요소를 찾을 수 없음');
        // 폴백: 바로 스토리보드로 이동 (기존 스테이지 데이터도 함께 로드)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            let url = 'storyboard/index.html?autoImport=true';
            url = appendExistingStageParams(url);
            window.location.href = url;
        }, 300);
    }
}

// Navigate to storyboard with auto-import trigger (Stage 6)
window.goToStoryboardWithStage6Import = function() {
    console.log('🎬 goToStoryboardWithStage6Import 함수 호출됨');
    
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage6-json-input');
    if (fileInput) {
        console.log('📂 Stage 6 파일 선택 대화상자 열기');
        
        // 이벤트 리스너가 없는 경우 추가
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', handleStage6FileSelect);
            fileInput.setAttribute('data-listener-added', 'true');
            console.log('✅ Stage 6 이벤트 리스너 추가됨');
        }
        
        fileInput.click();
    } else {
        console.log('⚠️ Stage 6 파일 입력 요소를 찾을 수 없음');
        // 폴백: 바로 스토리보드로 이동 (기존 스테이지 데이터도 함께 로드)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            let url = 'storyboard/index.html?autoImport=true';
            // 기존에 저장된 다른 스테이지 데이터도 함께 로드
            url = appendExistingStageParams(url);
            window.location.href = url;
        }, 300);
    }
}

// Navigate to storyboard with auto-import trigger (Stage 7)
window.goToStoryboardWithStage7Import = function() {
    console.log('🎬 goToStoryboardWithStage7Import 함수 호출됨');
    
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage7-json-input');
    if (fileInput) {
        console.log('📂 Stage 7 파일 선택 대화상자 열기');
        
        // 이벤트 리스너가 없는 경우 추가
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', handleStage7FileSelect);
            fileInput.setAttribute('data-listener-added', 'true');
            console.log('✅ Stage 7 이벤트 리스너 추가됨');
        }
        
        fileInput.click();
    } else {
        console.log('⚠️ Stage 7 파일 입력 요소를 찾을 수 없음');
        // 폴백: 바로 스토리보드로 이동 (기존 스테이지 데이터도 함께 로드)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            let url = 'storyboard/index.html?autoImport=true';
            url = appendExistingStageParams(url);
            window.location.href = url;
        }, 300);
    }
}

// Navigate to storyboard with auto-import trigger (Stage 8)
window.goToStoryboardWithStage8Import = function() {
    console.log('🎬 goToStoryboardWithStage8Import 함수 호출됨');
    
    // 개별 스테이지 업로드 시 상태 초기화
    resetIndividualUploadState();
    
    // 파일 선택 대화상자 열기
    const fileInput = document.getElementById('stage8-json-input');
    if (fileInput) {
        console.log('📂 Stage 8 파일 선택 대화상자 열기');
        
        // 이벤트 리스너가 없는 경우 추가
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', handleStage8FileSelect);
            fileInput.setAttribute('data-listener-added', 'true');
            console.log('✅ Stage 8 이벤트 리스너 추가됨');
        }
        
        fileInput.click();
    } else {
        console.log('⚠️ Stage 8 파일 입력 요소를 찾을 수 없음');
        // 폴백: 바로 스토리보드로 이동 (기존 스테이지 데이터도 함께 로드)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            let url = 'storyboard/index.html?autoImport=true';
            url = appendExistingStageParams(url);
            window.location.href = url;
        }, 300);
    }
}

// Handle Stage 2 JSON file selection
function handleStage2FileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    console.log('📁 Stage 2 파일 선택됨:', file.name);
    
    // 파일을 읽어서 localStorage에 임시 저장
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // JSON 유효성 검사
            const jsonData = JSON.parse(e.target.result);
            console.log('✅ Stage 2 JSON 파싱 성공');
            
            // localStorage에 임시 저장
            localStorage.setItem('stage2TempJson', e.target.result);
            localStorage.setItem('stage2TempFileName', file.name);
            
            // Stage 2 업로드 완료 플래그 저장 (영구 보관)
            localStorage.setItem('stage2Uploaded', 'true');
            
            console.log('💾 Stage 2 데이터 localStorage 저장 완료');
            
            // Stage 2 카드 즉시 업데이트
            updateStageUploadCard(2);
            
            // 순차 업로드 모달에서 호출된 경우
            const modal = document.getElementById('sequential-upload-modal');
            if (modal && modal.classList.contains('show')) {
                // 모달에서 호출된 경우
                showStageUploadComplete(2);
                completeStageUpload(2);
            } else {
                // 개별 Stage 카드에서 직접 호출된 경우 - 바로 스토리보드로 이동
                console.log('🚀 개별 Stage 2 업로드 - 스토리보드로 바로 이동');
                
                // fade 효과와 함께 페이지 이동
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    const url = 'storyboard/index.html?loadTempJson=true';
                    console.log('📍 이동할 URL:', url);
                    window.location.href = url;
                }, 300);
            }
            
        } catch (error) {
            console.error('❌ Stage 2 JSON 파싱 오류:', error);
            showStageUploadError(2, '올바른 JSON 파일이 아닙니다.');
        }
    };
    
    reader.onerror = function() {
        console.error('❌ Stage 2 파일 읽기 오류');
        showStageUploadError(2, '파일을 읽는 중 오류가 발생했습니다.');
    };
    
    reader.readAsText(file);
    event.target.value = ''; // 파일 입력 초기화
}

// Handle Stage 4 JSON file selection
function handleStage4FileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    
    // 파일을 읽어서 localStorage에 임시 저장
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // JSON 유효성 검사
            const jsonData = JSON.parse(e.target.result);
            
            // Stage 4 데이터 유효성 검사
            if (jsonData.stage !== 4) {
                throw new Error('Stage 4 파일이 아닙니다.');
            }
            
            // 프로젝트 타입 확인 (CF 또는 FILM)
            const projectType = jsonData.project_info?.project_type || 
                               (jsonData.project_info?.project_id?.includes('FILM') ? 'film' : 'cf');
            console.log(`Stage 4 프로젝트 타입: ${projectType}`);
            
            // localStorage에 임시 저장 (Stage 4용)
            localStorage.setItem('stage4TempJson', e.target.result);
            localStorage.setItem('stage4TempFileName', file.name);
            localStorage.setItem('stage4ProjectType', projectType);
            
            // Stage 4 업로드 완료 플래그 저장 (영구 보관)
            localStorage.setItem('stage4Uploaded', 'true');
            
            console.log(`Stage 4 JSON 파일을 임시 저장했습니다. (${projectType} 프로젝트)`);
            
            // 업로드 완료 메시지 표시
            showStageUploadComplete(4);
            
            // Stage 4 카드 즉시 업데이트
            updateStageUploadCard(4);
            
            // 순차 업로드 모달에서 호출된 경우
            const modal = document.getElementById('sequential-upload-modal');
            if (modal && modal.classList.contains('show')) {
                // 모달에서 호출된 경우
                completeStageUpload(4);
            } else {
                // 개별 Stage 카드에서 직접 호출된 경우 - 바로 컨셉아트로 이동
                console.log('🎨 개별 Stage 4 업로드 - 컨셉아트로 바로 이동');
                
                // 컨셉아트 페이지에서 새로고침 후 첫 번째 캐릭터 클릭하도록 플래그 설정
                localStorage.setItem('shouldClickActiveCharacter', 'true');
                
                // fade 효과와 함께 페이지 이동
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    const url = 'concept-art/index.html?loadStage4Json=true&autoRefresh=true';
                    console.log('📍 이동할 URL:', url);
                    window.location.href = url;
                }, 300);
            }
            
        } catch (error) {
            showStageUploadError(4, '올바른 JSON 파일이 아닙니다.');
            console.error('JSON 파싱 오류:', error);
        }
    };
    
    reader.onerror = function() {
        showStageUploadError(4, '파일을 읽는 중 오류가 발생했습니다.');
        console.error('파일 읽기 오류');
    };
    
    reader.readAsText(file);
    event.target.value = ''; // 파일 입력 초기화
}

// Handle Stage 5 JSON file selection (multiple files)
function handleStage5FileSelect(event) {
    console.log('📁 handleStage5FileSelect 함수 호출됨');
    const files = Array.from(event.target.files);
    if (files.length === 0) {
        console.log('⚠️ 선택된 파일이 없음');
        return;
    }

    console.log(`✅ Stage 5 JSON 파일 ${files.length}개 선택됨:`, files.map(f => f.name));
    
    // 여러 파일을 순차적으로 처리
    const fileContents = [];
    const fileNames = [];
    let processedCount = 0;
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // JSON 유효성 검사
                const jsonData = JSON.parse(e.target.result);
                
                fileContents[index] = e.target.result;
                fileNames[index] = file.name;
                processedCount++;
                
                console.log(`Stage 5 JSON 파일 처리됨 (${processedCount}/${files.length}):`, file.name);
                
                // 모든 파일이 처리되면 localStorage에 저장하고 완료 메시지 표시
                if (processedCount === files.length) {
                    // 기존 저장된 파일들 가져오기
                    const existingFiles = localStorage.getItem('stage5TempJsonFiles');
                    const existingFileNames = localStorage.getItem('stage5TempFileNames');
                    
                    let allFileContents = fileContents;
                    let allFileNames = fileNames;
                    
                    // 기존 파일이 있으면 병합
                    if (existingFiles && existingFileNames) {
                        try {
                            const parsedExistingFiles = JSON.parse(existingFiles);
                            const parsedExistingFileNames = JSON.parse(existingFileNames);
                            
                            // 기존 파일과 새 파일을 병합
                            allFileContents = [...parsedExistingFiles, ...fileContents];
                            allFileNames = [...parsedExistingFileNames, ...fileNames];
                            
                            console.log(`기존 ${parsedExistingFiles.length}개 파일과 새로운 ${files.length}개 파일을 병합합니다.`);
                        } catch (e) {
                            console.error('기존 파일 파싱 오류:', e);
                        }
                    }
                    
                    // 모든 파일을 배열로 저장
                    localStorage.setItem('stage5TempJsonFiles', JSON.stringify(allFileContents));
                    localStorage.setItem('stage5TempFileNames', JSON.stringify(allFileNames));
                    
                    // stage5TempProcessed 플래그 제거하여 재처리 가능하게 함
                    localStorage.removeItem('stage5TempProcessed');
                    
                    console.log(`Stage 5 JSON 파일 총 ${allFileContents.length}개를 임시 저장했습니다.`);
                    
                    // Stage 5 업로드 완료 플래그 저장 (영구 보관)
                    localStorage.setItem('stage5Uploaded', 'true');
                    
                    // Stage 5 카드 즉시 업데이트
                    updateStageUploadCard(5);
                    
                    // 업로드 완료 메시지 표시
                    showStageUploadComplete(5);
                    
                    // 순차 업로드 모달에서 호출된 경우
                    const modal = document.getElementById('sequential-upload-modal');
                    console.log('🔍 모달 상태 확인:', modal ? '존재함' : '없음', modal?.classList.contains('show') ? '표시중' : '숨김');
                    
                    if (modal && modal.classList.contains('show')) {
                        console.log('📋 모달에서 호출됨 - completeStageUpload 실행');
                        completeStageUpload(5);
                    } else {
                        // 개별 Stage 카드에서 직접 호출된 경우 - 바로 스토리보드로 이동
                        console.log('🎬 개별 Stage 5 업로드 - 스토리보드로 바로 이동');
                        
                        // fade 효과와 함께 페이지 이동
                        document.body.classList.add('fade-out');
                        setTimeout(() => {
                            const url = 'storyboard/index.html?loadStage5JsonMultiple=true';
                            console.log('📍 이동할 URL:', url);
                            console.log('🚀 페이지 이동 실행...');
                            window.location.href = url;
                        }, 300);
                    }
                }
                
            } catch (error) {
                showStageUploadError(5, `올바른 JSON 파일이 아닙니다 (${file.name})`);
                console.error('JSON 파싱 오류:', error);
                return;
            }
        };
        
        reader.onerror = function() {
            showStageUploadError(5, `파일을 읽는 중 오류가 발생했습니다 (${file.name})`);
            console.error('파일 읽기 오류');
            return;
        };
        
        reader.readAsText(file);
    });
    
    event.target.value = ''; // 파일 입력 초기화
}

// Handle Stage 6 JSON file selection (multiple files)
function handleStage6FileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) {
        return;
    }

    console.log(`Stage 6 JSON 파일 ${files.length}개 선택됨:`, files.map(f => f.name));
    
    // 여러 파일을 순차적으로 처리
    const fileContents = [];
    const fileNames = [];
    let processedCount = 0;
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // JSON 유효성 검사
                const jsonData = JSON.parse(e.target.result);
                
                fileContents[index] = e.target.result;
                fileNames[index] = file.name;
                processedCount++;
                
                console.log(`Stage 6 JSON 파일 처리됨 (${processedCount}/${files.length}):`, file.name);
                
                // 모든 파일이 처리되면 localStorage에 저장하고 완료 메시지 표시
                if (processedCount === files.length) {
                    // 기존 저장된 파일들 가져오기
                    const existingFiles = localStorage.getItem('stage6TempJsonFiles');
                    const existingFileNames = localStorage.getItem('stage6TempFileNames');
                    
                    let allFileContents = fileContents;
                    let allFileNames = fileNames;
                    
                    // 기존 파일이 있으면 병합
                    if (existingFiles && existingFileNames) {
                        try {
                            const parsedExistingFiles = JSON.parse(existingFiles);
                            const parsedExistingFileNames = JSON.parse(existingFileNames);
                            
                            // 기존 파일과 새 파일을 병합
                            allFileContents = [...parsedExistingFiles, ...fileContents];
                            allFileNames = [...parsedExistingFileNames, ...fileNames];
                            
                            console.log(`기존 ${parsedExistingFiles.length}개 파일과 새로운 ${files.length}개 파일을 병합합니다.`);
                        } catch (e) {
                            console.error('기존 파일 파싱 오류:', e);
                        }
                    }
                    
                    // 모든 파일을 배열로 저장
                    localStorage.setItem('stage6TempJsonFiles', JSON.stringify(allFileContents));
                    localStorage.setItem('stage6TempFileNames', JSON.stringify(allFileNames));
                    
                    // stage6TempProcessed 플래그 제거하여 재처리 가능하게 함
                    localStorage.removeItem('stage6TempProcessed');
                    localStorage.removeItem('stage6TempFilesProcessed');
                    
                    console.log(`Stage 6 JSON 파일 총 ${allFileContents.length}개를 임시 저장했습니다.`);
                    
                    // Stage 6 업로드 완료 플래그 저장 (영구 보관)
                    localStorage.setItem('stage6Uploaded', 'true');
                    
                    // Stage 6 카드 즉시 업데이트
                    updateStageUploadCard(6);
                    
                    // 업로드 완료 메시지 표시
                    showStageUploadComplete(6);
                    
                    // 순차 업로드 모달에서 호출된 경우
                    const modal = document.getElementById('sequential-upload-modal');
                    if (modal && modal.classList.contains('show')) {
                        completeStageUpload(6);
                    } else {
                        // 개별 Stage 카드에서 직접 호출된 경우 - 바로 스토리보드로 이동
                        console.log('🎬 개별 Stage 6 업로드 - 스토리보드로 바로 이동');
                        
                        // fade 효과와 함께 페이지 이동
                        document.body.classList.add('fade-out');
                        setTimeout(() => {
                            const url = 'storyboard/index.html?loadStage6JsonMultiple=true';
                            console.log('📍 이동할 URL:', url);
                            window.location.href = url;
                        }, 300);
                    }
                }
                
            } catch (error) {
                showStageUploadError(6, `올바른 JSON 파일이 아닙니다 (${file.name})`);
                console.error('JSON 파싱 오류:', error);
                return;
            }
        };
        
        reader.onerror = function() {
            showStageUploadError(6, `파일을 읽는 중 오류가 발생했습니다 (${file.name})`);
            console.error('파일 읽기 오류');
            return;
        };
        
        reader.readAsText(file);
    });
    
    event.target.value = ''; // 파일 입력 초기화
}

// Handle Stage 7 JSON file selection (multiple files)
function handleStage7FileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) {
        return;
    }

    console.log(`Stage 7 JSON 파일 ${files.length}개 선택됨:`, files.map(f => f.name));
    
    // 여러 파일을 순차적으로 처리
    const fileContents = [];
    const fileNames = [];
    let processedCount = 0;
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // JSON 유효성 검사
                const jsonData = JSON.parse(e.target.result);
                
                fileContents[index] = e.target.result;
                fileNames[index] = file.name;
                processedCount++;
                
                console.log(`Stage 7 JSON 파일 처리됨 (${processedCount}/${files.length}):`, file.name);
                
                // 모든 파일이 처리되면 localStorage에 저장하고 완료 메시지 표시
                if (processedCount === files.length) {
                    // 기존 저장된 파일들 가져오기
                    const existingFiles = localStorage.getItem('stage7TempJsonFiles');
                    const existingFileNames = localStorage.getItem('stage7TempFileNames');
                    
                    let allFileContents = fileContents;
                    let allFileNames = fileNames;
                    
                    // 기존 파일이 있으면 병합
                    if (existingFiles && existingFileNames) {
                        try {
                            const parsedExistingFiles = JSON.parse(existingFiles);
                            const parsedExistingFileNames = JSON.parse(existingFileNames);
                            
                            // 기존 파일과 새 파일을 병합
                            allFileContents = [...parsedExistingFiles, ...fileContents];
                            allFileNames = [...parsedExistingFileNames, ...fileNames];
                            
                            console.log(`기존 ${parsedExistingFiles.length}개 파일과 새로운 ${files.length}개 파일을 병합합니다.`);
                        } catch (e) {
                            console.error('기존 파일 파싱 오류:', e);
                        }
                    }
                    
                    // 모든 파일을 배열로 저장
                    localStorage.setItem('stage7TempJsonFiles', JSON.stringify(allFileContents));
                    localStorage.setItem('stage7TempFileNames', JSON.stringify(allFileNames));
                    
                    // stage7TempProcessed 플래그 제거하여 재처리 가능하게 함
                    localStorage.removeItem('stage7TempProcessed');
                    
                    console.log(`Stage 7 JSON 파일 총 ${allFileContents.length}개를 임시 저장했습니다.`);
                    
                    // Stage 7 업로드 완료 플래그 저장 (영구 보관)
                    localStorage.setItem('stage7Uploaded', 'true');
                    
                    // Stage 7 카드 즉시 업데이트
                    updateStageUploadCard(7);
                    
                    // 업로드 완료 메시지 표시
                    showStageUploadComplete(7);
                    
                    // 순차 업로드 모달에서 호출된 경우
                    const modal = document.getElementById('sequential-upload-modal');
                    if (modal && modal.classList.contains('show')) {
                        completeStageUpload(7);
                    } else {
                        // 개별 Stage 카드에서 직접 호출된 경우 - 바로 스토리보드로 이동
                        console.log('🎬 개별 Stage 7 업로드 - 스토리보드로 바로 이동');
                        
                        // fade 효과와 함께 페이지 이동
                        document.body.classList.add('fade-out');
                        setTimeout(() => {
                            const url = 'storyboard/index.html?loadStage7JsonMultiple=true';
                            console.log('📍 이동할 URL:', url);
                            window.location.href = url;
                        }, 300);
                    }
                }
                
            } catch (error) {
                showStageUploadError(7, `올바른 JSON 파일이 아닙니다 (${file.name})`);
                console.error('JSON 파싱 오류:', error);
                return;
            }
        };
        
        reader.onerror = function() {
            showStageUploadError(7, `파일을 읽는 중 오류가 발생했습니다 (${file.name})`);
            console.error('파일 읽기 오류');
            return;
        };
        
        reader.readAsText(file);
    });
    
    event.target.value = ''; // 파일 입력 초기화
}

// Handle Stage 8 JSON file selection (multiple files)
function handleStage8FileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) {
        return;
    }

    console.log(`Stage 8 JSON 파일 ${files.length}개 선택됨:`, files.map(f => f.name));
    
    // 여러 파일을 순차적으로 처리
    const fileContents = [];
    const fileNames = [];
    let processedCount = 0;
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // JSON 유효성 검사
                const jsonData = JSON.parse(e.target.result);
                
                fileContents[index] = e.target.result;
                fileNames[index] = file.name;
                processedCount++;
                
                console.log(`Stage 8 JSON 파일 처리됨 (${processedCount}/${files.length}):`, file.name);
                
                // 모든 파일이 처리되면 localStorage에 저장하고 완료 메시지 표시
                if (processedCount === files.length) {
                    // 기존 저장된 파일들 가져오기
                    const existingFiles = localStorage.getItem('stage8TempJsonFiles');
                    const existingFileNames = localStorage.getItem('stage8TempFileNames');
                    
                    let allFileContents = fileContents;
                    let allFileNames = fileNames;
                    
                    // 기존 파일이 있으면 병합
                    if (existingFiles && existingFileNames) {
                        try {
                            const parsedExistingFiles = JSON.parse(existingFiles);
                            const parsedExistingFileNames = JSON.parse(existingFileNames);
                            
                            // 기존 파일과 새 파일을 병합
                            allFileContents = [...parsedExistingFiles, ...fileContents];
                            allFileNames = [...parsedExistingFileNames, ...fileNames];
                            
                            console.log(`기존 ${parsedExistingFiles.length}개 파일과 새로운 ${files.length}개 파일을 병합합니다.`);
                        } catch (e) {
                            console.error('기존 파일 파싱 오류:', e);
                        }
                    }
                    
                    // 모든 파일을 배열로 저장
                    localStorage.setItem('stage8TempJsonFiles', JSON.stringify(allFileContents));
                    localStorage.setItem('stage8TempFileNames', JSON.stringify(allFileNames));
                    
                    // stage8TempProcessed 플래그 제거하여 재처리 가능하게 함
                    localStorage.removeItem('stage8TempProcessed');
                    
                    console.log(`Stage 8 JSON 파일 총 ${allFileContents.length}개를 임시 저장했습니다.`);
                    
                    // Stage 8 업로드 완료 플래그 저장 (영구 보관)
                    localStorage.setItem('stage8Uploaded', 'true');
                    
                    // Stage 8 카드 즉시 업데이트
                    updateStageUploadCard(8);
                    
                    // 업로드 완료 메시지 표시
                    showStageUploadComplete(8);
                    
                    // 순차 업로드 모달에서 호출된 경우
                    const modal = document.getElementById('sequential-upload-modal');
                    if (modal && modal.classList.contains('show')) {
                        completeStageUpload(8);
                    } else {
                        // 개별 Stage 카드에서 직접 호출된 경우 - 바로 스토리보드로 이동
                        console.log('🎬 개별 Stage 8 업로드 - 스토리보드로 바로 이동');
                        
                        // fade 효과와 함께 페이지 이동
                        document.body.classList.add('fade-out');
                        setTimeout(() => {
                            const url = 'storyboard/index.html?loadStage8JsonMultiple=true';
                            console.log('📍 이동할 URL:', url);
                            window.location.href = url;
                        }, 300);
                    }
                }
                
            } catch (error) {
                showStageUploadError(8, `올바른 JSON 파일이 아닙니다 (${file.name})`);
                console.error('JSON 파싱 오류:', error);
                return;
            }
        };
        
        reader.onerror = function() {
            showStageUploadError(8, `파일을 읽는 중 오류가 발생했습니다 (${file.name})`);
            console.error('파일 읽기 오류');
            return;
        };
        
        reader.readAsText(file);
    });
    
    event.target.value = ''; // 파일 입력 초기화
}

// Google Drive Video Import Functions
function setupVideoImport() {
    const urlInput = document.getElementById('google-drive-url');
    const loadBtn = document.getElementById('load-video-btn');
    const clearBtn = document.getElementById('clear-video-btn');
    const previewContainer = document.getElementById('video-preview-container');
    const videoUrlDisplay = document.getElementById('video-url-display');

    if (!urlInput || !loadBtn || !previewContainer) {
        console.log('Video import elements not found');
        return;
    }

    // 저장된 동영상 URL 복원 (새로고침 대응)
    const savedUrl = localStorage.getItem('googleDriveVideoUrl');
    const savedFileId = localStorage.getItem('googleDriveVideoFileId');
    if (savedUrl && savedFileId) {
        urlInput.value = savedUrl;
        // 저장된 동영상 자동 로드 - 향상된 복원
        setTimeout(() => {
            showNotification('저장된 동영상을 복원하는 중...', 'info');
            createGoogleDriveAccessOptions(savedFileId, savedUrl, previewContainer, videoUrlDisplay);
        }, 500);
    }

    // URL 입력 실시간 검증
    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        const fileId = extractGoogleDriveFileId(url);
        
        if (!url) {
            this.classList.remove('valid', 'invalid');
            loadBtn.disabled = false;
        } else if (fileId) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            loadBtn.disabled = false;
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            loadBtn.disabled = true;
        }
    });

    // 동영상 불러오기 버튼
    loadBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (!url) {
            showNotification('URL을 입력해주세요.', 'error');
            return;
        }

        const fileId = extractGoogleDriveFileId(url);
        if (!fileId) {
            showNotification('올바른 Google Drive URL을 입력해주세요.', 'error');
            return;
        }

        loadBtn.disabled = true;
        loadBtn.textContent = '불러오는 중...';
        
        handleVideoLoad(url, fileId, previewContainer, videoUrlDisplay);
        
        setTimeout(() => {
            loadBtn.disabled = false;
            loadBtn.textContent = '동영상 불러오기';
        }, 2000);
    });

    // 동영상 제거 버튼
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            previewContainer.style.display = 'none';
            urlInput.value = '';
            urlInput.classList.remove('valid', 'invalid');
            
            // localStorage 정리
            localStorage.removeItem('googleDriveVideoUrl');
            localStorage.removeItem('googleDriveVideoFileId');
            
            showNotification('동영상이 제거되었습니다.', 'info');
        });
    }

    // Enter 키로 동영상 로드
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loadBtn.disabled) {
            loadBtn.click();
        }
    });

    // 로컬 파일 업로드 기능 추가
    setupLocalVideoUpload();
}

function setupLocalVideoUpload() {
    // 로컬 파일 업로드 버튼 추가
    const urlInputGroup = document.querySelector('.url-input-group');
    if (urlInputGroup) {
        const uploadSection = document.createElement('div');
        uploadSection.className = 'local-upload-section';
        uploadSection.innerHTML = `
            <div class="upload-divider">
                <span>또는</span>
            </div>
            <div class="local-upload-group">
                <label for="local-video-input" class="upload-label">로컬 동영상 파일 업로드:</label>
                <input type="file" id="local-video-input" class="file-input" accept="video/*" multiple>
                <div class="upload-help">
                    MP4, MOV, AVI, WebM 등 동영상 파일을 선택하세요. (여러 파일 선택 가능)
                </div>
            </div>
        `;
        
        urlInputGroup.appendChild(uploadSection);
        
        // 파일 선택 이벤트
        const fileInput = document.getElementById('local-video-input');
        if (fileInput) {
            fileInput.addEventListener('change', handleLocalVideoUpload);
        }
    }
}

function handleLocalVideoUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const previewContainer = document.getElementById('video-preview-container');
    const videoWrapper = document.querySelector('.video-wrapper');
    const videoUrlDisplay = document.getElementById('video-url-display');
    
    // 기존 컨텐츠 정리
    videoWrapper.innerHTML = '';
    
    // 여러 파일 처리
    if (files.length === 1) {
        const file = files[0];
        createLocalVideoPlayer(file, videoWrapper, videoUrlDisplay, previewContainer);
    } else {
        createMultipleVideoPlayer(files, videoWrapper, videoUrlDisplay, previewContainer);
    }
}

function createLocalVideoPlayer(file, videoWrapper, videoUrlDisplay, previewContainer) {
    const videoUrl = URL.createObjectURL(file);
    
    const videoElement = document.createElement('video');
    videoElement.className = 'video-element';
    videoElement.controls = true;
    videoElement.src = videoUrl;
    videoElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
        border-radius: 10px;
    `;
    
    // 로딩 표시기
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'video-loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>동영상을 불러오는 중...</p>
    `;
    
    videoWrapper.appendChild(loadingDiv);
    videoWrapper.appendChild(videoElement);
    
    // 비디오 로드 완료 시 로딩 제거
    videoElement.addEventListener('loadeddata', () => {
        if (loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    });
    
    // 에러 처리
    videoElement.addEventListener('error', () => {
        showNotification('동영상을 재생할 수 없습니다.', 'error');
        if (loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    });
    
    // UI 업데이트
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    videoUrlDisplay.innerHTML = `
        <strong>📁 로컬 동영상 파일</strong><br>
        파일명: <code>${file.name}</code><br>
        크기: <code>${fileSize} MB</code><br>
        형식: <code>${file.type}</code>
    `;
    
    previewContainer.style.display = 'block';
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification('로컬 동영상이 로드되었습니다.', 'success');
}

function createMultipleVideoPlayer(files, videoWrapper, videoUrlDisplay, previewContainer) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'multiple-video-container';
    videoContainer.style.cssText = `
        display: grid;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
    `;
    
    let fileInfoHtml = '<strong>📁 다중 동영상 파일</strong><br>';
    let totalSize = 0;
    
    Array.from(files).forEach((file, index) => {
        const videoUrl = URL.createObjectURL(file);
        const fileSize = file.size / (1024 * 1024);
        totalSize += fileSize;
        
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.5);
        `;
        
        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.src = videoUrl;
        videoElement.style.cssText = `
            width: 100%;
            height: 200px;
            object-fit: contain;
            background: #000;
            border-radius: 5px;
        `;
        
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = `
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
        `;
        fileInfo.innerHTML = `${index + 1}. ${file.name} (${fileSize.toFixed(2)} MB)`;
        
        videoItem.appendChild(videoElement);
        videoItem.appendChild(fileInfo);
        videoContainer.appendChild(videoItem);
        
        fileInfoHtml += `${index + 1}. <code>${file.name}</code> (${fileSize.toFixed(2)} MB)<br>`;
    });
    
    fileInfoHtml += `<strong>총 크기: ${totalSize.toFixed(2)} MB</strong>`;
    
    videoWrapper.appendChild(videoContainer);
    videoUrlDisplay.innerHTML = fileInfoHtml;
    
    previewContainer.style.display = 'block';
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification(`${files.length}개의 동영상이 로드되었습니다.`, 'success');
}

function handleVideoLoad(url, fileId, previewContainer, videoUrlDisplay) {
    try {
        showNotification('동영상 정보를 처리하는 중입니다...', 'info');
        createGoogleDriveAccessOptions(fileId, url, previewContainer, videoUrlDisplay);
    } catch (error) {
        console.error('Video load error:', error);
        showNotification('동영상 정보를 처리할 수 없습니다.', 'error');
    }
}

function createGoogleDriveAccessOptions(fileId, originalUrl, previewContainer, videoUrlDisplay) {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    // 기존 컨텐츠 정리
    videoWrapper.innerHTML = '';
    
    // 다양한 우회 방법으로 동영상 플레이어 시도
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'video-access-options';
    optionsContainer.innerHTML = `
        <div class="access-content">
            <div class="access-header">
                <h3>🎬 Google Drive 동영상 플레이어</h3>
                <div class="player-tabs">
                    <button class="tab-btn active" onclick="switchVideoPlayer('embed', '${fileId}')">임베드 플레이어</button>
                    <button class="tab-btn" onclick="switchVideoPlayer('preview', '${fileId}')">미리보기 플레이어</button>
                    <button class="tab-btn" onclick="switchVideoPlayer('direct', '${fileId}')">직접 스트림</button>
                    <button class="tab-btn" onclick="switchVideoPlayer('options', '${fileId}')">접근 옵션</button>
                </div>
            </div>
            
            <!-- 임베드 플레이어 -->
            <div id="player-embed" class="player-content active">
                <div class="video-player-wrapper">
                    <iframe src="https://drive.google.com/file/d/${fileId}/preview" 
                            width="100%" height="400" frameborder="0" allowfullscreen
                            allow="autoplay; encrypted-media"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
                    </iframe>
                </div>
                <p class="player-desc">Google Drive 공식 임베드 플레이어입니다.</p>
            </div>
            
            <!-- 미리보기 플레이어 -->
            <div id="player-preview" class="player-content">
                <div class="video-player-wrapper">
                    <iframe src="https://docs.google.com/file/d/${fileId}/preview" 
                            width="100%" height="400" frameborder="0" allowfullscreen>
                    </iframe>
                </div>
                <p class="player-desc">Google Docs 미리보기 플레이어입니다.</p>
            </div>
            
            <!-- 직접 스트림 -->
            <div id="player-direct" class="player-content">
                <div class="video-player-wrapper">
                    <video controls width="100%" height="400" 
                           poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E동영상 로딩 중...%3C/text%3E%3C/svg%3E">
                        <source src="https://drive.google.com/uc?export=download&id=${fileId}" type="video/mp4">
                        <source src="https://docs.google.com/uc?export=download&id=${fileId}" type="video/mp4">
                        브라우저가 HTML5 비디오를 지원하지 않습니다.
                    </video>
                </div>
                <p class="player-desc">직접 스트림 방식입니다. 파일이 공개되어 있을 때 작동합니다.</p>
            </div>
            
            <!-- 접근 옵션 -->
            <div id="player-options" class="player-content">
                <div class="access-options">
                    <a href="https://drive.google.com/file/d/${fileId}/view" target="_blank" rel="noopener noreferrer" class="access-btn primary">
                        <span class="btn-icon">▶️</span>
                        <div class="btn-content">
                            <div class="btn-title">Google Drive에서 재생</div>
                            <div class="btn-desc">새 창에서 Google Drive 플레이어로 재생</div>
                        </div>
                    </a>
                    
                    <button onclick="tryAlternativeUrls('${fileId}')" class="access-btn">
                        <span class="btn-icon">🔧</span>
                        <div class="btn-content">
                            <div class="btn-title">대체 URL 시도</div>
                            <div class="btn-desc">다양한 Google Drive URL 형식으로 시도</div>
                        </div>
                    </button>
                    
                    <a href="https://drive.google.com/uc?export=download&id=${fileId}" target="_blank" rel="noopener noreferrer" class="access-btn">
                        <span class="btn-icon">⬇️</span>
                        <div class="btn-content">
                            <div class="btn-title">동영상 다운로드</div>
                            <div class="btn-desc">파일을 다운로드하여 로컬에서 재생</div>
                        </div>
                    </a>
                    
                    <button onclick="copyToClipboard('${originalUrl}')" class="access-btn">
                        <span class="btn-icon">📋</span>
                        <div class="btn-content">
                            <div class="btn-title">원본 URL 복사</div>
                            <div class="btn-desc">동영상 링크를 클립보드에 복사</div>
                        </div>
                    </button>
                </div>
                
                <div class="access-tips">
                    <h4>💡 동영상 접근 팁</h4>
                    <ul>
                        <li><strong>공유 설정:</strong> 동영상이 "링크를 아는 사람"에게 공유되어 있는지 확인</li>
                        <li><strong>Google 로그인:</strong> Google 계정으로 로그인되어 있는지 확인</li>
                        <li><strong>파일 형식:</strong> MP4, MOV, AVI 등 일반적인 동영상 형식인지 확인</li>
                        <li><strong>파일 크기:</strong> 너무 큰 파일은 스트리밍이 제한될 수 있음</li>
                        <li><strong>새로고침 문제:</strong> 페이지 새로고침 후에는 다시 불러오기 필요</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    videoWrapper.appendChild(optionsContainer);
    
    // UI 업데이트
    updateVideoUI(originalUrl, fileId, videoUrlDisplay, previewContainer);
    
    showNotification('동영상 플레이어를 준비했습니다. 각 탭을 시도해보세요.', 'success');
}

function updateVideoUI(originalUrl, fileId, videoUrlDisplay, previewContainer) {
    videoUrlDisplay.innerHTML = `
        <div class="video-info-card">
            <strong>📋 동영상 정보</strong><br>
            <div class="info-row">
                <span class="info-label">원본 URL:</span>
                <code class="info-value">${originalUrl}</code>
            </div>
            <div class="info-row">
                <span class="info-label">파일 ID:</span>
                <code class="info-value">${fileId}</code>
            </div>
            <div class="info-row">
                <span class="info-label">상태:</span>
                <span class="status-badge success">정보 추출 완료</span>
            </div>
        </div>
    `;
    
    // 미리보기 컨테이너 표시
    previewContainer.style.display = 'block';
    
    // 스크롤하여 미리보기로 이동
    previewContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // localStorage에 저장
    localStorage.setItem('googleDriveVideoUrl', originalUrl);
    localStorage.setItem('googleDriveVideoFileId', fileId);
}

// 클립보드 복사 함수
window.copyToClipboard = function(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('URL이 클립보드에 복사되었습니다.', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
};

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('URL이 클립보드에 복사되었습니다.', 'success');
    } catch (err) {
        showNotification('클립보드 복사에 실패했습니다.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 동영상 다시 로드
window.reloadVideo = function(fileId, originalUrl) {
    const previewContainer = document.getElementById('video-preview-container');
    const videoUrlDisplay = document.getElementById('video-url-display');
    
    showNotification('동영상 정보를 다시 불러오는 중...', 'info');
    createGoogleDriveAccessOptions(fileId, originalUrl, previewContainer, videoUrlDisplay);
};

// 비디오 플레이어 탭 전환
window.switchVideoPlayer = function(playerType, fileId) {
    // 모든 탭 버튼에서 active 클래스 제거
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // 모든 플레이어 컨텐츠에서 active 클래스 제거
    document.querySelectorAll('.player-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 버튼과 컨텐츠에 active 클래스 추가
    const activeBtn = document.querySelector(`[onclick*="'${playerType}'"]`);
    const activeContent = document.getElementById(`player-${playerType}`);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // 플레이어 타입에 따른 메시지 표시
    const messages = {
        'embed': '공식 임베드 플레이어를 로드했습니다.',
        'preview': '미리보기 플레이어를 로드했습니다.',
        'direct': '직접 스트림을 시도하고 있습니다.',
        'options': '추가 접근 옵션을 표시했습니다.'
    };
    
    showNotification(messages[playerType] || '플레이어를 전환했습니다.', 'info');
};

// 대체 URL들 시도
window.tryAlternativeUrls = function(fileId) {
    const alternativeUrls = [
        `https://drive.google.com/file/d/${fileId}/preview`,
        `https://docs.google.com/file/d/${fileId}/preview`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://docs.google.com/uc?export=view&id=${fileId}`,
        `https://googledrive.com/host/${fileId}`,
        `https://drive.google.com/file/d/${fileId}/edit`
    ];
    
    const urlList = alternativeUrls.map((url, index) => 
        `<div class="url-item">
            <strong>${index + 1}. ${url.includes('preview') ? '미리보기' : url.includes('uc') ? '다운로드' : url.includes('host') ? '호스팅' : '편집'} URL:</strong><br>
            <code class="url-code">${url}</code>
            <button onclick="testUrl('${url}')" class="test-btn">테스트</button>
            <button onclick="copyToClipboard('${url}')" class="copy-btn">복사</button>
        </div>`
    ).join('');
    
    // 새 창으로 대체 URL들 표시
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Google Drive 대체 URL 목록</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; line-height: 1.6; }
                .url-item { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
                .url-code { display: block; padding: 8px; background: #fff; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; margin: 5px 0; word-break: break-all; }
                .test-btn, .copy-btn { padding: 5px 10px; margin: 5px 5px 0 0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
                .test-btn { background: #007bff; color: white; }
                .copy-btn { background: #28a745; color: white; }
                .test-btn:hover { background: #0056b3; }
                .copy-btn:hover { background: #1e7e34; }
                h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                .instructions { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>🔧 Google Drive 대체 URL 목록</h1>
            <div class="instructions">
                <strong>사용법:</strong><br>
                1. 각 URL의 "테스트" 버튼을 클릭하여 새 창에서 확인<br>
                2. 동작하는 URL을 "복사" 버튼으로 복사<br>
                3. 원본 페이지의 URL 입력란에 붙여넣기<br>
                4. 파일 ID: <code>${fileId}</code>
            </div>
            ${urlList}
            <script>
                function testUrl(url) {
                    window.open(url, '_blank', 'width=800,height=600');
                }
                function copyToClipboard(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('URL이 클립보드에 복사되었습니다: ' + text);
                    }).catch(() => {
                        prompt('이 URL을 복사하세요:', text);
                    });
                }
            </script>
        </body>
        </html>
    `);
    
    showNotification('대체 URL 목록을 새 창에서 열었습니다.', 'success');
};

function extractGoogleDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Google Drive URL 패턴들
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9-_]+)/,
        /[?&]id=([a-zA-Z0-9-_]+)/,
        /\/open\?id=([a-zA-Z0-9-_]+)/,
        /\/uc\?id=([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}



function showNotification(message, type = 'info') {
    // 기존 알림이 있다면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 페이지 상단에 추가
    document.body.appendChild(notification);
    
    // 페이드 인 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 업로드 상태 관리
let uploadStatus = {
    stage2: false,
    stage4: false,
    stage5: false,
    stage6: false,
    stage7: false,
    stage8: false
};

// 스테이지별 업로드 완료 메시지 표시
function showStageUploadComplete(stageNumber) {
    uploadStatus[`stage${stageNumber}`] = true;
    
    const message = `Stage ${stageNumber}번의 업로드가 완료되었습니다.`;
    addUploadStatusItem(stageNumber, message, 'success');
    
    // 메인 페이지의 Stage 카드에 완료 표시 추가
    markStageCardAsCompleted(stageNumber);
    
    // 스테이지 업로드 카드 상태 업데이트
    updateStageUploadCard(stageNumber);
    
    // 프로젝트 카드 상태 업데이트
    updateProjectCardStatus();
    
    // 모든 스테이지가 완료되었는지 확인
    if (allStagesCompleted()) {
        showFinalUploadMessage();
    }
}

// 스테이지별 업로드 실패 메시지 표시
function showStageUploadError(stageNumber, errorMessage) {
    const message = `Stage ${stageNumber}번 업로드 실패: ${errorMessage}`;
    addUploadStatusItem(stageNumber, message, 'error');
    
    // 순차 업로드 모달에서 호출된 경우 - 에러 상태 표시
    const modal = document.getElementById('sequential-upload-modal');
    if (modal && modal.classList.contains('show')) {
        setStageStatus(stageNumber, 'error');
        showUploadMessage(`Stage ${stageNumber} 업로드 실패: ${errorMessage}`, 'error');
        
        // 다시 시도할 수 있도록 버튼은 활성화 상태로 유지
        enableStageButton(stageNumber);
    }
}

// 업로드 상태 아이템 추가
function addUploadStatusItem(stageNumber, message, status) {
    const statusList = document.getElementById('upload-status-list');
    
    // statusList가 없으면 함수 종료 (개별 업로드의 경우 알림 섹션이 없을 수 있음)
    if (!statusList) {
        console.log('📝 upload-status-list 요소가 없음 - 개별 업로드 모드');
        return;
    }
    
    const statusItem = document.createElement('div');
    statusItem.className = 'upload-status-item';
    
    const iconClass = status === 'success' ? 'success' : 'error';
    
    statusItem.innerHTML = `
        <div class="status-icon ${iconClass}"></div>
        <div class="status-text">${message}</div>
    `;
    
    statusList.appendChild(statusItem);
    
    // 알림 섹션 표시
    showUploadNotification();
}

// 모든 스테이지 완료 확인
function allStagesCompleted() {
    return Object.values(uploadStatus).every(status => status === true);
}

// 최종 완료 메시지 표시
function showFinalUploadMessage() {
    setTimeout(() => {
        const statusList = document.getElementById('upload-status-list');
        const finalMessage = document.createElement('div');
        finalMessage.className = 'upload-status-item';
        finalMessage.style.borderTop = '2px solid var(--success-color)';
        finalMessage.style.marginTop = '15px';
        finalMessage.style.paddingTop = '15px';
        
        finalMessage.innerHTML = `
            <div class="status-icon success"></div>
            <div class="status-text">
                <strong>모든 스테이지 업로드가 완료되었습니다!</strong><br>
                스토리보드나 컨셉아트 페이지에서 결과를 확인하세요.
            </div>
        `;
        
        statusList.appendChild(finalMessage);
    }, 500);
}

// 업로드 알림 섹션 표시
function showUploadNotification() {
    const notificationSection = document.getElementById('upload-notification-section');
    if (notificationSection) {
        notificationSection.style.display = 'block';
        // 자동 페이지 이동 설정 (3초 후)
        if (pendingNavigationUrl) {
            setTimeout(() => {
                closeUploadNotification();
            }, 3000);
        }
    } else {
        console.log('📝 upload-notification-section 요소가 없음 - 개별 업로드 모드');
    }
}

// 업로드 알림 섹션 닫기
function closeUploadNotification() {
    console.log('🔄 closeUploadNotification 호출됨');
    console.log('📍 pendingNavigationUrl:', pendingNavigationUrl);
    
    const notificationSection = document.getElementById('upload-notification-section');
    if (notificationSection) {
        notificationSection.style.display = 'none';
    }
    
    // 대기 중인 페이지 이동이 있으면 실행
    if (pendingNavigationUrl) {
        console.log('✅ 페이지 이동 실행:', pendingNavigationUrl);
        // fade-out 효과 제거하고 바로 이동 (디버깅)
        window.location.href = pendingNavigationUrl;
        pendingNavigationUrl = null; // 초기화
    } else {
        console.log('⚠️ pendingNavigationUrl이 없음');
    }
}

// Sequential Upload Modal Functions
let currentUploadStage = 0;
let completedStages = [];

// 순차적 업로드 시작
window.startSequentialUpload = function() {
    console.log('startSequentialUpload 함수 호출됨');
    const modal = document.getElementById('sequential-upload-modal');
    if (modal) {
        console.log('모달 요소를 찾았습니다');
        modal.classList.add('show');
        currentUploadStage = 0;
        completedStages = [];
        
        // localStorage에서 완료된 Stage 목록 가져오기
        const savedCompletedStages = JSON.parse(localStorage.getItem('completedStages') || '[]');
        
        // 모든 Stage 상태 초기화
        [2, 4, 5, 6, 7, 8].forEach(stage => {
            if (savedCompletedStages.includes(stage)) {
                // 이미 완료된 Stage는 완료 상태로 표시
                setStageStatus(stage, 'completed');
                completedStages.push(stage);
                disableStageButton(stage);
            } else {
                setStageStatus(stage, 'waiting');
                disableStageButton(stage);
            }
        });
        
        // 다음으로 업로드할 Stage 찾기
        const stages = [2, 4, 5, 6, 7, 8];
        let nextStageToEnable = null;
        for (const stage of stages) {
            if (!savedCompletedStages.includes(stage)) {
                nextStageToEnable = stage;
                break;
            }
        }
        
        // 다음 Stage 버튼 활성화
        if (nextStageToEnable) {
            enableStageButton(nextStageToEnable);
        } else {
            // 모든 Stage가 완료된 경우
            showUploadMessage('모든 Stage 업로드가 이미 완료되었습니다!', 'success');
            showModalActionButton();
        }
        
        // 진행률 업데이트
        updateOverallProgress();
        
        // 메시지 초기화
        const message = document.getElementById('upload-message');
        if (message) {
            message.className = 'upload-message';
            message.textContent = '';
        }
        
        // 액션 버튼 숨기기 (모든 Stage가 완료된 경우 제외)
        const actionBtn = document.getElementById('modal-action-btn');
        if (actionBtn && nextStageToEnable) {
            actionBtn.style.display = 'none';
        }
    } else {
        console.error('sequential-upload-modal 요소를 찾을 수 없습니다');
    }
}

// 모달 닫기
window.closeSequentialUploadModal = function() {
    const modal = document.getElementById('sequential-upload-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Stage 업로드
window.uploadStage = function(stageNumber) {
    // 이미 완료된 Stage인지 확인
    const stageItem = document.querySelector(`[data-stage="${stageNumber}"]`);
    if (stageItem && stageItem.classList.contains('completed')) {
        showUploadMessage(`Stage ${stageNumber}는 이미 업로드가 완료되었습니다.`, 'info');
        return;
    }
    
    const fileInput = document.getElementById(`stage${stageNumber}-json-input`);
    if (fileInput) {
        // 파일 선택 이벤트 리스너 추가
        fileInput.onchange = (event) => handleSequentialStageUpload(event, stageNumber);
        fileInput.click();
    }
}

// 순차적 Stage 업로드 처리
function handleSequentialStageUpload(event, stageNumber) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        return;
    }
    
    // 로딩 상태로 변경
    setStageStatus(stageNumber, 'loading');
    disableStageButton(stageNumber);
    
    // 메시지 표시
    showUploadMessage(`Stage ${stageNumber} 업로드 중...`);
    
    // 기존 핸들러 함수 호출
    switch(stageNumber) {
        case 2:
            handleStage2FileSelect(event);
            break;
        case 4:
            handleStage4FileSelect(event);
            break;
        case 5:
            handleStage5FileSelect(event);
            break;
        case 6:
            handleStage6FileSelect(event);
            break;
        case 7:
            handleStage7FileSelect(event);
            break;
        case 8:
            handleStage8FileSelect(event);
            break;
    }
    
    // 업로드 완료는 각 핸들러에서 처리
    // setTimeout 제거 - 실제 업로드 완료 시점에 completeStageUpload 호출
}

// Stage 업로드 완료 처리
function completeStageUpload(stageNumber) {
    // 완료 상태로 변경
    setStageStatus(stageNumber, 'completed');
    completedStages.push(stageNumber);
    
    // 메인 페이지의 Stage 카드에도 완료 표시 추가
    markStageCardAsCompleted(stageNumber);
    
    // 프로젝트 카드 상태 업데이트 - 실시간 변경사항 반영
    updateProjectCardStatus();
    
    // 진행률 업데이트
    updateOverallProgress();
    
    // 다음 Stage 활성화
    const nextStage = getNextStage(stageNumber);
    if (nextStage) {
        enableStageButton(nextStage);
        showUploadMessage(`Stage ${stageNumber} 업로드 완료! Stage ${nextStage} 업로드를 진행해주세요.`, 'success');
    } else {
        // 모든 업로드 완료
        showUploadMessage('모든 Stage 업로드가 완료되었습니다!', 'success');
        showModalActionButton();
    }
}

// 다음 Stage 번호 가져오기
function getNextStage(currentStage) {
    const stages = [2, 4, 5, 6, 7, 8];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
        return stages[currentIndex + 1];
    }
    return null;
}

// Stage 상태 설정
function setStageStatus(stageNumber, status) {
    const stageItem = document.querySelector(`[data-stage="${stageNumber}"]`);
    if (stageItem) {
        const statusIcon = stageItem.querySelector('.status-icon');
        if (statusIcon) {
            // 기존 클래스 제거
            statusIcon.classList.remove('waiting', 'loading', 'completed', 'error');
            
            // 새 상태 적용
            switch(status) {
                case 'waiting':
                    statusIcon.classList.add('waiting');
                    statusIcon.textContent = '⏳';
                    break;
                case 'loading':
                    statusIcon.classList.add('loading');
                    statusIcon.textContent = '🔄';
                    break;
                case 'completed':
                    statusIcon.classList.add('completed');
                    statusIcon.textContent = '✅';
                    stageItem.classList.add('completed');
                    // 버튼 텍스트도 변경
                    const button = stageItem.querySelector('.stage-upload-btn');
                    if (button) {
                        button.textContent = '완료됨';
                        button.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
                        button.style.color = 'white';
                    }
                    break;
                case 'error':
                    statusIcon.classList.add('error');
                    statusIcon.textContent = '❌';
                    break;
            }
        }
    }
}

// Stage 버튼 활성화
function enableStageButton(stageNumber) {
    const stageItem = document.querySelector(`[data-stage="${stageNumber}"]`);
    if (stageItem) {
        const button = stageItem.querySelector('.stage-upload-btn');
        if (button) {
            button.disabled = false;
        }
        stageItem.classList.add('active');
    }
}

// Stage 버튼 비활성화
function disableStageButton(stageNumber) {
    const stageItem = document.querySelector(`[data-stage="${stageNumber}"]`);
    if (stageItem) {
        const button = stageItem.querySelector('.stage-upload-btn');
        if (button) {
            button.disabled = true;
        }
        // completed 상태가 아닌 경우에만 active 클래스 제거
        if (!stageItem.classList.contains('completed')) {
            stageItem.classList.remove('active');
        }
    }
}

// 전체 진행률 업데이트
function updateOverallProgress() {
    const totalStages = 6; // Stage 2, 4, 5, 6, 7, 8
    const completedCount = completedStages.length;
    const percentage = Math.round((completedCount / totalStages) * 100);
    
    const progressFill = document.getElementById('overall-progress-fill');
    const progressPercentage = document.getElementById('overall-progress-percentage');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
    }
}

// 업로드 메시지 표시
function showUploadMessage(text, type = 'info') {
    const message = document.getElementById('upload-message');
    if (message) {
        message.textContent = text;
        message.className = 'upload-message show';
        if (type === 'error') {
            message.classList.add('error');
        } else if (type === 'success') {
            message.classList.add('success');
        }
    }
}

// 모달 액션 버튼 표시
function showModalActionButton() {
    const actionBtn = document.getElementById('modal-action-btn');
    if (actionBtn) {
        actionBtn.style.display = 'block';
    }
}

// 페이지 선택 모달 표시 - 더 이상 사용하지 않음
// function showPageSelectionModal() {
//     // 기존 모달이 있으면 제거
//     const existingModal = document.getElementById('page-selection-modal');
//     if (existingModal) {
//         existingModal.remove();
//     }
//     
//     // 모달 HTML 생성
//     const modalHTML = `
//         <div id="page-selection-modal" class="modal show">
//             <div class="modal-content" style="max-width: 600px;">
//                 <h3 style="text-align: center; margin-bottom: 20px;">프로젝트 보기</h3>
//                 <p style="text-align: center; margin-bottom: 30px;">
//                     모든 Stage 업로드가 완료되었습니다.<br>
//                     어느 페이지로 이동하시겠습니까?
//                 </p>
//                 <div style="display: flex; gap: 20px; justify-content: center;">
//                     <button onclick="navigateToStoryboard()" class="action-btn" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
//                         📽️ 스토리보드 보기
//                     </button>
//                     <button onclick="navigateToConceptArt()" class="action-btn" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
//                         🎨 컨셉아트 보기
//                     </button>
//                 </div>
//                 <div style="margin-top: 20px; text-align: center;">
//                     <button onclick="navigateToBoth()" class="action-btn" style="padding: 10px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
//                         ⚡ 순차적으로 모두 보기
//                     </button>
//                 </div>
//                 <button onclick="closePageSelectionModal()" class="close-btn" style="position: absolute; top: 10px; right: 10px;">✕</button>
//             </div>
//         </div>
//     `;
//     
//     // 모달을 body에 추가
//     document.body.insertAdjacentHTML('beforeend', modalHTML);
// }

// 페이지 선택 모달 닫기
window.closePageSelectionModal = function() {
    const modal = document.getElementById('page-selection-modal');
    if (modal) {
        modal.remove();
    }
}

// 스토리보드로 이동
window.navigateToStoryboard = function() {
    console.log('🎬 navigateToStoryboard 함수 시작');
    
    closePageSelectionModal();
    
    // 스토리보드 페이지에서 데이터를 다시 로드할 수 있도록 처리 완료 플래그 제거
    localStorage.removeItem('stage2TempProcessed');
    localStorage.removeItem('stage5TempProcessed');
    localStorage.removeItem('stage6TempProcessed');
    localStorage.removeItem('stage6TempFilesProcessed');
    localStorage.removeItem('stage7TempProcessed');
    localStorage.removeItem('stage8TempProcessed');
    console.log('✅ 스토리보드 처리 완료 플래그 제거됨');
    
    // URL 파라미터 동적 구성
    let params = [];
    
    // Stage 2 확인
    if (localStorage.getItem('stage2TempJson')) {
        params.push('loadTempJson=true');
        console.log('📦 Stage 2 데이터 발견');
    }
    
    // Stage 5 확인
    if (localStorage.getItem('stage5TempJsonFiles')) {
        params.push('loadStage5JsonMultiple=true');
        console.log('📦 Stage 5 데이터 발견');
    }
    
    // Stage 6 확인
    if (localStorage.getItem('stage6TempJsonFiles')) {
        params.push('loadStage6JsonMultiple=true');
        console.log('📦 Stage 6 데이터 발견');
    }
    
    // Stage 7 확인
    if (localStorage.getItem('stage7TempJsonFiles')) {
        params.push('loadStage7JsonMultiple=true');
        console.log('📦 Stage 7 데이터 발견');
    }
    
    // Stage 8 확인
    if (localStorage.getItem('stage8TempJsonFiles')) {
        params.push('loadStage8JsonMultiple=true');
        console.log('📦 Stage 8 데이터 발견');
    }
    
    // URL 구성
    let url = 'storyboard/index.html';
    if (params.length > 0) {
        url += '?' + params.join('&');
        console.log('🔗 최종 스토리보드 URL:', url);
    } else {
        console.log('⚠️ URL 파라미터 없음, 기본 URL 사용:', url);
    }
    
    console.log('🚀 페이지 이동 실행:', url);
    
    // 바로 이동
    try {
        window.location.href = url;
        console.log('✅ window.location.href 설정 완료');
    } catch (error) {
        console.error('❌ 페이지 이동 오류:', error);
    }
}

// 컨셉아트로 이동
window.navigateToConceptArt = function() {
    closePageSelectionModal();
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = 'concept-art/index.html?loadStage4Json=true';
    }, 300);
}

// 순차적으로 모두 보기 (먼저 컨셉아트 -> 스토리보드)
window.navigateToBoth = function() {
    closePageSelectionModal();
    
    // 스토리보드 페이지에서 데이터를 다시 로드할 수 있도록 처리 완료 플래그 제거
    localStorage.removeItem('stage2TempProcessed');
    localStorage.removeItem('stage5TempProcessed');
    localStorage.removeItem('stage6TempProcessed');
    localStorage.removeItem('stage6TempFilesProcessed');
    localStorage.removeItem('stage7TempProcessed');
    localStorage.removeItem('stage8TempProcessed');
    console.log('스토리보드 처리 완료 플래그 제거됨');
    
    // localStorage에 순차 보기 플래그 설정
    localStorage.setItem('sequentialViewMode', 'true');
    document.body.classList.add('fade-out');
    setTimeout(() => {
        // 먼저 컨셉아트 페이지로 이동
        window.location.href = 'concept-art/index.html?loadStage4Json=true&continueToStoryboard=true';
    }, 300);
}

// 모달 액션 처리
window.handleModalAction = function() {
    console.log('📍 handleModalAction 함수 호출됨');
    
    // 모달 닫기
    closeSequentialUploadModal();
    
    // 디버깅: localStorage 확인
    console.log('📦 Stage 2 데이터:', localStorage.getItem('stage2TempJson') ? '있음' : '없음');
    console.log('📦 Stage 5 데이터:', localStorage.getItem('stage5TempJsonFiles') ? '있음' : '없음');
    console.log('📦 Stage 6 데이터:', localStorage.getItem('stage6TempJsonFiles') ? '있음' : '없음');
    console.log('📦 Stage 7 데이터:', localStorage.getItem('stage7TempJsonFiles') ? '있음' : '없음');
    console.log('📦 Stage 8 데이터:', localStorage.getItem('stage8TempJsonFiles') ? '있음' : '없음');
    
    // 모달이 완전히 닫힌 후 페이지 이동 (약간의 지연 추가)
    setTimeout(() => {
        console.log('🚀 navigateToStoryboard 함수 호출 전');
        window.navigateToStoryboard();
        console.log('🚀 navigateToStoryboard 함수 호출 후');
    }, 100);
}

// 메인 페이지의 Stage 카드에 완료 표시 추가
function markStageCardAsCompleted(stageNumber) {
    // Stage 카드 찾기
    const stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(card => {
        const stageNumberElement = card.querySelector('.stage-number');
        if (stageNumberElement && stageNumberElement.textContent === String(stageNumber)) {
            // 카드에 완료 클래스 추가
            card.classList.add('stage-completed');
            
            // 기존 onclick 이벤트 유지하면서 시각적 표시만 추가
            if (!card.querySelector('.stage-check-icon')) {
                const checkIcon = document.createElement('span');
                checkIcon.className = 'stage-check-icon';
                checkIcon.textContent = '✓';
                stageNumberElement.appendChild(checkIcon);
            }
        }
    });
    
    // localStorage에도 완료 상태 저장
    const completedStagesKey = 'completedStages';
    let savedCompletedStages = JSON.parse(localStorage.getItem(completedStagesKey) || '[]');
    if (!savedCompletedStages.includes(stageNumber)) {
        savedCompletedStages.push(stageNumber);
        localStorage.setItem(completedStagesKey, JSON.stringify(savedCompletedStages));
    }
}

// 페이지 로드 시 완료된 Stage 카드 표시 복원
function restoreCompletedStages() {
    const completedStagesKey = 'completedStages';
    const savedCompletedStages = JSON.parse(localStorage.getItem(completedStagesKey) || '[]');
    
    savedCompletedStages.forEach(stageNumber => {
        markStageCardAsCompleted(stageNumber);
    });
}

// 히어로 비디오 자동재생 및 사운드 컨트롤
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.getElementById('heroVideo');
    const soundControlBtn = document.getElementById('soundControlBtn');
    const soundOffIcon = document.getElementById('soundOffIcon');
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundTooltip = document.querySelector('.sound-tooltip');
    const videoStatus = document.getElementById('videoStatus');
    const videoStatusText = document.getElementById('videoStatusText');
    
    // 디버깅 모드 (개발 시에만 true로 설정)
    const DEBUG_MODE = false;
    
    // 비디오 상태 업데이트 함수
    function updateVideoStatus(message) {
        if (DEBUG_MODE && videoStatus && videoStatusText) {
            videoStatus.style.display = 'block';
            videoStatusText.textContent = message;
            console.log('비디오 상태:', message);
        }
    }
    
    // 재방문자 체크 (Media Engagement 대체)
    const isReturningVisitor = localStorage.getItem('returningVisitor');
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().getTime();
    
    // 24시간 이내 재방문자는 소리 자동재생 시도
    const isFrequentVisitor = lastVisit && (now - parseInt(lastVisit)) < 86400000;
    
    if (heroVideo) {
        // 재생 시도 플래그 (중복 방지)
        let isPlayAttempted = false;
        let playbackStarted = false;
        
        // 모바일 디바이스 감지
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || (window.innerWidth <= 768);
        
        // 비디오 재생 함수 - 안정화 버전
        function attemptVideoPlay() {
            // 중복 재생 시도 방지
            if (isPlayAttempted || playbackStarted) {
                console.log('⏸️ 재생 시도 중복 방지');
                return;
            }
            
            // 비디오가 이미 재생 중이면 스킵
            if (!heroVideo.paused && !heroVideo.ended) {
                console.log('▶️ 비디오 이미 재생 중');
                playbackStarted = true;
                return;
            }
            
            isPlayAttempted = true;
            
            // 음소거 상태로 재생 (브라우저 정책 준수)
            heroVideo.muted = true;
            
            // 모바일 최적화 설정
            if (isMobileDevice) {
                heroVideo.setAttribute('webkit-playsinline', 'true');
                heroVideo.setAttribute('x-webkit-airplay', 'allow');
                heroVideo.setAttribute('x5-video-player-type', 'h5');
                heroVideo.setAttribute('x5-video-player-fullscreen', 'false');
                heroVideo.setAttribute('x5-video-orientation', 'portraint');
                
                // 모바일 성능 최적화
                heroVideo.setAttribute('preload', 'metadata'); // 메타데이터만 미리 로드
                heroVideo.setAttribute('poster', 'og-image.jpg'); // 포스터 이미지 설정
                
                // iOS Safari 특별 처리
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                if (isIOS) {
                    // iOS 최적화
                    heroVideo.setAttribute('playsinline', 'true');
                    heroVideo.setAttribute('webkit-playsinline', 'true');
                    console.log('📱 iOS 최적화 적용');
                }
                
                // Android 특별 처리
                const isAndroid = /Android/i.test(navigator.userAgent);
                if (isAndroid) {
                    // Android 최적화
                    heroVideo.setAttribute('x5-playsinline', 'true');
                    console.log('📱 Android 최적화 적용');
                }
                
                console.log('📱 모바일 비디오 최적화 설정 적용');
            }
            
            // 재생 시도
            const playPromise = heroVideo.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ 비디오 재생 시작');
                        playbackStarted = true;
                        
                        // 사운드 버튼 상태 업데이트
                        updateSoundButton(false);
                        
                        // 재생 시도 플래그 리셋
                        setTimeout(() => {
                            isPlayAttempted = false;
                        }, 1000);
                    })
                    .catch((error) => {
                        console.warn('⚠️ 자동재생 실패:', error.message);
                        isPlayAttempted = false;
                        
                        // 사용자 상호작용 대기
                        const playOnInteraction = (e) => {
                            // 사운드 버튼 클릭은 제외
                            if (e.target.closest('.sound-control-btn')) {
                                return;
                            }
                            
                            heroVideo.play()
                                .then(() => {
                                    console.log('✅ 수동 재생 성공');
                                    playbackStarted = true;
                                    updateSoundButton(heroVideo.muted === false);
                                })
                                .catch(err => {
                                    console.error('❌ 재생 실패:', err);
                                });
                        };
                        
                        // 클릭 이벤트만 사용 (더 안정적)
                        document.addEventListener('click', playOnInteraction, { once: true });
                    });
            }
        }
        
        // 비디오 상태 이벤트 모니터링
        let dataLoaded = false;
        
        heroVideo.addEventListener('loadeddata', () => {
            if (!dataLoaded) {
                console.log('📹 비디오 데이터 로드 완료');
                dataLoaded = true;
                attemptVideoPlay();
            }
        });
        
        // playing 이벤트로 재생 확인
        heroVideo.addEventListener('playing', () => {
            console.log('▶️ 비디오 재생 중');
            playbackStarted = true;
        });
        
        // pause 이벤트 감지
        heroVideo.addEventListener('pause', () => {
            console.log('⏸️ 비디오 일시정지');
            // 의도하지 않은 정지인 경우 재시작
            if (!heroVideo.ended && playbackStarted) {
                setTimeout(() => {
                    if (heroVideo.paused && !heroVideo.ended) {
                        console.log('🔄 비디오 재시작 시도');
                        heroVideo.play().catch(e => console.log('재시작 실패:', e));
                    }
                }, 500);
            }
        });
        
        // ended 이벤트 - 루프 확인
        heroVideo.addEventListener('ended', () => {
            console.log('🔚 비디오 종료 - 루프 재시작');
            playbackStarted = false;
            isPlayAttempted = false;
        });
        
        // 비디오 에러 처리
        heroVideo.addEventListener('error', (e) => {
            const error = heroVideo.error;
            console.error('❌ 비디오 에러:', {
                code: error?.code,
                message: error?.message,
                src: heroVideo.currentSrc
            });
            
            // 에러 코드별 처리
            if (error?.code === 4 || error?.code === 2) {
                console.error('네트워크 에러 또는 파일을 찾을 수 없음');
                // 비디오 요소에 에러 클래스 추가
                heroVideo.classList.add('error');
                
                // 히어로 섹션에 비디오 에러 클래스 추가 (폴백 배경 활성화)
                const heroSection = document.querySelector('.hero-section');
                if (heroSection) {
                    heroSection.classList.add('video-error');
                }
                
                // 사운드 컨트롤 버튼 숨기기
                if (soundControlBtn) {
                    soundControlBtn.style.display = 'none';
                }
            } else if (error?.code === 3) {
                console.error('디코딩 에러 또는 지원되지 않는 형식');
            } else if (error?.code === 1) {
                console.error('미디어 로딩이 중단됨');
            }
        });
        
        // 비디오 초기 상태 확인 및 재생
        console.log('📊 비디오 초기 상태:', {
            readyState: heroVideo.readyState,
            paused: heroVideo.paused,
            src: heroVideo.currentSrc || '소스 없음'
        });
        
        // 비디오 초기화 및 재생
        function initVideo() {
            // 비디오가 준비되었는지 확인
            if (heroVideo.readyState >= 2) {
                // 메타데이터가 로드됨
                console.log('🎬 비디오 준비 완료, 재생 시도');
                attemptVideoPlay();
            } else {
                // 메타데이터 로드 대기
                console.log('⏳ 비디오 메타데이터 로드 대기');
                heroVideo.addEventListener('loadedmetadata', () => {
                    console.log('📊 메타데이터 로드 완료');
                    attemptVideoPlay();
                }, { once: true });
            }
        }
        
        // DOM 로드 상태 확인
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // 약간의 지연 후 초기화 (다른 스크립트 로드 대기)
            setTimeout(initVideo, 200);
        } else {
            // DOM 로드 완료 대기
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initVideo, 200);
            }, { once: true });
        }
        
        // 방문 기록 저장
        localStorage.setItem('returningVisitor', 'true');
        localStorage.setItem('lastVisit', now.toString());
        
        // 사운드 컨트롤 버튼 이벤트
        if (soundControlBtn) {
            soundControlBtn.addEventListener('click', function() {
                if (heroVideo.muted) {
                    // 소리 켜기 전에 재생 상태 저장
                    const wasPlaying = !heroVideo.paused;
                    
                    // 소리 켜기
                    heroVideo.muted = false;
                    
                    // 재생이 중단된 경우 다시 재생
                    if (wasPlaying && heroVideo.paused) {
                        heroVideo.play().then(() => {
                            console.log('🔊 사운드 켜고 재생 재개');
                        }).catch(e => {
                            console.log('사운드 전환 중 재생 실패, 음소거로 복귀');
                            heroVideo.muted = true;
                            heroVideo.play();
                        });
                    }
                    
                    updateSoundButton(true);
                    soundTooltip.textContent = '클릭하여 음소거';
                    localStorage.setItem('preferSound', 'true');
                } else {
                    // 음소거
                    heroVideo.muted = true;
                    updateSoundButton(false);
                    soundTooltip.textContent = '클릭하여 사운드 켜기';
                    localStorage.setItem('preferSound', 'false');
                    
                    // 음소거 후에도 재생 유지
                    if (heroVideo.paused) {
                        heroVideo.play();
                    }
                }
            });
        }
        
        // 자동 소리 활성화 제거 (재생 중단 방지)
        // 사용자가 명시적으로 사운드 버튼을 클릭해야만 소리 활성화
        
    }
    
    // 사운드 버튼 UI 업데이트
    function updateSoundButton(soundOn) {
        if (soundOn) {
            soundOffIcon.style.display = 'none';
            soundOnIcon.style.display = 'block';
            soundControlBtn.classList.add('active');
            soundControlBtn.title = '음소거';
        } else {
            soundOffIcon.style.display = 'block';
            soundOnIcon.style.display = 'none';
            soundControlBtn.classList.remove('active');
            soundControlBtn.title = '사운드 켜기';
        }
    }
    
    // 사운드 활성화 안내 표시
    function showSoundPrompt() {
        if (soundControlBtn && !localStorage.getItem('soundPromptShown')) {
            // 버튼에 주목 애니메이션 추가
            soundControlBtn.style.animation = 'pulse 2s infinite';
            
            // 3초 후 애니메이션 제거
            setTimeout(() => {
                soundControlBtn.style.animation = '';
                localStorage.setItem('soundPromptShown', 'true');
            }, 3000);
        }
    }
});



// Stage 카드 클릭 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Stage 카드 이벤트 리스너 설정 시작');
    
    // Stage 카드 클릭 이벤트 바인딩
    const stageCards = document.querySelectorAll('[data-stage-action]');
    console.log('찾은 Stage 카드 수:', stageCards.length);
    
    stageCards.forEach(card => {
        card.addEventListener('click', function() {
            // 접근 권한 확인
            if (!checkUserAccess()) {
                // authSystem이 있으면 로그인 모달 표시
                if (window.authSystem && typeof window.authSystem.showLoginModal === 'function') {
                    window.authSystem.showLoginModal();
                }
                return;
            }

            const action = this.getAttribute('data-stage-action');
            console.log('🖱️ Stage 카드 클릭됨:', action);

            switch(action) {
                case 'stage2':
                    if (typeof window.goToStoryboardWithImport === 'function') {
                        window.goToStoryboardWithImport();
                    } else {
                        console.error('goToStoryboardWithImport 함수를 찾을 수 없습니다');
                    }
                    break;
                case 'stage4':
                    if (typeof window.goToConceptArtWithStage4Import === 'function') {
                        window.goToConceptArtWithStage4Import();
                    } else {
                        console.error('goToConceptArtWithStage4Import 함수를 찾을 수 없습니다');
                    }
                    break;
                case 'stage5':
                    if (typeof window.goToStoryboardWithStage5Import === 'function') {
                        window.goToStoryboardWithStage5Import();
                    } else {
                        console.error('goToStoryboardWithStage5Import 함수를 찾을 수 없습니다');
                    }
                    break;
                case 'stage6':
                    if (typeof window.goToStoryboardWithStage6Import === 'function') {
                        window.goToStoryboardWithStage6Import();
                    } else {
                        console.error('goToStoryboardWithStage6Import 함수를 찾을 수 없습니다');
                    }
                    break;
                case 'stage7':
                    if (typeof window.goToStoryboardWithStage7Import === 'function') {
                        window.goToStoryboardWithStage7Import();
                    } else {
                        console.error('goToStoryboardWithStage7Import 함수를 찾을 수 없습니다');
                    }
                    break;
                case 'stage8':
                    if (typeof window.goToStoryboardWithStage8Import === 'function') {
                        window.goToStoryboardWithStage8Import();
                    } else {
                        console.error('goToStoryboardWithStage8Import 함수를 찾을 수 없습니다');
                    }
                    break;
                default:
                    console.warn('알 수 없는 stage action:', action);
            }
        });
    });
    
    console.log('✅ Stage 카드 이벤트 리스너 설정 완료');
});

// 모바일 메뉴 토글 함수
function toggleMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}

// 모바일 메뉴 닫기 함수
function closeMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

// 전역 함수로 내보내기
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
