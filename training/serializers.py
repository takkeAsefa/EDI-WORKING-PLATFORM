from rest_framework import serializers
from .models import (
    TrainingType, Training, TrainingApplication, 
    Certificate, Payment, Innovation, WarrantyMoney,PaymentRate, TrainerLevel
)
from accounts.serializers import UserSerializer, InnovatorSerializer


class TrainingTypeSerializer(serializers.ModelSerializer):
    """
    Training Type serializer
    """
    class Meta:
        model = TrainingType
        fields = '__all__'


class TrainingSerializer(serializers.ModelSerializer):
    """
    Training serializer
    """
    given_by_name = serializers.CharField(source='given_by.full_name', read_only=True)
    training_type_name = serializers.CharField(source='training_type.training_type', read_only=True)
    
    class Meta:
        model = Training
        fields = ('id', 'training_id','given_by_name', 
                 'training_type', 'training_type_name', 'end_date', 
                 'given_date', 'given_location')
    
    def validate_training_id(self, value):
        if Training.objects.filter(training_id=value).exists():
            raise serializers.ValidationError("Training ID already exists")
        return value


class TrainingApplicationSerializer(serializers.ModelSerializer):
    """
    Training Application serializer
    """
    training_details = TrainingSerializer(source='for_training', read_only=True)
    trainer_name = serializers.CharField(source='trainer.full_name', read_only=True)
    
    class Meta:
        model = TrainingApplication
        fields = ('id', 'for_training', 'training_details', 'trainer', 
                 'trainer_name', 'applied_date', 'status')
        read_only_fields = ('applied_date',)
        lookup_field='for_training'


class CertificateSerializer(serializers.ModelSerializer):
    """
    Certificate serializer
    """
    certified_name = serializers.CharField(source='certified.full_name', read_only=True)
    training_details = TrainingSerializer(source='given_for', read_only=True)
    
    class Meta:
        model = Certificate
        fields = ('id', 'certificate_id', 'certified', 'certified_name', 
                 'given_for', 'training_details', 'given_date')
    
    def validate_certificate_id(self, value):
        if Certificate.objects.filter(certificate_id=value).exists():
            raise serializers.ValidationError("Certificate ID already exists")
        return value


class PaymentSerializer(serializers.ModelSerializer):
    """
    Payment serializer
    """
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ('id', 'receipt_id', 'approved_by', 'approved_by_name', 
                 'requested_by', 'requested_by_name', 'reason', 'status', 
                 'amount', 'created_date')
        read_only_fields = ('created_date','receipt_id')

    
    def validate_receipt_id(self, value):
        if Payment.objects.filter(receipt_id=value).exists():
            raise serializers.ValidationError("Receipt ID already exists")
        return value

class PaymentRateSerializer(serializers.ModelSerializer):
    class Meta:
        model=PaymentRate
        fields=('level','per_day')

class TrainerLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model= TrainerLevel
        fields= ('trainer','trainer_level')

class InnovationSerializer(serializers.ModelSerializer):
    """
    Innovation serializer
    """
    innovator_details = InnovatorSerializer(source='innovator', read_only=True)
    
    class Meta:
        model = Innovation
        fields = ('id', 'innovator', 'innovator_details', 'description', 
                 'title', 'created_date')
        read_only_fields = ('created_date',)


class WarrantyMoneySerializer(serializers.ModelSerializer):
    """
    Warranty Money serializer
    """
    allowed_for_name = serializers.CharField(source='allowed_for.full_name', read_only=True)
    
    class Meta:
        model = WarrantyMoney
        fields = ('id', 'guarantee', 'allowed_for', 'allowed_for_name', 
                 'amount', 'status', 'created_date', 'expiry_date')
        read_only_fields = ('created_date',)

