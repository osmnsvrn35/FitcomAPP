import uuid
from django.db import models
from statistics import mean

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
    level = models.CharField(
        max_length=20,
        choices=Level.choices,
        default=Level.BEGINNER
    )

class Program(models.Model):
    program_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=50, editable=False)

    def save(self, *args, **kwargs):
        if not self.type:
            self.type = self.__class__.__name__
        super().save(*args, **kwargs)

class WorkoutProgram(Program):
    schedule = models.ManyToManyField(Exercise)
    level = models.CharField(max_length=20,
                             choices=Level.choices,
                             editable=False)

    def save(self, *args, **kwargs):

        if not self.pk:
            super().save(*args, **kwargs)
        self.update_level()
        super().save(*args, **kwargs)

    def update_level(self):
        exercises = self.schedule.all()
        levels = [exercise.level for exercise in exercises]
        if levels:

            level_map = {
                'beginner': 0,
                'intermediate': 1,
                'expert': 2
            }
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

    def add_exercise(self, exercise):
        self.schedule.add(exercise)
        self.update_level()
        self.save()

    def delete_exercise(self, exercise):
        self.schedule.remove(exercise)
        self.update_level()
        self.save()
