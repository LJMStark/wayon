with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'return "inline-flex items-center text-[15px] font-medium text-white transition-colors";',
    'return "inline-flex items-center text-[16px] font-medium text-white transition-colors";'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
