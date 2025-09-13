from django.urls import path
from . import views

urlpatterns = [
    # Contract endpoints
    path('', views.ContractListCreateView.as_view(), name='contract_list_create'),
    path('<int:pk>/', views.ContractDetailView.as_view(), name='contract_detail'),
    path('<int:pk>/activate/', views.activate_contract, name='activate_contract'),
    path('<int:pk>/complete/', views.complete_contract, name='complete_contract'),
    path('<int:pk>/terminate/', views.terminate_contract, name='terminate_contract'),
]

