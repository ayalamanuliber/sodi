#!/usr/bin/env python3

import csv
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from openpyxl import Workbook


SOURCE_PATH = Path("/Users/manuayala/Documents/Contactos/contactos_organizados.csv")
OUTPUT_DIR = Path("/Users/manuayala/projects/sodi/private/directorio")

PACKS = [
    {
        "slug": "inicial",
        "name": "Pack Inicial",
        "row_limit": 5000,
        "price_ars": 19900,
    },
    {
        "slug": "pro",
        "name": "Pack PRO",
        "row_limit": 12000,
        "price_ars": 34900,
    },
    {
        "slug": "completo",
        "name": "Pack Completo",
        "row_limit": None,
        "price_ars": 49900,
    },
]

DELIVERY_COLUMNS = [
    "name",
    "rubro",
    "email",
    "phone",
    "whatsapp",
    "best_outreach_number",
    "address",
    "city",
    "province",
    "website",
    "instagram",
    "facebook",
    "linkedin",
    "source",
    "lead_score",
    "lead_tier",
    "contact_channel",
]


def load_rows():
    with SOURCE_PATH.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return list(reader)


def write_csv(path: Path, rows: list[dict[str, str]]):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=DELIVERY_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in DELIVERY_COLUMNS})


def write_xlsx(path: Path, rows: list[dict[str, str]]):
    wb = Workbook()
    ws = wb.active
    ws.title = "Contactos"
    ws.append(DELIVERY_COLUMNS)
    for row in rows:
      ws.append([row.get(key, "") for key in DELIVERY_COLUMNS])
    wb.save(path)


def build_readme(pack: dict, row_count: int):
    return f"""# {pack['name']}

Archivo preparado para entrega automática desde SODI.

- Registros: {row_count}
- Formatos incluidos: CSV y XLSX
- Contacto mínimo por registro: mail o teléfono
- Muchos registros incluyen ambos

Columnas incluidas:
{", ".join(DELIVERY_COLUMNS)}
"""


def write_zip(path: Path, csv_path: Path, xlsx_path: Path, readme_text: str):
    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        archive.write(csv_path, arcname=csv_path.name)
        archive.write(xlsx_path, arcname=xlsx_path.name)
        archive.writestr("README.txt", readme_text)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = load_rows()
    manifest = {}

    for pack in PACKS:
        selected_rows = rows if pack["row_limit"] is None else rows[: pack["row_limit"]]
        csv_path = OUTPUT_DIR / f"{pack['slug']}.csv"
        xlsx_path = OUTPUT_DIR / f"{pack['slug']}.xlsx"
        zip_path = OUTPUT_DIR / f"{pack['slug']}.zip"

        write_csv(csv_path, selected_rows)
        write_xlsx(xlsx_path, selected_rows)
        readme_text = build_readme(pack, len(selected_rows))
        write_zip(zip_path, csv_path, xlsx_path, readme_text)

        manifest[pack["slug"]] = {
            "name": pack["name"],
            "row_count": len(selected_rows),
            "price_ars": pack["price_ars"],
            "zip_path": str(zip_path),
            "csv_path": str(csv_path),
            "xlsx_path": str(xlsx_path),
            "zip_size_bytes": zip_path.stat().st_size,
        }

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Packages built in {OUTPUT_DIR}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
