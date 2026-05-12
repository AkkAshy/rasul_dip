"""
Tóretkenı thread'ta Django management command'tı baslaytuǵın yumshaq runner.

Production'da Celery yamasa RQ jaylanǵan bolar edi, biraq dipldom uchun
basit threading + StringIO logging — ámeli ámelge asıriwı joqarı, ámeliy
ámelge asırılǵan jaqtan da túsiniwlı.
"""
from __future__ import annotations
import io
import threading
from contextlib import redirect_stdout, redirect_stderr
from datetime import datetime, timezone

from django.core.management import call_command
from django.utils import timezone as djtz

from .models import ScraperJob, JobStatus


_lock = threading.Lock()


def _execute(job_id: int):
    """Background thread entry-point."""
    job = ScraperJob.objects.get(pk=job_id)
    job.status = JobStatus.RUNNING
    job.started_at = djtz.now()
    job.save(update_fields=["status", "started_at"])

    buf = io.StringIO()
    try:
        with redirect_stdout(buf), redirect_stderr(buf):
            _dispatch(job)
        job.status = JobStatus.SUCCESS
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = f"{type(e).__name__}: {e}"
    finally:
        job.log = buf.getvalue()[-20000:]  # last 20K characters
        job.finished_at = djtz.now()
        # parse stats from log
        _parse_stats_from_log(job)
        job.save()


def _dispatch(job: ScraperJob):
    """Map JobKind to actual management command."""
    p = job.params or {}
    if job.kind == "scrape_top":
        call_command(
            "scrape_uzum",
            bulk=True,
            start_id=p.get("from", 1),
            end_id=p.get("to", 1000),
            min_reviews=p.get("min_reviews", 5),
        )
    elif job.kind == "scrape_full":
        call_command(
            "scrape_uzum_full",
            top=p.get("top", 50),
            max_reviews=p.get("max_reviews", 100),
            page_size=p.get("page_size", 30),
            between=p.get("between", 4.0),
            rate_delay=p.get("rate_delay", 1.0),
            stop_after=p.get("stop_after"),
        )
    elif job.kind == "run_sentiment":
        call_command("run_sentiment", batch=p.get("batch", 32))
    elif job.kind == "run_absa":
        call_command("run_absa", reanalyze=p.get("reanalyze", False))
    else:
        raise ValueError(f"Belgisiz job kind: {job.kind}")


def _parse_stats_from_log(job: ScraperJob):
    """Logta'ǵı 'Готово: N результатов' kórinisindegi tatbiqshılardı extract qıladı."""
    import re
    log = job.log

    m = re.search(r"новых отзывов в БД:\s*(\d+)", log)
    if m:
        job.reviews_added = int(m.group(1))

    m = re.search(r"товаров (\d+), отзывов (\d+)", log)
    if m:
        job.products_added = int(m.group(1))
        if not job.reviews_added:
            job.reviews_added = int(m.group(2))

    m = re.search(r"Готово:\s*(\d+) результатов", log)
    if m:
        job.sentiment_analyzed = int(m.group(1))


def start_job(kind: str, params: dict | None = None) -> ScraperJob:
    """Jańa job jaratıp, background thread'ta basladı."""
    with _lock:
        # Eger jumıs aldıń'ǵı job RUNNING bolsa — refuse
        running = ScraperJob.objects.filter(status=JobStatus.RUNNING).first()
        if running:
            raise RuntimeError(
                f"Jumıs basqa job hali tugaltap atır: #{running.id} ({running.kind})"
            )

        job = ScraperJob.objects.create(
            kind=kind,
            params=params or {},
            status=JobStatus.PENDING,
        )

    thread = threading.Thread(target=_execute, args=(job.id,), daemon=True)
    thread.start()
    return job
