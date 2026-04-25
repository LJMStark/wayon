with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# 1. Update font weight
content = content.replace(
    'return "inline-flex items-center text-[15px] font-light text-white transition-colors";',
    'return "inline-flex items-center text-[15px] font-medium text-white transition-colors";'
)
content = content.replace(
    'return "inline-flex items-center text-[15px] font-light text-white transition-colors hover:text-white";',
    'return "inline-flex items-center text-[16px] font-medium text-white transition-colors hover:text-white";'
)
content = content.replace(
    'return "inline-flex items-center text-[15px] font-light text-white/80 transition-colors hover:text-white";',
    'return "inline-flex items-center text-[16px] font-medium text-white transition-colors hover:text-white";'
)

# 2. Update nav alignment
content = content.replace(
    '<nav className="hidden flex-1 items-center justify-start lg:flex ml-4 xl:ml-8 whitespace-nowrap">',
    '<nav className="hidden flex-1 items-center justify-center lg:flex whitespace-nowrap">'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
