import json

with open('./example_input/shirt.json', 'r', encoding='utf-8') as file:
    pattern = json.load(file)['pattern_json']

print(len(pattern['blocks']))

total_entities = 0
for es in pattern['blocks'].values():
    total_entities += len(es["entities"])

print(total_entities)
print(len(pattern['entities']))
