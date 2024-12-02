# serializers.py

from rest_framework import serializers
from rest_framework.validators import ValidationError
from .models import User
from rest_framework.authtoken.models import Token
from fitcom_app.models import WorkoutProgram
from django.contrib.contenttypes.models import ContentType

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=80)
    username = serializers.CharField(max_length=45)
    password = serializers.CharField(min_length=8, write_only=True)
    weight = serializers.FloatField(required=True)
    height = serializers.FloatField(required=True)
    gender = serializers.ChoiceField(choices=User.GENDER_CHOICES, required=True)  # Updated
    userLevel = serializers.ChoiceField(choices=User.ACTIVITY_LEVEL_CHOICES, required=False)
    profilePicture = serializers.URLField(required=False)
    age = serializers.IntegerField(required=False)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'weight', 'height', 'gender', 'userLevel', 'profilePicture', 'age']

    def validate(self, attrs):
        email_exists = User.objects.filter(email=attrs['email']).exists()
        if email_exists:
            raise ValidationError('Email already exists.')
        return super().validate(attrs)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = super().create(validated_data)
        user.set_password(password)
        user.calculate_needs()
        user.save()
        Token.objects.create(user=user)

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    selected_workout_program = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'weight', 'height', 'gender', 'userLevel', 'profilePicture',
            'age', 'saved_workout_programs', 'selected_workout_program'
        ]

    def get_selected_workout_program(self, obj):
        if obj.selected_workout_program:
            return {
                "program_id": obj.selected_workout_program.pk,
                "program_type": ContentType.objects.get_for_model(obj.selected_workout_program).model,
            }
        return None
