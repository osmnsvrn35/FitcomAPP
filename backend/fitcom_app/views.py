from django.shortcuts import render
from rest_framework.generics import ListAPIView
from .models import Exercise
from .serializers import ExerciseSerializer
# Create your views here.
class ExerciseListView(ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer