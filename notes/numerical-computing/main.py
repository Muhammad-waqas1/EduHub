import os
import json
from datetime import datetime

# File to write into
JSON_FILE = "files.json"

# Categories by extension (modify as needed)
CATEGORIES = {
    "pdf": "notes",
    "doc": "notes",
    "docx": "notes",
    "ppt": "notes",
    "pptx": "notes",
    "zip": "extras",
    "rar": "extras",
    "mp4": "extras",
    "jpg": "extras"
}

def get_file_size_mb(path):
    size_bytes = os.path.getsize(path)
    return f"{round(size_bytes / (1024*1024), 2)}MB"

def get_file_date(path):
    timestamp = os.path.getmtime(path)
    return datetime.fromtimestamp(timestamp).strftime("%d-%m-%Y")

def main():
    # Load or create JSON structure
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    # Ensure categories exist
    for cat in set(CATEGORIES.values()):
        if cat not in data:
            data[cat] = []

    # Scan current directory
    for filename in os.listdir("."):
        # Skip JSON file and the Python script itself
        if filename in [JSON_FILE, os.path.basename(__file__)]:
            continue

        if os.path.isfile(filename):
            ext = filename.split(".")[-1].lower()

            if ext in CATEGORIES:
                category = CATEGORIES[ext]

                entry = {
                    "name": filename,
                    "url": filename,
                    "type": ext,
                    "size": get_file_size_mb(filename),
                    "date": get_file_date(filename)
                }

                # Avoid duplicates
                if not any(item["name"] == filename for item in data[category]):
                    data[category].append(entry)

    # Save back
    with open(JSON_FILE, "w") as f:
        json.dump(data, f, indent=2)

    print("files.json updated successfully.")

if __name__ == "__main__":
    main()
