import uuid
from django.db import models
from statistics import mean

from django.forms import ValidationError
from django.utils import timezone


class Level(models.TextChoices):
    BEGINNER = 'Beginner', ('Beginner')
    INTERMEDIATE = 'Intermediate', ('Intermediate')
    EXPERT = 'Expert', ('Expert')

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

    def __str__(self):
        return self.name

    def clean(self):
        if self.level not in Level.values:
            raise ValidationError("Invalid level")

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
            level_map = {'Beginner': 0, 'Intermediate': 1, 'Expert': 2}
            numerical_levels = [level_map[lev] for lev in levels]
            avg_level = mean(numerical_levels)
            if avg_level <= 0.5:
                self.level = Level.BEGINNER
            elif avg_level <= 1.5:
                self.level = Level.INTERMEDIATE
            else:
                self.level = Level.EXPERT

class WorkoutProgram(AbstractWorkoutProgram):
    pass

class UserCustomWorkoutProgram(AbstractWorkoutProgram):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)

class Comment(models.Model):
    comment_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    author = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.timestamp}'


class Post(models.Model):
    post_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    author = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    likes = models.PositiveIntegerField(default=0)
    comments = models.ManyToManyField(Comment, related_name='post_comments', blank=True)

    def __str__(self):
        return self.title

    def like_post(self):
        self.likes += 1
        self.save()

    def add_comment(self, comment):
        self.comments.add(comment)
        self.save()

    def delete_comment(self, comment):
        self.comments.remove(comment)
        self.save()

