"""Génère favicon, icônes et image d'aperçu (og-image.jpg) de Bayt Immobilier."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
FONTS = sys.argv[1]           # dossier contenant les polices
OUT = sys.argv[2]             # dossier public/
VOLET=(31,79,158); VOLET_D=(22,60,122); CHAUX=(246,247,244); ENCRE=(15,27,45); CIEL=(230,238,248); PIERRE=(90,101,117); WHITE=(255,255,255)

def font(name, size, wght):
    f = ImageFont.truetype(os.path.join(FONTS, name), size, layout_engine=ImageFont.Layout.RAQM)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

def mark(size):
    S = size * 8
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    k = S / 32
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=7 * k, fill=VOLET)
    for x0, y0, x1, y1 in [(5.5, 16, 13, 25.5), (14, 10, 21.5, 25.5), (22.5, 14.5, 26.5, 25.5)]:
        d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=WHITE)
    for x0, y0, x1, y1 in [(16.5, 21.3, 19, 25.5), (7.5, 19, 10.5, 21.4), (16.3, 13, 19.2, 15.6)]:
        d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=VOLET)
    return im.resize((size, size), Image.LANCZOS)

mark(48).save(os.path.join(OUT, "favicon.png"))
# icônes plein cadre (iOS arrondit lui-même)
for sz, name in [(180, "apple-touch-icon.png"), (512, "icon-512.png")]:
    S = sz * 4
    im = Image.new("RGB", (S, S), VOLET); d = ImageDraw.Draw(im); k = S / 32
    for x0, y0, x1, y1 in [(6, 15.5, 13, 25), (14, 9.5, 21, 25), (22, 14, 26, 25)]:
        d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=WHITE)
    for x0, y0, x1, y1 in [(16.2, 20.8, 18.8, 25), (8, 18.5, 11, 20.9), (16, 12.5, 19, 15)]:
        d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=VOLET)
    im.resize((sz, sz), Image.LANCZOS).save(os.path.join(OUT, name))

# ---------- image d'aperçu 1200 x 630 ----------
W, H, F = 1200, 630, 2
im = Image.new("RGB", (W * F, H * F), CHAUX); d = ImageDraw.Draw(im)
def R(*v): return [x * F for x in v]

# façade aux volets bleus (à droite)
fx0, fy0, fx1 = 740, 0, 1200
d.rectangle(R(fx0, 0, fx1, H), fill=CIEL)
bx0, bx1, by0 = 790, 1160, 70
d.rectangle(R(bx0 + 10, by0 + 10, bx1 + 10, H), fill=(214, 222, 233))
d.rectangle(R(bx0, by0, bx1, H), fill=WHITE)
d.rectangle(R(bx0 - 10, by0 - 12, bx1 + 10, by0), fill=(236, 239, 243))
cols, rows = 3, 4
cw = (bx1 - bx0) / cols
for r in range(rows):
    for c in range(cols):
        cx = bx0 + cw * c + cw / 2
        wy0 = by0 + 40 + r * 140
        ww, wh = 42, 92
        x0, x1 = cx - ww / 2, cx + ww / 2
        d.rectangle(R(x0, wy0, x1, wy0 + wh), fill=(40, 52, 70))
        # volets ouverts de chaque côté
        open_ = (r + c) % 3 != 1
        for side in (-1, 1):
            if open_:
                sx0 = x0 - 24 if side < 0 else x1 + 2
                sx1 = x0 - 2 if side < 0 else x1 + 24
            else:
                sx0 = x0 if side < 0 else cx
                sx1 = cx if side < 0 else x1
            d.rectangle(R(sx0, wy0, sx1, wy0 + wh), fill=VOLET)
            y = wy0 + 6
            while y < wy0 + wh - 4:
                d.line(R(sx0 + 3, y, sx1 - 3, y), fill=VOLET_D, width=2 * F); y += 9
        # balcon en fer forgé
        if r in (1, 2):
            d.rectangle(R(x0 - 34, wy0 + wh - 4, x1 + 34, wy0 + wh + 4), fill=(236, 239, 243))
            d.line(R(x0 - 34, wy0 + wh - 26, x1 + 34, wy0 + wh - 26), fill=ENCRE, width=2 * F)
            xx = x0 - 30
            while xx < x1 + 34:
                d.line(R(xx, wy0 + wh - 26, xx, wy0 + wh - 4), fill=ENCRE, width=F); xx += 8

# logo + mot
m = mark(64)
im.paste(m.resize((64 * F, 64 * F), Image.LANCZOS), (72 * F, 64 * F), m.resize((64 * F, 64 * F), Image.LANCZOS))
fb = font("SofiaSans[wght].ttf", 40 * F, 800); fr = font("SofiaSans[wght].ttf", 40 * F, 400)
d.text((152 * F, 74 * F), "Bayt", font=fb, fill=ENCRE)
bw = d.textlength("Bayt ", font=fb)
d.text((152 * F + bw, 74 * F), "Immobilier", font=fr, fill=ENCRE)

# titre
ft = font("SofiaSans[wght].ttf", 66 * F, 760)
lines = ["Appartements,", "villas et terrains", "à Alger et Oran"]
y = 190
for ln in lines:
    d.text((72 * F, y * F), ln, font=ft, fill=ENCRE); y += 74
ff = font("SofiaSans[wght].ttf", 28 * F, 500)
d.text((72 * F, (y + 18) * F), "Visites sur rendez-vous, réponse sur WhatsApp", font=ff, fill=PIERRE)

# plaques de rue
def plaque(x, y, name, ar):
    fl = font("SofiaSansCondensed[wght].ttf", 30 * F, 700)
    fa = font("NotoKufiArabic[wght].ttf", 19 * F, 500)
    tw = d.textlength(name.upper(), font=fl); aw = d.textlength(ar, font=fa, direction="rtl")
    w = max(tw * 1.0 + 0.07 * 30 * F * len(name), aw) / F + 40
    h = 74
    d.rounded_rectangle(R(x, y, x + w, y + h), radius=9 * F, fill=VOLET)
    d.rounded_rectangle(R(x + 5, y + 5, x + w - 5, y + h - 5), radius=6 * F, outline=WHITE, width=2 * F)
    # lettres espacées
    cx = x * F + (w * F - (tw + 0.07 * 30 * F * (len(name) - 1))) / 2
    for ch in name.upper():
        d.text((cx, (y + 11) * F), ch, font=fl, fill=WHITE); cx += d.textlength(ch, font=fl) + 0.07 * 30 * F
    d.text((x * F + (w * F - aw) / 2, (y + 40) * F), ar, font=fa, fill=WHITE, direction="rtl")
    return w
w1 = plaque(72, 532, "Hydra", "حيدرة")
plaque(72 + w1 + 16, 532, "Oran", "وهران")
im.resize((W, H), Image.LANCZOS).save(os.path.join(OUT, "og-image.jpg"), quality=86)
print("ok")
