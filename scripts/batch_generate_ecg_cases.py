"""
批量心电图病例生成流水线
1. 从 Hampton PDF 提取每例的心电图图片
2. 调用 DeepSeek API 按原文生成结构化教学病例 JSON
3. 保存图片 + JSON
"""
import fitz
import json
import os
import re
import time
import sys
import argparse
from pathlib import Path
from openai import OpenAI

from env_local import load_env_local

load_env_local()

# ── 配置（可通过环境变量覆盖）────────────────────────────
PDF_PATH = os.environ.get("ECG_PDF_PATH", "I:/2024新书/150 ECG Cases 5th Edition by John Hampton.pdf")
MAP_PATH = os.environ.get("ECG_CASE_MAP_PATH", "I:/2024新书/case_page_map.json")
IMG_DIR = Path(os.environ.get("ECG_IMAGES_DIR", "I:/2024新书/ecg_images"))
JSON_DIR = Path(os.environ.get("ECG_CASES_DIR", "I:/2024新书/ecg_cases"))
IMG_DIR.mkdir(parents=True, exist_ok=True)
JSON_DIR.mkdir(parents=True, exist_ok=True)

# DeepSeek 客户端（使用和 ecg-academy 相同的配置）
deepseek = OpenAI(
    api_key=os.environ.get("DEEPSEEK_API_KEY", ""),
    base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
)
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")

# ── Prompt ────────────────────────────────────────────
SYSTEM_PROMPT = """# Role
你是一位资深心内科主任医师和心电图教学编辑。你的任务是将英文心电图病例书中的每个病例转化为结构化的中文教学病例。

# Core Rule — 铁律
**所有文字内容必须严格来自原文。你可以翻译成中文，但不能编造任何患者数据、测量值、诊断结论。**
原文中的每一个数值、每一个诊断结论都必须保留。

# 难度自动判断规则
- **基础**：正常心电图、窦性心律失常、单纯早搏、简单传导阻滞
- **进阶**：心肌缺血/梗死定位、束支阻滞、房颤房扑、SVT 鉴别、电解质异常
- **高级**：宽 QRS 心动过速鉴别、复杂心梗（多壁/合并束支阻滞）、起搏器 ECG、Brugada、Wellens、de Winter

# 分类判断
根据 Clinical interpretation 判断所属分类：
- 正常心电图、心肌缺血、心律失常、ST-T改变、束支阻滞、电解质异常、起搏器、心腔肥大、急诊

# Output JSON Schema
{
  "title": "中文标题（格式：ECG N: 核心判读发现）",
  "category": "分类（中文）",
  "difficulty": "基础/进阶/高级",
  "source": "150 ECG Cases 5th Ed., John Hampton, ECG N",
  "description": "中文病例摘要（50-100字，保留原文患者信息和主诉）",
  "patient": {
    "age": 数字或null,
    "gender": "男/女/null",
    "chief_complaint": "主诉（中文翻译）",
    "history": "病史（中文翻译，如有）"
  },
  "ecg_findings": {
    "summary": "ECG 总体描述的中文翻译，含心率、节律、间期等关键数值",
    "details": ["逐个心电图发现的列表，保留原文测量值"]
  },
  "final_diagnosis": "原文 Clinical interpretation 的中文翻译",
  "management": "原文 What to do 的中文翻译",
  "learning_stages": [
    {
      "stage": 1,
      "title": "心率与节律",
      "question": "引导问题（中文，基于原文内容）",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误（基于你的教学经验）"]
    },
    {
      "stage": 2,
      "title": "间期测量与电轴",
      "question": "引导问题",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误"]
    },
    {
      "stage": 3,
      "title": "P 波与 QRS 形态",
      "question": "引导问题",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误"]
    },
    {
      "stage": 4,
      "title": "ST 段与 T 波分析",
      "question": "引导问题",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误"]
    },
    {
      "stage": 5,
      "title": "综合判读与临床决策",
      "question": "综合引导问题",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误"]
    }
  ],
  "key_points": ["原文关键知识点（3-5个）"],
  "clinical_pearls": ["原文临床经验点（如有）"],
  "tags": ["标签"]
}
"""


def extract_case_text(doc, q_page, a_page):
    """提取一个病例的问题页和答案页文字"""
    q_text = doc[q_page].get_text().strip()
    a_text = doc[a_page].get_text().strip()
    # Clean whitespace
    q_text = re.sub(r'\s+', ' ', q_text)
    a_text = re.sub(r'\s+', ' ', a_text)
    return q_text, a_text


def render_ecg_image(doc, q_page, case_num):
    """渲染 ECG 问题页为 PNG 图片"""
    page = doc[q_page]
    # 渲染为图片 (2x 缩放以保证清晰度)
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    img_path = IMG_DIR / f"ecg_{case_num:03d}.png"
    pix.save(str(img_path))
    return str(img_path)


def call_deepseek(q_text, a_text, case_num):
    """调用 DeepSeek 生成结构化教学病例"""
    prompt = f"""【病例 #{case_num} — 问题页原文】
{q_text}

【病例 #{case_num} — 答案解析原文】
{a_text}

请严格按照原文内容，将以上心电图病例转化为结构化 JSON 教学病例。所有数据必须来自原文。"""

    try:
        response = deepseek.chat.completions.create(
            model=DEEPSEEK_MODEL,
            max_tokens=4096,
            temperature=0.3,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt[:30000]},  # 截断以防过长
            ],
        )
        raw = response.choices[0].message.content or "{}"
        # Clean markdown fences
        raw = re.sub(r'```json\s*', '', raw)
        raw = re.sub(r'```\s*', '', raw)
        return json.loads(raw.strip())
    except Exception as e:
        print(f"  DeepSeek error: {e}")
        return None


def process_case(doc, case_num, q_page, a_page):
    """处理单个病例"""
    print(f"\n{'='*60}")
    print(f"ECG {case_num}: Q=page{q_page+1} A=page{a_page+1}")

    # 1. Extract text
    q_text, a_text = extract_case_text(doc, q_page, a_page)
    print(f"  Question text: {len(q_text)} chars")
    print(f"  Answer text: {len(a_text)} chars")

    # 2. Render ECG image
    img_path = render_ecg_image(doc, q_page, case_num)
    print(f"  Image saved: {img_path}")

    # 3. Generate via DeepSeek
    print(f"  Calling DeepSeek...")
    case_data = call_deepseek(q_text, a_text, case_num)

    if case_data:
        # 4. Save JSON
        json_path = JSON_DIR / f"ecg_{case_num:03d}.json"
        case_data["image_path"] = img_path
        case_data["case_number"] = case_num
        case_data["product"] = "ecg-academy"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(case_data, f, ensure_ascii=False, indent=2)
        print(f"  JSON saved: {json_path}")
        print(f"  Title: {case_data.get('title', 'N/A')}")
        print(f"  Category: {case_data.get('category', 'N/A')}")
        print(f"  Difficulty: {case_data.get('difficulty', 'N/A')}")
        return case_data
    else:
        print(f"  FAILED to generate case {case_num}")
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=1, help="Start case number")
    parser.add_argument("--end", type=int, default=150, help="End case number")
    parser.add_argument("--dry-run", action="store_true", help="Only show mapping, don't generate")
    args = parser.parse_args()

    # Check API key
    if not os.environ.get("DEEPSEEK_API_KEY"):
        print("ERROR: DEEPSEEK_API_KEY environment variable not set!")
        sys.exit(1)

    # Load mapping
    with open(MAP_PATH) as f:
        case_map = json.load(f)

    # Open PDF
    doc = fitz.open(PDF_PATH)

    # Process cases
    results = []
    failed = []
    for case_num in range(args.start, args.end + 1):
        key = str(case_num)
        if key not in case_map:
            print(f"ECG {case_num}: NOT FOUND in mapping")
            failed.append(case_num)
            continue

        c = case_map[key]
        q_page = c["question_page"]
        a_page = c["answer_page"]

        if args.dry_run:
            q_text, a_text = extract_case_text(doc, q_page, a_page)
            print(f"ECG {case_num}: Q=page{q_page+1} ({len(q_text)}c) A=page{a_page+1} ({len(a_text)}c)")
            continue

        result = process_case(doc, case_num, q_page, a_page)
        if result:
            results.append(result)
        else:
            failed.append(case_num)

        # Rate limit: 1 second between API calls
        time.sleep(1)

    # Summary
    print(f"\n{'='*60}")
    print(f"DONE. Generated: {len(results)}, Failed: {len(failed)}")
    if failed:
        print(f"Failed cases: {failed}")

    # Save summary
    summary = {
        "total": len(results),
        "failed": failed,
        "cases": [
            {
                "num": r["case_number"],
                "title": r.get("title"),
                "category": r.get("category"),
                "difficulty": r.get("difficulty"),
            }
            for r in results
        ]
    }
    with open(JSON_DIR / "_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"Summary saved to {JSON_DIR / '_summary.json'}")

    doc.close()


if __name__ == "__main__":
    main()
