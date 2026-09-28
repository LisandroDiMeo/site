import json
import argparse
import posixpath
import stat
from pathlib import Path
from datetime import datetime

MANIFEST_NAME = 'writing-index.json'
DEFAULT_EXCLUDES = ['Sueños', '.obsidian', '.trash']


def parse_front_matter(text):
    """Same minimal `key: value` parser as src/utils/frontMatter.js."""
    if not text.startswith('---\n'):
        return {}
    lines = text.split('\n')
    closing = next((i for i, line in enumerate(lines) if i > 0 and line.strip() == '---'), -1)
    if closing == -1:
        return {}
    meta = {}
    for line in lines[1:closing]:
        if ':' not in line:
            continue
        key, value = line.split(':', 1)
        key = key.strip()
        if key:
            meta[key] = value.strip()
    return meta


def split_list(value):
    return [item.strip() for item in (value or '').split(',') if item.strip()]


def scan_vault(local_dir, relative_path, excludes):
    """Recursively scan the vault. Only .md files, skipping excluded dirs and drafts."""
    node = {
        'path': relative_path,
        'files': [],
        'file_details': [],
        'subdirs': [],
        'children': {},
    }

    for entry in sorted(local_dir.iterdir(), key=lambda p: p.name):
        if entry.name.startswith('.') or entry.name in excludes:
            continue

        if entry.is_dir():
            child_relative = f'{relative_path}/{entry.name}' if relative_path else entry.name
            child = scan_vault(entry, child_relative, excludes)
            if child['total_articles'] > 0:
                node['subdirs'].append(entry.name)
                node['children'][entry.name] = child
        elif entry.is_file() and entry.suffix.lower() == '.md':
            text = entry.read_text(encoding='utf-8', errors='replace')
            meta = parse_front_matter(text)
            if meta.get('draft', '').lower() == 'true':
                print(f'  skip (draft): {relative_path}/{entry.name}')
                continue

            file_stat = entry.stat()
            file_relative = f'{relative_path}/{entry.name}' if relative_path else entry.name
            detail = {
                'name': entry.name,
                'path': file_relative,
                'size': file_stat.st_size,
                'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                'title': meta.get('title') or entry.stem,
                'category': meta.get('category'),
                'tags': split_list(meta.get('tags')),
                'note': meta.get('note'),
                # Date shown in the site; falls back to the file's mtime.
                'date': meta.get('modified') or datetime.fromtimestamp(file_stat.st_mtime).date().isoformat(),
            }
            node['files'].append(entry.name)
            node['file_details'].append(detail)

    node['article_count'] = len(node['files'])
    node['total_articles'] = node['article_count'] + sum(
        child['total_articles'] for child in node['children'].values()
    )
    return node


def collect_files(node):
    """Yield (relative_path, local_absolute_path_builder) for every article in the tree."""
    for detail in node['file_details']:
        yield detail['path']
    for child in node['children'].values():
        yield from collect_files(child)


def sync(args):
    vault = Path(args.vault).expanduser().resolve()
    if not vault.is_dir():
        raise SystemExit(f'Vault not found: {vault}')

    excludes = set(args.exclude) if args.exclude else set(DEFAULT_EXCLUDES)
    print(f'Vault: {vault}')
    print(f'Excluding: {sorted(excludes)}')

    structure = scan_vault(vault, '', excludes)
    structure['generated_at'] = datetime.now().isoformat()
    articles = sorted(collect_files(structure))
    print(f'Found {len(articles)} article(s)')

    if args.dry_run:
        for rel in articles:
            print(f'  would sync: {rel}')
        print(f'  would write: {args.remote_path}/{MANIFEST_NAME}')
        return

    import paramiko  # imported here so --dry-run works without it installed

    print(f'Connecting to {args.host} as {args.user}...')
    ssh =paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(args.host, username=args.user, password=args.password)
    sftp = ssh.open_sftp()
    print('Connected.')

    def mkdir_p(remote_dir):
        parts = remote_dir.strip('/').split('/')
        current = ''
        for part in parts:
            current = f'{current}/{part}'
            try:
                sftp.stat(current)
            except FileNotFoundError:
                sftp.mkdir(current)

    uploaded = skipped = 0
    mkdir_p(args.remote_path)

    for rel in articles:
        local_file = vault / rel
        remote_file = posixpath.join(args.remote_path, rel)
        local_stat = local_file.stat()
        local_mtime = int(local_stat.st_mtime)

        try:
            remote_stat = sftp.stat(remote_file)
            if remote_stat.st_size == local_stat.st_size and int(remote_stat.st_mtime) == local_mtime:
                skipped += 1
                continue
        except FileNotFoundError:
            pass

        mkdir_p(posixpath.dirname(remote_file))
        sftp.put(str(local_file), remote_file)
        # Keep the local mtime so the next run can tell the file is unchanged.
        sftp.utime(remote_file, (local_mtime, local_mtime))
        uploaded += 1
        print(f'  uploaded: {rel}')

    if args.prune:
        keep = set(articles)
        removed = prune_remote(sftp, args.remote_path, '', keep)
        print(f'Pruned {removed} remote file(s)')

    manifest_remote = posixpath.join(args.remote_path, MANIFEST_NAME)
    with sftp.open(manifest_remote, 'w') as remote_manifest:
        remote_manifest.write(json.dumps(structure, indent=2, ensure_ascii=False).encode('utf-8'))

    sftp.close()
    ssh.close()
    print('Connection closed.')
    print(f'Done: {uploaded} uploaded, {skipped} unchanged, manifest at {manifest_remote}')


def prune_remote(sftp, remote_base, relative, keep):
    """Delete remote .md files that no longer exist in the vault, then empty directories."""
    removed = 0
    remote_dir = posixpath.join(remote_base, relative) if relative else remote_base

    for entry in sftp.listdir_attr(remote_dir):
        entry_relative = f'{relative}/{entry.filename}' if relative else entry.filename
        entry_remote = posixpath.join(remote_dir, entry.filename)

        if stat.S_ISDIR(entry.st_mode):
            removed += prune_remote(sftp, remote_base, entry_relative, keep)
            if not sftp.listdir(entry_remote):
                sftp.rmdir(entry_remote)
        elif entry.filename.lower().endswith('.md') and entry_relative not in keep:
            sftp.remove(entry_remote)
            print(f'  removed: {entry_relative}')
            removed += 1

    return removed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Sync the Obsidian vault (.md only) to the NAS and publish writing-index.json'
    )
    parser.add_argument('--user', help='SSH username (not needed with --dry-run)')
    parser.add_argument('--password', help='SSH password (not needed with --dry-run)')
    parser.add_argument('--host', default='192.168.1.80', help='SSH host (default: 192.168.1.80)')
    parser.add_argument('--vault', default='~/Documents/Lecturas/lecturas', help='Local Obsidian vault path')
    parser.add_argument('--remote-path', default='/volume1/Web/writing', help='Remote path (default: /volume1/Web/writing)')
    parser.add_argument('--exclude', action='append', help=f'Directory name to skip, repeatable (default: {DEFAULT_EXCLUDES})')
    parser.add_argument('--prune', action='store_true', help='Delete remote .md files no longer in the vault')
    parser.add_argument('--dry-run', action='store_true', help='Only list what would be synced')
    parsed = parser.parse_args()

    if not parsed.dry_run and not (parsed.user and parsed.password):
        parser.error('--user and --password are required unless --dry-run')

    sync(parsed)
