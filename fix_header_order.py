with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# Extract the mobile menu button
start_idx = content.find('<button\n            type="button"\n            className={`relative z-10 inline-flex size-10')
end_idx = content.find('</button>', start_idx) + 9

mobile_btn = content[start_idx:end_idx]

# Remove it from current location
content = content[:start_idx] + content[end_idx:]

# Insert it at the end of the nav block, right before the closing </div> of the inner flex container
nav_end_idx = content.find('</nav>') + 6
# We need to insert it right after </nav>
content = content[:nav_end_idx] + '\n\n          ' + mobile_btn + content[nav_end_idx:]

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

print("Fixed mobile menu button position")
