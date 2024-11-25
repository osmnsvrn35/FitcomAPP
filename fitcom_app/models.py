import uuid
from django.db import models

# Create your models here.


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
    program_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name