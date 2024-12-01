from django.test import TestCase
from django.contrib.auth import get_user_model
from fitcom_app.models import Exercise, WorkoutProgram, UserCustomWorkoutProgram, Comment, Post, Level

User = get_user_model()

class ExerciseModelTest(TestCase):
    def setUp(self):
        self.exercise = Exercise.objects.create(
            name="Push Up",
            body_part="Chest",
            equipment="None",
            gif_url="http://example.com/pushup.gif",
            target="Pectorals",
            secondary_muscles=["Triceps", "Deltoids"],
            instructions=["Get on the floor", "Push up your body"],
            level=Level.BEGINNER,
        )

    def test_exercise_creation(self):
        self.assertEqual(self.exercise.name, "Push Up")
        self.assertEqual(self.exercise.level, Level.BEGINNER)

class WorkoutProgramModelTest(TestCase):
    def setUp(self):
        self.exercise1 = Exercise.objects.create(
            name="Push Up",
            body_part="Chest",
            equipment="None",
            gif_url="http://example.com/pushup.gif",
            target="Pectorals",
            level=Level.BEGINNER,
        )
        self.exercise2 = Exercise.objects.create(
            name="Squat",
            body_part="Legs",
            equipment="None",
            gif_url="http://example.com/squat.gif",
            target="Quadriceps",
            level=Level.INTERMEDIATE,
        )
        self.workout_program = WorkoutProgram.objects.create(
            name="Basic Workout",
            description="A simple workout program"
        )
        self.workout_program.schedule.set([self.exercise1, self.exercise2])

    def test_workout_program_creation(self):
        self.assertEqual(self.workout_program.name, "Basic Workout")

    def test_update_level(self):
        self.workout_program.update_level()
        self.assertEqual(self.workout_program.level, Level.BEGINNER)

class UserCustomWorkoutProgramTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='testuser@example.com'
        )
        self.user_custom_program = UserCustomWorkoutProgram.objects.create(
            name="Custom Workout",
            description="User's custom workout",
            user=self.user
        )

    def test_user_custom_workout_creation(self):
        self.assertEqual(self.user_custom_program.name, "Custom Workout")
        self.assertEqual(self.user_custom_program.user.username, 'testuser')

class CommentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='testuser@example.com'
        )
        self.comment = Comment.objects.create(
            author=self.user,
            content="This is a test comment"
        )

    def test_comment_creation(self):
        self.assertEqual(str(self.comment), f'Comment by {self.user.username} on {self.comment.timestamp}')

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='testuser@example.com'
        )
        self.post = Post.objects.create(
            author=self.user,
            title="Test Post",
            content="This is a test post"
        )
        self.comment = Comment.objects.create(
            author=self.user,
            content="This is a test comment"
        )
        self.post.comments.add(self.comment)

    def test_post_creation(self):
        self.assertEqual(str(self.post), "Test Post")

    def test_like_post(self):
        self.post.like_post()
        self.assertEqual(self.post.likes, 1)

    def test_add_comment(self):
        new_comment = Comment.objects.create(
            author=self.user,
            content="Another test comment"
        )
        self.post.add_comment(new_comment)
        self.assertIn(new_comment, self.post.comments.all())

    def test_delete_comment(self):
        self.post.delete_comment(self.comment)
        self.assertNotIn(self.comment, self.post.comments.all())
