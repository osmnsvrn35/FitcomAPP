from rest_framework import viewsets,mixins
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAdminUser
from .models import Exercise, Program,WorkoutProgram
from .serializers import ExerciseSerializer, ProgramSerializer,WorkoutProgramSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

class ProgramViewSet(viewsets.GenericViewSet,mixins.ListModelMixin, mixins.DestroyModelMixin):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

class WorkoutProgramViewSet(viewsets.ModelViewSet):
    queryset = WorkoutProgram.objects.all()
    serializer_class = WorkoutProgramSerializer
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
