// 페이지 보호 시스템
// 승인된 사용자만 페이지에 접근할 수 있도록 제어

class PageProtection {
    constructor() {
        this.init();
    }

    init() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAccess());
        } else {
            this.checkAccess();
        }
    }

    checkAccess() {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');

        // 로그인하지 않은 경우
        if (!token || !userInfo) {
            this.redirectToLogin('로그인이 필요한 페이지입니다.');
            return false;
        }

        try {
            const user = JSON.parse(userInfo);

            // 승인 대기 중인 경우
            if (user.status === 'pending') {
                this.showPendingMessage();
                return false;
            }

            // 거부된 경우
            if (user.status === 'rejected') {
                this.showRejectedMessage();
                return false;
            }

            // 승인된 경우 - 정상 접근 허용
            if (user.status === 'approved') {
                console.log('페이지 접근 허용:', user.email);
                return true;
            }

            // 기타 상태
            this.redirectToLogin('유효하지 않은 사용자 상태입니다.');
            return false;

        } catch (e) {
            console.error('사용자 정보 확인 오류:', e);
            this.redirectToLogin('사용자 정보를 확인할 수 없습니다.');
            return false;
        }
    }

    redirectToLogin(message) {
        // 현재 페이지 URL 저장 (로그인 후 돌아올 수 있도록)
        sessionStorage.setItem('redirectUrl', window.location.href);

        // 메시지 저장
        sessionStorage.setItem('loginMessage', message);

        // 메인 페이지로 리다이렉트
        alert(message);
        window.location.href = '/index.html';
    }

    showPendingMessage() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 500px;
                ">
                    <div style="font-size: 72px; margin-bottom: 20px;">⏳</div>
                    <h1 style="margin: 0 0 20px 0; font-size: 28px;">승인 대기 중</h1>
                    <p style="margin: 0 0 30px 0; font-size: 16px; opacity: 0.9;">
                        회원가입이 완료되었지만, 관리자의 승인을 기다리고 있습니다.<br>
                        승인이 완료되면 모든 기능을 이용할 수 있습니다.
                    </p>
                    <button onclick="window.location.href='/index.html'" style="
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        메인으로 돌아가기
                    </button>
                </div>
            </div>
        `;
    }

    showRejectedMessage() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 500px;
                ">
                    <div style="font-size: 72px; margin-bottom: 20px;">🚫</div>
                    <h1 style="margin: 0 0 20px 0; font-size: 28px;">접근 거부</h1>
                    <p style="margin: 0 0 30px 0; font-size: 16px; opacity: 0.9;">
                        죄송합니다. 귀하의 계정 접근이 거부되었습니다.<br>
                        자세한 내용은 관리자에게 문의해 주세요.
                    </p>
                    <button onclick="window.location.href='/index.html'" style="
                        background: white;
                        color: #f5576c;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                        margin-right: 10px;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        메인으로 돌아가기
                    </button>
                    <button onclick="localStorage.clear(); window.location.href='/index.html'" style="
                        background: transparent;
                        color: white;
                        border: 2px solid white;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        margin-left: 10px;
                    " onmouseover="this.style.background='white'; this.style.color='#f5576c';" onmouseout="this.style.background='transparent'; this.style.color='white';">
                        로그아웃
                    </button>
                </div>
            </div>
        `;
    }
}

// 페이지 보호 자동 실행
const pageProtection = new PageProtection();