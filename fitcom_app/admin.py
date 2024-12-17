from django.contrib import admin
from .models import Exercise
# Register your models here.
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):

    list_display = ('exercise_id', 'name', 'body_part', 'equipment','gif_url','target','instructions','level')
    list_filter = ('name','body_part','equipment','target','level')