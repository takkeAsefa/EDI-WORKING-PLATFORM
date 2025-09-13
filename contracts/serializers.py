from rest_framework import serializers
from .models import Contract
from training.serializers import TrainingSerializer, TrainingTypeSerializer
from accounts.serializers import UserSerializer


class ContractSerializer(serializers.ModelSerializer):
    """
    Contract serializer
    """
    training_details = TrainingTypeSerializer(source='for_training', read_only=True)
    signed_by_name = serializers.CharField(source='signed_by.full_name', read_only=True)
    
    class Meta:
        model = Contract
        fields = ('id', 'for_training', 'contract_doc', 'training_details', 
                  'signed_by_name', 'completion', 'end_date', 
                 'signed_date', 'terms_and_conditions', 'created_date')
        read_only_fields = ('created_date','signed_date')
    
    def validate_id(self, value):
        if Contract.objects.filter(id=value).exists():
            raise serializers.ValidationError("Contract ID already exists")
        return value

