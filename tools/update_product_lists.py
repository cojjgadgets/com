import html
import os
import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"


@dataclass(frozen=True)
class Product:
    id: str
    name: str
    price: int
    image: str
    images: list[str]
    specs: str


PRODUCTS_TEXT = """
Qualcomm 3.0 Fast Charger – 999
Apple AirPods Pro 2 – 304500
LENYES S837 – 481170
Apple AirPods Pro 3 – 309920
S24 Ultra Privacy – 4725
Apple Type-C USB Cable – 21990
LENYES S835 – 299450
JBL Boombox 3 – 850000
Power Bank RPB – 30450
Wireless Charger – 29680
3-in-1 Magnetic Wireless Charger – 31500
Portable Universal – 27500
S25 Ultra Privacy – 6820
EPU Film HD/Matt – 6250
Back Film Black – 2000
S23 Plus Black – 8450
S22 Plus Black – 7500
S20 Black – 6250
S24 Plus Black – 12550

iPhone 360 Privacy – 7990
iPhone 360 Privacy – 8990
iPhone 360 Privacy – 9990
iPhone 360 Privacy – 10990
iPhone 360 Privacy – 11990
iPhone 360 Privacy – 12990

ROCK – 99750
Liquid Metal iPhone Case – 45500
Liquid Metal iPhone Case – 48250
Oneline Case iPhone – 37600
Oneline Case iPhone – 38600
Oneline Case iPhone – 45000

S22 Ultra Black – 7500
S10 Plus Black – 6250

iPhone AR Screen Protector – 7990
iPhone AR Screen Protector – 8990
iPhone AR Screen Protector – 9990
iPhone AR Screen Protector – 10990
iPhone AR Screen Protector – 11990
iPhone AR Screen Protector – 12990

ST102 Phone Holder – 49990
ST901A Tablet & Laptop Stand – 69990
Type-C Multifunction Hub – 42000
Apple Type-C to Lightning – 16990

IBAND Yellow – 4500
IBAND Light Blue – 4500
IBAND Ash Grey – 4500
IBAND Blue/Black – 4500
IBAND Light Grey – 4500

Leafless Hair Dryer – 22990
Premium Watch Band – 5489

KINGKOD 16 Pro Mini – 13990
KINGKOD 16 Pro – 13990

ROCK Type-C Cable – 3675
ROCK Type-C Lightning – 9990
ROCK Protection – 15739
ROCK Protection – 16789

KFSENIOR 5000mAh – 36289
KFSENIOR 10000mAh – 39589

Drone AE86 Pro – 605000
Drone B7 Pro – 275000

Samsung Note20 Black – 5990
Samsung S24 Black Full – 8990
Samsung S23 Black Full – 7990
Samsung S21 Plus Black – 7590

MAXCO Geometry – 36750
RECCI Wireless Headset – 46990

Apple Watch Ultra – 62500
Apple Watch Series – 26000
Apple Watch Series – 35700

Universal Stylus Pen – 21990
30W Adapter – 17536
30W USB-C Cable – 4189

Xiaomi Lite Mouse – 13485
MI Mouse – 18000
Xiaomi Mouse Black – 28336

Hair Ball Trimmer – 16485
Xiaomi Air 3 SE – 33000
Xiaomi Air 4 SE – 45000

OTG Multifunction – 13639
AirPod 4 – 19990
Apple USB-C 20W Adapter – 18000
Apple AirTag – 66000
Apple Magic Mouse – 135000
Soundcore – 109336
ROCK OWS Open Ear – 37800

DJI Mic Mini – 203300
Apple Magnetic Charger – 27500

Coteci Wireless Mic – 38400
Coteci Wireless Mic – 38400
Coteci Wireless Mic – 31188
Coteci Wireless Mic – 30708

Hair Dryer H300 – 39000
DJI RS 3 Mini – 480000
DJI RSC 2 – 380800
Apple 140W USB-C – 82500

MagSnap (Surya/Dione/Helios) – 25188
MagSnap (Surya/Dione/Helios) – 25289
MagSnap (Surya/Dione/Helios) – 28788
MagSnap (Surya/Dione/Helios) – 31200

Neck Massager – 45000
Smart Neck Massager – 117300
Handheld Electric Massager – 22500
Wireless Straightener – 46250
Eye Massager – 47490
Head Spa – 46290

Sandisk Ultra – 9350
Sandisk Ultra – 24990
Sandisk Ultra – 45490

1TB i-Flashdrive – 20000
i-Flashdrive HD – 18700
i-Flashdrive HD – 17600

Toshiba 1TB – 34800
Toshiba 2TB – 45600

DJI Osmo Mobile 6 – 245000
DJI Osmo SE – 220490

Travel Case Bag – 22500
AWEI 10000mAh – 19200
AWEI 5000mAh – 17900

iPhone Battery Pack – 50000
Apple Battery Pack – 25650

X-Crystal – 9000
X-Crystal – 18990
X-Crystal – 19990
X-Crystal – 20990
X-Crystal – 21500
X-Crystal – 22500
X-Crystal – 23750
X-Crystal – 24500
X-Crystal – 25490

Magnetic Tablet Stand – 50000
DSP HiFi Speaker – 87500

Motor Charger – 12000
Motor Charger – 32990
Motor Charger – 17500

65W Super Fast Charger – 39990

JBL Xtreme 3 – 475000
Meta Quest 2 – 747500
Apple World Travel Adapter – 106250
Onyx Studio 8 – 365500
PlayStation Portal – 479600
JBL Flip 6 – 149500
PlayStation DualSense – 105000
DualSense Charging Dock – 50400
Mortal Kombat 11 – 75000
FC25 – 145990

PlayStation 5 Console – 1125000
PS5 Pro 2TB – 1750000

PITAKA Accessories – 14950
PITAKA Accessories – 22500
PITAKA Accessories – 27500
PITAKA Accessories – 35200
PITAKA Accessories – 75750
PITAKA Accessories – 78750
PITAKA Accessories – 88000
PITAKA Accessories – 99990
PITAKA Accessories – 106250
PITAKA Accessories – 115000
PITAKA Accessories – 125000

AirPods Max – 28786
Encrypted Flash Drive 256GB – 69990
Encrypted Flash Drive 512GB – 99990

Apple Type-C Cable (Alt) – 59990
Protective Case – 42990
RECCI PD 65W – 15750

iPhone 16 Pro – 1890000
iPhone 16 Pro Max – 2236000
iPhone 15 – 1100000

Samsung S23 – 770000
Samsung S23 Ultra – 934500
Samsung S24 – 1050000
Samsung S24 Ultra – 1070000
Samsung S25 – 1260000
Samsung S25 Ultra – 1545000
Samsung Fold 6 – 1890000

HP Envy Laptop – 1950000
Dell XPS 13 – 3000000
HP Spectre x360 – 2875000
""".strip()


ALIAS_IMAGE_STEM = {
    "Apple AirPods Pro 2": "Apple AirPods Pro (2nd Gen)",
    "Apple AirPods Pro 3": "Apple AirPods Pro 3rd Gen",
    "AirPod 4": "AirPods 4",
    "LENYES S835": "Lenyes S835 Speaker",
    "LENYES S837": "Lenyes S837",
    "Power Bank RPB": "Power Bank RPB-P20",
    # Prefer the .jpg version; there is also a file with no extension.
    "Wireless Charger": "Wireless Charger Magnetics",
    "Apple Magnetic Charger": "Apple Magnetic Charging Cable",
    "Apple 140W USB-C": "140W Power USB C Adapter",
    "Apple USB-C 20W Adapter": "Apple 20W USB-C Adapter",
    "Apple Type-C to Lightning": "Apple Type C to Lightning Cable",
    "Type-C Multifunction Hub": "Type C Multifunction Hub",
    "OTG Multifunction": "OTG Multifunction Adapter",
    "Portable Universal": "Portable Universal USB Charger",
    "30W Adapter": "30W USB C Charger",
    "30W USB-C Cable": "30W USB C-C Cable",
    "MAXCO Geometry": "Maxco Geometry Wireless Charger",
    "DJI RSC 2": "DJI RSC 2 Gimbal",
    "DJI RS 3 Mini": "DJI RS 3 Mini Gimbal",
    "Drone AE86 Pro": "Drone AE86 Pro Max",
    "Drone B7 Pro": "Drone B7-Pro",
    "ROCK OWS Open Ear": "Rock OWS Open Ear Headphones",
    "Soundcore": "Soundcore Speaker",
}


def parse_products(text: str) -> list[tuple[str, int]]:
    items: list[tuple[str, int]] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or "–" not in line:
            continue
        name, price = [p.strip() for p in line.split("–", 1)]
        items.append((name, int(price.replace(",", ""))))

    # De-dupe exact duplicates, keeping first occurrence order
    seen: set[tuple[str, int]] = set()
    out: list[tuple[str, int]] = []
    for name, price in items:
        key = (name, price)
        if key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def guess_specs(name: str) -> str:
    n = name.lower()
    if any(
        k in n
        for k in [
            "airpods",
            "airpod",
            "headset",
            "speaker",
            "jbl",
            "mic",
            "soundcore",
            "open ear",
            "lenyes",
            "xiaomi air",
            "onyx studio",
        ]
    ):
        return "Premium audio accessory."
    if any(k in n for k in ["charger", "adapter", "cable", "usb", "type-c", "type c", "hub", "otg"]):
        return "Fast charging and connectivity accessory."
    if "power bank" in n or "mah" in n:
        return "Portable power bank."
    if any(k in n for k in ["privacy", "screen protector", "film", "crystal"]):
        return "Screen protection accessory."
    if any(k in n for k in ["case", "protective", "pitaka"]):
        return "Protective case accessory."
    if any(k in n for k in ["mouse", "stylus", "stand", "holder", "airtag"]):
        return "Device accessory."
    if any(k in n for k in ["watch", "band", "iband"]):
        return "Wearable accessory."
    if any(k in n for k in ["laptop", "xps", "spectre", "envy"]):
        return "Laptop computer."
    if any(k in n for k in ["playstation", "dualsense", "mortal kombat", "fc25", "meta quest"]):
        return "Gaming product."
    if any(k in n for k in ["drone", "dji", "osmo", "rs ", "rsc "]):
        return "Camera and creator gear."
    if any(k in n for k in ["toshiba", "sandisk", "flashdrive", "flash drive", "tb", "drive"]):
        return "Storage device."
    if any(k in n for k in ["massager", "hair", "straightener", "trimmer", "spa"]):
        return "Personal care device."
    return "Available at COJJ."


def is_audio(name: str) -> bool:
    n = name.lower()
    return any(
        k in n
        for k in [
            "airpods",
            "airpod",
            "headset",
            "speaker",
            "jbl",
            "mic",
            "soundcore",
            "open ear",
            "lenyes",
            "xiaomi air",
            "onyx studio",
        ]
    )


def build_image_index() -> dict[str, list[str]]:
    stems: dict[str, list[str]] = {}
    for file in IMAGES_DIR.iterdir():
        if not file.is_file():
            continue
        stem = re.sub(r"\.(jpg|jpeg|png|webp|gif)$", "", file.name, flags=re.I)
        stems.setdefault(stem.lower(), []).append(file.name)
    return stems


EXT_ORDER = [".jpg", ".jpeg", ".png", ".webp", ".gif"]


def _score_image(filename: str) -> tuple[int, int, int]:
    lower = filename.lower()
    ext = os.path.splitext(lower)[1]
    ext_score = EXT_ORDER.index(ext) if ext in EXT_ORDER else 99
    dash_score = 0 if re.search(r"-\d+\.", lower) is None else 10
    return (dash_score, ext_score, len(filename))


def pick_images(stems: dict[str, list[str]], name: str) -> tuple[str, list[str]]:
    # The project convention is:
    # - data-image uses the product's image name
    # - data-images uses the same name with "-1" and "-2"
    # We follow that convention for every product we add. If a matching file
    # isn't present yet, we still output the expected filename (so adding the
    # image later makes the site pick it up automatically).
    raw_stem = ALIAS_IMAGE_STEM.get(name, name)
    stem = raw_stem.lower()

    def pick_existing_or_default(stem_key: str, default_filename: str) -> str:
        candidates = stems.get(stem_key, [])
        candidates_with_ext = [c for c in candidates if os.path.splitext(c)[1].lower() in EXT_ORDER]
        if candidates_with_ext or candidates:
            return sorted(candidates_with_ext or candidates, key=_score_image)[0]
        return default_filename

    primary_file = pick_existing_or_default(stem, f"{raw_stem}.jpg")
    extra_1 = pick_existing_or_default(f"{stem}-1", f"{raw_stem}-1.jpg")
    extra_2 = pick_existing_or_default(f"{stem}-2", f"{raw_stem}-2.jpg")

    return (f"images/{primary_file}", [f"images/{extra_1}", f"images/{extra_2}"])


def load_existing_ids() -> dict[tuple[str, int], str]:
    existing: dict[tuple[str, int], str] = {}
    for path in [
        ROOT / "index.html",
        ROOT / "category-audio.html",
        ROOT / "category-accessories.html",
        ROOT / "category-iphones.html",
        ROOT / "category-samsung.html",
    ]:
        s = path.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'data-id="(p\d+)"[^>]*data-name="([^"]+)"[^>]*data-price="(\d+)', s):
            pid = m.group(1)
            # Names in HTML may contain entities (e.g. &amp;). Normalize so ids stay stable.
            name = html.unescape(m.group(2))
            price = int(m.group(3))
            existing.setdefault((name, price), pid)
    return existing


def alloc_id(existing_ids: dict[tuple[str, int], str], used_ids: set[str], name: str, price: int) -> str:
    key = (name, price)
    if key in existing_ids:
        return existing_ids[key]

    max_existing = max((int(pid[1:]) for pid in used_ids), default=317)
    next_id = max_existing + 1
    while f"p{next_id}" in used_ids:
        next_id += 1

    pid = f"p{next_id}"
    existing_ids[key] = pid
    used_ids.add(pid)
    return pid


def product_to_div(product: Product) -> str:
    extras = "|".join(product.images)
    return (
        f'<div data-product data-id="{html.escape(product.id, quote=True)}" '
        f'data-name="{html.escape(product.name, quote=True)}" '
        f'data-price="{product.price}" '
        f'data-image="{html.escape(product.image, quote=True)}" '
        f'data-images="{html.escape(extras, quote=True)}" '
        f'data-specs="{html.escape(product.specs, quote=True)}"></div>'
    )


def extract_product_divs(html_text: str) -> list[str]:
    return re.findall(r"<div\s+data-product\b[^>]*></div>", html_text)

def extract_div_id(div_html: str) -> str | None:
    m = re.search(r'\bdata-id="(p\d+)"', div_html)
    return m.group(1) if m else None


def replace_products_source(html_text: str, new_divs: list[str]) -> str:
    pattern = re.compile(
        r'(<div\s+id="productsSource"\s+hidden>\s*)([\s\S]*?)(\s*</div>\s*<div\s+id="productsGrid")',
        re.IGNORECASE,
    )
    m = pattern.search(html_text)
    if not m:
        raise RuntimeError("Could not find productsSource block")

    indent = re.search(r"\n([ \t]+)<div\s+data-product", m.group(2))
    pad = indent.group(1) if indent else "          "
    inner = "\n" + "\n".join(pad + d for d in new_divs) + "\n"
    return html_text[: m.start(2)] + inner + html_text[m.end(2) :]


def main() -> None:
    products = parse_products(PRODUCTS_TEXT)
    stems = build_image_index()
    existing_ids = load_existing_ids()
    used_ids = set(existing_ids.values())

    built: list[Product] = []
    for name, price in products:
        pid = alloc_id(existing_ids, used_ids, name, price)
        image, extras = pick_images(stems, name)
        built.append(
            Product(
                id=pid,
                name=name,
                price=price,
                image=image,
                images=extras,
                specs=guess_specs(name),
            )
        )

    all_divs = [product_to_div(p) for p in built]
    audio_divs = [product_to_div(p) for p in built if is_audio(p.name)]
    accessories_divs = [product_to_div(p) for p in built if not is_audio(p.name)]

    # index.html: keep existing products and append new list (dedupe by id; new list overwrites same id)
    index_path = ROOT / "index.html"
    index_html = index_path.read_text(encoding="utf-8", errors="ignore")
    existing_index_divs = extract_product_divs(index_html)
    index_by_id: dict[str, str] = {}
    ordered_ids: list[str] = []
    for div in existing_index_divs:
        pid = extract_div_id(div)
        if not pid:
            continue
        if pid not in index_by_id:
            ordered_ids.append(pid)
        index_by_id[pid] = div

    for div in all_divs:
        pid = extract_div_id(div)
        if not pid:
            continue
        if pid not in index_by_id:
            ordered_ids.append(pid)
        index_by_id[pid] = div

    combined = [index_by_id[pid] for pid in ordered_ids if pid in index_by_id]
    index_path.write_text(replace_products_source(index_html, combined), encoding="utf-8")

    # category pages: replace with relevant subset
    audio_path = ROOT / "category-audio.html"
    audio_html = audio_path.read_text(encoding="utf-8", errors="ignore")
    audio_path.write_text(replace_products_source(audio_html, audio_divs), encoding="utf-8")

    accessories_path = ROOT / "category-accessories.html"
    accessories_html = accessories_path.read_text(encoding="utf-8", errors="ignore")
    accessories_path.write_text(replace_products_source(accessories_html, accessories_divs), encoding="utf-8")

    print(f"Updated index products: {len(combined)}")
    print(f"Updated audio products: {len(audio_divs)}")
    print(f"Updated accessories products: {len(accessories_divs)}")


if __name__ == '__main__':
    main()
