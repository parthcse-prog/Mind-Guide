import os
from PIL import Image, ImageDraw

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c242c" />
      <stop offset="50%" stop-color="#0e3e4a" />
      <stop offset="100%" stop-color="#005c53" />
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa" />
      <stop offset="100%" stop-color="#fba86f" />
    </linearGradient>
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#261b17" />
      <stop offset="50%" stop-color="#3d271f" />
      <stop offset="100%" stop-color="#180e0a" />
    </linearGradient>
    <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042f2e" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="256" fill="url(#bgGrad)" />

  <!-- Back Hair Waves -->
  <path d="M150 180 C150 70, 362 70, 362 180 C375 280, 385 365, 370 425 C345 390, 335 320, 335 270 C335 200, 177 200, 177 270 C177 320, 167 390, 142 425 C127 365, 137 280, 150 180 Z" fill="url(#hairGrad)" />

  <!-- Shoulders / Jacket -->
  <path d="M126 500 C140 400, 196 365, 256 365 C316 365, 372 400, 386 500 C346 515, 166 515, 126 500 Z" fill="url(#shirtGrad)" />

  <!-- Neck -->
  <path d="M226 310 L226 385 C236 395, 276 395, 286 385 L286 310 Z" fill="url(#skinGrad)" />
  <path d="M226 345 C246 365, 266 365, 286 345 L286 360 C266 380, 246 380, 226 360 Z" fill="#e59f75" opacity="0.6" />

  <!-- Face -->
  <ellipse cx="256" cy="245" rx="78" ry="92" fill="url(#skinGrad)" />

  <!-- Front Hair Style / Bangs -->
  <path d="M176 215 C178 135, 220 115, 256 115 C292 115, 334 135, 336 215 C322 175, 285 160, 256 168 C227 160, 190 175, 176 215 Z" fill="url(#hairGrad)" />
  <path d="M176 215 C172 255, 182 295, 187 315 C192 290, 187 255, 182 225 Z" fill="url(#hairGrad)" />
  <path d="M336 215 C340 255, 330 295, 325 315 C320 290, 325 255, 330 225 Z" fill="url(#hairGrad)" />

  <!-- Eyebrows -->
  <path d="M206 216 Q222 208, 236 214" stroke="#261b17" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <path d="M306 216 Q290 208, 276 214" stroke="#261b17" stroke-width="4.5" stroke-linecap="round" fill="none" />

  <!-- Eyes -->
  <ellipse cx="222" cy="236" rx="12" ry="13" fill="#ffffff" />
  <circle cx="223" cy="236" r="7.5" fill="#2e1f18" />
  <circle cx="225" cy="233" r="2.8" fill="#ffffff" />

  <ellipse cx="290" cy="236" rx="12" ry="13" fill="#ffffff" />
  <circle cx="289" cy="236" r="7.5" fill="#2e1f18" />
  <circle cx="291" cy="233" r="2.8" fill="#ffffff" />

  <!-- Eyelashes -->
  <path d="M209 232 Q222 223, 235 232" stroke="#1c120e" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <path d="M277 232 Q290 223, 303 232" stroke="#1c120e" stroke-width="2.5" stroke-linecap="round" fill="none" />

  <!-- Nose -->
  <path d="M256 238 L256 264 Q252 270, 256 272 Q260 270, 256 264" stroke="#d88b5d" stroke-width="3" stroke-linecap="round" fill="none" />

  <!-- Soft Blush -->
  <ellipse cx="204" cy="262" rx="15" ry="9" fill="#f87171" opacity="0.35" />
  <ellipse cx="308" cy="262" rx="15" ry="9" fill="#f87171" opacity="0.35" />

  <!-- Warm Smile -->
  <path d="M235 292 Q256 314, 277 292" stroke="#c2410c" stroke-width="3.5" stroke-linecap="round" fill="none" />
  <path d="M238 292 Q256 309, 274 292 Z" fill="#ffffff" opacity="0.95" />

  <!-- Emerald/Teal Earrings -->
  <circle cx="174" cy="262" r="5.5" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5" />
  <circle cx="338" cy="262" r="5.5" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5" />
</svg>"""

os.makedirs(r'd:\parth\Saarthi\Mind-Guide\client\public', exist_ok=True)
svg_path = r'd:\parth\Saarthi\Mind-Guide\client\public\female-avatar.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)
print('Saved SVG:', svg_path)

# Also generate PNG
img = Image.new('RGBA', (512, 512), (12, 36, 44, 255))
draw = ImageDraw.Draw(img)

# Background circle
draw.ellipse([0, 0, 512, 512], fill=(14, 62, 74, 255), outline=(0, 92, 83, 255), width=6)

# Back Hair
draw.chord([140, 90, 372, 430], 0, 360, fill=(38, 27, 23, 255))

# Shoulders / Shirt
draw.chord([120, 365, 392, 560], 0, 360, fill=(13, 148, 136, 255))

# Neck
draw.rectangle([226, 310, 286, 385], fill=(254, 215, 170, 255))

# Face
draw.ellipse([178, 153, 334, 337], fill=(254, 215, 170, 255))

# Front hair
draw.chord([166, 105, 346, 235], 180, 360, fill=(38, 27, 23, 255))
draw.polygon([(168, 175), (200, 280), (190, 175)], fill=(38, 27, 23, 255))
draw.polygon([(344, 175), (312, 280), (322, 175)], fill=(38, 27, 23, 255))

# Eyes
draw.ellipse([210, 224, 234, 248], fill=(255, 255, 255, 255))
draw.ellipse([217, 229, 229, 243], fill=(46, 31, 24, 255))
draw.ellipse([222, 231, 226, 235], fill=(255, 255, 255, 255))

draw.ellipse([278, 224, 302, 248], fill=(255, 255, 255, 255))
draw.ellipse([283, 229, 295, 243], fill=(46, 31, 24, 255))
draw.ellipse([286, 231, 290, 235], fill=(255, 255, 255, 255))

# Eyebrows
draw.line([(206, 216), (236, 214)], fill=(38, 27, 23, 255), width=4)
draw.line([(276, 214), (306, 216)], fill=(38, 27, 23, 255), width=4)

# Blush
draw.ellipse([190, 254, 218, 270], fill=(248, 113, 113, 90))
draw.ellipse([294, 254, 322, 270], fill=(248, 113, 113, 90))

# Smile
draw.arc([234, 272, 278, 306], 20, 160, fill=(194, 65, 12, 255), width=4)

# Earrings
draw.ellipse([168, 256, 180, 268], fill=(45, 212, 191, 255))
draw.ellipse([332, 256, 344, 268], fill=(45, 212, 191, 255))

png_path = r'd:\parth\Saarthi\Mind-Guide\client\public\female-avatar.png'
img.save(png_path, 'PNG')
print('Saved PNG:', png_path)
