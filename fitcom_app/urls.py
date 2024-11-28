from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet,WorkoutProgramViewSet,UserCustomWorkoutProgramViewSet,PostViewSet,CommentViewSet
from accounts.views import UserViewSet

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet)
router.register(r'workout-programs', WorkoutProgramViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'user-custom-workout-programs',UserCustomWorkoutProgramViewSet)
urlpatterns = [
    path('', include(router.urls)),
]
