from rest_framework import viewsets
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("product", "sentiment_result").all()
    serializer_class = ReviewSerializer
    filterset_fields = ["product", "language", "rating"]
    search_fields = ["text", "author"]
    ordering_fields = ["posted_at", "rating"]
