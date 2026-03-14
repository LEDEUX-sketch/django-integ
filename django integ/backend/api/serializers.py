from rest_framework import serializers
from .models import User, Product, CartItem, Order, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'status', 'created_at']


class UserRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField()


class ReviewSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.name', read_only=True)
    userId = serializers.IntegerField(source='user_id')
    productId = serializers.IntegerField(source='product_id')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Review
        fields = ['_id', 'userId', 'userName', 'productId', 'rating', 'comment', 'createdAt']


class ProductSerializer(serializers.ModelSerializer):
    originalPrice = serializers.FloatField(source='original_price', allow_null=True, required=False)
    shortDescription = serializers.CharField(source='short_description', allow_null=True, required=False, allow_blank=True)
    ratingCount = serializers.IntegerField(source='rating_count', required=False)
    isFeatured = serializers.BooleanField(source='is_featured', required=False)
    isFlashSale = serializers.BooleanField(source='is_flash_sale', required=False)
    flashSaleEnd = serializers.DateTimeField(source='flash_sale_end', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    _id = serializers.IntegerField(source='id', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            '_id', 'name', 'description', 'shortDescription', 'price',
            'originalPrice', 'images', 'category', 'brand', 'series',
            'condition', 'stock', 'sold', 'rating', 'ratingCount',
            'tags', 'isFeatured', 'isFlashSale', 'flashSaleEnd', 'createdAt',
            'reviews',
        ]


class CartItemProductSerializer(serializers.ModelSerializer):
    """Nested product info for cart items."""
    originalPrice = serializers.FloatField(source='original_price', allow_null=True)
    ratingCount = serializers.IntegerField(source='rating_count')
    isFeatured = serializers.BooleanField(source='is_featured')
    isFlashSale = serializers.BooleanField(source='is_flash_sale')
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Product
        fields = [
            '_id', 'name', 'description', 'price', 'originalPrice',
            'images', 'category', 'brand', 'condition', 'stock',
            'sold', 'rating', 'ratingCount', 'tags', 'isFeatured', 'isFlashSale',
        ]


class CartItemSerializer(serializers.ModelSerializer):
    product = CartItemProductSerializer(read_only=True)
    productId = serializers.IntegerField(source='product_id')
    userId = serializers.IntegerField(source='user_id')
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = CartItem
        fields = ['_id', 'userId', 'productId', 'quantity', 'product']


class OrderSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user_id')
    totalAmount = serializers.FloatField(source='total_amount')
    shippingAddress = serializers.JSONField(source='shipping_address')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Order
        fields = ['_id', 'userId', 'items', 'totalAmount', 'status', 'shippingAddress', 'createdAt']
