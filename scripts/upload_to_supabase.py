"""
上传 ECG 图片到 Supabase Storage，导入病例 JSON 到 Supabase cases 表
Usage:
  python scripts/upload_to_supabase.py --images  # 上传图片
  python scripts/upload_to_supabase.py --cases   # 导入病例
  python scripts/upload_to_supabase.py --all     # 全部执行
"""
import json
import os
import sys
import argparse
from pathlib import Path
from supabase import create_client, Client

# ── Supabase 配置 ──────────────────────────────────────
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://kqoigeigwucvlpzbvboy.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

CASES_DIR = Path(os.environ.get("ECG_CASES_DIR", "I:/2024新书/ecg_cases"))
IMAGES_DIR = Path(os.environ.get("ECG_IMAGES_DIR", "I:/2024新书/ecg_images"))
BUCKET_NAME = "ecg-images"


def get_client(admin=False):
    key = SUPABASE_KEY if admin else os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    if not key:
        raise ValueError("Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return create_client(SUPABASE_URL, key)


def upload_images():
    """上传所有 ECG 图片到 Supabase Storage"""
    supabase = get_client(admin=True)

    # Ensure bucket exists
    try:
        supabase.storage.create_bucket(BUCKET_NAME, {"public": True})
        print(f"Created bucket: {BUCKET_NAME}")
    except Exception:
        print(f"Bucket '{BUCKET_NAME}' already exists or couldn't create")

    images = sorted(IMAGES_DIR.glob("ecg_*.png"))
    print(f"Found {len(images)} images to upload")

    uploaded = []
    for img in images:
        case_num = img.stem.replace("ecg_", "")
        remote_path = f"{case_num}/{img.name}"

        with open(img, "rb") as f:
            result = supabase.storage.from_(BUCKET_NAME).upload(
                remote_path, f.read(),
                {"content-type": "image/png", "upsert": "true"}
            )

        # Get public URL
        url = supabase.storage.from_(BUCKET_NAME).get_public_url(remote_path)
        uploaded.append({"case_num": case_num, "url": url, "local_path": str(img)})
        print(f"  [{case_num}/150] {url}")

    # Save URL mapping
    mapping = {u["case_num"]: u["url"] for u in uploaded}
    with open(CASES_DIR / "_image_urls.json", "w") as f:
        json.dump(mapping, f, indent=2)
    print(f"\nUploaded {len(uploaded)} images. URL mapping saved.")
    return mapping


def flatten_case(case_data, image_url=None):
    """将教学病例 JSON 展平为数据库行格式"""
    patient = case_data.get("patient", {}) or {}
    ecg = case_data.get("ecg_findings", {}) or {}

    return {
        "title": case_data.get("title", ""),
        "category": case_data.get("category", ""),
        "difficulty": case_data.get("difficulty", "基础"),
        "description": case_data.get("description", ""),
        "ecg_findings": ecg.get("details", []) if isinstance(ecg, dict) else [],
        "question": case_data.get("learning_stages", [{}])[0].get("question", "") if case_data.get("learning_stages") else "",
        "hint": "",
        "key_points": case_data.get("key_points", []),
        "is_published": True,
        "content_json": {
            "source": case_data.get("source", ""),
            "product": "ecg-academy",
            "patient": patient,
            "ecg_findings": ecg,
            "final_diagnosis": case_data.get("final_diagnosis", ""),
            "management": case_data.get("management", ""),
            "learning_stages": case_data.get("learning_stages", []),
            "key_points": case_data.get("key_points", []),
            "clinical_pearls": case_data.get("clinical_pearls", []),
            "image_urls": [image_url] if image_url else [],
            "tags": case_data.get("tags", []),
        },
    }


def import_cases():
    """导入所有病例 JSON 到 Supabase"""
    supabase = get_client(admin=True)

    # Load image URL mapping
    url_map = {}
    map_file = CASES_DIR / "_image_urls.json"
    if map_file.exists():
        with open(map_file) as f:
            url_map = json.load(f)

    json_files = sorted(CASES_DIR.glob("ecg_*.json"))
    print(f"Found {len(json_files)} case JSONs to import")

    imported = []
    failed = []
    for jf in json_files:
        case_num = jf.stem.replace("ecg_", "")
        with open(jf, "r", encoding="utf-8") as f:
            case_data = json.load(f)

        image_url = url_map.get(case_num, "")
        row = flatten_case(case_data, image_url)

        try:
            result = supabase.table("cases").insert(row).execute()
            imported.append(case_num)
            print(f"  [{case_num}/150] ✅ {case_data.get('title', 'N/A')}")
        except Exception as e:
            failed.append(case_num)
            print(f"  [{case_num}/150] ❌ {str(e)[:100]}")

    print(f"\nImported: {len(imported)}, Failed: {len(failed)}")
    return imported, failed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", action="store_true")
    parser.add_argument("--cases", action="store_true")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    if not (args.images or args.cases or args.all):
        print("Usage: python upload_to_supabase.py [--images] [--cases] [--all]")
        sys.exit(1)

    if args.images or args.all:
        print("=== Uploading Images ===")
        upload_images()

    if args.cases or args.all:
        print("\n=== Importing Cases ===")
        import_cases()


if __name__ == "__main__":
    main()
