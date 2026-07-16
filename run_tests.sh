#!/usr/bin/env bash
# 전체 회귀: 각 _test_*.js는 마지막 줄에 PASS/FAIL을 출력하고 exit code로 판정
set -u
fail=0; pass=0; failed=()
for f in _test_*.js; do
  out=$(node "$f" 2>&1); code=$?
  if [ $code -eq 0 ]; then pass=$((pass+1)); echo "PASS  $f";
  else fail=$((fail+1)); failed+=("$f"); echo "FAIL  $f"; echo "$out" | tail -5; fi
done
echo "----------------------------------------"
echo "PASS $pass / FAIL $fail"
[ $fail -gt 0 ] && { printf 'FAILED: %s\n' "${failed[@]}"; exit 1; }
exit 0
