from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/products/", include("apps.products.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/analysis/", include("apps.analysis.urls")),
    path("api/scraper/", include("apps.scraper.urls")),
]
