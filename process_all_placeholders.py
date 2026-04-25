import os
import subprocess
import glob
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

def extract_frame(video, out):
    # Just extract the first frame to avoid length issues
    subprocess.run(['ffmpeg', '-y', '-i', video, '-vframes', '1', out], check=True, capture_output=True)

showroom_imgs = sorted(glob.glob('docs/海盛/展厅图片/*.jpg'))
cases_imgs = sorted(glob.glob('docs/海盛/合作案例(优先用销售案例）/销售合作案例/*.jpg'))
factory_videos = sorted(glob.glob('docs/海盛/工厂图片/*.mov'))

factory_frames = []
for i, v in enumerate(factory_videos[:5]):
    out = f'/tmp/factory_{i}.jpg'
    extract_frame(v, out)
    factory_frames.append(out)

process_file(showroom_imgs[0], 'public/assets/hero/hero-1.jpg', (2560, 1080))
process_file(factory_frames[0], 'public/assets/hero/hero-2.jpg', (2560, 1080))

for i in range(8):
    process_file(showroom_imgs[i+1], f'public/assets/home-products/prod-{i}.jpg', (1200, 1200))

for i in range(6):
    process_file(showroom_imgs[i+9], f'public/assets/partners/partner-{i}.jpg', (800, 600))

process_file(showroom_imgs[15], 'public/assets/news/news-feature.jpg', (1600, 1200))

for i in range(6):
    process_file(showroom_imgs[i+16], f'public/assets/showcases/showcase-{i}.jpg', (1920, 1080))

process_file(factory_frames[1], 'public/assets/contact/contact-hero.jpg', (1920, 1080))

process_file(showroom_imgs[22], 'public/assets/fallbacks/product-fallback.jpg', (1200, 1200))
process_file(showroom_imgs[23], 'public/assets/fallbacks/news-fallback.jpg', (1200, 800))

aspects = [
    (1200, 900),   (900, 1200),   (1600, 900),   (1200, 1200),  
    (900, 1200),   (1600, 900),   (960, 1200),   (1600, 900),   
    (1200, 900),   (1200, 1200),  (900, 1200),   (960, 1200)
]

for i, aspect in enumerate(aspects):
    src = cases_imgs[i % len(cases_imgs)]
    process_file(src, f'public/assets/solutions-gallery/gallery-{i}.jpg', aspect)

print("Image processing complete!")
