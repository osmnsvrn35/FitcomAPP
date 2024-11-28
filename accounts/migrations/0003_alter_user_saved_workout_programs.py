# Generated by Django 5.1.3 on 2024-11-28 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_saved_workout_programs'),
        ('fitcom_app', '0002_workoutprogram_user_usercustomworkoutprogram'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='saved_workout_programs',
            field=models.ManyToManyField(blank=True, related_name='saved_by_users', to='fitcom_app.workoutprogram'),
        ),
    ]