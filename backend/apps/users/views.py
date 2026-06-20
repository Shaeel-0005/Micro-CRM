from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from apps.workspaces.services import create_workspace_for_user


class SignupView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Validation
        if not username or not password:
            return Response(
                {'error': 'Username and password required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email or '',
            password=password
        )

        membership = create_workspace_for_user(user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'workspace': {
                'id': membership.workspace.id,
                'name': membership.workspace.name,
                'role': membership.role,
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


# A little "show me off" view for your authenticated users
from apps.workspaces.services import get_active_membership


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whoami(request):
    user = request.user
    membership = get_active_membership(user)
    payload = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }
    if membership:
        payload['workspace'] = {
            'id': membership.workspace.id,
            'name': membership.workspace.name,
            'role': membership.role,
            'role_display': membership.get_role_display(),
        }
    return Response(payload)
