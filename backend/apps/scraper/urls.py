from django.urls import path
from .views import start, job_detail, latest, history

urlpatterns = [
    path("start/", start, name="scraper-start"),
    path("latest/", latest, name="scraper-latest"),
    path("history/", history, name="scraper-history"),
    path("jobs/<int:job_id>/", job_detail, name="scraper-job-detail"),
]
