from rest_framework import serializers
from .models import Exercise, WorkoutProgram,UserCustomWorkoutProgram,Post,Comment

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'
        ref_name = "WorkoutProgramExercise"


class UserCustomWorkoutProgramSerializer(serializers.ModelSerializer):
    schedule = ExerciseSerializer(many=True, read_only=True)
    schedule_ids = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), many=True, write_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = UserCustomWorkoutProgram
        fields = ['program_id', 'name', 'description', 'schedule', 'schedule_ids', 'level', 'user']
        read_only_fields = ['program_id', 'level']
        ref_name = "UserCustomExercise"

    def create(self, validated_data):
        schedule_ids = validated_data.pop('schedule_ids')
        custom_program = UserCustomWorkoutProgram.objects.create(**validated_data)
        custom_program.schedule.set(schedule_ids)
        custom_program.update_level()
        return custom_program

    def update(self, instance, validated_data):
        schedule_ids = validated_data.pop('schedule_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if schedule_ids:
            instance.schedule.set(schedule_ids)
        instance.update_level()
        return instance


class WorkoutProgramSerializer(serializers.ModelSerializer):
    schedule = ExerciseSerializer(many=True, read_only=True)
    schedule_ids = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), many=True, write_only=True)

    class Meta:
        model = WorkoutProgram
        fields = ['program_id', 'name', 'description', 'schedule', 'schedule_ids', 'level']
        read_only_fields = ['level']

    def create(self, validated_data):
        schedule_ids = validated_data.pop('schedule_ids')
        workout_program = WorkoutProgram.objects.create(**validated_data)
        workout_program.schedule.set(schedule_ids)

        workout_program.save()
        return workout_program

    def update(self, instance, validated_data):
        schedule_ids = validated_data.pop('schedule_ids', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if schedule_ids:
            instance.schedule.set(schedule_ids)

        instance.update_level()
        return instance


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['comment_id', 'author', 'content', 'timestamp']

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Post
        fields = ['post_id', 'author', 'title', 'content', 'timestamp', 'likes', 'comments']
