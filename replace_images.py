import re

with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'import\s+(\w+)\s+from\s+[\'"][^\'"]+\.jpg[\'"];', r'const \1 = "";', content)

with open('src/lib/mock-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Images replaced")
