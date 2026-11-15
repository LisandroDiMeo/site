#!/usr/bin/env python3
"""Generate downscaled WebP copies of the photo library, meant to run on the NAS (cron).

For every photo under PHOTOS_ROOT it writes, next to the library:

    _derived/thumb/<relative path>.webp    long side 480px  (grid tiles, album covers)
    _derived/medium/<relative path>.webp   long side 2048px (in-page viewer)

The site requests these via config.getPhotoVariantUrl() and falls back to the original
when a variant is missing, so a photo added between runs still shows up.

Runs are incremental: a variant is (re)built only when missing or older than its source,
and variants whose source disappeared are deleted. With --index it also rewrites
photo-index.json (same format as generate-photo-directory.py), so uploading photos and
waiting for the next cron run is all it takes to publish them.

Requires Python 3.8+ and Pillow with WebP support.

    python3 generate-thumbnails.py --root /volume1/Web/photos --index
    python3 generate-thumbnails.py --root /volume1/Web/photos --only RicohSOC/2026/July --dry-run
"""
import argparse
import fcntl
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps

DERIVED_DIR = '_derived'
INDEX_NAME = 'photo-index.json'
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
VARIANTS = {
    # name: (long side px, WebP quality)
    'medium': (2048, 82),
    'thumb': (480, 70),
}

Image.MAX_IMAGE_PIXELS = 200_000_000  # large scans are legit; keep a ceiling anyway


def log(msg):
    print(f'[{datetime.now():%Y-%m-%d %H:%M:%S}] {msg}', flush=True)


def load_exclusions(path):
    if not path or not path.exists():
        return set(), set()
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except (ValueError, UnicodeDecodeError) as err:
        # Never fall back to "no exclusions": that would publish hidden albums.
        sys.exit(f'Invalid exclusions file {path} ({path.stat().st_size} bytes): {err}')
    return set(data.get('filtered', [])), set(data.get('filtered_dirs', []))


def is_photo(name):
    return not name.startswith('.') and Path(name).suffix.lower() in IMAGE_EXTENSIONS


def iter_photos(root, start, skip_files, skip_dirs):
    """Yield source photo paths under `start`, honouring the same exclusions as the index."""
    for dirpath, dirnames, filenames in os.walk(start):
        dirnames[:] = sorted(
            d for d in dirnames
            if not d.startswith(('_', '.', '@')) and d not in skip_dirs  # '@eaDir' etc. are NAS metadata
        )
        for name in sorted(filenames):
            if is_photo(name) and name not in skip_files:
                yield Path(dirpath) / name


def variant_path(root, src, variant):
    rel = src.relative_to(root)
    return root / DERIVED_DIR / variant / rel.parent / f'{rel.name}.webp'


def needs_build(src_mtime, dst):
    try:
        return dst.stat().st_mtime < src_mtime
    except FileNotFoundError:
        return True


def save_webp(img, dst, quality, src_mtime):
    dst.parent.mkdir(parents=True, exist_ok=True)
    tmp = dst.with_name(f'.{dst.name}.tmp')
    img.save(tmp, 'WEBP', quality=quality, method=4)
    os.utime(tmp, (src_mtime, src_mtime))
    os.replace(tmp, dst)  # atomic: nginx never serves a half-written file


def build_variants(root, src, dry_run):
    src_mtime = src.stat().st_mtime
    todo = {v: variant_path(root, src, v) for v in VARIANTS}
    todo = {v: p for v, p in todo.items() if needs_build(src_mtime, p)}
    if not todo or dry_run:
        return list(todo)

    with Image.open(src) as img:
        # JPEG draft mode decodes at a reduced scale: much faster and lighter on a NAS CPU.
        # Pillow only reduces the scale while both sides stay >= the requested box, so request
        # the aspect-correct box of the largest variant (not a square).
        largest = max(VARIANTS[v][0] for v in todo)
        w, h = img.size
        ratio = largest / max(w, h)
        if ratio < 1:
            img.draft('RGB', (round(w * ratio), round(h * ratio)))
        img = ImageOps.exif_transpose(img)
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if 'transparency' in img.info or img.mode in ('LA', 'P') else 'RGB')

        # Biggest first, each smaller one is derived from the previous result.
        for variant in sorted(todo, key=lambda v: -VARIANTS[v][0]):
            size, quality = VARIANTS[variant]
            img.thumbnail((size, size), Image.Resampling.LANCZOS)
            save_webp(img, todo[variant], quality, src_mtime)
    return list(todo)


def remove_orphans(root, start_rel, dry_run):
    removed = 0
    for variant in VARIANTS:
        base = root / DERIVED_DIR / variant
        scan = base / start_rel if start_rel else base
        if not scan.exists():
            continue
        for dirpath, _dirnames, filenames in os.walk(scan, topdown=False):
            for name in filenames:
                dst = Path(dirpath) / name
                if name.startswith('.') and name.endswith('.tmp'):
                    if not dry_run:
                        dst.unlink(missing_ok=True)  # leftover from an interrupted run
                    continue
                src = root / dst.relative_to(base).parent / name[:-len('.webp')]
                if not src.exists():
                    removed += 1
                    if not dry_run:
                        dst.unlink()
            if not dry_run and dirpath != str(base):
                try:
                    os.rmdir(dirpath)  # only succeeds when empty
                except OSError:
                    pass
    return removed


def build_index(root, skip_files, skip_dirs):
    """Same structure generate-photo-directory.py publishes, read from the local filesystem."""
    def details(path, name):
        st = path.stat()
        ts = datetime.fromtimestamp(st.st_mtime).isoformat()
        return {'name': name, 'size': st.st_size, 'modified': ts, 'created': ts}

    def walk(directory, relative):
        files, subdirs = [], []
        for entry in os.scandir(directory):
            if entry.is_dir(follow_symlinks=False):
                if entry.name not in skip_dirs and not entry.name.startswith(('_', '.', '@')):
                    subdirs.append(entry.name)
            elif entry.is_file() and is_photo(entry.name) and entry.name not in skip_files:
                files.append(entry.name)
        files.sort()
        subdirs.sort()
        node = {
            'path': relative,
            'files': files,
            'file_details': [details(Path(directory) / f, f) for f in files],
            'subdirs': subdirs,
            'children': {},
            'photo_count': len(files),
        }
        total = len(files)
        for sub in subdirs:
            child = walk(Path(directory) / sub, f'{relative}/{sub}' if relative else sub)
            node['children'][sub] = child
            total += child['total_photos']
        node['total_photos'] = total
        return node

    index = walk(root, '')
    index['generated_at'] = datetime.now().isoformat()
    return index


def write_index(root, index):
    """Write the index only when its content changed, so the ETag (and visitors' cached copy)
    stays valid across the hourly cron runs."""
    dst = root / INDEX_NAME
    try:
        previous = json.loads(dst.read_text(encoding='utf-8'))
        previous.pop('generated_at', None)
        if previous == {k: v for k, v in index.items() if k != 'generated_at'}:
            return False
    except (FileNotFoundError, ValueError):
        pass
    tmp = dst.with_name(f'.{INDEX_NAME}.tmp')
    tmp.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding='utf-8')
    os.replace(tmp, dst)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--root', default='/volume1/Web/photos', help='Photo library root (default: %(default)s)')
    parser.add_argument('--exclusions', default=None,
                        help='dont-show.json path (default: dont-show.json next to this script)')
    parser.add_argument('--only', default='', help='Restrict to a sub-path, e.g. RicohSOC/2026/July (for testing)')
    parser.add_argument('--index', action='store_true', help=f'Also rewrite {INDEX_NAME} in --root')
    parser.add_argument('--dry-run', action='store_true', help='Report what would change without writing')
    args = parser.parse_args()

    root = Path(args.root).resolve()
    exclusions = Path(args.exclusions) if args.exclusions else Path(__file__).with_name('dont-show.json')
    skip_files, skip_dirs = load_exclusions(exclusions)
    start = root / args.only if args.only else root
    if not start.is_dir():
        sys.exit(f'Not a directory: {start}')

    # One run at a time: the first full pass over the library can outlast the cron interval.
    lock = open(root / '.thumbs.lock', 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        log('Another run is in progress, exiting.')
        return

    started = time.monotonic()
    built = failed = seen = 0
    for src in iter_photos(root, start, skip_files, skip_dirs):
        seen += 1
        try:
            made = build_variants(root, src, args.dry_run)
            if made:
                built += 1
                log(f'{"would build" if args.dry_run else "built"} {",".join(made)}: {src.relative_to(root)}')
        except Exception as err:  # keep going: one corrupt file shouldn't stop the run
            failed += 1
            log(f'FAILED {src.relative_to(root)}: {err}')

    removed = remove_orphans(root, args.only, args.dry_run)

    if args.index and not args.dry_run:
        if write_index(root, build_index(root, skip_files, skip_dirs)):
            log(f'Wrote {root / INDEX_NAME}')
        else:
            log(f'{INDEX_NAME} unchanged')

    log(f'Done in {time.monotonic() - started:.0f}s: {seen} photos, {built} updated, '
        f'{failed} failed, {removed} orphan variants {"to remove" if args.dry_run else "removed"}.')


if __name__ == '__main__':
    main()
