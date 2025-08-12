#!/usr/bin/env python3
import re

# HTML 파일 읽기
with open('image_prompt_generator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 줄 단위로 분리
lines = content.split('\n')

# 함수 위치 찾기
optimize_prompt_start = None
optimize_prompt_end = None
optimize_single_start = None
optimize_single_end = None

for i, line in enumerate(lines):
    if 'async function optimizePromptWithAI(data)' in line:
        optimize_prompt_start = i - 1  # 주석 포함
    elif optimize_prompt_start is not None and optimize_prompt_end is None and line.strip() == '}':
        # 들여쓰기 레벨 확인
        if i + 1 < len(lines) and lines[i+1].strip() == '':
            optimize_prompt_end = i
    
    if 'async function optimizeSinglePrompt(text, provider, apiKey, model)' in line:
        optimize_single_start = i - 1  # 주석 포함
    elif optimize_single_start is not None and optimize_single_end is None and line.strip() == '}':
        # 들여쓰기 레벨 확인
        if i + 1 < len(lines) and (lines[i+1].strip() == '' or 'function mergeOptimizedPrompt' in lines[i+1]):
            optimize_single_end = i

print(f"optimizePromptWithAI: {optimize_prompt_start} ~ {optimize_prompt_end}")
print(f"optimizeSinglePrompt: {optimize_single_start} ~ {optimize_single_end}")

if all([optimize_prompt_start, optimize_prompt_end, optimize_single_start, optimize_single_end]):
    # 함수들 추출
    optimize_prompt_func = lines[optimize_prompt_start:optimize_prompt_end+1]
    optimize_single_func = lines[optimize_single_start:optimize_single_end+1]
    
    # 새로운 순서로 재배치
    new_lines = (
        lines[:optimize_prompt_start] +
        optimize_single_func +
        [''] +
        optimize_prompt_func +
        [''] +
        lines[optimize_single_end+1:]
    )
    
    # 파일 쓰기
    with open('image_prompt_generator.html', 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print("함수 순서가 수정되었습니다.")
else:
    print("함수 위치를 찾을 수 없습니다.")