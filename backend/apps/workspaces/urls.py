from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AcceptInviteView,
    AuditLogViewSet,
    WorkspaceInviteViewSet,
    WorkspaceMeView,
    WorkspaceMemberViewSet,
)

router = DefaultRouter()
router.register(r'members', WorkspaceMemberViewSet, basename='workspace-member')
router.register(r'audit', AuditLogViewSet, basename='workspace-audit')

invite_list = WorkspaceInviteViewSet.as_view({'get': 'list', 'post': 'create'})

urlpatterns = [
    path('me/', WorkspaceMeView.as_view(), name='workspace-me'),
    path('invites/accept/', AcceptInviteView.as_view(), name='workspace-invite-accept'),
    path('invites/', invite_list, name='workspace-invites'),
    path('', include(router.urls)),
]
