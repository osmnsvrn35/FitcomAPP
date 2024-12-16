from django.forms import ValidationError
from django.test import TestCase
from accounts.models import User
from fitcom_app.models import Exercise, WorkoutProgram, UserCustomWorkoutProgram, Comment, Post, Level
import uuid
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.db.utils import IntegrityError
from rest_framework.authtoken.models import Token

class UserCustomWorkoutProgramModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')
        self.exercise1 = Exercise.objects.create(name='Push-up', level=Level.BEGINNER)

    def test_user_custom_workout_program_creation(self):
        program = UserCustomWorkoutProgram.objects.create(user=self.user, name='Custom Program', description='A custom program')
        program.schedule.set([self.exercise1])
        program.save()
        self.assertEqual(program.user, self.user)
        self.assertEqual(program.name, 'Custom Program')
        self.assertEqual(program.level, Level.BEGINNER)

    def test_invalid_user_custom_workout_program_creation(self):
        with self.assertRaises(IntegrityError):
            UserCustomWorkoutProgram.objects.create(user=None, name='Invalid Program', description='Invalid description')


class UserCustomWorkoutProgramViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.exercise = Exercise.objects.create(name='Push-up', level=Level.BEGINNER)

    def test_create_user_custom_workout_program(self):
        url = reverse('usercustomworkoutprogram-list')
        data = {
            'name': 'Custom Program',
            'description': 'A custom workout program',
            'schedule_ids': [self.exercise.pk]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserCustomWorkoutProgram.objects.count(), 1)
        self.assertEqual(UserCustomWorkoutProgram.objects.first().name, 'Custom Program')

    def test_create_user_custom_workout_program_unauthorized(self):
        self.client.credentials()
        url = reverse('usercustomworkoutprogram-list')
        data = {
            'name': 'Unauthorized Custom Program',
            'description': 'Should not be created',
            'schedule_ids': [self.exercise.pk]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_user_custom_workout_program(self):
    # Create the UserCustomWorkoutProgram object
        program = UserCustomWorkoutProgram.objects.create(
            user=self.user,
            name='Custom Program',
            description='A custom program'
        )
        program.schedule.set([self.exercise])
        program.save()  # Ensure the object is saved

        # Use the correct URL pattern name
        url = reverse('user-custom-workout-programs', args=[program.program_id])
        response = self.client.get(url, format='json')

        # Check the response status and data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Custom Program')


class PostViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='This is a test post.'
        )

    def test_list_posts(self):
        url = reverse('post-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_post(self):
        url = reverse('post-list')
        data = {
            'title': 'New Post',
            'content': 'This is a new post.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_create_post_unauthorized(self):
        self.client.credentials()
        url = reverse('post-list')
        data = {
            'title': 'Unauthorized Post',
            'content': 'This should not be created.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_post(self):
        url = reverse('post-detail', args=[self.post.post_id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Post')

class CommentViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser2', password='testpassword123', weight=75.0, height=180.0, gender='male')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='This is a test post.'
        )
        self.comment = Comment.objects.create(
            author=self.user,
            content='This is a test comment.'
        )
        self.post.add_comment(self.comment)

    def test_list_comments(self):
        url = reverse('comment-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_comment(self):
        url = reverse('comment-list')
        data = {
            'content': 'This is another comment.',
            'author': self.user.id,
            'post_id': str(self.post.post_id)
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)

    def test_create_comment_unauthorized(self):
        self.client.credentials()
        url = reverse('comment-list')
        data = {
            'content': 'Unauthorized comment.',
            'post_id': str(self.post.post_id)
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_comment(self):
        url = reverse('comment-detail', args=[self.comment.comment_id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'This is a test comment.')



class CommentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            userLevel='Moderate',
            age=30)
        self.comment = Comment.objects.create(
            author=self.user,
            content='This is a test comment.'
        )

    def test_comment_creation(self):
        self.assertEqual(self.comment.author, self.user)
        self.assertEqual(self.comment.content, 'This is a test comment.')
        self.assertIsInstance(self.comment.comment_id, uuid.UUID)

    def test_string_representation(self):
        expected_str = f'Comment by {self.user.username} on {self.comment.timestamp}'
        self.assertEqual(str(self.comment), expected_str)

    def test_invalid_comment_creation(self):
        with self.assertRaises(IntegrityError):
            Comment.objects.create(
                author=None,
                content='Invalid comment'
            )


class PostModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            weight=70.0,
            height=175.0,
            gender='male',
            userLevel='Moderate',
            age=30)
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='This is a test post.'
        )
        self.comment = Comment.objects.create(
            author=self.user,
            content='This is a test comment.'
        )

    def test_post_creation(self):
        self.assertEqual(self.post.author, self.user)
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.content, 'This is a test post.')
        self.assertIsInstance(self.post.post_id, uuid.UUID)

    def test_string_representation(self):
        self.assertEqual(str(self.post), 'Test Post')

    def test_like_post(self):
        initial_likes = self.post.likes
        self.post.like_post()
        self.assertEqual(self.post.likes, initial_likes + 1)

    def test_add_comment(self):
        self.post.add_comment(self.comment)
        self.assertIn(self.comment, self.post.comments.all())

    def test_delete_comment(self):
        self.post.add_comment(self.comment)
        self.post.delete_comment(self.comment)
        self.assertNotIn(self.comment, self.post.comments.all())

    def test_invalid_post_creation(self):
        with self.assertRaises(IntegrityError):
            Post.objects.create(
                author=None,
                title='Invalid Post',
                content='Invalid content'
            )

class ExerciseModelTests(TestCase):
    def setUp(self):
        self.exercise = Exercise.objects.create(
            name='Push Up',
            body_part='Chest',
            equipment='None',
            gif_url='http://example.com/pushup.gif',
            target='Pectorals',
            secondary_muscles=['Triceps', 'Shoulders'],
            instructions=['Start in a plank position', 'Lower your body until your chest nearly touches the floor', 'Push back to the starting position'],
            level=Level.BEGINNER
        )

    def test_exercise_creation(self):
        self.assertEqual(self.exercise.name, 'Push Up')
        self.assertEqual(self.exercise.body_part, 'Chest')
        self.assertEqual(self.exercise.equipment, 'None')
        self.assertEqual(self.exercise.level, Level.BEGINNER)

    def test_exercise_id_is_uuid(self):
        self.assertIsInstance(self.exercise.exercise_id, uuid.UUID)

    def test_string_representation(self):
        self.assertEqual(str(self.exercise), 'Push Up')

    def test_invalid_level(self):
        exercise = Exercise(
            name='Invalid Level Exercise',
            body_part='Legs',
            equipment='None',
            gif_url='http://example.com/invalid.gif',
            target='Quadriceps',
            level='InvalidLevel'
        )
        with self.assertRaises(ValidationError):
            exercise.full_clean()

    def test_missing_required_fields(self):
        exercise = Exercise(
            body_part='Legs',
            equipment='None',
            gif_url='http://example.com/invalid.gif',
            target='Quadriceps'
        )
        with self.assertRaises(ValidationError):
            exercise.full_clean()



class ExerciseViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
                email='testuser@example.com',
                username='testuser',
                password='testpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
        self.admin_user = User.objects.create_superuser(
                email='admin@example.com',
                username='admin',
                password='adminpassword123',
                weight=70.0,
                height=175.0,
                gender='male'
            )
        self.token = Token.objects.create(user=self.user)
        self.admin_token = Token.objects.create(user=self.admin_user)
        self.exercise = Exercise.objects.create(
            name='Push Up',
            body_part='Chest',
            equipment='None',
            gif_url='http://example.com/pushup.gif',
            target='Pectorals',
            secondary_muscles=['Triceps', 'Shoulders'],
            instructions=['Start in a plank position', 'Lower your body until your chest nearly touches the floor', 'Push back to the starting position'],
            level=Level.BEGINNER
        )

    def test_list_exercises_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('exercise-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_exercises_unauthenticated(self):
        url = reverse('exercise-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_exercise_as_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('exercise-list')
        data = {
            'name': 'Squat',
            'body_part': 'Legs',
            'equipment': 'Barbell',
            'gif_url': 'http://example.com/squat.gif',
            'target': 'Quadriceps',
            'secondary_muscles': ['Glutes', 'Hamstrings'],
            'instructions': ['Stand with feet shoulder-width apart', 'Lower your body as if sitting back into a chair', 'Return to standing position'],
            'level': Level.INTERMEDIATE
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_exercise_as_non_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('exercise-list')
        data = {
            'name': 'Squat',
            'body_part': 'Legs',
            'equipment': 'Barbell',
            'gif_url': 'http://example.com/squat.gif',
            'target': 'Quadriceps',
            'secondary_muscles': ['Glutes', 'Hamstrings'],
            'instructions': ['Stand with feet shoulder-width apart', 'Lower your body as if sitting back into a chair', 'Return to standing position'],
            'level': Level.INTERMEDIATE
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_exercise(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('exercise-detail', args=[self.exercise.exercise_id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Push Up')

    def test_update_exercise_as_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('exercise-detail', args=[self.exercise.exercise_id])
        data = {
            'name': 'Updated Push Up',
            'body_part': 'Chest',
            'equipment': 'None',
            'gif_url': 'http://example.com/pushup.gif',
            'target': 'Pectorals',
            'secondary_muscles': ['Triceps', 'Shoulders'],
            'instructions': ['Start in a plank position', 'Lower your body until your chest nearly touches the floor', 'Push back to the starting position'],
            'level': Level.BEGINNER
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.exercise.refresh_from_db()
        self.assertEqual(self.exercise.name, 'Updated Push Up')

    def test_update_exercise_as_non_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('exercise-detail', args=[self.exercise.exercise_id])
        data = {
            'name': 'Updated Push Up',
            'body_part': 'Chest',
            'equipment': 'None',
            'gif_url': 'http://example.com/pushup.gif',
            'target': 'Pectorals',
            'secondary_muscles': ['Triceps', 'Shoulders'],
            'instructions': ['Start in a plank position', 'Lower your body until your chest nearly touches the floor', 'Push back to the starting position'],
            'level': Level.BEGINNER
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_exercise_as_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('exercise-detail', args=[self.exercise.exercise_id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Exercise.objects.filter(exercise_id=self.exercise.exercise_id).exists())

    def test_delete_exercise_as_non_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('exercise-detail', args=[self.exercise.exercise_id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_exercise_with_invalid_data(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('exercise-list')
        data = {
            'name': '',
            'body_part': 'Legs',
            'equipment': 'Barbell',
            'gif_url': 'not-a-url',
            'target': 'Quadriceps',
            'secondary_muscles': ['Glutes', 'Hamstrings'],
            'instructions': ['Stand with feet shoulder-width apart', 'Lower your body as if sitting back into a chair', 'Return to standing position'],
            'level': 'InvalidLevel'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)