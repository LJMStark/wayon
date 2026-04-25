from PIL import Image

def extract_white_text_from_blue_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Calculate brightness
        brightness = sum(item[:3]) / 3.0
        
        # We want white pixels to be opaque white, and blue/dark pixels to be transparent.
        # Blue background has brightness around 65. White has 255.
        # Let's map brightness: < 150 -> alpha 0, > 200 -> alpha 255
        
        if brightness < 150:
            alpha = 0
        elif brightness > 220:
            alpha = 255
        else:
            # Smooth transition for anti-aliasing
            alpha = int((brightness - 150) / 70.0 * 255)
            
        newData.append((255, 255, 255, alpha))
            
    img.putdata(newData)
    img.save(output_path, "PNG")

extract_white_text_from_blue_bg('public/assets/brand/logo-yanlian-yanban-header.jpg', 'public/assets/brand/logo-wayon-white.png')
print("White text extracted and background made transparent.")
