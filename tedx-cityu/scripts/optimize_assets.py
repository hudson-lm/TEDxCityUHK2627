"""Create deterministic, web-sized copies of the production image assets.

Original files in src/Assets are never modified. Optimized derivatives are
written to src/AssetsOptimized and described in image-manifest.json.
"""

from __future__ import annotations

import json
import math
import shutil
from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT / "src" / "Assets"
OUTPUT_ROOT = PROJECT_ROOT / "src" / "AssetsOptimized"
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg"}


def target_widths(relative_path: Path) -> tuple[int, int]:
    normalized = relative_path.as_posix()
    if normalized.startswith("Members/"):
        return 400, 800
    if normalized.startswith("About/"):
        return 640, 1400
    if normalized.startswith("TeamCrew/"):
        return 768, 1600
    if normalized.startswith("Sponsor/"):
        return 360, 720
    if relative_path.name == "Event_details.png":
        return 720, 1600
    if relative_path.name == "pamphlet.png":
        return 720, 1200
    if relative_path.name == "TEDxTeam2025.png":
        return 960, 1920
    if relative_path.name.lower().startswith("background"):
        return 768, 1920
    if "MetamorphosisLogo" in relative_path.name:
        return 600, 1200
    return 640, 1400


def output_name(source: Path, variant: str) -> str:
    return f"{source.stem}-{variant}.webp"


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    width = min(width, image.width)
    height = max(1, round(image.height * width / image.width))
    if (width, height) == image.size:
        return image.copy()
    return image.resize((width, height), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, destination: Path, graphic: bool) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    image.save(
        destination,
        "WEBP",
        quality=88 if graphic else 82,
        method=6,
        exact=image.mode == "RGBA",
    )


def is_graphic(relative_path: Path, image: Image.Image) -> bool:
    name = relative_path.name.lower()
    return (
        image.mode in {"RGBA", "LA"}
        or "logo" in name
        or relative_path.as_posix().startswith("Sponsor/")
        or name in {"event_details.png", "pamphlet.png"}
    )


def optimize_standard(source: Path, relative_path: Path) -> dict[str, object]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        small_width, large_width = target_widths(relative_path)
        graphic = is_graphic(relative_path, image)
        variants: dict[str, dict[str, object]] = {}

        for label, width in (("sm", small_width), ("lg", large_width)):
            resized = resize_to_width(image, width)
            destination = OUTPUT_ROOT / relative_path.parent / output_name(source, label)
            save_webp(resized, destination, graphic)
            variants[label] = {
                "path": destination.relative_to(PROJECT_ROOT / "src").as_posix(),
                "width": resized.width,
                "height": resized.height,
                "bytes": destination.stat().st_size,
            }

        return {
            "source": relative_path.as_posix(),
            "sourceWidth": image.width,
            "sourceHeight": image.height,
            "sourceBytes": source.stat().st_size,
            "variants": variants,
        }


def optimize_past_events(source: Path, relative_path: Path) -> dict[str, object]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        source_slice_height = round(image.width * 2000 / 1600)
        tile_count = math.ceil(image.height / source_slice_height)
        tiles: list[dict[str, object]] = []

        for index in range(tile_count):
            top = index * source_slice_height
            bottom = min(image.height, (index + 1) * source_slice_height)
            source_tile = image.crop((0, top, image.width, bottom))
            variants: dict[str, dict[str, object]] = {}

            for label, width in (("sm", 720), ("lg", 1600)):
                resized = resize_to_width(source_tile, width)
                filename = f"{source.stem}-{index + 1:02d}-{label}.webp"
                destination = OUTPUT_ROOT / relative_path.parent / filename
                save_webp(resized, destination, graphic=True)
                variants[label] = {
                    "path": destination.relative_to(PROJECT_ROOT / "src").as_posix(),
                    "width": resized.width,
                    "height": resized.height,
                    "bytes": destination.stat().st_size,
                }

            tiles.append({"index": index + 1, "variants": variants})

        return {
            "source": relative_path.as_posix(),
            "sourceWidth": image.width,
            "sourceHeight": image.height,
            "sourceBytes": source.stat().st_size,
            "tiles": tiles,
        }


def main() -> None:
    if OUTPUT_ROOT.exists():
        resolved_output = OUTPUT_ROOT.resolve()
        expected_output = (PROJECT_ROOT / "src" / "AssetsOptimized").resolve()
        if resolved_output != expected_output:
            raise RuntimeError(f"Refusing to clear unexpected output path: {resolved_output}")
        shutil.rmtree(OUTPUT_ROOT)
    OUTPUT_ROOT.mkdir(parents=True)

    manifest: dict[str, object] = {"assets": {}, "pastEventTiles": []}

    for source in sorted(SOURCE_ROOT.rglob("*")):
        if not source.is_file() or source.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        relative_path = source.relative_to(SOURCE_ROOT)
        if relative_path.as_posix() == "PastEvents/TEDx Website Design.png":
            result = optimize_past_events(source, relative_path)
            manifest["pastEventTiles"] = result["tiles"]
            manifest["assets"][relative_path.as_posix()] = result
        else:
            manifest["assets"][relative_path.as_posix()] = optimize_standard(source, relative_path)

    manifest_path = OUTPUT_ROOT / "image-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    source_bytes = sum(item["sourceBytes"] for item in manifest["assets"].values())
    optimized_files = [path for path in OUTPUT_ROOT.rglob("*.webp")]
    optimized_bytes = sum(path.stat().st_size for path in optimized_files)
    print(
        json.dumps(
            {
                "sourceImages": len(manifest["assets"]),
                "optimizedFiles": len(optimized_files),
                "sourceMB": round(source_bytes / 1024 / 1024, 1),
                "optimizedMB": round(optimized_bytes / 1024 / 1024, 1),
                "reductionPercent": round((1 - optimized_bytes / source_bytes) * 100, 1),
                "manifest": str(manifest_path),
            }
        )
    )


if __name__ == "__main__":
    main()
