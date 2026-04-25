import re

with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# 1. Remove flex-1 from nav so it doesn't expand and break centering
content = content.replace(
    '<nav className="hidden flex-1 items-center justify-center lg:flex whitespace-nowrap">',
    '<nav className="hidden items-center lg:flex whitespace-nowrap">'
)
# If it hasn't been updated to justify-center yet
content = content.replace(
    '<nav className="hidden flex-1 items-center justify-start lg:flex ml-4 xl:ml-8 whitespace-nowrap">',
    '<nav className="hidden items-center lg:flex whitespace-nowrap">'
)

# 2. Update the container to use justify-center on lg screens
content = content.replace(
    '<div className="flex h-[var(--header-height)] w-full items-center justify-between lg:justify-start gap-6 lg:gap-10">',
    '<div className="flex h-[var(--header-height)] w-full items-center justify-between lg:justify-center gap-6 lg:gap-10 xl:gap-16">'
)

# 3. Make the font even bolder (font-semibold)
content = content.replace('font-medium', 'font-semibold')

# Ensure text-[16px]
content = content.replace('text-[15px]', 'text-[16px]')

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

print("Fixed centering and font weight")
