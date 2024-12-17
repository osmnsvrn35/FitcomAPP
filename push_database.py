import os
import sys
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fitcom_project.settings")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'fitcom_app')))
django.setup()
from fitcom_app.models import Exercise
exercise_data_url = os.path.join(os.path.dirname(__file__), 'exercises.json')
Exercise.objects.all().delete()

def get_exercises_fields(exercise_data):
    for exercise in exercise_data:
        exercise_instance = Exercise.objects.create(
            name=exercise["name"],
            body_part=exercise["bodyPart"],
            equipment=exercise["equipment"],
            gif_url=exercise["gifUrl"],
            target=exercise["target"],
            secondary_muscles=exercise["secondaryMuscles"],
            instructions=exercise["instructions"],
            level=exercise["level"]
        )
        print(f"Created exercise: {exercise_instance.name}")
if os.path.exists(exercise_data_url):
    with open(exercise_data_url, "r") as file:
        get_exercises_fields(json.load(file))
else:
    print(f"Error: {exercise_data_url} not found!")