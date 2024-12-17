from django.utils import timezone
from django.test import TestCase
from django.urls import reverse
from jsonschema import ValidationError
from rest_framework import status
from rest_framework.test import APIClient,APITestCase
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from django.contrib.contenttypes.models import ContentType
from fitcom_app.models import UserCustomWorkoutProgram
from .serializers import LoginSerializer
from .models import User, DailyUserProgress
from rest_framework.test import APITestCase


## User Model Unit Tests

class UserModelTests(TestCase):

    # Test creating a new user
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

    def test_duplicate_email(self):
        User.objects.create_user(email='testuser@example.com', username='testuser1', password='testpassword123', weight=70.0, height=175.0, gender='male')
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')


    def test_password_hashing(self):
        user = User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')
        self.assertNotEqual(user.password, 'testpassword123')
        self.assertTrue(user.check_password('testpassword123'))

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='adminpassword123',

        )
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)

    def test_calculate_needs_variations(self):
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
        initial_kcal = user.kcal_needs

        user.gender = 'female'
        user.calculate_needs()
        self.assertNotEqual(initial_kcal, user.kcal_needs)

        user.userLevel = 'Very Active'
        user.calculate_needs()
        self.assertGreater(user.kcal_needs, initial_kcal)

    def test_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', username='testuser', password='testpassword123', weight=70.0, height=175.0, gender='male')

    #Testing updating a user's profile
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

    #Test token creation for a user
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

    #test retrieving a user's daily progress
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

    # Test many-to-many relationship with UserCustomWorkoutProgram
    def test_saved_workout_programs(self):
        user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male'
        )
        program = UserCustomWorkoutProgram.objects.create(
            name='Program 1',
            user=user
        )
        user.saved_workout_programs.add(program)
        self.assertIn(program, user.saved_workout_programs.all())


    def test_generic_foreign_key(self):
            user = User.objects.create_user(
                email='testuser@example.com',
                username='testuser',
                password='testpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
            content_type = ContentType.objects.get_for_model(UserCustomWorkoutProgram)

            program = UserCustomWorkoutProgram.objects.create(
                name='Program 1',
                # Ensure the program is associated with the user
                user=user
            )
            user.selected_program_type = content_type
             # Use the correct field for the ID
            user.selected_program_id = program.program_id
            user.save()
            self.assertEqual(user.selected_workout_program, program)

class UserAPITests(APITestCase):

        def setUp(self):

            self.user = User.objects.create_user(
                email='testuser@example.com',
                username='testuser',
                password='testpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
            self.user_token = Token.objects.create(user=self.user)


            self.admin_user = User.objects.create_superuser(
                email='admin@example.com',
                username='admin',
                password='adminpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
            self.admin_token = Token.objects.create(user=self.admin_user)

        #Testing if user will be while user get is only admin authenticated
        def test_user_list_as_normal_user(self):
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user_token.key)
            url = reverse('user-list')
            response = self.client.get(url, format='json')
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        def test_user_list_as_admin(self):
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
            url = reverse('user-list')
            response = self.client.get(url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data), 1)

        def test_user_detail_as_normal_user(self):
            # Authenticate as a normal user
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user_token.key)
            url = reverse('user-detail', args=[self.user.id])
            response = self.client.get(url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['email'], 'testuser@example.com')

        def test_user_detail_as_other_user(self):
            other_user = User.objects.create_user(
                email='otheruser@example.com',
                username='otheruser',
                password='otherpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
            other_user_token = Token.objects.create(user=other_user)
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + other_user_token.key)
            url = reverse('user-detail', args=[self.user.id])
            response = self.client.get(url, format='json')
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        def test_user_me_endpoint_as_normal_user(self):
            # Authenticate as a normal user
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user_token.key)
            url = reverse('user-me')
            response = self.client.get(url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['email'], 'testuser@example.com')

class AuthTests(APITestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            email='kinqomsan@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            age = 35,
            userLevel='Moderate'
        )
        self.token = Token.objects.create(user=self.user)

    def test_register_user(self):
        url = reverse('auth_register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'newpassword123',
            'age':35,
            'weight': 70.0,
            'height': 175.0,
            'gender': 'male',
            'userLevel': 'Moderate'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(User.objects.get(email='newuser@example.com').username, 'newuser')

    def test_register_user_with_existing_email(self):
        url = reverse('auth_register')
        data = {
            'email': 'kinqomsan@example.com',
            'username': 'newuser',
            'password': 'newpassword123',
            'age': 35,
            'weight': 70.0,
            'height': 175.0,
            'gender': 'male',
            'userLevel': 'Moderate'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertIn('Email already exists.', [str(error) for error in response.data['errors']])

    def test_register_user_with_invalid_data(self):
        url = reverse('auth_register')
        data = {
            'email': 'invalidemail',
            'username': 'newuser',
            'password': 'short',
            'age':35,
            'weight': 'not_a_number',
            'height': 175.0,
            'gender': 'unknown',
            'userLevel': 'Moderate'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Enter a valid email address.', response.data['email'])
        self.assertIn('Ensure this field has at least 8 characters.', response.data['password'])
        self.assertIn('A valid number is required.', response.data['weight'])
        self.assertIn('"unknown" is not a valid choice.', response.data['gender'])

    def test_login_user(self):
        url = reverse('auth_login')
        data = {
            'email': 'kinqomsan@example.com',  # Corrected email
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_id'], self.user.id)

    def test_login_user_with_wrong_password(self):
        url = reverse('auth_login')
        data = {
            'email': 'osmankinq@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid credentials', response.data['error'])

    def test_login_user_with_nonexistent_email(self):
        url = reverse('auth_login')
        data = {
            'email': 'nonexistentcec@example.com',
            'password': 'somepassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid credentials', response.data['error'])

    def test_logout_user(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Logout successful', response.data['message'])

    def test_logout_user_without_token(self):
        url = reverse('logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Authentication credentials were not provided.')

    def test_logout_user_with_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + 'invalidtoken')
        url = reverse('logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Invalid token.')


class DailyUserProgressModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            age=30,
            userLevel='Moderate'
        )

    def test_create_daily_user_progress(self):
        progress = DailyUserProgress.objects.create(
            user=self.user,
            date=timezone.now().date(),
            workout_completed=True,
            kcal_burned=500.0,
            kcal_consumed=2000.0,
            protein_consumed=150.0,
            carbs_consumed=250.0,
            fat_consumed=70.0,
            water_consumed=2.0
        )
        self.assertEqual(progress.user, self.user)
        self.assertTrue(progress.workout_completed)
        self.assertEqual(progress.kcal_burned, 500.0)

    def test_get_progress_vs_needs(self):
        progress = DailyUserProgress.objects.create(
            user=self.user,
            date=timezone.now().date(),
            kcal_consumed=2000.0,
            protein_consumed=150.0,
            carbs_consumed=250.0,
            fat_consumed=70.0,
            water_consumed=2.0
        )
        progress_vs_needs = progress.get_progress_vs_needs()
        self.assertIn('kcal_diff', progress_vs_needs)
        self.assertIn('protein_diff', progress_vs_needs)

    def test_unique_together_constraint(self):
        DailyUserProgress.objects.create(
            user=self.user,
            date=timezone.now().date()
        )
        with self.assertRaises(IntegrityError):
            DailyUserProgress.objects.create(
                user=self.user,
                date=timezone.now().date()
            )

    def test_string_representation(self):
        progress = DailyUserProgress.objects.create(
            user=self.user,
            date=timezone.now().date()
        )
        self.assertEqual(str(progress), f"{self.user.username} - {progress.date}")


class DailyUserProgressViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            age=30,
            userLevel='Moderate'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_daily_user_progress(self):
        url = reverse('dailyuserprogress-list')
        data = {
            'user': self.user.username,
            'date': timezone.now().date(),
            'workout_completed': True,
            'kcal_burned': 500.0,
            'kcal_consumed': 2000.0,
            'protein_consumed': 150.0,
            'carbs_consumed': 250.0,
            'fat_consumed': 70.0,
            'water_consumed': 2.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DailyUserProgress.objects.count(), 1)

    def test_retrieve_daily_user_progress(self):
        progress = DailyUserProgress.objects.create(
            user=self.user,
            date=timezone.now().date(),
            kcal_consumed=2000.0
        )
        url = reverse('dailyuserprogress-detail', args=[progress.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['kcal_consumed'], 2000.0)

    def test_create_progress_without_authentication(self):
        self.client.credentials()
        url = reverse('dailyuserprogress-list')
        data = {
            'user': self.user.username,
            'date': timezone.now().date(),
            'kcal_consumed': 2000.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_progress_with_invalid_data(self):
        url = reverse('dailyuserprogress-list')
        data = {
            'user': self.user.username,
            'date': 'invalid-date',
            'kcal_consumed': 'not-a-number'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

if __name__ == "__main__":
    TestCase.main()
