from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Trainee, Innovator
import uuid

User = get_user_model()


class TrainingType(models.Model):
    """
    Training Type model defining different types of training
    """
    training_type = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    designed_for = models.CharField(max_length=100, blank=True)
    requirement = models.TextField(blank=True)
    
    def __str__(self):
        return self.training_type


class Training(models.Model):
    """
    Training model for training sessions
    """
    training_id = models.CharField(max_length=50, unique=True)
    given_by = models.ForeignKey(User, on_delete=models.CASCADE,limit_choices_to={'role':'trainer'} )
    training_type = models.ForeignKey(TrainingType, on_delete=models.CASCADE)
    end_date = models.DateField()
    given_date = models.DateField()
    given_location = models.CharField(max_length=200)
    
    
    def __str__(self):
        return f"{self.training_type.training_type} - {self.training_id}"


class TrainingApplication(models.Model):
    """
    Training Application model for applying to training sessions
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    for_training = models.ForeignKey(Training, on_delete=models.CASCADE)
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'trainer'})
    applied_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"Application for {self.for_training.training_type.training_type}"


class Certificate(models.Model):
    """
    Certificate model for training certificates
    """
    certificate_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    certified = models.ForeignKey(User, on_delete=models.CASCADE ) 
    given_for = models.ForeignKey(Training, on_delete=models.CASCADE)
    given_date = models.DateField()

    
    
    def __str__(self):
        return f"Certificate {self.certificate_id} for {self.certified.full_name}"


class Payment(models.Model):
    """
    Payment model for tracking payments
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    receipt_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                    limit_choices_to={'role':'staff'},related_name='approved_payments')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, 
                                     limit_choices_to={'role':'trainer'},related_name='requested_payments')
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment {self.receipt_id} - {self.status}"
    
class PaymentRate(models.Model):
    level= models.CharField(max_length=15, null=False, blank=False, primary_key=True)
    per_day= models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.level

class TrainerLevel(models.Model):
    trainer= models.OneToOneField(User, on_delete=models.CASCADE, 
                                  limit_choices_to={'role':'trainer'})
    trainer_level= models.ForeignKey(PaymentRate, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.trainer.first_name} {self.trainer.last_name}"




class Innovation(models.Model):
    """
    Innovation model for tracking innovations
    """
    innovator = models.ForeignKey(Innovator, on_delete=models.CASCADE)
    description = models.TextField()
    title = models.CharField(max_length=200)
    created_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Innovation: {self.title}"


class WarrantyMoney(models.Model):
    """
    Warranty Money model for warranty management
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('claimed', 'Claimed'),
        ('pending', 'Pending'),
    ]
    
    guarantee = models.CharField(max_length=100)
    allowed_for = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role':"trainee"})
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"Warranty {self.guarantee} - {self.amount}"

