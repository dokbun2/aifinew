// utils.js - 유틸리티 함수 모음

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 */
export function showToast(message) {
    const toast = document.getElementById('toast-message');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * CSV 데이터를 복사
 * @param {Array} csvData - CSV 데이터 배열
 */
export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('클립보드에 복사되었습니다.');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * 클립보드 API를 사용할 수 없을 때의 대체 복사 방법
 * @param {string} text - 복사할 텍스트
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('클립보드에 복사되었습니다.');
    } catch (err) {
        showToast('복사 실패: 수동으로 선택하여 복사하세요.');
    }
    
    document.body.removeChild(textArea);
}

/**
 * URL 유효성 검사
 * @param {string} url - 검사할 URL
 * @returns {boolean} 유효한 URL인지 여부
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Google Drive URL에서 파일 ID 추출
 * @param {string} url - Google Drive URL
 * @returns {string|null} 파일 ID 또는 null
 */
export function extractGoogleDriveFileId(url) {
    const patterns = [
        /\/d\/([a-zA-Z0-9-_]+)/,
        /id=([a-zA-Z0-9-_]+)/,
        /\/file\/d\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * 현재 날짜/시간을 포맷팅된 문자열로 반환
 * @returns {string} 포맷팅된 날짜/시간 문자열
 */
export function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * 파일명에서 안전하지 않은 문자 제거
 * @param {string} filename - 원본 파일명
 * @returns {string} 안전한 파일명
 */
export function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
}

/**
 * 객체가 비어있는지 확인
 * @param {Object} obj - 확인할 객체
 * @returns {boolean} 비어있는지 여부
 */
export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}