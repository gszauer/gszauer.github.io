#!/usr/bin/env python3
"""
Parse all_locations.txt into locations.json
Delimiter: lines of dashes (66 chars)
Fields: ID, Name, Description, Url
"""

import json
import os

def parse_locations(input_file, output_file):
    locations = []
    current_loc = {}

    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()

            # Check for delimiter (line of dashes)
            if line.startswith('---') and len(line) >= 10:
                if current_loc and 'id' in current_loc:
                    locations.append(current_loc)
                current_loc = {}
                continue

            # Parse field lines
            if line.startswith('ID:'):
                current_loc['id'] = line.split(':', 1)[1].strip()
            elif line.startswith('Name:'):
                current_loc['name'] = line.split(':', 1)[1].strip()
            elif line.startswith('Description:'):
                current_loc['description'] = line.split(':', 1)[1].strip()
            elif line.startswith('Url:'):
                current_loc['url'] = line.split(':', 1)[1].strip()
                # Fix URL (re-add the colon after http/https)
                if current_loc['url'].startswith('//'):
                    current_loc['url'] = 'https:' + current_loc['url']
                elif not current_loc['url'].startswith('http'):
                    current_loc['url'] = 'https://' + current_loc['url']

        # Don't forget the last location
        if current_loc and 'id' in current_loc:
            locations.append(current_loc)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(locations)} locations to {output_file}")
    return locations

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)

    input_path = os.path.join(project_dir, 'all_locations.txt')
    output_path = os.path.join(project_dir, 'data', 'locations.json')

    parse_locations(input_path, output_path)
