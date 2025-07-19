import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from supabase import create_client, Client
from django.conf import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

@api_view(['GET'])
def get_users(request):
    """Get all users from Supabase"""
    try:
        response = supabase.table('auth_user').select('*').execute()
        return Response(response.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_lists(request):
    """Get all SOP lists from Supabase"""
    try:
        print("🔍 Fetching all lists...")
        
        # Fetch all lists with user data
        lists_response = supabase.table('sop_lists').select('''
            *,
            assigned_user:auth_user!assigned_user_id(*),
            created_by:auth_user!created_by_id(*)
        ''').execute()
        
        print(f"📊 Lists response: {len(lists_response.data)} lists found")
        
        # Fetch all items for all lists
        items_response = supabase.table('sop_items').select('*').order('sop_list_id, order').execute()
        
        print(f"📋 Items response: {len(items_response.data)} items found")
        
        # Group items by list_id
        items_by_list = {}
        for item in items_response.data:
            list_id = item['sop_list_id']
            if list_id not in items_by_list:
                items_by_list[list_id] = []
            items_by_list[list_id].append(item)
        
        # Add items to each list
        for list_data in lists_response.data:
            list_id = list_data['id']
            list_data['items'] = items_by_list.get(list_id, [])
        
        print(f"✅ Returning {len(lists_response.data)} lists with items")
        return Response(lists_response.data)
    except Exception as e:
        print(f"💥 Error in get_lists: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_list(request):
    """Create new SOP list in Supabase"""
    try:
        data = request.data
        items = data.pop('items', [])
        
        # Create the list
        list_response = supabase.table('sop_lists').insert(data).execute()
        list_id = list_response.data[0]['id']
        
        # Create items if provided
        if items:
            items_data = [
                {
                    'sop_list_id': list_id,
                    'text': item,
                    'order': index
                }
                for index, item in enumerate(items)
            ]
            supabase.table('sop_items').insert(items_data).execute()
        
        # Return the created list with items
        final_response = supabase.table('sop_lists').select('''
            *,
            assigned_user:auth_user!assigned_user_id(*),
            created_by:auth_user!created_by_id(*),
            items:sop_items(*)
        ''').eq('id', list_id).execute()
        
        return Response(final_response.data[0], status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_list_detail(request, list_id):
    """Get specific SOP list from Supabase"""
    try:
        print(f"🔍 Fetching list detail for ID: {list_id}")
        
        # Fetch the list with user data
        list_response = supabase.table('sop_lists').select('''
            *,
            assigned_user:auth_user!assigned_user_id(*),
            created_by:auth_user!created_by_id(*)
        ''').eq('id', list_id).execute()
        
        print(f"📊 List response: {list_response.data}")
        
        if not list_response.data:
            print(f"❌ No list found with ID: {list_id}")
            return Response(
                {'error': 'List not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Fetch the items separately
        items_response = supabase.table('sop_items').select('*').eq('sop_list_id', list_id).order('order').execute()
        
        print(f"📋 Items response: {items_response.data}")
        
        # Combine the data
        list_data = list_response.data[0]
        list_data['items'] = items_response.data
        
        print(f"✅ Final list data with items: {list_data}")
        print(f"📋 Items count: {len(list_data.get('items', []))}")
        
        return Response(list_data)
    except Exception as e:
        print(f"💥 Error in get_list_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
def update_list(request, list_id):
    """Update SOP list in Supabase"""
    try:
        response = supabase.table('sop_lists').update(request.data).eq('id', list_id).execute()
        
        if not response.data:
            return Response(
                {'error': 'List not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(response.data[0])
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_list(request, list_id):
    """Delete SOP list from Supabase"""
    try:
        response = supabase.table('sop_lists').delete().eq('id', list_id).execute()
        return Response({'message': 'List deleted successfully'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def toggle_item_check(request, item_id):
    """Toggle the checked status of an SOP item in Supabase"""
    try:
        # Get current item
        current_item = supabase.table('sop_items').select('*').eq('id', item_id).execute()
        
        if not current_item.data:
            return Response(
                {'error': 'Item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        item = current_item.data[0]
        new_checked_status = not item['is_checked']
        
        # Update item
        update_data = {
            'is_checked': new_checked_status,
            'checked_at': 'now()' if new_checked_status else None
        }
        
        response = supabase.table('sop_items').update(update_data).eq('id', item_id).execute()
        return Response(response.data[0])
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def user_assigned_lists(request, user_id):
    """Get all SOP lists assigned to a specific user from Supabase"""
    try:
        print(f"🔍 Fetching lists for user ID: {user_id}")
        
        # Fetch lists assigned to the user
        lists_response = supabase.table('sop_lists').select('''
            *,
            assigned_user:auth_user!assigned_user_id(*),
            created_by:auth_user!created_by_id(*)
        ''').eq('assigned_user_id', user_id).execute()
        
        print(f"📊 User lists response: {len(lists_response.data)} lists found")
        
        if lists_response.data:
            # Get all list IDs
            list_ids = [lst['id'] for lst in lists_response.data]
            
            # Fetch items for these lists
            items_response = supabase.table('sop_items').select('*').in_('sop_list_id', list_ids).order('sop_list_id, order').execute()
            
            print(f"📋 Items response: {len(items_response.data)} items found")
            
            # Group items by list_id
            items_by_list = {}
            for item in items_response.data:
                list_id = item['sop_list_id']
                if list_id not in items_by_list:
                    items_by_list[list_id] = []
                items_by_list[list_id].append(item)
            
            # Add items to each list
            for list_data in lists_response.data:
                list_id = list_data['id']
                list_data['items'] = items_by_list.get(list_id, [])
        
        print(f"✅ Returning {len(lists_response.data)} lists with items for user {user_id}")
        return Response(lists_response.data)
    except Exception as e:
        print(f"💥 Error in user_assigned_lists: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 