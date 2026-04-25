import os
from PIL import Image, ImageEnhance, ImageFilter

def enhance_image(img):
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = ImageEnhance.Color(img).enhance(1.15)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Brightness(img).enhance(1.02)
    img = ImageEnhance.Sharpness(img).enhance(1.6)
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    return img

def crop_and_resize(img, target_size):
    tw, th = target_size
    w, h = img.size
    target_ratio = tw / th
    current_ratio = w / h

    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        offset = (w - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, h))
    else:
        new_h = int(w / target_ratio)
        offset = (h - new_h) // 2
        img = img.crop((0, offset, w, offset + new_h))
    
    return img.resize(target_size, Image.Resampling.LANCZOS)

def process_file(src_path, target_path, target_size):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    img = Image.open(src_path)
    img = enhance_image(img)
    img = crop_and_resize(img, target_size)
    
    ext = target_path.split('.')[-1].lower()
    if ext == 'png':
        img.save(target_path, format='PNG')
    elif ext == 'webp':
        img.save(target_path, format='WEBP', quality=90)
    else:
        img.save(target_path, format='JPEG', quality=90)

categories_imgs = [
    "docs/4.22/新品素材/800×2600×9mm/哑光（超细干粒）/ZL826XY22罗马洞石米白/ZL826XY22罗马洞石米白元素图.jpg",
    "docs/4.22/新品素材/900×2700×9mm/亮面（亮光）/LV927L163经典宝格丽/LV927L163经典宝格丽元素图.jpg",
    "docs/4.22/特定厚度/900×3000×9mm/哑光/数码釉/LV930Y21罗马洞石米黄/LV930Y21罗马洞石米黄元素图.jpg",
    "docs/4.22/特定厚度/800×2600×9mm/精雕/LV826Y027JD南美柚木细纹米白/LV826Y027JD南美柚木细纹米白元素图.jpg",
    "docs/4.22/新品素材/900×2700×9mm/亮面（亮光）/LV927L119香雪玉/LV927L119香雪玉空间图.jpg",
    "docs/4.22/工艺岩板/现货工艺岩板/定制图案设计/B类/LV826GY909奢华艺术壁纸-棕/LV826GY909奢华艺术壁纸-棕元素图.jpg",
    "docs/4.22/新品素材/1600X3200X12mm/真石镜面釉-亮光/ZS1632L1208圣托里尼/ZS1632L1208圣托里尼-元素图.jpg",
    "docs/4.22/工艺岩板/现货工艺岩板/定制图案设计/B类/LV826GY972盛夏-马赛克/LV826GY972盛夏-马赛克元素图.jpg"
]

# Update Home Products (8 categories)
for i in range(8):
    process_file(categories_imgs[i], f'public/assets/home-products/prod-{i}.jpg', (1200, 1200))

# Update Product Page Category Showcases (6 categories)
for i in range(6):
    process_file(categories_imgs[i], f'public/assets/showcases/showcase-{i}.jpg', (1920, 1080))

print("Product category images processing complete!")
