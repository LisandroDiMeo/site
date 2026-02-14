import os
import json
import argparse
import stat
import paramiko
from pathlib import Path, PurePosixPath
from datetime import datetime


def generate_file_index(ssh_user, ssh_password, ssh_host='192.168.0.147', remote_base='/volume1/Web/photos'):
    # Image extensions to include
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}

    # Images to omit
    photos_to_omit_list = []
    photos_to_omit_dirs = []
    with open("public/dont-show.json") as file_photos_to_omit:
        photos_to_omit = json.load(file_photos_to_omit)
        photos_to_omit_list = photos_to_omit["filtered"]
        photos_to_omit_dirs = photos_to_omit["filtered_dirs"]

    print(f"Omiting {photos_to_omit_list}")
    print(f"Omiting {photos_to_omit_dirs}")

    # Output path
    script_dir = Path(__file__).parent
    output_path = script_dir / 'public' / 'photo-index.json'

    # Connect via SSH/SFTP
    print(f"Connecting to {ssh_host} as {ssh_user}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ssh_host, username=ssh_user, password=ssh_password)
    sftp = ssh.open_sftp()
    print("Connected.")

    def get_file_info(remote_path, filename):
        """Get detailed information about a remote file"""
        try:
            file_stat = sftp.stat(remote_path)
            return {
                'name': filename,
                'size': file_stat.st_size,
                'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                'created': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
            }
        except (OSError, ValueError):
            return {
                'name': filename,
                'size': 0,
                'modified': None,
                'created': None
            }

    def read_directory(remote_dir):
        """Read remote directory and return files and subdirectories with details"""
        files = []
        file_details = []
        subdirs = []

        try:
            entries = sftp.listdir_attr(remote_dir)
        except FileNotFoundError:
            print(f'Remote directory not found: {remote_dir}')
            return {'files': [], 'subdirs': [], 'file_details': []}
        except PermissionError:
            print(f'Permission denied accessing: {remote_dir}')
            return {'files': [], 'subdirs': [], 'file_details': []}

        for entry in entries:
            if stat.S_ISDIR(entry.st_mode):
                if entry.filename not in photos_to_omit_dirs:
                    subdirs.append(entry.filename)
            elif stat.S_ISREG(entry.st_mode):
                suffix = PurePosixPath(entry.filename).suffix.lower()
                if suffix in image_extensions and entry.filename not in photos_to_omit_list:
                    files.append(entry.filename)
                    file_details.append({
                        'name': entry.filename,
                        'size': entry.st_size,
                        'modified': datetime.fromtimestamp(entry.st_mtime).isoformat(),
                        'created': datetime.fromtimestamp(entry.st_mtime).isoformat()
                    })

        return {
            'files': sorted(files),
            'subdirs': sorted(subdirs),
            'file_details': sorted(file_details, key=lambda x: x['name'])
        }

    def build_structure(remote_dir, relative_path=''):
        """Recursively build the directory structure"""
        dir_info = read_directory(remote_dir)
        structure = {
            'path': relative_path,
            'files': dir_info['files'],
            'file_details': dir_info['file_details'],
            'subdirs': dir_info['subdirs'],
            'children': {},
            'photo_count': len(dir_info['files'])
        }

        # Process subdirectories
        total_photos = len(dir_info['files'])
        for subdir in dir_info['subdirs']:
            subdir_remote = f"{remote_dir}/{subdir}"
            subdir_relative = f"{relative_path}/{subdir}" if relative_path else subdir
            child_structure = build_structure(subdir_remote, subdir_relative)
            structure['children'][subdir] = child_structure
            total_photos += child_structure.get('total_photos', 0)

        structure['total_photos'] = total_photos
        return structure

    # Generate the file structure
    print(f'Scanning remote directory: {ssh_host}:{remote_base}')
    file_structure = build_structure(remote_base)

    # Close SFTP/SSH
    sftp.close()
    ssh.close()
    print("Connection closed.")

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write the JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(file_structure, f, indent=2, ensure_ascii=False)

    print('Photo index generated successfully!')
    print(f'Output file: {output_path}')
    print(f'Root directories found: {file_structure["subdirs"]}')
    print(f'Total photos found: {file_structure["total_photos"]}')

    # Print directory breakdown
    for dirname, child in file_structure['children'].items():
        print(f'  {dirname}: {child["total_photos"]} photos')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate photo index from remote SSH/SFTP server')
    parser.add_argument('--user', required=True, help='SSH username')
    parser.add_argument('--password', required=True, help='SSH password')
    parser.add_argument('--host', default='192.168.0.147', help='SSH host (default: 192.168.0.147)')
    parser.add_argument('--remote-path', default='/volume1/Web/photos', help='Remote photos path (default: /volume1/Web/photos)')
    args = parser.parse_args()

    generate_file_index(args.user, args.password, args.host, args.remote_path)
