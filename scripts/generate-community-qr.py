"""Generate the community QR assets; requires qrcode and Pillow."""
from pathlib import Path
import re
import qrcode
from qrcode.image.svg import SvgPathFillImage

root = Path(__file__).resolve().parent.parent
source = (root / "src/community.ts").read_text()
url = re.search(r"export const communityUrl = '([^']+)'", source).group(1)
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=4)
qr.add_data(url)
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save(root / "public/community-qr.png")
qr.make_image(image_factory=SvgPathFillImage).save(root / "public/community-qr.svg")
