import os
import re

target_dir = r"c:\Users\biggr\Downloads\p1\client\src"

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace http://localhost:3001 with API URL
            content = content.replace('"http://localhost:3001"', '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`')
            content = content.replace('`http://localhost:3001/', '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/')
            
            # Replace ws://localhost:3001 with WS URL
            content = content.replace('"ws://localhost:3001"', 'process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"')
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

print("Replaced all hardcoded URLs.")
