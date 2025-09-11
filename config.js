/**
 * AIFI 환경 변수 설정 파일
 */

// 바나나 페이지 접근 비밀번호
const BANANA_PASSWORD = '1004';

// 비밀번호 검증 함수
function validateBananaPassword(inputPassword) {
    return inputPassword === BANANA_PASSWORD;
}

// 전역 사용을 위해 window 객체에 추가
window.AIFI_CONFIG = {
    BANANA_PASSWORD,
    validateBananaPassword
};