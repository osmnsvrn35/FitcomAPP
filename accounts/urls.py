from . import views
from django.urls import path

urlpatterns = [
    path('register/', views.RegisterView.as_view(),name='register'),
    path('login/', views.LoginView.as_view(),name='login'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:id>/', views.UserDetailView.as_view(), name='user-detail'),
]
