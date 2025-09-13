from django.db import models
from django.contrib.auth import get_user_model
from training.models import Training, TrainingType

User = get_user_model()


class Contract(models.Model):
    """
    Contract model for training contracts
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
    ]
    
    contract_doc = models.FileField(upload_to='Documents/',blank=True, null=True)
    for_training = models.ForeignKey(TrainingType, on_delete=models.CASCADE)
    signed_by = models.ForeignKey(User, on_delete=models.CASCADE)


    completion = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    end_date = models.DateField()
    signed_date = models.DateField(auto_now=True)
    terms_and_conditions = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Contract For {self.for_training.training_type}"
    
    class Meta:
        ordering = ['-created_date']

