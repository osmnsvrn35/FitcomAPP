from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import Exercise, UserCustomWorkoutProgram, WorkoutProgram
from .serializers import ExerciseSerializer, UserCustomWorkoutProgramSerializer, WorkoutProgramSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

class WorkoutProgramViewSet(viewsets.ModelViewSet):
    queryset = WorkoutProgram.objects.all()
    serializer_class = WorkoutProgramSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return WorkoutProgram.objects.filter(user__in=[None, user])
        else:
            return WorkoutProgram.objects.filter(user=None)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def perform_create(self, serializer):
        workout_program = serializer.save(user=self.request.user)
        self.request.user.saved_workout_programs.add(workout_program)  # Save to user's profile




class WorkoutProgramViewSet(viewsets.ModelViewSet):
    queryset = WorkoutProgram.objects.all()
    serializer_class = WorkoutProgramSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()



class UserCustomWorkoutProgramViewSet(viewsets.ModelViewSet):
    queryset = UserCustomWorkoutProgram.objects.all()
    serializer_class = UserCustomWorkoutProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCustomWorkoutProgram.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
