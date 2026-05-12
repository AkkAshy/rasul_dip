"""API endpoint'leri: scraper job start hám status."""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import ScraperJob, JobKind, JobStatus
from .runner import start_job


def _serialize(job: ScraperJob) -> dict:
    return {
        "id": job.id,
        "kind": job.kind,
        "kind_label": job.get_kind_display(),
        "status": job.status,
        "params": job.params,
        "products_added": job.products_added,
        "reviews_added": job.reviews_added,
        "sentiment_analyzed": job.sentiment_analyzed,
        "error": job.error,
        "log_tail": (job.log or "").split("\n")[-15:],
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "duration_seconds": job.duration_seconds,
    }


@api_view(["POST"])
def start(request):
    """Jańa scraper job baslaw.

    Body: { "kind": "scrape_top"|"scrape_full"|"run_sentiment"|"run_absa",
             "params": { ... } }
    """
    kind = request.data.get("kind")
    params = request.data.get("params", {})

    if kind not in dict(JobKind.choices):
        return Response(
            {"detail": f"Belgisiz kind: {kind}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        job = start_job(kind, params)
    except RuntimeError as e:
        return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)

    return Response(_serialize(job), status=status.HTTP_201_CREATED)


@api_view(["GET"])
def job_detail(request, job_id: int):
    """Bir konkret job statusı."""
    job = ScraperJob.objects.filter(pk=job_id).first()
    if not job:
        return Response({"detail": "Job tabılmadı"}, status=404)
    return Response(_serialize(job))


@api_view(["GET"])
def latest(request):
    """Eń jańa job'tıń statusı (frontend polling ushın)."""
    job = ScraperJob.objects.first()
    if not job:
        return Response(None)
    return Response(_serialize(job))


@api_view(["GET"])
def history(request):
    """So'nggi 10 job."""
    jobs = ScraperJob.objects.all()[:10]
    return Response([_serialize(j) for j in jobs])
