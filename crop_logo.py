from PIL import Image

def crop_transparent_padding(input_path, output_path):
    img = Image.open(input_path)
    bbox = img.getbbox()
    if bbox:
        # Add a tiny bit of padding (like 5px) just in case
        padding = 10
        width, height = img.size
        left = max(0, bbox[0] - padding)
        upper = max(0, bbox[1] - padding)
        right = min(width, bbox[2] + padding)
        lower = min(height, bbox[3] + padding)
        
        cropped = img.crop((left, upper, right, lower))
        cropped.save(output_path, "PNG")
        print(f"Cropped logo from {img.size} to {cropped.size}")

crop_transparent_padding('public/assets/brand/logo-wayon-white.png', 'public/assets/brand/logo-wayon-white.png')
