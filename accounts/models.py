from django.db import models
import uuid
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from fitcom_app.models import WorkoutProgram, UserCustomWorkoutProgram
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

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
    email = models.EmailField(max_length=80, unique=True)
    username = models.CharField(max_length=45)
    weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    userLevel = models.CharField(max_length=20, null=True, blank=True)
    profilePicture = models.URLField(max_length=200, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    saved_workout_programs = models.ManyToManyField(UserCustomWorkoutProgram, blank=True, related_name='saved_by_users')

    selected_program_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    selected_program_id = models.UUIDField(null=True, blank=True)
    selected_workout_program = GenericForeignKey('selected_program_type', 'selected_program_id')

    water_needs = models.FloatField(null=True, blank=True)
    kcal_needs = models.FloatField(null=True, blank=True)
    carbs_needs = models.FloatField(null=True,blank=True)
    protein_needs = models.FloatField(null=True, blank=True)
    fat_needs = models.FloatField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
