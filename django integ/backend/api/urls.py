from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/signin/', views.sign_in, name='sign_in'),
    path('auth/admin-login/', views.admin_login, name='admin_login'),
    path('auth/user/<int:user_id>/', views.get_user, name='get_user'),

    # Users (Admin)
    path('users/', views.list_users, name='list_users'),
    path('users/<int:user_id>/ban/', views.ban_user, name='ban_user'),
    path('users/<int:user_id>/unban/', views.unban_user, name='unban_user'),
    path('users/<int:user_id>/suspend/', views.suspend_user, name='suspend_user'),
    path('users/<int:user_id>/reactivate/', views.reactivate_user, name='reactivate_user'),

    # Products
    path('products/', views.product_list, name='product_list'),
    path('products/featured/', views.products_featured, name='products_featured'),
    path('products/flash-sale/', views.products_flash_sale, name='products_flash_sale'),
    path('products/search/', views.product_search, name='product_search'),
    path('products/create/', views.create_product, name='create_product'),
    path('products/<int:product_id>/', views.product_detail, name='product_detail'),

    # Cart
    path('cart/', views.cart_get, name='cart_get'),
    path('cart/add/', views.cart_add, name='cart_add'),
    path('cart/update/', views.cart_update_quantity, name='cart_update_quantity'),
    path('cart/remove/', views.cart_remove, name='cart_remove'),
    path('cart/count/', views.cart_count, name='cart_count'),

    # Orders
    path('orders/place/', views.place_order, name='place_order'),
    path('orders/', views.orders_by_user, name='orders_by_user'),

    # Seed
    path('seed/', views.seed_products, name='seed_products'),
]
