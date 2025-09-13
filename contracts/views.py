from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Contract
from .serializers import ContractSerializer
import uuid


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow staff or admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['staff', 'admin']
    
class IsTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['trainer']
        


class ContractListCreateView(generics.ListCreateAPIView):
    """
    List and create contracts
    """
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Contract.objects.all()
        if self.request.user.role=='trainer':
            # self.permission_classes=[IsTrainer]
            return queryset.filter(signed_by=self.request.user).order_by('-created_date')
        return queryset.order_by('-created_date')
    
    def perform_create(self, serializer):
        if self.request.user.role =='trainer':
            serializer.save(signed_by=self.request.user)
        else:
            serializer.save(signed_by=self.request.user)


class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a contract
    """
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def activate_contract(request, pk):
    """
    Activate a contract
    """
    try:
        contract = Contract.objects.get(pk=pk)
        contract.completion = 'active'
        contract.save()
        serializer = ContractSerializer(contract)
        return Response(serializer.data)
    except Contract.DoesNotExist:
        return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def complete_contract(request, pk):
    """
    Mark a contract as completed
    """
    try:
        contract = Contract.objects.get(pk=pk)
        contract.completion = 'completed'
        contract.save()
        serializer = ContractSerializer(contract)
        return Response(serializer.data)
    except Contract.DoesNotExist:
        return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def terminate_contract(request, pk):
    """
    Terminate a contract
    """
    try:
        contract = Contract.objects.get(pk=pk)
        contract.completion = 'terminated'
        contract.save()
        serializer = ContractSerializer(contract)
        return Response(serializer.data)
    except Contract.DoesNotExist:
        return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

