#!/usr/bin/env python3
"""
Parse all_cards.txt into cards.json
Delimiter: lines of dashes (66 chars)
Fields: ID, Name, Series, Description, Abilities, Cost, Power, Url
"""

import json
import os

def parse_cards(input_file, output_file):
    cards = []
    current_card = {}

    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()

            # Check for delimiter (line of dashes)
            if line.startswith('---') and len(line) >= 10:
                if current_card and 'id' in current_card:
                    cards.append(current_card)
                current_card = {}
                continue

            # Parse field lines
            if line.startswith('ID:'):
                current_card['id'] = line.split(':', 1)[1].strip()
            elif line.startswith('Name:'):
                current_card['name'] = line.split(':', 1)[1].strip()
            elif line.startswith('Series:'):
                current_card['series'] = line.split(':', 1)[1].strip()
            elif line.startswith('Description:'):
                current_card['description'] = line.split(':', 1)[1].strip()
            elif line.startswith('Abilities:'):
                abilities_str = line.split(':', 1)[1].strip()
                if abilities_str and abilities_str.lower() != 'no ability':
                    current_card['abilities'] = [a.strip() for a in abilities_str.split(',')]
                else:
                    current_card['abilities'] = []
            elif line.startswith('Cost:'):
                try:
                    current_card['cost'] = int(line.split(':', 1)[1].strip())
                except ValueError:
                    current_card['cost'] = 0
            elif line.startswith('Power:'):
                try:
                    current_card['power'] = int(line.split(':', 1)[1].strip())
                except ValueError:
                    current_card['power'] = 0
            elif line.startswith('Url:'):
                current_card['url'] = line.split(':', 1)[1].strip()
                # Fix URL (re-add the colon after http/https)
                if current_card['url'].startswith('//'):
                    current_card['url'] = 'https:' + current_card['url']
                elif not current_card['url'].startswith('http'):
                    current_card['url'] = 'https://' + current_card['url']

        # Don't forget the last card
        if current_card and 'id' in current_card:
            cards.append(current_card)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(cards)} cards to {output_file}")
    return cards

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)

    input_path = os.path.join(project_dir, 'all_cards.txt')
    output_path = os.path.join(project_dir, 'data', 'cards.json')

    parse_cards(input_path, output_path)
