with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# 1. Update container
content = content.replace(
    '<div className="wayon-container">',
    '<div className="mx-auto w-full px-4 md:px-8 xl:px-12 2xl:px-16">'
)

content = content.replace(
    '<div className="flex h-[var(--header-height)] items-center justify-between gap-6">',
    '<div className="flex h-[var(--header-height)] w-full items-center justify-between lg:justify-start gap-6 lg:gap-10">'
)

# 2. Extract tools block
start_str = '<div className="hidden items-center gap-5 lg:flex">'
end_str = '</div>\n          </div>\n\n          <button\n            type="button"'
start_idx = content.find(start_str)
end_idx = content.find(end_str) + len('</div>\n          </div>')

tools_block = content[start_idx:end_idx]
content = content[:start_idx] + content[end_idx:]

tools_block = tools_block.replace(
    '<div className="hidden items-center gap-5 lg:flex">',
    '<div className="hidden h-[40px] items-center gap-5 border-r border-white/35 pr-6 lg:flex xl:gap-8 xl:pr-10">'
)

# Insert tools block before BrandLogo
logo_idx = content.find('<Link\n            href="/"\n            className="block shrink-0"\n          >')
content = content[:logo_idx] + tools_block + '\n\n          ' + content[logo_idx:]

# 3. Update BrandLogo
content = content.replace(
    'className="relative h-[55px] w-[82px] md:h-[65px] md:w-[98px]"',
    'className="relative h-[65px] w-[105px] md:h-[90px] md:w-[146px]"'
)

# 4. Update Nav to align left
content = content.replace(
    '<nav className="hidden flex-1 items-center justify-center lg:flex">',
    '<nav className="hidden flex-1 items-center justify-start lg:flex ml-4 xl:ml-8 whitespace-nowrap">'
)

# Also ensure ul is nowrap to be extra safe
content = content.replace(
    '<ul className="flex items-center">',
    '<ul className="flex items-center flex-nowrap">'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
