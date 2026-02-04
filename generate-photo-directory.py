import os
import json
from pathlib import Path
from datetime import datetime

def generate_file_index():
    # Image extensions to include
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}

    # Images to omit
    photos_to_omit_list = []
    with open("public/dont-show.json") as file_photos_to_omit:
        photos_to_omit = json.load(file_photos_to_omit)
        photos_to_omit_list = photos_to_omit["filtered"]

    print(f"Omiting {photos_to_omit_list}")

    # Path to your assets directory
    script_dir = Path(__file__).parent
    assets_path = script_dir / 'public' / 'assets' / 'photos'
    output_path = script_dir / 'public' / 'photo-index.json'

    def get_file_info(file_path):
        """Get detailed information about a file"""
        try:
            stat = file_path.stat()
            return {
                'name': file_path.name,
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'created': datetime.fromtimestamp(stat.st_ctime).isoformat()
            }
        except (OSError, ValueError):
            return {
                'name': file_path.name,
                'size': 0,
                'modified': None,
                'created': None
            }

    def read_directory(dir_path):
        """Read directory and return files and subdirectories with details"""
        if not dir_path.exists():
            print(f'Assets directory not found: {dir_path}')
            return {'files': [], 'subdirs': [], 'file_details': []}

        files = []
        file_details = []
        subdirs = []

        try:
            for item in dir_path.iterdir():
                if item.is_dir():
                    subdirs.append(item.name)
                elif item.is_file():
                    # Only include image files
                    if item.suffix.lower() in image_extensions and item.name not in photos_to_omit_list:
                        files.append(item.name)
                        file_details.append(get_file_info(item))
        except PermissionError:
            print(f'Permission denied accessing: {dir_path}')
            return {'files': [], 'subdirs': [], 'file_details': []}

        return {
            'files': sorted(files),
            'subdirs': sorted(subdirs),
            'file_details': sorted(file_details, key=lambda x: x['name'])
        }

    def build_structure(dir_path, relative_path=''):
        """Recursively build the directory structure"""
        dir_info = read_directory(dir_path)
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
            subdir_path = dir_path / subdir
            subdir_relative = f"{relative_path}/{subdir}" if relative_path else subdir
            child_structure = build_structure(subdir_path, subdir_relative)
            structure['children'][subdir] = child_structure
            total_photos += child_structure.get('total_photos', 0)

        structure['total_photos'] = total_photos
        return structure

    # Generate the file structure
    print(f'Scanning directory: {assets_path}')
    file_structure = build_structure(assets_path)

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
        print(f'  📁 {dirname}: {child["total_photos"]} photos')

if __name__ == '__main__':
    generate_file_index()