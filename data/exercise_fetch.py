import json
import requests

exerciseURL = "https://exercisedb.p.rapidapi.com/exercises?limit=1400&offset=0"
exerciseApiKey = "976d3a600emsh229ba70e1b0a779p1d783ajsna494cb0bf31b"

def fetchExercises(exerciseURL,exerciseApiKey):
    headers = {
        "x-rapidapi-key": exerciseApiKey
    }
    response = requests.get(exerciseURL, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching exercises: {response.status_code}")
        return None


execises_json = fetchExercises (exerciseURL, exerciseApiKey)

json_response = json.dumps(execises_json,indent=4)

with open("exercises.json", "w") as file:
    file.write(json_response)

