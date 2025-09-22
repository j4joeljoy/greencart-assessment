from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from .models import Driver, Route, Order, SimulationRun

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    assigned_route = RouteSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class SimulationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRun
        fields = '__all__'

class SimulationResultSerializer(serializers.Serializer):
    total_profit = serializers.DecimalField(max_digits=10, decimal_places=2)
    efficiency_score = serializers.FloatField()
    on_time_deliveries = serializers.IntegerField()
    late_deliveries = serializers.IntegerField()
    fuel_cost_breakdown = serializers.DecimalField(max_digits=10, decimal_places=2)

class DriverPerformanceSerializer(serializers.Serializer):
    driver_name = serializers.CharField()
    total_orders = serializers.IntegerField()
    on_time_orders = serializers.IntegerField()
    late_orders = serializers.IntegerField()
    efficiency_score = serializers.FloatField()
    total_profit = serializers.DecimalField(max_digits=10, decimal_places=2)
    avg_delivery_time = serializers.DecimalField(max_digits=8, decimal_places=2)

class RoutePerformanceSerializer(serializers.Serializer):
    route_id = serializers.CharField()
    total_orders = serializers.IntegerField()
    on_time_orders = serializers.IntegerField()
    late_orders = serializers.IntegerField()
    efficiency_score = serializers.FloatField()
    total_profit = serializers.DecimalField(max_digits=10, decimal_places=2)
    avg_delivery_time = serializers.DecimalField(max_digits=8, decimal_places=2)
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=2)
    traffic_level = serializers.CharField()