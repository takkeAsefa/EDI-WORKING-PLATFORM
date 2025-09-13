from django.contrib import admin
from .models import (
    TrainingType, Training, TrainingApplication, 
    Certificate, Payment, PaymentRate,TrainerLevel,Innovation, WarrantyMoney
)


@admin.register(TrainingType)
class TrainingTypeAdmin(admin.ModelAdmin):
    """
    Training Type Admin
    """
    list_display = ('training_type', 'designed_for', 'requirement')
    search_fields = ('training_type', 'description', 'designed_for')
    list_filter = ('designed_for',)


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    """
    Training Admin
    """
    list_display = ('training_id', 'training_type', 'given_by', 'given_date', 'end_date', 'given_location')
    list_filter = ('training_type', 'given_by', 'given_date')
    search_fields = ('training_id', 'training_type__training_type', 'given_location')
    date_hierarchy = 'given_date'
    ordering = ('-given_date',)


@admin.register(TrainingApplication)
class TrainingApplicationAdmin(admin.ModelAdmin):
    """
    Training Application Admin
    """
    list_display = ('for_training', 'trainer', 'applied_date', 'status')
    list_filter = ('status', 'applied_date', 'trainer')
    search_fields = ('for_training__training_id', 'trainer__username')
    date_hierarchy = 'applied_date'
    ordering = ('-applied_date',)
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} applications approved.")
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} applications rejected.")
    reject_applications.short_description = "Reject selected applications"


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    """
    Certificate Admin
    """
    list_display = ('certificate_id', 'certified', 'given_for', 'given_date')
    list_filter = ('given_date', 'given_for__training_type')
    search_fields = ('certificate_id', 'certified__username', 'certified__first_name', 'certified__last_name')
    date_hierarchy = 'given_date'
    ordering = ('-given_date',)
    readonly_fields=['certificate_id']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Payment Admin
    """
    list_display = ('receipt_id', 'requested_by', 'approved_by', 'amount', 'status', 'created_date')
    list_filter = ('status', 'created_date', 'requested_by')
    search_fields = ('receipt_id', 'requested_by__username', 'reason')
    date_hierarchy = 'created_date'
    ordering = ('-created_date',)
    readonly_fields=['receipt_id']
    
    actions = ['approve_payments', 'reject_payments']
    
    def approve_payments(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} payments approved.")
    approve_payments.short_description = "Approve selected payments"
    
    def reject_payments(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} payments rejected.")
    reject_payments.short_description = "Reject selected payments"

@admin.register(PaymentRate)
class PaymentRateAdmin(admin.ModelAdmin):
    list_display=('level','per_day')
    list_filter =('level',)
    search_fields=('level',)
    ordering=('per_day',)

@admin.register(TrainerLevel)
class TrainerLevelAdmin(admin.ModelAdmin):
    list_display=('trainer','trainer_level')
    list_filter=('trainer_level',)
    search_fields=('trainer',)
    ordering=('trainer_level',)



@admin.register(Innovation)
class InnovationAdmin(admin.ModelAdmin):
    """
    Innovation Admin
    """
    list_display = ('title', 'innovator', 'created_date')
    list_filter = ('created_date', 'innovator')
    search_fields = ('title', 'description', 'innovator__first_name', 'innovator__last_name')
    date_hierarchy = 'created_date'
    ordering = ('-created_date',)


@admin.register(WarrantyMoney)
class WarrantyMoneyAdmin(admin.ModelAdmin):
    """
    Warranty Money Admin
    """
    list_display = ('guarantee', 'allowed_for', 'amount', 'status', 'created_date', 'expiry_date')
    list_filter = ('status', 'created_date', 'expiry_date')
    search_fields = ('guarantee', 'allowed_for__username')
    date_hierarchy = 'created_date'
    ordering = ('-created_date',)
    
    actions = ['mark_as_expired', 'mark_as_claimed']
    
    def mark_as_expired(self, request, queryset):
        queryset.update(status='expired')
        self.message_user(request, f"{queryset.count()} warranties marked as expired.")
    mark_as_expired.short_description = "Mark selected warranties as expired"
    
    def mark_as_claimed(self, request, queryset):
        queryset.update(status='claimed')
        self.message_user(request, f"{queryset.count()} warranties marked as claimed.")
    mark_as_claimed.short_description = "Mark selected warranties as claimed"

