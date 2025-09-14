#!/bin/bash

# AIFI 로컬 서버 시작 스크립트
echo "🚀 AIFI 로컬 서버를 시작합니다..."
echo "브라우저에서 http://localhost:8000 으로 접속하세요"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

# Python 3 HTTP 서버 시작
python3 -m http.server 8000