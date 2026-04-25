from PIL import Image

def extract_pure_white(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        brightness = sum(item[:3]) / 3.0
        
        # We want the text to be pure white and opaque.
        if brightness > 100:
            alpha = 255
        elif brightness > 30:
            # Smooth edge
            alpha = int((brightness - 30) / 70.0 * 255)
        else:
            alpha = 0
            
        newData.append((255, 255, 255, alpha))
            
    img.putdata(newData)
    img.save(output_path, "PNG")

extract_pure_white('/Users/demon/.gemini/antigravity/brain/5372abad-85e3-404b-b8ec-6cce8bce8a0c/media__1777124495832.png', 'public/assets/brand/logo-wayon-white.png')
print("Extracted pure white logo.")
