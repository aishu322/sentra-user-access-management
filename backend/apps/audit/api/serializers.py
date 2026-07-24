from rest_framework import serializers

from apps.audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action",
            "description",
            "user_agent",
            "created_at",
        ]

    def get_user(self, obj) -> str:
        if obj.user:
            return obj.user.email
        return None