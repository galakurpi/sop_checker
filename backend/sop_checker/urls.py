from django.urls import path
from . import views

urlpatterns = [
    # Users
    path('users/', views.get_users, name='get-users'),
    path('users/<int:user_id>/lists/', views.user_assigned_lists, name='user-assigned-lists'),
    
    # SOP Lists
    path('lists/', views.get_lists, name='get-lists'),
    path('lists/create/', views.create_list, name='create-list'),
    path('lists/<int:list_id>/', views.get_list_detail, name='get-list-detail'),
    path('lists/<int:list_id>/update/', views.update_list, name='update-list'),
    path('lists/<int:list_id>/delete/', views.delete_list, name='delete-list'),
    
    # SOP Items
    path('items/<int:item_id>/toggle/', views.toggle_item_check, name='toggle-item'),
] 