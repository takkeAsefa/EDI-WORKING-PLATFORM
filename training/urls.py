from django.urls import path
from . import views

urlpatterns = [
    # Training Type endpoints
    path('types/', views.TrainingTypeListCreateView.as_view(), name='training_type_list_create'),
    path('types/<int:pk>/', views.TrainingTypeDetailView.as_view(), name='training_type_detail'),
    
    # Training endpoints
    path('sessions/', views.TrainingListCreateView.as_view(), name='training_list_create'),
    path('sessions/<int:pk>/', views.TrainingDetailView.as_view(), name='training_detail'),
    
    # Training Application endpoints
    path('applications/', views.TrainingApplicationListCreateView.as_view(), name='application_list_create'),
    path('applications/<int:pk>/', views.TrainingApplicationDetailView.as_view(), name='application_detail'),
    path('applications/<int:pk>/approve/', views.approve_training_application, name='approve_application'),
    path('applications/<int:pk>/reject/', views.reject_training_application, name='reject_application'),
    path('applications/<int:pk>/apply/', views.apply, name='apply_application'),
    path('applications/<int:pk>/complete/', views.complete_training_application, name='complete_application'),
    
    # Certificate endpoints
    path('certificates/', views.CertificateListCreateView.as_view(), name='certificate_list_create'),
    path('certificates/<int:pk>/', views.CertificateDetailView.as_view(), name='certificate_detail'),
    
    # Payment endpoints
    path('payments/', views.PaymentListCreateView.as_view(), name='payment_list_create'),
    path('payments/rate/', views.PaymentRateView.as_view(), name='payment_rate_list_create'),
    path('payments/trainer/', views.TrainerLevelView.as_view(), name='payment_trainer'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment_detail'),
    path('payments/<int:pk>/approve/', views.approve_payment, name='approve_payment'),
    path('payments/<int:pk>/reject/', views.reject_payment, name= 'reject_payment'),
    path('payments/<int:pk>/request/', views.request_payment, name="request_payment"),
    
    # Innovation endpoints
    path('innovations/', views.InnovationListCreateView.as_view(), name='innovation_list_create'),
    path('innovations/<int:pk>/', views.InnovationDetailView.as_view(), name='innovation_detail'),
    
    # Warranty Money endpoints
    path('warranties/', views.WarrantyMoneyListCreateView.as_view(), name='warranty_list_create'),
    path('warranties/<int:pk>/', views.WarrantyMoneyDetailView.as_view(), name='warranty_detail'),
]

