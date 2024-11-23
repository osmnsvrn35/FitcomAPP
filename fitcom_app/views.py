from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import Exercise
from .serializers import ExerciseSerializer


class ExerciseListView(ListAPIView):
    """
    API View to list all Exercise objects.
    """

    permission_classes=[AllowAny]
    serializer_class = ExerciseSerializer
    queryset = Exercise.objects.all()

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
