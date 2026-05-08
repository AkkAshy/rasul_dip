from django.contrib import admin
from .models import SentimentResult, Aspect, AspectMention


@admin.register(SentimentResult)
class SentimentResultAdmin(admin.ModelAdmin):
    list_display = ("review", "label", "score", "model_name", "analyzed_at")
    list_filter = ("label", "model_name")
    raw_id_fields = ("review",)


@admin.register(Aspect)
class AspectAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(AspectMention)
class AspectMentionAdmin(admin.ModelAdmin):
    list_display = ("review", "aspect", "label", "score")
    list_filter = ("aspect", "label")
    raw_id_fields = ("review",)
