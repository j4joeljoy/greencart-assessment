from django.contrib import admin
from .models import Driver, Route, Order, SimulationRun

# Register your models here.
@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['name', 'current_shift_hours', 'past_7_day_work_hours']
    search_fields = ['name']

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['route_id', 'distance_km', 'traffic_level', 'base_time']
    search_fields = ['route_id']
    list_filter = ['traffic_level']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'value_rs', 'assigned_route', 'is_late', 'profit', 'simulation_run_at']
    search_fields = ['order_id']
    list_filter = ['is_late', 'simulation_run_at']
    readonly_fields = ['simulation_run_at']

@admin.register(SimulationRun)
class SimulationRunAdmin(admin.ModelAdmin):
    list_display = ['run_id', 'timestamp', 'num_drivers', 'total_profit', 'efficiency_score', 'total_orders']
    search_fields = ['run_id']
    list_filter = ['timestamp', 'num_drivers']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
