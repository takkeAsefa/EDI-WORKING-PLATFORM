from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Staff, Trainer, Rworker, Department, Trainee, Innovator


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom User Admin with role-based management
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'sex','is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'middle_name', 'phone_number')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'middle_name', 'phone_number')}),
    )


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    """
    Staff Admin - only shows staff members
    """
    list_display = ('username', 'email', 'first_name', 'last_name','sex', 'is_active', 'date_joined')
    list_filter = ('is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='staff')


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    """
    Trainer Admin - only shows trainers
    """
    list_display = ('username', 'email', 'first_name', 'last_name','sex', 'is_active', 'date_joined')
    list_filter = ('is_active', 'date_joined','sex')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='trainer')
    
@admin.register(Trainee)
class TraineeAdmin(admin.ModelAdmin):
    """
    Trainee Admin - only shows trainers
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'sex','is_active', 'date_joined')
    list_filter = ('is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='trainee')

@admin.register(Rworker)
class RworkerAdmin(admin.ModelAdmin):
    """
    Regional Worker Admin - only shows regional workers
    """
    list_display = ('username', 'email', 'first_name', 'last_name','sex', 'is_active', 'date_joined')
    list_filter = ('is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='rworker')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """
    Department Admin
    """
    list_display = ('dept_name', 'dept_head', 'service')
    search_fields = ('dept_name', 'service')
    list_filter = ('dept_head',)


@admin.register(Innovator)
class InnovatorAdmin(admin.ModelAdmin):
    """
    Innovator Admin
    """
    list_display = ('first_name', 'last_name', 'email', 'sex','phone_number')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('first_name',)

