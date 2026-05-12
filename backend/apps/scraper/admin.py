from django.contrib import admin
from .models import ScraperJob


@admin.register(ScraperJob)
class ScraperJobAdmin(admin.ModelAdmin):
    list_display = ("id", "kind", "status", "products_added", "reviews_added",
                    "created_at", "duration_seconds")
    list_filter = ("kind", "status")
    readonly_fields = ("created_at", "started_at", "finished_at")
