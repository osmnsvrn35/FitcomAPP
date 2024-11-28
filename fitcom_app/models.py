import uuid
from django.db import models
from statistics import mean
from django.contrib.auth import get_user_model
from django.utils import timezone


class Level(models.TextChoices):
    BEGINNER = 'beginner', ('Beginner')
    INTERMEDIATE = 'intermediate', ('Intermediate')
    EXPERT = 'expert', ('Expert')

class Exercise(models.Model):
    exercise_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)
    name = models.CharField(max_length=200)
    body_part = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100)
    gif_url = models.URLField()
    target = models.CharField(max_length=100)
    secondary_muscles = models.JSONField(default=list)
    instructions = models.JSONField(default=list)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)

class AbstractWorkoutProgram(models.Model):
    program_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    name = models.CharField(max_length=255, default="")
    description = models.TextField(default="")
    schedule = models.ManyToManyField(Exercise)
    level = models.CharField(max_length=20, choices=Level.choices, editable=False)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)
        self.update_level()
        super().save(*args, **kwargs)

    def update_level(self):
        exercises = self.schedule.all()
        levels = [exercise.level for exercise in exercises]
        if levels:
            level_map = {'beginner': 0, 'intermediate': 1, 'expert': 2}
            numerical_levels = [level_map[lev] for lev in levels]
            avg_level = mean(numerical_levels)
            if avg_level <= 1:
                self.level = Level.BEGINNER
            elif avg_level <= 2:
                self.level = Level.INTERMEDIATE
            else:
                self.level = Level.EXPERT
        else:
            self.level = Level.BEGINNER

class WorkoutProgram(AbstractWorkoutProgram):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, null=True, blank=True)

class UserCustomWorkoutProgram(AbstractWorkoutProgram):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
