import os

print("Searching for 'portfolio' (case-insensitive) in NexaSphere repository...")

portfolio_files = []
for root, dirs, files in os.walk("C:\\anshika\\college\\gssoc'26\\NexaSphere"):
    if ".git" in root or "node_modules" in root or "dist" in root:
        continue
    for file in files:
        path = os.path.join(root, file)
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if "portfolio" in content.lower():
                portfolio_files.append(path)
                print(f"Match found in: {path}")
        except Exception:
            pass

print(f"Total matching files: {len(portfolio_files)}")
