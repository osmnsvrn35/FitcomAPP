# Generated by Django 5.1.3 on 2024-11-25 14:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitcom_app', '0004_workoutprogram_schedule_alter_program_program_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='program',
            name='type',
            field=models.CharField(default='Program', editable=False, max_length=50),
        ),
    ]
