with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="flex h-[var(--header-height)] w-full items-center gap-6 lg:gap-10">',
    '<div className="flex h-[var(--header-height)] w-full items-center justify-between gap-6 lg:justify-start lg:gap-10">'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

print("Fixed flex justify")
