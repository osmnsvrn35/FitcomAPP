from rest_framework import serializers
from rest_framework.validators import ValidationError
from .models import User
from rest_framework.authtoken.models import Token

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=80)
    username = serializers.CharField(max_length=45)
    password = serializers.CharField(min_length=8, write_only=True)
    weight = serializers.FloatField(required=False)
    height = serializers.FloatField(required=False)
    gender = serializers.CharField(max_length=10, required=False)
    userLevel = serializers.CharField(max_length=20, required=False)
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
        user.save()
        Token.objects.create(user=user)
        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'weight', 'height', 'gender', 'userLevel', 'profilePicture', 'age']
