from rest_framework.generics import ListAPIView
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseListView(ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
