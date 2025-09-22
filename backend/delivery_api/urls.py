from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from .views import (
    DriverViewSet, 
    RouteViewSet, 
    OrderViewSet, 
    SimulationAPIView,
    LoginAPIView,
    SimulationRunViewSet,
    HistoricalDataAPIView,
    DriverPerformanceAPIView,
    RoutePerformanceAPIView
)

router = DefaultRouter()
router.register(r'drivers', DriverViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'simulation-runs', SimulationRunViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('simulate/', SimulationAPIView.as_view(), name='simulate'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('analytics/historical-data/', HistoricalDataAPIView.as_view(), name='historical-data'),
    path('analytics/driver-performance/', DriverPerformanceAPIView.as_view(), name='driver-performance'),
    path('analytics/route-performance/', RoutePerformanceAPIView.as_view(), name='route-performance'),
]