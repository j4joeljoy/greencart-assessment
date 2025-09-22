from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from typing import Optional

class Driver(models.Model):
    name = models.CharField(max_length=255)
    current_shift_hours = models.DecimalField(max_digits=5, decimal_places=2)
    past_7_day_work_hours = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.name

class Route(models.Model):
    route_id = models.CharField(max_length=50, unique=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    traffic_level = models.CharField(max_length=50)
    base_time = models.IntegerField(help_text="Base time in minutes")

    def __str__(self):
        return self.route_id

class Order(models.Model):
    order_id = models.CharField(max_length=50, unique=True)
    value_rs = models.DecimalField(max_digits=10, decimal_places=2)
    assigned_route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_timestamp = models.DateTimeField(null=True, blank=True)
    is_late = models.BooleanField(default=False)
    penalty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fuel_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    simulation_run_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.order_id

class SimulationRun(models.Model):
    run_id = models.CharField(max_length=50, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    num_drivers = models.IntegerField()
    start_time = models.DateTimeField()
    max_hours_per_day = models.IntegerField()
    total_profit = models.DecimalField(max_digits=15, decimal_places=2)
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2)
    on_time_deliveries = models.IntegerField()
    late_deliveries = models.IntegerField()
    total_fuel_cost = models.DecimalField(max_digits=15, decimal_places=2)
    total_orders = models.IntegerField()
    avg_delivery_time = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    high_value_orders = models.IntegerField(default=0)

    def __str__(self):
        return f"Simulation Run {self.run_id} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"