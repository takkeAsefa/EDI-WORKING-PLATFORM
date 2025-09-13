from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from django.db.models import Q
from .models import (
    TrainingType, Training, TrainingApplication, 
    Certificate, Payment, Innovation, WarrantyMoney, PaymentRate, TrainerLevel
)
from .serializers import (
    TrainingTypeSerializer, TrainingSerializer, TrainingApplicationSerializer,
    CertificateSerializer, PaymentSerializer, InnovationSerializer, 
   PaymentRateSerializer,TrainerLevelSerializer, WarrantyMoneySerializer
)


class IsTrainerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow trainers, staff, or admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['trainer', 'staff', 'admin','rworker']


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow staff or admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['staff', 'admin']

class IsStaffOrAdminRworker(permissions.BasePermission):
    """
    Custom permission to only allow staff or admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['staff', 'admin',]
# Training Type Views
class TrainingTypeListCreateView(generics.ListCreateAPIView):
    """
    List and create training types
    """
    queryset = TrainingType.objects.all()
    serializer_class = TrainingTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class TrainingTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a training type
    """
    queryset = TrainingType.objects.all()
    serializer_class = TrainingTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


# Training Views
class TrainingListCreateView(generics.ListCreateAPIView):
    """
    List and create training sessions
    """
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Training.objects.all()
        if self.request.user.role == 'trainer':
            # Trainers can only see their own training sessions
            # given_by=self.request.user
            queryset = queryset.filter()
        return queryset.order_by('-given_date')
    
    def perform_create(self, serializer):
        if self.request.user.role in['admin','rworker','staff']:
            serializer.save(given_by=self.request.user)
        else:
            serializer.save()


class TrainingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a training session
    """
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [IsTrainerOrStaff]
    
    def get_queryset(self):
        queryset = Training.objects.all()
        if self.request.user.role == 'trainer':
            # Trainers can only access their own training sessions
            queryset = queryset.filter(given_by=self.request.user)
        return queryset


# Training Application Views
class TrainingApplicationListCreateView(generics.ListCreateAPIView):
    """
    List and create training applications
    """
    queryset = TrainingApplication.objects.all()
    serializer_class = TrainingApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrainingApplication.objects.all()
        if self.request.user.role == 'trainer':
            # Trainers can see applications for their training sessions
            queryset = queryset.filter(trainer=self.request.user)
        elif self.request.user.role in ['staff', 'admin']:
            # Staff and admin can see all applications
            pass
        else:
            # Other users can only see their own applications
            queryset = queryset.filter(trainer=self.request.user)
        return queryset.order_by('-applied_date')


class TrainingApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a training application
    """
    queryset = TrainingApplication.objects.all()
    serializer_class = TrainingApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def approve_training_application(request, pk):
    """
    Approve a training application
    """
    try:
        application = TrainingApplication.objects.get(pk=pk)
        if request.user.role == 'trainer' and application.trainer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application.status = 'approved'
        application.save()
        serializer = TrainingApplicationSerializer(application)
        return Response(serializer.data)
    except TrainingApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])    
def complete_training_application(request, pk):
    """
    complete a training application
    """
    try:
        application = TrainingApplication.objects.get(pk=pk)
        if request.user.role == 'trainer' and application.trainer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application.status = 'complete'
        application.save()
        serializer = TrainingApplicationSerializer(application)
        return Response(serializer.data)
    except TrainingApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def reject_training_application(request, pk):
    """
    Reject a training application
    """
    try:
        application = TrainingApplication.objects.get(pk=pk)
        if request.user.role == 'trainer' and application.trainer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application.status = 'rejected'
        application.save()
        serializer = TrainingApplicationSerializer(application)
        return Response(serializer.data)
    except TrainingApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsTrainerOrStaff])
def apply(request, pk):
    """
    API endpoint for trainers to apply for a specific training.
    
    Args:
        request: HTTP request object
        pk: Primary key of the training to apply for
    
    Returns:
        Response with application data or error message
    """
    try:
        # Get the training object or return 404 if not found
        training = get_object_or_404(Training, id=pk)
        
        # Check if the user is a trainer
        if request.user.role != 'trainer':
            return Response(
                {"error": "Only trainers can apply for training programs"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the trainer has already applied for this training
        existing_application = TrainingApplication.objects.filter(
            trainer=request.user,
            for_training=training
        ).first()
        
        if existing_application:
            return Response(
                {"error": "You have already applied for this training"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare data for the application
        application_data = request.data.copy()
        print('APPLICATION:' ,application_data)
        application_data['trainer'] = request.user.id
        application_data['for_training'] = training.id
        print('APPLICATION:' ,application_data)
        
        # Create and validate the serializer
        serializer = TrainingApplicationSerializer(data=application_data)
        
        if serializer.is_valid():
            # Save the application
            application = serializer.save()
            
            return Response(
                {
                    "message": "Application submitted successfully",
                    "application": TrainingApplicationSerializer(application).data
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"errors": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Training.DoesNotExist:
        return Response(
            {"error": "Training not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except IntegrityError:
        return Response(
            {"error": "Application already exists for this training"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    # except Exception as e:
    #     return Response(
    #         {"error": f"An unexpected error occurred: {str(e)}"}, 
    #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #     )


@api_view(['GET'])
@permission_classes([IsTrainerOrStaff])
def get_training_applications(request, pk=None):
    """
    API endpoint to get training applications.
    
    Args:
        request: HTTP request object
        pk: Optional primary key of specific training
    
    Returns:
        Response with application data
    """
    try:
        if pk:
            # Get applications for a specific training
            training = get_object_or_404(Training, id=pk)
            applications = TrainingApplication.objects.filter(training=training)
        else:
            # Get all applications for the current trainer
            if request.user.role == 'trainer':
                applications = TrainingApplication.objects.filter(trainer=request.user)
            else:
                # Staff can see all applications
                applications = TrainingApplication.objects.all()
        
        serializer = TrainingApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Training.DoesNotExist:
        return Response(
            {"error": "Training not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['GET'])
@permission_classes([IsTrainerOrStaff])
def get_application_detail(request, pk, app_id):
    """
    API endpoint to get details of a specific training application.
    
    Args:
        request: HTTP request object
        pk: Primary key of the training
        app_id: Primary key of the application
    
    Returns:
        Response with application details
    """
    try:
        training = get_object_or_404(Training, id=pk)
        application = get_object_or_404(
            TrainingApplication, 
            id=app_id, 
            training=training
        )
        
        # Check permissions
        if request.user.role == 'trainer' and application.trainer != request.user:
            return Response(
                {"error": "You can only view your own applications"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TrainingApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except TrainingApplication.DoesNotExist:
        return Response(
            {"error": "Application not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsStaffOrAdmin])
def update_application_status(request, app_id):
    """
    API endpoint for staff to update application status.
    
    Args:
        request: HTTP request object
        app_id: Primary key of the application
    
    Returns:
        Response with updated application data
    """
    try:
        application = get_object_or_404(TrainingApplication, id=app_id)
        
        # Import the update serializer
        from .serializers import TrainingApplicationUpdateSerializer
        
        serializer = TrainingApplicationUpdateSerializer(
            application, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            # Set the reviewer
            serializer.save(reviewed_by=request.user)
            
            return Response(
                {
                    "message": "Application status updated successfully",
                    "application": TrainingApplicationSerializer(application).data
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"errors": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except TrainingApplication.DoesNotExist:
        return Response(
            {"error": "Application not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsTrainerOrStaff])
def withdraw_application(request, app_id):
    """
    API endpoint for trainers to withdraw their application.
    
    Args:
        request: HTTP request object
        app_id: Primary key of the application
    
    Returns:
        Response confirming withdrawal
    """
    try:
        application = get_object_or_404(
            TrainingApplication, 
            id=app_id, 
            trainer=request.user
        )
        
        # Check if application can be withdrawn
        if application.status not in ['pending', 'approved']:
            return Response(
                {"error": "Application cannot be withdrawn in its current status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to withdrawn
        application.status = 'withdrawn'
        application.save()
        
        serializer = TrainingApplicationSerializer(application)
        return Response(
            {
                "message": "Application withdrawn successfully",
                "application": serializer.data
            },
            status=status.HTTP_200_OK
        )
        
    except TrainingApplication.DoesNotExist:
        return Response(
            {"error": "Application not found or you don't have permission to withdraw it"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Certificate Views
class CertificateListCreateView(generics.ListCreateAPIView):
    """
    List and create certificates
    """
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Certificate.objects.all()
        if self.request.user.role == 'trainer' or \
            self.request.user.role=='rworker' or \
                self.request.user.role=='trainee' :
            # Trainees can see certificates for their training sessions
            queryset = queryset.filter(certified=self.request.user)
        return queryset.order_by('-given_date')
    
    

class CertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a certificate
    """
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsTrainerOrStaff]


# Payment Views
class PaymentListCreateView(generics.ListCreateAPIView):
    """
    List and create payments
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Payment.objects.all()
        if self.request.user.role in ['staff', 'admin']:
            # Staff and admin can see all payments
            pass
        else:
            # Other users can only see their own payments
            queryset = queryset.filter(requested_by=self.request.user)
        return queryset.order_by('-created_date')
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

class PaymentRateView(generics.ListCreateAPIView):
    queryset=PaymentRate.objects.all()
    serializer_class= PaymentRateSerializer
    permission_classes=[permissions.IsAuthenticated]

class TrainerLevelView(generics.ListCreateAPIView):
    queryset=TrainerLevel.objects.all()
    serializer_class= TrainerLevelSerializer
    permission_classes=[permissions.IsAuthenticated]


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a payment
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def approve_payment(request, pk):
    """
    Approve a payment
    """
    try:
        payment = Payment.objects.get(pk=pk)
        payment.status = 'approved'
        # payment.requested_by = request.user
        payment.save()
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def reject_payment(request, pk):
    """
    reject a payment
    """
    try:
        payment = Payment.objects.get(pk=pk)
        payment.status = 'rejected'
        # payment.requested_by = request.user
        payment.save()
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["POST"])
@permission_classes([IsTrainerOrStaff])
def request_payment(request, pk):
    """
    Handles a payment request for a specific training.
    """
    service_days=0
    # Get the training object or return 404 if not found
    trapp = get_object_or_404(TrainingApplication, id=pk)

    training_start= trapp.for_training.given_date
    training_end= trapp.for_training.end_date

    level= get_object_or_404(TrainerLevel,trainer=request.user).trainer_level
    rate_perday= get_object_or_404(PaymentRate, level=level).per_day

    if training_end==training_start:
        service_days=1
    else:
        service_days= (training_end - training_start).days
        
    calculated_payments= rate_perday * service_days


    # print('LEVEL', level)
    # print('Rate',rate_perday)
    # print('training_end', training_end)
    # print('traing start:', training_start)
    # print('days:',service_days)
    # print(type(training_end - training_start))
    # print("Day:",type(service_days))
    # print("calculated:",calculated_payments)



    
    requested_data = request.data.copy()
    requested_data["requested_by"] = request.user.id
    requested_data["reason"] = trapp.for_training.training_id
    requested_data["amount"]= calculated_payments

    # Check if the user has already requested for this payment
    if Payment.objects.filter(requested_by=request.user, reason=requested_data["reason"]).exists():
        return Response(
            {"error": "You have already requested payment for this training."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create and validate the serializer
    serializer = PaymentSerializer(data=requested_data)

    if serializer.is_valid():
        try:
            # Save the application
            payment_requested = serializer.save()
            return Response(
                {
                    "message": "Payment request submitted successfully",
                    "payment": PaymentSerializer(payment_requested).data
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {"error": "A payment request for this training already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    

# Innovation Views
class InnovationListCreateView(generics.ListCreateAPIView):
    """
    List and create innovations
    """
    queryset = Innovation.objects.all()
    serializer_class = InnovationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Innovation.objects.all().order_by('-created_date')


class InnovationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an innovation
    """
    queryset = Innovation.objects.all()
    serializer_class = InnovationSerializer
    permission_classes = [permissions.IsAuthenticated]


# Warranty Money Views
class WarrantyMoneyListCreateView(generics.ListCreateAPIView):
    """
    List and create warranty money records
    """
    queryset = WarrantyMoney.objects.all()
    serializer_class = WarrantyMoneySerializer
    permission_classes = [IsStaffOrAdmin]
    
    def get_queryset(self):
        return WarrantyMoney.objects.all().order_by('-created_date')


class WarrantyMoneyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a warranty money record
    """
    queryset = WarrantyMoney.objects.all()
    serializer_class = WarrantyMoneySerializer
    permission_classes = [IsStaffOrAdmin]

