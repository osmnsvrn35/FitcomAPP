from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .models import User,DailyUserProgress


# class DailyUserProgressTests(TestCase):

#     def setUp(self):
#         self.user = User.objects.create(
#             email="testuser@example.com",
#             username="testuser",
#             weight=70.0,
#             height=175.0,
#             gender="male",
#             userLevel="Moderate",
#             age=30
#         )
#         self.user.calculate_needs()

#         self.daily_progress = DailyUserProgress.objects.create(
#             user=self.user,
#             date='2024-12-02',
#             workout_completed=True,
#             kcal_burned=500.0,
#             kcal_consumed=2200.0,
#             protein_consumed=130.0,
#             carbs_consumed=300.0,
#             fat_consumed=70.0,
#             water_consumed=2.5
#         )

#     def test_daily_progress_creation(self):
#         self.assertEqual(self.daily_progress.user, self.user)
#         self.assertTrue(self.daily_progress.workout_completed)
#         self.assertEqual(self.daily_progress.kcal_burned, 500.0)
#         self.assertEqual(self.daily_progress.kcal_consumed, 2200.0)
#         self.assertEqual(self.daily_progress.protein_consumed, 130.0)
#         self.assertEqual(self.daily_progress.carbs_consumed, 300.0)
#         self.assertEqual(self.daily_progress.fat_consumed, 70.0)
#         self.assertEqual(self.daily_progress.water_consumed, 2.5)

#     def test_unique_together_constraint(self):
#         with self.assertRaises(Exception):
#             DailyUserProgress.objects.create(
#                 user=self.user,
#                 date='2024-12-02',
#                 workout_completed=False
#             )

#     def test_get_progress_vs_needs(self):
#         progress = self.daily_progress.get_progress_vs_needs()

#         expected_kcal_diff = round(self.daily_progress.kcal_consumed - self.user.kcal_needs, 1)
#         expected_protein_diff = round(self.daily_progress.protein_consumed - self.user.protein_needs, 1)
#         expected_carbs_diff = round(self.daily_progress.carbs_consumed - self.user.carbs_needs, 1)
#         expected_fat_diff = round(self.daily_progress.fat_consumed - self.user.fat_needs, 1)
#         expected_water_diff = round(self.daily_progress.water_consumed - self.user.water_needs, 1)

#         self.assertEqual(progress['kcal_diff'], expected_kcal_diff)
#         self.assertEqual(progress['protein_diff'], expected_protein_diff)
#         self.assertEqual(progress['carbs_diff'], expected_carbs_diff)
#         self.assertEqual(progress['fat_diff'], expected_fat_diff)
#         self.assertEqual(progress['water_diff'], expected_water_diff)

#     def test_ordering_by_date(self):
#         progress_older = DailyUserProgress.objects.create(
#             user=self.user,
#             date='2024-12-01',
#             workout_completed=True,
#             kcal_burned=400.0,
#             kcal_consumed=2100.0,
#             protein_consumed=120.0,
#             carbs_consumed=280.0,
#             fat_consumed=65.0,
#             water_consumed=2.2
#         )
#         progress_newer = DailyUserProgress.objects.create(
#             user=self.user,
#             date='2024-12-03',
#             workout_completed=True,
#             kcal_burned=550.0,
#             kcal_consumed=2300.0,
#             protein_consumed=140.0,
#             carbs_consumed=320.0,
#             fat_consumed=75.0,
#             water_consumed=2.7
#         )
#         progresses = DailyUserProgress.objects.all()
#         self.assertEqual(progresses[0], progress_newer)
#         self.assertEqual(progresses[1], self.daily_progress)
#         self.assertEqual(progresses[2], progress_older)



class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.logout_url = reverse('logout')

        self.user_data = {
            'email': 'testuser@example.com',
            'username': 'testuser',
            'password': 'testpassword123',
            'weight': 70.0,
            'height': 175.0,
            'gender': 'male',
            'userLevel': 'Moderate',
            'age': 30
        }

        self.existing_user = User.objects.create_user(
            email='existinguser@example.com',
            username='existinguser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            userLevel='Moderate',
            age=30
        )

    def test_register(self):

        new_user_data = self.user_data.copy()
        new_user_data['email'] = 'newuser@example.com'
        response = self.client.post(self.register_url, new_user_data, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_login(self):
        response = self.client.post(self.login_url, {
            'email': self.existing_user.email,
            'password': 'testpassword123'
        }, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_logout(self):

        response = self.client.post(self.login_url, {
            'email': self.existing_user.email,
            'password': 'testpassword123'
        }, format='json')
        print(response.data)
        self.assertIn('token', response.data)
        token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(key=token).exists())

if __name__ == "__main__":
    TestCase.main()

