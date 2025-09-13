from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Staff, Trainer, Rworker, Department, Trainee, Innovator


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for basic user information
    """
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'middle_name', 'phone_number', 'role', 'sex','is_active', 'date_joined', 'password')
        read_only_fields = ('id', 'date_joined')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer with role-based validation
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 
                 'middle_name', 'phone_number', 'role','sex', 'password', 'password_confirm')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_role = request.user.role
            
            # Admin can register staff
            if user_role == 'admin' and value == 'staff':
                return value
            # Staff can register trainers and rworkers
            elif user_role == 'staff' and value in ['trainer', 'rworker']:
                return value
            # Anyone can register as trainee
            elif value == 'trainee':
                return value
            else:
                raise serializers.ValidationError(
                    f"You don't have permission to register users with role '{value}'"
                )
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Login serializer for user authentication
    """
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class StaffSerializer(serializers.ModelSerializer):
    """
    Staff serializer
    """
    # role= serializers.CharField(source='role', limit_choices_to={'role': 'staff'})
    class Meta:
        model = Staff
        fields = ('id', 'username', 'email','sex', 'first_name', 'last_name', 
                 'middle_name', 'phone_number', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class TrainerSerializer(serializers.ModelSerializer):
    """
    Trainer serializer
    """
    class Meta:
        model = Trainer
        fields = ('id', 'username', 'email', 'sex','first_name', 'last_name', 
                 'middle_name', 'phone_number', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class RworkerSerializer(serializers.ModelSerializer):
    """
    Regional Worker serializer
    """
    class Meta:
        model = Rworker
        fields = ('id', 'username', 'email', 'sex','first_name', 'last_name', 
                 'middle_name', 'phone_number', 'is_active', 'date_joined')
        # extra_kwargs= {'role': "Regional Worker"}
        read_only_fields = ('id', 'date_joined')
        


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Department serializer
    """
    dept_head_name = serializers.CharField(source='dept_head.full_name', read_only=True)
    
    class Meta:
        model = Department
        fields = ('id', 'dept_name', 'dept_head', 'dept_head_name', 'service')


class TraineeSerializer(serializers.ModelSerializer):
   
   class Meta:
        model = Trainee
        fields = ('id', 'username', 'email', 'sex','first_name', 'last_name', 
                 'middle_name', 'phone_number', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class InnovatorSerializer(serializers.ModelSerializer):
    """
    Innovator serializer
    """
    class Meta:
        model = Innovator
        fields = ('id', 'email', 'first_name', 'last_name', 'middle_name','sex', 'phone_number')

