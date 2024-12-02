import json
import random
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fitcom_project.settings")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'fitcom_app')))
django.setup()
from fitcom_app.models import WorkoutProgram, Exercise
WorkoutProgram.objects.all().delete()
# Load exercises from exercises.json
with open('exercises.json', 'r') as file:
    exercises_data = json.load(file)

# Define muscle groups
muscle_groups = [
    "back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist"
]

# Organize exercises by muscle group
exercises = {muscle: [] for muscle in muscle_groups}
for exercise in exercises_data:
    body_part = exercise['bodyPart']
    if body_part in exercises:
        exercises[body_part].append(exercise)


def create_program():
    program = {}
    selected_muscle_groups = random.sample(muscle_groups, random.randint(3, 5))

    for muscle in selected_muscle_groups:
        num_exercises = random.randint(1, 2)
        for exercise in random.sample(exercises[muscle], num_exercises):
            program[exercise['name']] = {
                'bodyPart': exercise['bodyPart'],
                'equipment': exercise['equipment'],
                'gifUrl': exercise['gifUrl'],
                'id': exercise['id'],
                'target': exercise['target'],
                'secondaryMuscles': exercise['secondaryMuscles'],
                'instructions': exercise['instructions'],
                'level': exercise['level']
            }

    return program

programs = [create_program() for _ in range(50)]


for i, program in enumerate(programs):
    workout_program = WorkoutProgram(name=f"Random Program {random.randint(1, 1000000)}", description="A randomly generated workout program")
    workout_program.save()
    for exercise_name, details in program.items():
        exercises_qs = Exercise.objects.filter(name=exercise_name)
        if exercises_qs.exists():
            exercise = exercises_qs.first()
            workout_program.schedule.add(exercise)
    workout_program.save()


for i, program in enumerate(programs):
    print(f"Workout Program {i+1}:")
    for exercise_name, details in program.items():
        print(f"  {exercise_name}:")
        print(f"    - Body Part: {details['bodyPart']}")
        print(f"    - Equipment: {details['equipment']}")
        print(f"    - Target: {details['target']}")
        print(f"    - Secondary Muscles: {', '.join(details['secondaryMuscles'])}")
        print(f"    - Instructions: {' '.join(details['instructions'])}")
        print(f"    - Level: {details['level']}")
    print("\n")


with open('workout_programs.json', 'w') as file:
    json.dump(programs, file, indent=4)
