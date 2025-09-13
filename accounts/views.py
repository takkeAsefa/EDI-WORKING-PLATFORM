from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from .models import User, Staff, Trainer, Rworker, Department, Trainee, Innovator
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    StaffSerializer, TrainerSerializer, RworkerSerializer,
    DepartmentSerializer, TraineeSerializer, InnovatorSerializer
)


class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow admin or staff users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class IsStaffOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user with role-based validation
    """
    serializer = UserRegistrationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """
    Login user and return token
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """
    Logout user and delete token
    """
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """
    Update current user profile
    """
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffListView(generics.ListAPIView):
    """
    List all staff members (Admin only)
    """
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Staff.objects.all()
        return Staff.objects.none()


class TrainerListView(generics.ListAPIView):
    """
    List all trainers (Staff and Admin only)
    """
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [IsAdminOrStaff]


class TraineeListView(generics.ListAPIView):
    """
    List all trainers (Staff and Admin only)
    """
    queryset = Trainee.objects.all()
    serializer_class = TraineeSerializer
    permission_classes = [permissions.IsAuthenticated]

class RworkerListView(generics.ListAPIView):
    """
    List all regional workers (Staff and Admin only)
    """
    queryset = Rworker.objects.all()
    serializer_class = RworkerSerializer
    permission_classes = [IsAdminOrStaff]


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    List and create departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrStaff]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a department
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrStaff]


# class TraineeListCreateView(generics.ListCreateAPIView):
#     """
#     List and create trainees
#     """
#     queryset = Trainee.objects.all()
#     serializer_class = TraineeSerializer
#     permission_classes = [permissions.IsAuthenticated]


# class TraineeDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     Retrieve, update or delete a trainee
#     """
#     queryset = Trainee.objects.all()
#     serializer_class = TraineeSerializer
#     permission_classes = [permissions.IsAuthenticated]


class InnovatorListCreateView(generics.ListCreateAPIView):
    """
    List and create innovators
    """
    queryset = Innovator.objects.all()
    serializer_class = InnovatorSerializer
    permission_classes = [permissions.IsAuthenticated]


class InnovatorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an innovator
    """
    queryset = Innovator.objects.all()
    serializer_class = InnovatorSerializer
    permission_classes = [permissions.IsAuthenticated]

