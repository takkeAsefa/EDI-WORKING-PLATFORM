from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.user_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    
    # User management endpoints
    path('staff/', views.StaffListView.as_view(), name='staff_list'),
    path('trainers/', views.TrainerListView.as_view(), name='trainer_list'),
    path('rworkers/', views.RworkerListView.as_view(), name='rworker_list'),
    path('trainees/', views.TraineeListView.as_view(), name='trainee_list'),
    
    # Department endpoints
    path('departments/', views.DepartmentListCreateView.as_view(), name='department_list_create'),
    path('departments/<int:pk>/', views.DepartmentDetailView.as_view(), name='department_detail'),
    
    # Trainee endpoints
    # path('trainees/', views.TraineeListCreateView.as_view(), name='trainee_list_create'),
    # path('trainees/<int:pk>/', views.TraineeDetailView.as_view(), name='trainee_detail'),
    
    # Innovator endpoints
    path('innovators/', views.InnovatorListCreateView.as_view(), name='innovator_list_create'),
    path('innovators/<int:pk>/', views.InnovatorDetailView.as_view(), name='innovator_detail'),
]

