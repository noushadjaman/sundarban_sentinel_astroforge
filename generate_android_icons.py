"""
Generate production-ready Android launcher icons and app logos
for Sundarban Sentinel.
"""
import os
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SOURCE_IMAGE = r"C:\Users\RAJ\.gemini\antigravity-ide\brain\2d0fa9ee-baf4-4286-9179-ce6e6ae9df1e\sundarban_sentinel_logo_1793133551909.jpg"
RES_DIR = r"f:\sundarbansanetile\mobile\android\app\src\main\res"
PLAYSTORE_DIR = r"f:\sundarbansanetile\mobile\android\app\src\main"
MOBILE_ASSETS_DIR = r"f:\sundarbansanetile\mobile\assets\images"
PROJECT_ASSETS_DIR = r"f:\sundarbansanetile\project_assets"

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def clean_corner_background(img_rgba):
    """
    Flood fills the four extreme white corners to transparent,
    while keeping all internal emblem white pixels untouched.
    """
    arr = np.array(img_rgba)
    h, w, _ = arr.shape
    visited = np.zeros((h, w), dtype=bool)
    to_clear = np.zeros((h, w), dtype=bool)

    seeds = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    queue = deque()
    for r, c in seeds:
        if np.all(arr[r, c, :3] > 210):
            queue.append((r, c))
            visited[r, c] = True

    while queue:
        r, c = queue.popleft()
        to_clear[r, c] = True
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h and 0 <= nc < w and not visited[nr, nc]:
                visited[nr, nc] = True
                if np.all(arr[nr, nc, :3] > 200):
                    queue.append((nr, nc))

    # Apply alpha transparency to the corner pixels with soft feathered boundary
    mask = Image.fromarray((~to_clear).astype(np.uint8) * 255, mode="L")
    # Slight antialiasing on corner mask
    mask_blurred = mask.filter(ImageFilter.GaussianBlur(radius=1.2))
    img_rgba.putalpha(mask_blurred)
    return img_rgba

def create_circular_icon(img_rgba):
    """
    Creates an antialiased circular version of the icon.
    """
    size = img_rgba.size[0]
    # Draw high-res circle mask at 4x supersampling for ultra smooth anti-aliased edge
    scale = 4
    mask_hires = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(mask_hires)
    # Circle with 1px inset for clean border
    draw.ellipse((scale, scale, size * scale - scale, size * scale - scale), fill=255)
    mask = mask_hires.resize((size, size), Image.Resampling.LANCZOS)

    # Combine with existing alpha channel
    existing_alpha = img_rgba.split()[3]
    combined_alpha = Image.new("L", (size, size))
    combined_arr = np.minimum(np.array(mask), np.array(existing_alpha))
    combined_alpha = Image.fromarray(combined_arr)

    round_img = img_rgba.copy()
    round_img.putalpha(combined_alpha)
    return round_img

def main():
    print(f"Loading master logo from {SOURCE_IMAGE}...")
    base_img = Image.open(SOURCE_IMAGE).convert("RGBA")
    
    # 1. Clean corner background
    master_icon = clean_corner_background(base_img)
    master_round = create_circular_icon(master_icon)

    os.makedirs(MOBILE_ASSETS_DIR, exist_ok=True)
    os.makedirs(PROJECT_ASSETS_DIR, exist_ok=True)

    # Save master assets
    master_icon.save(os.path.join(MOBILE_ASSETS_DIR, "app_logo.png"), format="PNG")
    master_round.save(os.path.join(MOBILE_ASSETS_DIR, "app_logo_round.png"), format="PNG")
    master_icon.save(os.path.join(PROJECT_ASSETS_DIR, "sundarban_sentinel_logo.png"), format="PNG")
    master_round.save(os.path.join(PROJECT_ASSETS_DIR, "sundarban_sentinel_logo_round.png"), format="PNG")

    # Play Store 512x512
    playstore_icon = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
    playstore_icon.save(os.path.join(PLAYSTORE_DIR, "ic_launcher-playstore.png"), format="PNG")
    playstore_icon.save(os.path.join(PROJECT_ASSETS_DIR, "app_icon_512.png"), format="PNG")
    print("Saved 512x512 Play Store icon.")

    # 2. Resized launcher icons for each mipmap density
    for folder, size in DENSITIES.items():
        target_dir = os.path.join(RES_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)

        # Standard squircle launcher icon
        icon_resized = master_icon.resize((size, size), Image.Resampling.LANCZOS)
        icon_path = os.path.join(target_dir, "ic_launcher.png")
        icon_resized.save(icon_path, format="PNG")

        # Round launcher icon
        round_resized = master_round.resize((size, size), Image.Resampling.LANCZOS)
        round_path = os.path.join(target_dir, "ic_launcher_round.png")
        round_resized.save(round_path, format="PNG")

        print(f"Generated {folder}: {size}x{size} -> ic_launcher.png & ic_launcher_round.png")

    print("\nAll Android icons generated successfully!")

if __name__ == "__main__":
    main()
