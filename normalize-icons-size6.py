#!/usr/bin/env python3
import os
import re
from pathlib import Path

def normalize_icon_sizes(content):
    """
    Normalize all icon sizes to size-5 (optimal visible size).
    This will replace all size classes with size-5.
    """
    modified = content
    
    # Replace all sizes with size-5
    modified = re.sub(r'\bsize-1\.5\b', 'size-5', modified)
    modified = re.sub(r'\bsize-1\b', 'size-5', modified)
    modified = re.sub(r'\bsize-2\.5\b', 'size-5', modified)
    modified = re.sub(r'\bsize-2\b', 'size-5', modified)
    modified = re.sub(r'\bsize-3\.5\b', 'size-5', modified)
    modified = re.sub(r'\bsize-3\b', 'size-5', modified)
    modified = re.sub(r'\bsize-4\b', 'size-5', modified)
    modified = re.sub(r'\bsize-6\b', 'size-5', modified)
    modified = re.sub(r'\bsize-7\b', 'size-5', modified)
    modified = re.sub(r'\bsize-8\b', 'size-5', modified)
    modified = re.sub(r'\bsize-9\b', 'size-5', modified)
    modified = re.sub(r'\bsize-10\b', 'size-5', modified)
    modified = re.sub(r'\bsize-11\b', 'size-5', modified)
    modified = re.sub(r'\bsize-12\b', 'size-5', modified)
    
    # Replace all custom rem sizes with size-5
    modified = re.sub(r'\bsize-\[[0-9.]+rem\]', 'size-5', modified)
    
    return modified

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = normalize_icon_sizes(content)
        
        if content != modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified)
            rel_path = os.path.relpath(file_path)
            print(f"✓ Updated: {rel_path}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def walk_directory(src_dir):
    """Walk through directory and process all TypeScript/JavaScript files"""
    files_modified = 0
    
    for root, dirs, files in os.walk(src_dir):
        # Skip node_modules, .next, and .git directories
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '.git')]
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                file_path = os.path.join(root, file)
                if process_file(file_path):
                    files_modified += 1
    
    return files_modified

def main():
    """Main function"""
    script_dir = Path(__file__).parent
    src_dir = script_dir / 'src'
    
    if not src_dir.exists():
        print(f"✗ Error: src directory not found at {src_dir}")
        return 1
    
    print("Normalizing all Material Icon sizes to size-5...\n")
    print("This will set ALL icons to size-5 (1.25rem / 20px) for optimal visibility.\n")
    
    count = walk_directory(src_dir)
    print(f"\n✓ Complete! Normalized {count} files.")
    print("\nAll Material Icons are now size-5 - consistent and perfectly sized!")
    return 0

if __name__ == '__main__':
    exit(main())
