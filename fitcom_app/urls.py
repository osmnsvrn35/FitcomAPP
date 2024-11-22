from django.urls import path
from .views import ExerciseListView,UserRegistrationView, LoginView

urlpatterns = [
    path('exercises/', ExerciseListView.as_view()),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='login'),
]