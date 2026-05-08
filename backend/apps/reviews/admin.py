from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "author", "rating", "language", "posted_at")
    list_filter = ("language", "rating", "product__source")
    search_fields = ("text", "author")
    raw_id_fields = ("product",)
