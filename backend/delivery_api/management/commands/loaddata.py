import csv
import os
import sys
from typing import Optional, Dict, List, Union, Tuple, Any
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, DatabaseError, IntegrityError
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.conf import settings
from delivery_api.models import Driver, Route, Order
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Loads initial data from CSV files'

    def add_arguments(self, parser):
        parser.add_argument('--data-dir', type=str, help='Directory containing CSV files')

    def handle(self, *args, **options):
        data_dir = options.get('data_dir', '')
        
        try:
            # Load drivers
            self.stdout.write('Loading drivers...')
            
            if not os.path.exists(os.path.join(data_dir, 'drivers.csv')):
                raise CommandError('drivers.csv not found in specified directory')
                
            # Load drivers with error handling
            with open(os.path.join(data_dir, 'drivers.csv'), 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    try:
                        past_week_hours_str = row.get('past_week_hours', '')
                        if not past_week_hours_str:
                            self.stdout.write(self.style.WARNING(f"Missing past_week_hours for driver {row['name']}"))
                            continue
                            
                        past_week_hours_list = [int(h) for h in past_week_hours_str.split('|')]
                        total_past_week_hours = sum(past_week_hours_list)

                        Driver.objects.get_or_create(
                            name=row['name'],
                            defaults={
                                'current_shift_hours': row['shift_hours'],
                                'past_7_day_work_hours': total_past_week_hours
                            }
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing driver {row.get('name', 'unknown')}: {str(e)}"))
                        continue

            self.stdout.write(self.style.SUCCESS('Drivers loaded successfully.'))

            # Load routes
            self.stdout.write('Loading routes...')
            with open(os.path.join(data_dir, 'routes.csv'), 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    try:
                        Route.objects.get_or_create(
                            route_id=row['route_id'],
                            defaults={
                                'distance_km': row['distance_km'],
                                'traffic_level': row['traffic_level'],
                                'base_time': row['base_time_min']
                            }
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing route {row.get('route_id', 'unknown')}: {str(e)}"))
                        continue
            self.stdout.write(self.style.SUCCESS('Routes loaded successfully.'))

            # Load orders
            self.stdout.write('Loading orders...')
            with open(os.path.join(data_dir, 'orders.csv'), 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    try:
                        route = Route.objects.get(route_id=row['route_id'])
                        Order.objects.get_or_create(
                            order_id=row['order_id'],
                            defaults={
                                'value_rs': row['value_rs'],
                                'assigned_route': route,
                                # delivery_timestamp is not included in the initial data load.
                                # The CSV only contains a time string, not a full date.
                                # It will be populated during the simulation.
                            }
                        )
                    except Route.DoesNotExist:
                        self.stdout.write(self.style.ERROR(f"Route with route_id {row['route_id']} not found. Skipping order {row['order_id']}."))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing order {row.get('order_id', 'unknown')}: {str(e)}"))
                        continue
            self.stdout.write(self.style.SUCCESS('Orders loaded successfully.'))

        except Exception as e:
            raise CommandError(f'Failed to load data: {str(e)}')