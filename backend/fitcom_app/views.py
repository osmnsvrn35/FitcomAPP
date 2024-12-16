from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser,IsAuthenticatedOrReadOnly
from .models import Exercise, UserCustomWorkoutProgram, WorkoutProgram,Post,Comment
from .serializers import ExerciseSerializer, UserCustomWorkoutProgramSerializer, WorkoutProgramSerializer,PostSerializer,CommentSerializer

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
        if getattr(self, 'swagger_fake_view', False): return UserCustomWorkoutProgram.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-timestamp')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-timestamp')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        post = Post.objects.get(post_id=post_id)
        serializer.save(author=self.request.user)
        post.add_comment(serializer.instance)
