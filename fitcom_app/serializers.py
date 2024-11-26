from rest_framework import serializers
from .models import Exercise, Program, WorkoutProgram

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class WorkoutProgramSerializer(ProgramSerializer):
    schedule = ExerciseSerializer(many=True)

    class Meta:
        model = WorkoutProgram
        fields = '__all__'
        read_only_fields = ['level']

    def create(self, validated_data):
        exercises_data = validated_data.pop('schedule')

        workout_program = WorkoutProgram.objects.create(**validated_data)

        for exercise_data in exercises_data:
            exercise, created = Exercise.objects.get_or_create(**exercise_data)
            workout_program.schedule.add(exercise)
        workout_program.save()
        return workout_program

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('schedule')
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        instance.schedule.clear()
        for exercise_data in exercises_data:
            exercise, created = Exercise.objects.get_or_create(**exercise_data)
            instance.schedule.add(exercise)

        instance.update_level()
        return instance
