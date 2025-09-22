from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, ParseError, NotFound
from rest_framework.authentication import TokenAuthentication
from django.utils import timezone
from django.db import transaction, DatabaseError
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
from django.conf import settings
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from decimal import Decimal
import logging
from django.views.generic import TemplateView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Driver, Route, Order, SimulationRun
from .serializers import (
    DriverSerializer, 
    RouteSerializer, 
    OrderSerializer, 
    SimulationResultSerializer,
    SimulationRunSerializer,
    DriverPerformanceSerializer,
    RoutePerformanceSerializer
)

logger = logging.getLogger(__name__)

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class SimulationAPIView(APIView):
    # Use IsAuthenticated to ensure only logged-in users can run simulations
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # 1. Data Validation [cite: 82]
        try:
            num_drivers = int(request.data.get('num_drivers'))
            start_time_str = request.data.get('start_time')
            max_hours_per_day = int(request.data.get('max_hours_per_day'))

            if num_drivers <= 0 or max_hours_per_day <= 0:
                return Response(
                    {'error': 'Invalid parameters. num_drivers and max_hours_per_day must be positive integers.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid parameters. Please provide valid integers for num_drivers and max_hours_per_day.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Get data
        all_routes = Route.objects.all()
        all_orders = list(Order.objects.all())

        total_profit = Decimal('0')
        on_time_deliveries = 0
        total_deliveries = len(all_orders)
        total_fuel_cost = Decimal('0')

        # Create a timestamp for this simulation run 
        simulation_timestamp = timezone.now()
        
        # Generate unique run ID
        run_id = f"SIM_{simulation_timestamp.strftime('%Y%m%d_%H%M%S')}"

        try:
            # Parse the datetime string
            naive_start_time = datetime.strptime(start_time_str, '%Y-%m-%d %H:%M:%S')
            
            # Create a timezone-aware datetime using the current timezone
            start_time = timezone.now().replace(
                year=naive_start_time.year,
                month=naive_start_time.month,
                day=naive_start_time.day,
                hour=naive_start_time.hour,
                minute=naive_start_time.minute,
                second=naive_start_time.second,
                microsecond=0
            )
            
            if not start_time:
                return Response(
                    {'error': 'start_time is required in format YYYY-MM-DD HH:MM:SS'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # 3. Apply company rules & calculate KPIs [cite: 89]
            logger.info(f"Processing {len(all_orders)} orders with start_time: {start_time}")
            for order in all_orders:
                route = order.assigned_route
                if not route:
                    logger.warning(f"Order {order.order_id} has no assigned route, skipping")
                    continue

                # a. Calculate Fuel Cost [cite: 94]
                fuel_cost_per_km = Decimal('5')
                if route.traffic_level.lower() == 'high':
                    fuel_cost_per_km += Decimal('2')
                
                order.fuel_cost = route.distance_km * fuel_cost_per_km
                total_fuel_cost += order.fuel_cost

                # b. Late Delivery Penalty & On-time check [cite: 91]
                is_late = False
                base_time_seconds = route.base_time * 60
                
                # Calculate actual delivery time based on traffic and distance
                traffic_multiplier = 1.0
                if route.traffic_level.lower() == 'high':
                    traffic_multiplier = 1.5
                elif route.traffic_level.lower() == 'medium':
                    traffic_multiplier = 1.2
                
                delivery_time_seconds = base_time_seconds * traffic_multiplier
                
                if delivery_time_seconds > (base_time_seconds + 600): # 600 seconds = 10 minutes
                    is_late = True
                    order.penalty = Decimal('50')
                else:
                    order.penalty = Decimal('0')

                if not is_late:
                    on_time_deliveries += 1
                order.is_late = is_late

                # Calculate actual delivery timestamp
                try:
                    delivery_minutes = delivery_time_seconds // 60
                    order.delivery_timestamp = start_time + timedelta(minutes=delivery_minutes)
                    logger.debug(f"Order {order.order_id}: delivery_timestamp = {order.delivery_timestamp}")
                except Exception as ts_error:
                    logger.error(f"Error calculating delivery timestamp for order {order.order_id}: {ts_error}")
                    order.delivery_timestamp = start_time + timedelta(minutes=30)  # Default 30 minutes

                # c. High-Value Bonus [cite: 93]
                order.bonus = 0
                if order.value_rs > 1000 and not is_late:
                    order.bonus = order.value_rs * Decimal('0.10')

                # d. Overall Profit [cite: 98]
                order.profit = order.value_rs + order.bonus - order.penalty - order.fuel_cost
                total_profit += order.profit

                # Save the results of this simulation run 
                try:
                    order.simulation_run_at = simulation_timestamp
                    order.save()
                    logger.debug(f"Successfully saved order {order.order_id}")
                except Exception as save_error:
                    logger.error(f"Error saving order {order.order_id}: {save_error}")
                    # Continue with other orders even if one fails

            # 4. Calculate final KPIs
            late_deliveries = total_deliveries - on_time_deliveries
            efficiency_score = (on_time_deliveries / total_deliveries) * 100 if total_deliveries > 0 else 0
            
            # Calculate additional metrics
            high_value_orders = Order.objects.filter(
                simulation_run_at=simulation_timestamp,
                value_rs__gt=1000
            ).count()
            
            # Calculate average delivery time
            delivery_times = []
            for order in Order.objects.filter(simulation_run_at=simulation_timestamp):
                if order.delivery_timestamp and order.assigned_route:
                    delivery_time = (order.delivery_timestamp - start_time).total_seconds() / 60  # in minutes
                    delivery_times.append(delivery_time)
            
            avg_delivery_time = sum(delivery_times) / len(delivery_times) if delivery_times else 0
            
            # 5. Save simulation run data
            simulation_run = SimulationRun.objects.create(
                run_id=run_id,
                num_drivers=num_drivers,
                start_time=start_time,
                max_hours_per_day=max_hours_per_day,
                total_profit=total_profit,
                efficiency_score=efficiency_score,
                on_time_deliveries=on_time_deliveries,
                late_deliveries=late_deliveries,
                total_fuel_cost=total_fuel_cost,
                total_orders=total_deliveries,
                avg_delivery_time=avg_delivery_time,
                high_value_orders=high_value_orders
            )
            
            # 6. Return results [cite: 81]
            results = {
                'total_profit': total_profit,
                'efficiency_score': efficiency_score,
                'on_time_deliveries': on_time_deliveries,
                'late_deliveries': late_deliveries,
                'fuel_cost_breakdown': total_fuel_cost, # This will be used for the chart [cite: 41]
                'run_id': run_id
            }
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Simulation error: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Simulation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class LoginAPIView(APIView):
    authentication_classes = []  # No authentication required for login
    permission_classes = []      # No permissions required for login
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class SimulationRunViewSet(viewsets.ModelViewSet):
    queryset = SimulationRun.objects.all().order_by('-timestamp')
    serializer_class = SimulationRunSerializer
    permission_classes = [IsAuthenticated]

class HistoricalDataAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Get historical simulation data for trend charts"""
        try:
            # Get last 10 simulation runs for trend analysis
            runs = SimulationRun.objects.all().order_by('-timestamp')[:10]
            
            trend_data = []
            for run in runs:
                trend_data.append({
                    'timestamp': run.timestamp.isoformat(),
                    'run_id': run.run_id,
                    'total_profit': float(run.total_profit),
                    'efficiency_score': float(run.efficiency_score),
                    'on_time_deliveries': run.on_time_deliveries,
                    'late_deliveries': run.late_deliveries,
                    'total_fuel_cost': float(run.total_fuel_cost),
                    'total_orders': run.total_orders,
                    'avg_delivery_time': float(run.avg_delivery_time) if run.avg_delivery_time else 0,
                    'high_value_orders': run.high_value_orders
                })
            
            return Response({
                'trend_data': trend_data,
                'total_runs': SimulationRun.objects.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching historical data: {str(e)}")
            return Response(
                {'error': 'Failed to fetch historical data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DriverPerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Get driver performance breakdown for drill-down analysis"""
        try:
            run_id = request.query_params.get('run_id')
            if not run_id:
                return Response(
                    {'error': 'run_id parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get simulation run
            try:
                simulation_run = SimulationRun.objects.get(run_id=run_id)
            except SimulationRun.DoesNotExist:
                return Response(
                    {'error': 'Simulation run not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get orders for this simulation run
            orders = Order.objects.filter(simulation_run_at=simulation_run.timestamp)
            
            # Group by driver (we'll simulate driver assignment for now)
            driver_performance = {}
            
            for i, order in enumerate(orders):
                # Simulate driver assignment based on order index
                driver_name = f"Driver {(i % simulation_run.num_drivers) + 1}"
                
                if driver_name not in driver_performance:
                    driver_performance[driver_name] = {
                        'driver_name': driver_name,
                        'total_orders': 0,
                        'on_time_orders': 0,
                        'late_orders': 0,
                        'total_profit': 0,
                        'delivery_times': []
                    }
                
                driver_performance[driver_name]['total_orders'] += 1
                if order.is_late:
                    driver_performance[driver_name]['late_orders'] += 1
                else:
                    driver_performance[driver_name]['on_time_orders'] += 1
                
                driver_performance[driver_name]['total_profit'] += float(order.profit)
                
                if order.delivery_timestamp and order.assigned_route:
                    delivery_time = (order.delivery_timestamp - simulation_run.start_time).total_seconds() / 60
                    driver_performance[driver_name]['delivery_times'].append(delivery_time)
            
            # Calculate efficiency scores and average delivery times
            driver_data = []
            for driver_name, data in driver_performance.items():
                efficiency_score = (data['on_time_orders'] / data['total_orders']) * 100 if data['total_orders'] > 0 else 0
                avg_delivery_time = sum(data['delivery_times']) / len(data['delivery_times']) if data['delivery_times'] else 0
                
                driver_data.append({
                    'driver_name': driver_name,
                    'total_orders': data['total_orders'],
                    'on_time_orders': data['on_time_orders'],
                    'late_orders': data['late_orders'],
                    'efficiency_score': round(efficiency_score, 2),
                    'total_profit': round(data['total_profit'], 2),
                    'avg_delivery_time': round(avg_delivery_time, 2)
                })
            
            return Response({
                'driver_performance': driver_data,
                'simulation_run': SimulationRunSerializer(simulation_run).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching driver performance: {str(e)}")
            return Response(
                {'error': 'Failed to fetch driver performance data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RoutePerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Get route performance breakdown for drill-down analysis"""
        try:
            run_id = request.query_params.get('run_id')
            if not run_id:
                return Response(
                    {'error': 'run_id parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get simulation run
            try:
                simulation_run = SimulationRun.objects.get(run_id=run_id)
            except SimulationRun.DoesNotExist:
                return Response(
                    {'error': 'Simulation run not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get orders for this simulation run
            orders = Order.objects.filter(simulation_run_at=simulation_run.timestamp)
            
            # Group by route
            route_performance = {}
            
            for order in orders:
                if not order.assigned_route:
                    continue
                    
                route_id = order.assigned_route.route_id
                
                if route_id not in route_performance:
                    route_performance[route_id] = {
                        'route_id': route_id,
                        'total_orders': 0,
                        'on_time_orders': 0,
                        'late_orders': 0,
                        'total_profit': 0,
                        'delivery_times': [],
                        'distance_km': float(order.assigned_route.distance_km),
                        'traffic_level': order.assigned_route.traffic_level
                    }
                
                route_performance[route_id]['total_orders'] += 1
                if order.is_late:
                    route_performance[route_id]['late_orders'] += 1
                else:
                    route_performance[route_id]['on_time_orders'] += 1
                
                route_performance[route_id]['total_profit'] += float(order.profit)
                
                if order.delivery_timestamp:
                    delivery_time = (order.delivery_timestamp - simulation_run.start_time).total_seconds() / 60
                    route_performance[route_id]['delivery_times'].append(delivery_time)
            
            # Calculate efficiency scores and average delivery times
            route_data = []
            for route_id, data in route_performance.items():
                efficiency_score = (data['on_time_orders'] / data['total_orders']) * 100 if data['total_orders'] > 0 else 0
                avg_delivery_time = sum(data['delivery_times']) / len(data['delivery_times']) if data['delivery_times'] else 0
                
                route_data.append({
                    'route_id': route_id,
                    'total_orders': data['total_orders'],
                    'on_time_orders': data['on_time_orders'],
                    'late_orders': data['late_orders'],
                    'efficiency_score': round(efficiency_score, 2),
                    'total_profit': round(data['total_profit'], 2),
                    'avg_delivery_time': round(avg_delivery_time, 2),
                    'distance_km': data['distance_km'],
                    'traffic_level': data['traffic_level']
                })
            
            return Response({
                'route_performance': route_data,
                'simulation_run': SimulationRunSerializer(simulation_run).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching route performance: {str(e)}")
            return Response(
                {'error': 'Failed to fetch route performance data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HomeView(TemplateView):
    template_name = 'delivery_api/index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['api_version'] = '1.0.0'
        return context
