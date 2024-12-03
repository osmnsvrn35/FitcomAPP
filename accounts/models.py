from django.db import models
import uuid
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from fitcom_app.models import WorkoutProgram, UserCustomWorkoutProgram
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)



class User(AbstractUser):
    ACTIVITY_LEVEL_CHOICES = [
        ('Sedentary', 'Sedentary: little or no exercise'),
        ('Light', 'Light: exercise 1-3 times/week'),
        ('Moderate', 'Moderate: exercise 4-5 times/week'),
        ('Active', 'Active: daily exercise or intense exercise 3-4 times/week'),
        ('Very Active', 'Very Active: intense exercise 6-7 times/week'),
        ('Extra Active', 'Extra Active: very intense exercise daily, or physical job'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),

    ]

    email = models.EmailField(max_length=80, unique=True)
    username = models.CharField(max_length=45)
    weigth = models.FloatField(blank=False)
    height = models.FloatField(blank=False)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=False)
    userLevel = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, blank=True, null=True)
    profilePicture = models.URLField(max_length=200, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    saved_workout_programs = models.ManyToManyField(UserCustomWorkoutProgram, blank=True, related_name='saved_by_users')

    selected_program_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    selected_program_id = models.UUIDField(null=True, blank=True)
    selected_workout_program = GenericForeignKey('selected_program_type', 'selected_program_id')

    water_needs = models.FloatField(null=True, blank=True)
    kcal_needs = models.FloatField(null=True, blank=True)
    carbs_needs = models.FloatField(null=True, blank=True)
    protein_needs = models.FloatField(null=True, blank=True)
    fat_needs = models.FloatField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    def calculate_needs(self):
        if self.gender == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        elif self.gender == 'female':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age - 161

        activity_levels = {
            'Sedentary': 1.2,
            'Light': 1.375,
            'Moderate': 1.55,
            'Active': 1.725,
            'Very Active': 1.9,
            'Extra Active': 2.0
        }

        activity_factor = activity_levels.get(self.userLevel, 1.2)
        self.kcal_needs = round(bmr * activity_factor, 1)
        self.protein_needs = round(self.weight * 1.8, 1)
        self.fat_needs = round(self.kcal_needs * 0.25 / 9, 1)
        self.carbs_needs = round((self.kcal_needs - (self.protein_needs * 4 + self.fat_needs * 9)) / 4, 1)
        self.water_needs = round(self.weight * 0.033, 1)

        self.save()


class DailyUserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_progress')
    date = models.DateField(timezone.now())
    workout_completed = models.BooleanField(default=False)
    kcal_burned = models.FloatField(default=0.0)

    kcal_consumed = models.FloatField(default=0.0)
    protein_consumed = models.FloatField(default=0.0)
    carbs_consumed = models.FloatField(default=0.0)
    fat_consumed = models.FloatField(default=0.0)
    water_consumed = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}"

    def get_progress_vs_needs(self):

        user = self.user
        user.calculate_needs()
        return {
            'kcal_diff': round(self.kcal_consumed - user.kcal_needs, 1),
            'protein_diff': round(self.protein_consumed - user.protein_needs, 1),
            'carbs_diff': round(self.carbs_consumed - user.carbs_needs, 1),
            'fat_diff': round(self.fat_consumed - user.fat_needs, 1),
            'water_diff': round(self.water_consumed - user.water_needs, 1)
        }
