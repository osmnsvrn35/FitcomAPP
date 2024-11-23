from . import views
from django.urls import path

urlpatterns = [
    path('exercises/', views.ExerciseListView.as_view(),name='exercises')

]
