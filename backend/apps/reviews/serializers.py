from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    sentiment = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "product", "author", "rating", "text", "language",
            "posted_at", "scraped_at", "sentiment",
        ]

    def get_sentiment(self, obj):
        result = getattr(obj, "sentiment_result", None)
        if not result:
            return None
        return {
            "label": result.label,
            "score": result.score,
        }
