import os
import re
import json

ABILITY_DIR = '/Users/isbtty/Desktop/outcome/ability'
PROCESS_DIR = '/Users/isbtty/Desktop/outcome/process'
OUTPUT_FILE = '/Users/isbtty/Desktop/outcome/top_students.json'

# Mapping text ratings to numeric scores
RATING_MAP = {
    "なし": 1,
    "あまり自信がない": 1,
    "あまりそう思わない": 1,
    "あまり明確でない": 1,
    "不安／苦手": 1,
    "未提出": 0,
    "個人で少しだけ": 2,
    "どちらとも言えない": 3,
    "やや自信がある": 4,
    "ややそう思う": 4,
    "自信がある": 5,
    "とてもそう思う": 5,
    "明確": 5,
    "得意": 5,
    "サポート型": 0, # Type, not score
    "アイデア型": 0, # Type, not score
    "リーダー型": 0, # Type, not score
}

def parse_ability(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract Before/After section
    match = re.search(r'## Before/After ハイライト\n(.*?)(?=\n##|$)', content, re.DOTALL)
    if not match:
        return {}
    
    lines = match.group(1).strip().split('\n')
    data = {}
    total_growth = 0
    
    for line in lines:
        if ':' in line and '→' in line:
            key, values = line.split(':', 1)
            key = key.strip('- ').strip()
            before_str, after_str = values.split('→')
            before_str = before_str.strip()
            after_str = after_str.strip()
            
            before_score = RATING_MAP.get(before_str, 0)
            after_score = RATING_MAP.get(after_str, 0)
            
            # Special handling for types (not numeric growth)
            if "型" in before_str or "型" in after_str:
                growth = 0
            else:
                growth = after_score - before_score
            
            total_growth += growth
            data[key] = {
                "before": before_str,
                "after": after_str,
                "growth": growth
            }
            
    return {"stats": data, "total_growth": total_growth}

def parse_process(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Extract Ki-Sho-Ten-Ketsu section
    match = re.search(r'## 起承転結サマリー\n(.*?)(?=\n##|$)', content, re.DOTALL)
    if not match:
        return {}
        
    lines = match.group(1).strip().split('\n')
    summary = {}
    for line in lines:
        if line.startswith('- 起:'):
            summary['ki'] = line[4:].strip()
        elif line.startswith('- 承:'):
            summary['sho'] = line[4:].strip()
        elif line.startswith('- 転:'):
            summary['ten'] = line[4:].strip()
        elif line.startswith('- 結:'):
            summary['ketsu'] = line[4:].strip()
            
    return summary

def main():
    students = []
    
    # Iterate through ability files
    for filename in os.listdir(ABILITY_DIR):
        if not filename.endswith('.md'):
            continue
            
        learner_id = filename.replace('.md', '')
        ability_path = os.path.join(ABILITY_DIR, filename)
        process_path = os.path.join(PROCESS_DIR, filename)
        
        if not os.path.exists(process_path):
            continue
            
        ability_data = parse_ability(ability_path)
        process_data = parse_process(process_path)
        
        if ability_data and process_data:
            students.append({
                "id": learner_id,
                "growth_score": ability_data['total_growth'],
                "stats": ability_data['stats'],
                "story": process_data
            })
            
    # Sort by growth score descending
    students.sort(key=lambda x: x['growth_score'], reverse=True)
    
    # Pick top 5
    top_students = students[:5]
    
    print(f"Found {len(students)} students. Selected top {len(top_students)}.")
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(top_students, f, indent=2, ensure_ascii=False)
        
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
