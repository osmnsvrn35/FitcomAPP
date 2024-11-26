from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, ProgramViewSet,WorkoutProgramViewSet

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'workout-programs', WorkoutProgramViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
