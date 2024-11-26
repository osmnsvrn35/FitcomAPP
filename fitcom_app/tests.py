from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import User
from rest_framework.authtoken.models import Token

class GetExercisesTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword')
        self.token = Token.objects.create(user=self.user)

        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.exercises_url = reverse('exercises')

        response = self.client.post(self.login_url, {'email': 'testuser@example.com', 'password': 'testpassword'}, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_get_exercises_authenticated(self):

        response = self.client.get(self.exercises_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


        self.assertIsInstance(response.data, list)
