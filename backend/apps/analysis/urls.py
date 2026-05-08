from django.urls import path
from .views import (
    product_sentiment_summary,
    product_demand_score,
    overall_demand_index,
    demand_by_category,
    model_quality_by_language,
)

urlpatterns = [
    path("demand-index/", overall_demand_index, name="demand-index"),
    path("demand-by-category/", demand_by_category, name="demand-by-category"),
    path("products/<int:product_id>/summary/", product_sentiment_summary, name="product-summary"),
    path("products/<int:product_id>/demand/", product_demand_score, name="product-demand"),
    path("model-quality/", model_quality_by_language, name="model-quality"),
]
