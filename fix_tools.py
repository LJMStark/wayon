import re

with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# 1. Update the styling inside the tools block FIRST, before moving it
# Search button color
content = content.replace(
    'text-white/80 hover:text-white',
    'text-white hover:text-white'
)
# Language button font and color
content = content.replace(
    'text-[16px] font-light transition-colors',
    'text-[16px] font-semibold transition-colors'
)

# 2. Extract tools block and move it
# The tools block starts at:
# <div className="hidden h-[40px] items-center gap-5 border-r border-white/35 pr-6 lg:flex xl:gap-8 xl:pr-10">
# and ends with </AnimatePresence> </div> </div> right before <Link href="/" className="block shrink-0">

start_str = '<div className="hidden h-[40px] items-center gap-5 border-r border-white/35 pr-6 lg:flex xl:gap-8 xl:pr-10">'
start_idx = content.find(start_str)

if start_idx != -1:
    logo_start = content.find('<Link\n            href="/"\n            className="block shrink-0"\n          >')
    # The tools block is from start_idx to logo_start
    tools_block = content[start_idx:logo_start].strip()
    
    # Remove tools_block from its current position
    content = content[:start_idx] + content[logo_start:]
    
    # Modify tools_block to remove the right border
    tools_block = tools_block.replace(
        '<div className="hidden h-[40px] items-center gap-5 border-r border-white/35 pr-6 lg:flex xl:gap-8 xl:pr-10">',
        '<div className="hidden h-[40px] items-center gap-5 lg:flex xl:gap-8">'
    )
    
    # Find the end of <nav>
    nav_end_str = '</nav>'
    nav_end_idx = content.find(nav_end_str) + len(nav_end_str)
    
    # Insert tools_block after </nav>
    content = content[:nav_end_idx] + '\n\n          ' + tools_block + content[nav_end_idx:]

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

print("Tools moved and styled")
