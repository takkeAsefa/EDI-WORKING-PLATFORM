from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('trainer', 'Trainer'),
        ('rworker', 'Regional Worker'),
        ('trainee', 'Trainee'),
    ]
    Gender=[
        ('male', 'Male'),
        ('female','Female'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='trainee')
    middle_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    sex= models.CharField(max_length=10, choices=Gender,null=False, blank=False)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}({self.get_role_display()})"
    
    @property
    def full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"


class StaffManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role='staff')
    
class Staff(User):
    """
    Staff proxy model - inherits from User
    Staff members can register Trainers and Regional Workers
    """
    objects=StaffManager()
    class Meta:
        proxy = True
        verbose_name = "Staff Member"
        verbose_name_plural = "Staff Members"
    
    def save(self, *args, **kwargs):
        self.role = 'staff'
        super().save(*args, **kwargs)


class TrainerManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role='trainer')


class Trainer(User):
    """
    Trainer proxy model - inherits from User
    Trainers can conduct training sessions
    """

    objects=TrainerManager()

    class Meta:
        proxy = True
        verbose_name = "Trainer"
        verbose_name_plural = "Trainers"
    
    def save(self, *args, **kwargs):
        self.role = 'trainer'
        super().save(*args, **kwargs)

class RworkerManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role='rworker')
    
class Rworker(User):
    """
    Regional Worker proxy model - inherits from User
    Regional workers have specific regional responsibilities
    """
    objects=RworkerManager()
    class Meta:
        proxy = True
        verbose_name = "Regional Worker"
        verbose_name_plural = "Regional Workers"
    
    def save(self, *args, **kwargs):
        self.role = 'rworker'
        super().save(*args, **kwargs)


class TraineeManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role='trainee')  

class Trainee(User):
    """
    Trainee proxy model - inherits from User
    Trainee can conduct training sessions
    """

    objects=TraineeManager()

    class Meta:
        proxy = True
        verbose_name = "Trainee"
        verbose_name_plural = "Trainee"
    
    def save(self, *args, **kwargs):
        self.role = 'trainee'
        super().save(*args, **kwargs)


class Department(models.Model):
    """
    Department model for organizational structure
    """
    dept_name = models.CharField(max_length=100)
    dept_head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  limit_choices_to={'role':'staff'})
    service = models.TextField(blank=True)
    
    def __str__(self):
        return self.dept_name


# class Trainee(models.Model):
#     """
#     Trainee model - separate from User as per schema
#     """
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trainee_profile')
#     department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    
#     def __str__(self):
#         return f"Trainee: {self.user.full_name}"


class Innovator(models.Model):
    Gender=[
        ('male', 'Male'),
        ('female','Female'),
    ]
    email = models.EmailField()
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True)
    sex= models.CharField(max_length=10,choices=Gender, null=False, blank=False)
    phone_number = models.CharField(max_length=15, blank=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

