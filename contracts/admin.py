from django.contrib import admin
from .models import Contract


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    """
    Contract Admin
    """
    list_display = ('id','contract_doc', 'for_training', 'signed_by', 'completion', 'signed_date', 'end_date')
    list_filter = ('completion', 'signed_date', 'end_date')
    search_fields = ('signed_by__username', 'for_training__training_type')
    date_hierarchy = 'signed_date'
    ordering = ('-created_date',)
    
    fieldsets = (
        ('Contract Information', {
            'fields': ( 'for_training', 'signed_by')
        }),
        ('Dates', {
            'fields': ['end_date'] # 'signed_date'
        }),
        ('Status & Terms', {
            'fields': ('completion', 'terms_and_conditions')
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_active']
    
    def mark_as_completed(self, request, queryset):
        queryset.update(completion='completed')
        self.message_user(request, f"{queryset.count()} contracts marked as completed.")
    mark_as_completed.short_description = "Mark selected contracts as completed"
    
    def mark_as_active(self, request, queryset):
        queryset.update(completion='active')
        self.message_user(request, f"{queryset.count()} contracts marked as active.")
    mark_as_active.short_description = "Mark selected contracts as active"

