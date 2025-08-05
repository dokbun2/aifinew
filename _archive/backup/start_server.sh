#!/bin/bash
# 로컬 서버 시작 스크립트

echo "🚀 로컬 서버를 시작합니다..."
echo "브라우저에서 http://localhost:8000 을 열어주세요"
echo "종료하려면 Ctrl+C를 누르세요"

# Python 3 서버 시작
python3 -m http.server 8000