from PIL import Image

def extract_white_text(input_path, output_path, tolerance=240):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is close to white
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            newData.append((255, 255, 255, 0)) # Make background transparent
        else:
            # Make the text white
            newData.append((255, 255, 255, item[3]))
            
    img.putdata(newData)
    img.save(output_path, "PNG")

extract_white_text('public/assets/brand/logo-yanlian-yanban-header.jpg', 'public/assets/brand/logo-wayon-white.png')
print("Logo processed and saved as logo-wayon-white.png")
