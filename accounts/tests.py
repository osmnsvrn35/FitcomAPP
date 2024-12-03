from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient,APITestCase
from rest_framework.authtoken.models import Token

from .serializers import LoginSerializer
from .models import User, DailyUserProgress


## User Model Unit Tests

class UserModelTests(TestCase):

    def test_create_user(self):
        user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            userLevel='Moderate',
            age=30
        )
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpassword123'))
        self.assertEqual(user.weight, 70.0)
        self.assertEqual(user.height, 175.0)
        self.assertEqual(user.gender, 'male')
        self.assertEqual(user.userLevel, 'Moderate')
        self.assertEqual(user.age, 30)

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='adminpassword123'
        )
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='adminpassword123',
            weight=70.0,
            height=175.0,
            gender='male'
        )
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)

    def test_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', username='testuser', password='testpassword123', weight=70.0, height=175.0, gender='male')


    def test_update_user_profile(self):
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male'
        )
        user.weight = 75.0
        user.height = 180.0
        user.save()
        updated_user = User.objects.get(id=user.id)
        self.assertEqual(updated_user.weight, 75.0)
        self.assertEqual(updated_user.height, 180.0)

    def test_user_token_creation(self):
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male'
        )
        token = Token.objects.create(user=user)
        self.assertIsNotNone(token)
        self.assertEqual(token.user, user)

    def test_calculate_needs(self):
        user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            userLevel='Moderate',
            age=30
        )
        user.calculate_needs()

        self.assertTrue(1500 < user.kcal_needs < 3500)
        self.assertTrue(50 < user.protein_needs < 200)
        self.assertTrue(150 < user.carbs_needs < 450)
        self.assertTrue(30 < user.fat_needs < 120)
        self.assertTrue(1.5 < user.water_needs < 4)

    def test_invalid_user_creation(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                username='testuser',
                password='testpassword123'
            )

    def test_user_str_representation(self):
        user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male'
        )
        self.assertEqual(str(user), 'testuser')


## DailyUserProgress Model Tests
# class DailyUserProgressTests(TestCase):

#     def setUp(self):
#         self.user = User.objects.create_user(
#             email="testuser@example.com",
#             username="testuser",
#             password="testpassword123",
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

#     def test_get_progress_vs_needs(self):
#         progress = self.daily_progress.get_progress_vs_needs()

#         self.assertIn('kcal_diff', progress)
#         self.assertIn('protein_diff', progress)
#         self.assertIn('carbs_diff', progress)
#         self.assertIn('fat_diff', progress)
#         self.assertIn('water_diff', progress)

#         self.assertEqual(progress['kcal_diff'], round(self.daily_progress.kcal_consumed - self.user.kcal_needs, 1))
#         self.assertEqual(progress['protein_diff'], round(self.daily_progress.protein_consumed - self.user.protein_needs, 1))
#         self.assertEqual(progress['carbs_diff'], round(self.daily_progress.carbs_consumed - self.user.carbs_needs, 1))
#         self.assertEqual(progress['fat_diff'], round(self.daily_progress.fat_consumed - self.user.fat_needs, 1))
#         self.assertEqual(progress['water_diff'], round(self.daily_progress.water_consumed - self.user.water_needs, 1))

#     def test_daily_progress_str_representation(self):
#         expected_str = f"{self.user.username}'s progress on 2024-12-02"
#         self.assertEqual(str(self.daily_progress), expected_str)

#     def test_daily_progress_ordering(self):
#         DailyUserProgress.objects.create(
#             user=self.user,
#             date='2024-12-01',
#             workout_completed=True
#         )
#         DailyUserProgress.objects.create(
#             user=self.user,
#             date='2024-12-03',
#             workout_completed=True
#         )

#         progresses = DailyUserProgress.objects.all()
#         self.assertEqual(progresses[0].date.strftime('%Y-%m-%d'), '2024-12-03')
#         self.assertEqual(progresses[2].date.strftime('%Y-%m-%d'), '2024-12-01')

## Login Unit tests


# class LoginSerializerTests(TestCase):

#     def test_valid_data(self):
#         data = {'email': 'user@example.com', 'password': 'password123'}
#         serializer = LoginSerializer(data=data)
#         self.assertTrue(serializer.is_valid(), "Serializer should be valid with correct data")
#         self.assertEqual(serializer.validated_data, data, "Validated data should match the input data")

#     def test_missing_email(self):
#         data = {'password': 'password123'}
#         serializer = LoginSerializer(data=data)
#         self.assertFalse(serializer.is_valid(), "Serializer should be invalid if email is missing")
#         self.assertIn('email', serializer.errors, "Errors should contain 'email' field")

#     def test_missing_password(self):
#         data = {'email': 'user@example.com'}
#         serializer = LoginSerializer(data=data)
#         self.assertFalse(serializer.is_valid(), "Serializer should be invalid if password is missing")
#         self.assertIn('password', serializer.errors, "Errors should contain 'password' field")

#     def test_invalid_email_format(self):
#         data = {'email': 'userexample.com', 'password': 'password123'}
#         serializer = LoginSerializer(data=data)
#         self.assertFalse(serializer.is_valid(), "Serializer should be invalid if email format is incorrect")
#         self.assertIn('email', serializer.errors, "Errors should contain 'email' field")


# class LoginViewTests(APITestCase):

#     def setUp(self):
#         self.user = User.objects.create_user(
#             email='user@example.com',
#             username='user',
#             password='password123',
#             weight=70.0,
#             height=175.0,
#             gender='male',
#             userLevel='Moderate',
#             age=30
#         )
#         self.url = reverse('auth_login')

#     def test_login_success(self):
#         data = {'email': self.user.email, 'password': 'password123'}
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "Should return 200 OK on successful login")
#         self.assertIn('token', response.data, "Response should include a token")
#         self.assertTrue(Token.objects.filter(key=response.data['token']).exists(), "Token should exist in the database")

#     def test_login_invalid_credentials(self):
#         data = {'email': self.user.email, 'password': 'wrongpassword'}
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Should return 401 Unauthorized for invalid credentials")
#         self.assertIn('error', response.data, "Response should include an error message")

#     def test_login_missing_email(self):
#         data = {'password': 'password123'}
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Should return 400 Bad Request if email is missing")
#         self.assertIn('email', response.data, "Response should include an email error message")

#     def test_login_missing_password(self):
#         data = {'email': 'user@example.com'}
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Should return 400 Bad Request if password is missing")
#         self.assertIn('password', response.data, "Response should include a password error message")



# class DailyUserProgressTests(TestCase):

    # def setUp(self):
    #     self.user = User.objects.create(
    #         email="testuser@example.com",
    #         username="testuser",
    #         weight=70.0,
    #         height=175.0,
    #         gender="male",
    #         userLevel="Moderate",
    #         age=30
    #     )
    #     self.user.calculate_needs()

    #     self.daily_progress = DailyUserProgress.objects.create(
    #         user=self.user,
    #         date='2024-12-02',
    #         workout_completed=True,
    #         kcal_burned=500.0,
    #         kcal_consumed=2200.0,
    #         protein_consumed=130.0,
    #         carbs_consumed=300.0,
    #         fat_consumed=70.0,
    #         water_consumed=2.5
    #     )

    # def test_daily_progress_creation(self):
    #     self.assertEqual(self.daily_progress.user, self.user, "The user linked to DailyUserProgress should be correct")
    #     self.assertTrue(self.daily_progress.workout_completed, "Workout should be marked as completed")
    #     self.assertEqual(self.daily_progress.kcal_burned, 500.0, "Calories burned should match")
    #     self.assertEqual(self.daily_progress.kcal_consumed, 2200.0, "Calories consumed should match")
    #     self.assertEqual(self.daily_progress.protein_consumed, 130.0, "Protein consumed should match")
    #     self.assertEqual(self.daily_progress.carbs_consumed, 300.0, "Carbohydrates consumed should match")
    #     self.assertEqual(self.daily_progress.fat_consumed, 70.0, "Fat consumed should match")
    #     self.assertEqual(self.daily_progress.water_consumed, 2.5, "Water consumed should match")

    # def test_unique_together_constraint(self):
    #     with self.assertRaises(Exception, msg="Creating a DailyUserProgress with the same user and date should raise an Exception"):
    #         DailyUserProgress.objects.create(
    #             user=self.user,
    #             date='2024-12-02',
    #             workout_completed=False
    #         )

    # def test_get_progress_vs_needs(self):
    #     progress = self.daily_progress.get_progress_vs_needs()

    #     expected_kcal_diff = round(self.daily_progress.kcal_consumed - self.user.kcal_needs, 1)
    #     expected_protein_diff = round(self.daily_progress.protein_consumed - self.user.protein_needs, 1)
    #     expected_carbs_diff = round(self.daily_progress.carbs_consumed - self.user.carbs_needs, 1)
    #     expected_fat_diff = round(self.daily_progress.fat_consumed - self.user.fat_needs, 1)
    #     expected_water_diff = round(self.daily_progress.water_consumed - self.user.water_needs, 1)

    #     self.assertEqual(progress['kcal_diff'], expected_kcal_diff, "Calories difference should match the expected value")
    #     self.assertEqual(progress['protein_diff'], expected_protein_diff, "Protein difference should match the expected value")
    #     self.assertEqual(progress['carbs_diff'], expected_carbs_diff, "Carbohydrates difference should match the expected value")
    #     self.assertEqual(progress['fat_diff'], expected_fat_diff, "Fat difference should match the expected value")
    #     self.assertEqual(progress['water_diff'], expected_water_diff, "Water difference should match the expected value")

    # def test_ordering_by_date(self):
    #     progress_older = DailyUserProgress.objects.create(
    #         user=self.user,
    #         date='2024-12-01',
    #         workout_completed=True,
    #         kcal_burned=400.0,
    #         kcal_consumed=2100.0,
    #         protein_consumed=120.0,
    #         carbs_consumed=280.0,
    #         fat_consumed=65.0,
    #         water_consumed=2.2
    #     )
    #     progress_newer = DailyUserProgress.objects.create(
    #         user=self.user,
    #         date='2024-12-03',
    #         workout_completed=True,
    #         kcal_burned=550.0,
    #         kcal_consumed=2300.0,
    #         protein_consumed=140.0,
    #         carbs_consumed=320.0,
    #         fat_consumed=75.0,
    #         water_consumed=2.7
    #     )
    #     progresses = DailyUserProgress.objects.all()
    #     self.assertEqual(progresses[0], progress_newer, "Latest progress entry should be first")
    #     self.assertEqual(progresses[1], self.daily_progress, "Current progress entry should be second")
    #     self.assertEqual(progresses[2], progress_older, "Oldest progress entry should be last")


# class AuthTests(TestCase):

#     def setUp(self):
#         self.client = APIClient()
#         self.register_url = reverse('auth_register')
#         self.login_url = reverse('auth_login')
#         self.logout_url = reverse('logout')

#         self.user_data = {
#             'email': 'testuser@example.com',
#             'username': 'testuser',
#             'password': 'testpassword123',
#             'weight': 70.0,
#             'height': 175.0,
#             'gender': 'male',
#             'userLevel': 'Moderate',
#             'age': 30
#         }

#         self.existing_user = User.objects.create_user(
#             email='existinguser@example.com',
#             username='existinguser',
#             password='testpassword123',
#             weight=70.0,
#             height=175.0,
#             gender='male',
#             userLevel='Moderate',
#             age=30
#         )

#     def test_register(self):
#         new_user_data = self.user_data.copy()
#         new_user_data['email'] = 'newuser@example.com'
#         response = self.client.post(self.register_url, new_user_data, format='json')
#         print(response.data)
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED, "User should be registered successfully")
#         self.assertEqual(User.objects.count(), 2, "There should be two users in the database")

#     def test_login(self):
#         response = self.client.post(self.login_url, {
#             'email': self.existing_user.email,
#             'password': 'testpassword123'
#         }, format='json')
#         print(response.data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "User should be able to log in with correct credentials")
#         self.assertIn('token', response.data, "Response should include a token")

#     def test_logout(self):
#         response = self.client.post(self.login_url, {
#             'email': self.existing_user.email,
#             'password': 'testpassword123'
#         }, format='json')
#         print(response.data)
#         self.assertIn('token', response.data, "Login response should include a token")
#         token = response.data['token']
#         self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
#         response = self.client.post(self.logout_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "User should be able to log out successfully")
#         self.assertFalse(Token.objects.filter(key=token).exists(), "Token should be deleted after logout")


# class UserViewSetTests(TestCase):

#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_superuser(
#             email='admin@example.com',
#             username='admin',
#             password='adminpassword',
#             weight=70.0,
#             height=175.0,
#             gender='male',
#             userLevel='Moderate',
#             age=30
#         )
#         self.token = Token.objects.create(user=self.user)
#         self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
#         self.user_url = '/api/users/'
#         self.user_detail_url = lambda pk: f'/api/users/{pk}/'

#     def test_get_user_list(self):
#         response = self.client.get(self.user_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin should be able to get the user list")
#         self.assertIsInstance(response.data, list, "Response should be a list")
#         self.assertGreater(len(response.data), 0, "Response list should contain users")


#     def test_get_user_detail(self):
#         response = self.client.get(self.user_detail_url(self.user.pk))
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin should be able to get user details")
#         self.assertEqual(response.data['email'], self.user.email, "User email should match")

#     def test_create_user(self):
#         user_data = {
#             'email': 'newuser2@example.com',
#             'username': 'newuser2',
#             'password': 'newpassword123',
#             'weight': 70.0,
#             'height': 175.0,
#             'gender': 'male',
#             'userLevel': 'Moderate',
#             'age': 30
#         }
#         response = self.client.post(self.user_url, user_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED, "Admin should be able to create a new user")
#         self.assertIn('id', response.data, "Response should contain the user's ID")

#     def test_update_user(self):
#         user_data = {
#             'email': 'updateduser@example.com',
#             'username': 'updateduser',
#             'password': 'newpassword123',
#             'weight': 75.0,
#             'height': 180.0,
#             'gender': 'male',
#             'userLevel': 'Active',
#             'age': 31
#         }
#         response = self.client.put(self.user_detail_url(self.user.pk), user_data, format='json')
#         print(response.data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin should be able to update user details")
#         self.assertEqual(response.data['email'], user_data['email'], "Updated email should match the new value")


#     def test_delete_user(self):
#         response = self.client.delete(self.user_detail_url(self.user.pk))
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, "Admin should be able to delete a user")
#         self.assertFalse(User.objects.filter(pk=self.user.pk).exists(), "User should be deleted from the database")


if __name__ == "__main__":
    TestCase.main()
