import json
import random


with open('exercises.json', 'r') as file:
    data = json.load(file)
total_data = len(data)

num_beginner = int(total_data * 0.4)
num_intermediate = int(total_data * 0.4)
num_expert = total_data - num_beginner - num_intermediate

levels = ["Beginner"] * num_beginner + ["Intermediate"] * num_intermediate + ["Expert"] * num_expert
random.shuffle(levels)
for i in range(total_data):
    data[i]["level"] = levels[i]
with open('exercises.json', 'w') as file:
    json.dump(data, file, indent=4)

print("Updated JSON data has been saved to 'exercises.json'")
