"""Scraper jumıs járıyalarınıń (job) trekingi."""
from django.db import models


class JobStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    RUNNING = "running", "Running"
    SUCCESS = "success", "Success"
    FAILED = "failed", "Failed"


class JobKind(models.TextChoices):
    SCRAPE_TOP = "scrape_top", "REST top-feedback (httpx)"
    SCRAPE_FULL = "scrape_full", "Tólıq pikirler (Playwright)"
    RUN_SENTIMENT = "run_sentiment", "Sentiment analiz"
    RUN_ABSA = "run_absa", "ABSA analiz"


class ScraperJob(models.Model):
    kind = models.CharField(max_length=30, choices=JobKind.choices)
    status = models.CharField(max_length=20, choices=JobStatus.choices, default=JobStatus.PENDING)
    params = models.JSONField(default=dict, blank=True)
    log = models.TextField(blank=True, default="")
    error = models.TextField(blank=True, default="")

    products_added = models.PositiveIntegerField(default=0)
    reviews_added = models.PositiveIntegerField(default=0)
    sentiment_analyzed = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return f"{self.kind} [{self.status}] #{self.id}"

    @property
    def duration_seconds(self) -> float | None:
        if self.started_at and self.finished_at:
            return (self.finished_at - self.started_at).total_seconds()
        return None
