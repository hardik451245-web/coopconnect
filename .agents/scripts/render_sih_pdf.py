import fitz
from pathlib import Path
src = Path('attached_assets/SIH26089_Updated_with_Additional_Features_Final_1790004172834.pdf')
out = Path('.agents/outputs/sih-pdf-pages')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
print(f'pages={doc.page_count}')
for idx, page in enumerate(doc):
    if idx in {0, 1, 5, 10, 11, 12, 13, 14}:
        pix = page.get_pixmap(matrix=fitz.Matrix(1.25, 1.25), alpha=False)
        path = out / f'page-{idx+1}.png'
        pix.save(path)
        print(path)
