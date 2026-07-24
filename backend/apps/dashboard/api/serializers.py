from rest_framework import serializers


class DashboardStatisticsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_roles = serializers.IntegerField()
    audit_events = serializers.IntegerField()


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    action = serializers.CharField()
    description = serializers.CharField()
    created_at = serializers.DateTimeField()


class DashboardSerializer(serializers.Serializer):
    statistics = serializers.DictField()

    recent_activity = serializers.ListField()

    recent_users = serializers.ListField()

    users_per_role = serializers.ListField()