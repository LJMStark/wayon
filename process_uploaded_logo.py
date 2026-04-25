from PIL import Image

def extract_white_from_black(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # For a black-and-white image, brightness is simply the average (or just one channel)
        brightness = sum(item[:3]) / 3.0
        
        # We can just use the brightness directly as alpha for perfect smooth edges!
        alpha = int(brightness)
        
        # Boost contrast slightly to make sure text is solid white
        if alpha < 10:
            alpha = 0
        elif alpha > 240:
            alpha = 255
            
        newData.append((255, 255, 255, alpha))
            
    img.putdata(newData)
    img.save(output_path, "PNG")

extract_white_from_black('/Users/demon/.gemini/antigravity/brain/5372abad-85e3-404b-b8ec-6cce8bce8a0c/media__1777124495832.png', 'public/assets/brand/logo-wayon-white.png')
print("Extracted white logo from user's uploaded black-background image.")
