#!/bin/bash
# 로그인 API 테스트 스크립트
# 사용법: ./test_login.sh your@email.com yourpassword

EMAIL=${1:-"test@example.com"}
PASSWORD=${2:-"password123"}

echo "========================================="
echo "로그인 테스트"
echo "Email: $EMAIL"
echo "========================================="

curl -v -X POST https://api.studylink.store/user/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt

echo ""
echo "========================================="
echo "쿠키를 사용한 /user/info 테스트"
echo "========================================="

curl -v https://api.studylink.store/user/info \
  -b cookies.txt

echo ""
echo "저장된 쿠키:"
cat cookies.txt
