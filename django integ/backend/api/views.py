from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from .models import User, Product, CartItem, Order
from .serializers import (
    UserSerializer, ProductSerializer, CartItemSerializer, OrderSerializer,
)


# ─── Utility: simple hash (matches the Convex demo hash) ───
def simple_hash(s: str) -> str:
    h = 0
    for ch in s:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF  # keep it 32-bit
        if h >= 0x80000000:
            h -= 0x100000000
    # convert to base-36
    if h < 0:
        return '-' + base36(-h)
    return base36(h)


def base36(n: int) -> str:
    chars = '0123456789abcdefghijklmnopqrstuvwxyz'
    if n == 0:
        return '0'
    result = ''
    while n:
        result = chars[n % 36] + result
        n //= 36
    return result


# ─────────────────────── AUTH ───────────────────────

ADMIN_EMAIL = "admin@toybox.com"
ADMIN_PASSWORD = "admin123"


@api_view(['POST'])
def register(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    name = request.data.get('name', '').strip()

    if not email or not password or not name:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create(
        email=email,
        password_hash=simple_hash(password),
        name=name,
        role='user',
        status='active',
    )

    return Response({
        'userId': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'status': user.status,
    })


@api_view(['POST'])
def sign_in(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.password_hash != simple_hash(password):
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.status == 'banned':
        return Response({'error': 'Your account has been banned. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

    if user.status == 'suspended':
        return Response({'error': 'Your account has been suspended. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

    return Response({
        'userId': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'status': user.status,
    })


@api_view(['POST'])
def admin_login(request):
    """Auto-create admin on first call, then return admin user."""
    admin, created = User.objects.get_or_create(
        email=ADMIN_EMAIL,
        defaults={
            'password_hash': simple_hash(ADMIN_PASSWORD),
            'name': 'Admin',
            'role': 'admin',
            'status': 'active',
        },
    )
    return Response({
        'userId': str(admin.id),
        'name': admin.name,
        'email': admin.email,
        'role': admin.role,
        'status': admin.status,
    })


@api_view(['GET'])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserSerializer(user).data)


# ─────────────────────── USERS (Admin) ───────────────────────

@api_view(['GET'])
def list_users(request):
    users = User.objects.all().order_by('-id')
    data = []
    for u in users:
        data.append({
            '_id': str(u.id),
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'status': u.status,
            'createdAt': u.created_at.timestamp() * 1000,  # milliseconds like JS Date.now()
        })
    return Response(data)


@api_view(['POST'])
def ban_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    if user.role == 'admin':
        return Response({'error': 'Cannot ban an admin user.'}, status=status.HTTP_400_BAD_REQUEST)
    user.status = 'banned'
    user.save()
    return Response({'success': True})


@api_view(['POST'])
def unban_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    user.status = 'active'
    user.save()
    return Response({'success': True})


@api_view(['POST'])
def suspend_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    if user.role == 'admin':
        return Response({'error': 'Cannot suspend an admin user.'}, status=status.HTTP_400_BAD_REQUEST)
    user.status = 'suspended'
    user.save()
    return Response({'success': True})


@api_view(['POST'])
def reactivate_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    user.status = 'active'
    user.save()
    return Response({'success': True})


@api_view(['PUT'])
def update_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    if 'name' in data:
        user.name = data['name']
    if 'role' in data and data['role'] in dict(User.ROLE_CHOICES):
        user.role = data['role']
    if 'status' in data and data['status'] in dict(User.STATUS_CHOICES):
        user.status = data['status']
    
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    if user.role == 'admin':
        return Response({'error': 'Cannot delete an admin user.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.delete()
    return Response({'success': True})


# ─────────────────────── PRODUCTS ───────────────────────

@api_view(['GET'])
def product_list(request):
    category = request.query_params.get('category')
    brand = request.query_params.get('brand')
    limit = int(request.query_params.get('limit', 50))

    qs = Product.objects.all()
    if category:
        qs = qs.filter(category=category)
    elif brand:
        qs = qs.filter(brand=brand)

    qs = qs.order_by('-created_at')[:limit]
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['GET'])
def products_featured(request):
    qs = Product.objects.filter(is_featured=True)[:10]
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['GET'])
def products_flash_sale(request):
    now = timezone.now()
    qs = Product.objects.filter(is_flash_sale=True).filter(
        Q(flash_sale_end__isnull=True) | Q(flash_sale_end__gt=now)
    )[:20]
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['GET'])
def product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(None, status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(product).data)


@api_view(['GET'])
def product_search(request):
    term = request.query_params.get('searchTerm', '').strip()
    if not term:
        return Response([])
    qs = Product.objects.filter(name__icontains=term)[:20]
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['POST'])
def create_product(request):
    data = request.data
    product = Product.objects.create(
        name=data.get('name', ''),
        description=data.get('description', ''),
        short_description=data.get('shortDescription', ''),
        price=float(data.get('price', 0)),
        category=data.get('category', ''),
        brand=data.get('brand', ''),
        condition=data.get('condition', ''),
        stock=int(data.get('stock', 0)),
        images=data.get('images', []),
        sold=0,
        rating=0,
        rating_count=0,
        tags=[],
        is_featured=False,
        is_flash_sale=False,
    )
    return Response({'_id': str(product.id)}, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'shortDescription' in data:
        product.short_description = data['shortDescription']
    if 'price' in data:
        product.price = float(data['price'])
    if 'originalPrice' in data:
        product.original_price = data['originalPrice']
    if 'images' in data:
        product.images = data['images']
    if 'category' in data:
        product.category = data['category']
    if 'brand' in data:
        product.brand = data['brand']
    if 'series' in data:
        product.series = data['series']
    if 'condition' in data:
        product.condition = data['condition']
    if 'stock' in data:
        product.stock = int(data['stock'])
    if 'tags' in data:
        product.tags = data['tags']
    if 'isFeatured' in data:
        product.is_featured = bool(data['isFeatured'])
    if 'isFlashSale' in data:
        product.is_flash_sale = bool(data['isFlashSale'])
    if 'flashSaleEnd' in data:
        product.flash_sale_end = data['flashSaleEnd']
    
    product.save()
    return Response(ProductSerializer(product).data)


@api_view(['DELETE'])
def delete_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    product.delete()
    return Response({'success': True})


# ─────────────────────── CART ───────────────────────

@api_view(['GET'])
def cart_get(request):
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response({'error': 'userId is required.'}, status=status.HTTP_400_BAD_REQUEST)

    items = CartItem.objects.filter(user_id=user_id).select_related('product')
    return Response(CartItemSerializer(items, many=True).data)


@api_view(['POST'])
def cart_add(request):
    user_id = request.data.get('userId')
    product_id = request.data.get('productId')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    if product.stock < quantity:
        return Response({'error': 'Not enough stock.'}, status=status.HTTP_400_BAD_REQUEST)

    cart_item, created = CartItem.objects.get_or_create(
        user_id=user_id,
        product_id=product_id,
        defaults={'quantity': quantity},
    )
    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    return Response({'success': True})


@api_view(['POST'])
def cart_update_quantity(request):
    cart_item_id = request.data.get('cartItemId')
    quantity = int(request.data.get('quantity', 0))

    try:
        cart_item = CartItem.objects.get(id=cart_item_id)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

    if quantity <= 0:
        cart_item.delete()
    else:
        cart_item.quantity = quantity
        cart_item.save()

    return Response({'success': True})


@api_view(['POST'])
def cart_remove(request):
    cart_item_id = request.data.get('cartItemId')
    try:
        cart_item = CartItem.objects.get(id=cart_item_id)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
    cart_item.delete()
    return Response({'success': True})


@api_view(['GET'])
def cart_count(request):
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response(0)
    items = CartItem.objects.filter(user_id=user_id)
    total = sum(item.quantity for item in items)
    return Response(total)


# ─────────────────────── ORDERS ───────────────────────

@api_view(['POST'])
def place_order(request):
    user_id = request.data.get('userId')
    shipping_address = request.data.get('shippingAddress', {})

    cart_items = CartItem.objects.filter(user_id=user_id).select_related('product')
    if not cart_items.exists():
        return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    total_amount = 0
    order_items = []

    for cart_item in cart_items:
        product = cart_item.product
        if product.stock < cart_item.quantity:
            return Response(
                {'error': f'Not enough stock for {product.name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_items.append({
            'productId': str(product.id),
            'name': product.name,
            'price': product.price,
            'quantity': cart_item.quantity,
            'image': product.images[0] if product.images else '',
        })
        total_amount += product.price * cart_item.quantity

        # Decrement stock, increment sold
        product.stock -= cart_item.quantity
        product.sold += cart_item.quantity
        product.save()

    order = Order.objects.create(
        user_id=user_id,
        items=order_items,
        total_amount=total_amount,
        status='pending',
        shipping_address=shipping_address,
    )

    # Clear cart
    cart_items.delete()

    return Response({'_id': str(order.id)}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def orders_by_user(request):
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response({'error': 'userId is required.'}, status=status.HTTP_400_BAD_REQUEST)
    orders = Order.objects.filter(user_id=user_id).order_by('-created_at')[:50]
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['PUT'])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    if new_status not in dict(Order.STATUS_CHOICES):
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = new_status
    order.save()
    return Response(OrderSerializer(order).data)


# ─────────────────────── SEED ───────────────────────

@api_view(['POST'])
def seed_products(request):
    """Seed the database with demo products (idempotent – deletes existing first)."""
    from datetime import timedelta

    Product.objects.all().delete()

    now = timezone.now()
    SEED = [
        dict(name="Hot Toys Iron Man Mark LXXXV", description="1/6th scale collectible figure from Avengers: Endgame. Die-cast construction with over 50 points of articulation and LED light-up features.", price=18500, original_price=22000, images=["/products/iron-man.jpg"], category="action-figures", brand="Hot Toys", series="Marvel Avengers", condition="mint-in-box", stock=5, sold=142, rating=4.9, rating_count=87, tags=["marvel","iron-man","die-cast","premium","LED"], is_featured=True, is_flash_sale=False),
        dict(name="S.H.Figuarts Spider-Man No Way Home", description="Highly articulated action figure with multiple interchangeable hands and web effects. Includes Tom Holland head sculpt.", price=4200, original_price=5500, images=["/products/spider-man.jpg"], category="action-figures", brand="SHFiguarts", series="Marvel Spider-Man", condition="new", stock=12, sold=305, rating=4.8, rating_count=213, tags=["marvel","spider-man","shf","bandai"], is_featured=True, is_flash_sale=True, flash_sale_end=now + timedelta(days=7)),
        dict(name="MAFEX Batman Hush", description="Premium 6-inch action figure based on the iconic Batman: Hush comic. Includes batarang, grapple gun, and fabric cape.", price=5800, images=["/products/batman.jpg"], category="action-figures", brand="Mafex", series="DC Comics", condition="new", stock=8, sold=198, rating=4.7, rating_count=156, tags=["dc","batman","mafex","medicom"], is_featured=True, is_flash_sale=False),
        dict(name="Dragon Ball Z Goku Ultra Instinct Statue", description="12-inch premium resin statue featuring Goku in Ultra Instinct form. Hand-painted with LED base effects.", price=12800, original_price=15000, images=["/products/goku.jpg"], category="statues", brand="Banpresto", series="Dragon Ball Z", condition="mint-in-box", stock=3, sold=67, rating=4.9, rating_count=45, tags=["anime","dragon-ball","goku","statue","LED"], is_featured=True, is_flash_sale=True, flash_sale_end=now + timedelta(days=5)),
        dict(name="LEGO Star Wars UCS Millennium Falcon", description="Ultimate Collector Series set with 7,541 pieces. Includes Han Solo, Chewbacca, Princess Leia, and C-3PO minifigures.", price=42000, images=["/products/millennium-falcon.jpg"], category="model-kits", brand="LEGO", series="Star Wars", condition="new", stock=2, sold=23, rating=5.0, rating_count=19, tags=["lego","star-wars","ucs","premium"], is_featured=True, is_flash_sale=False),
        dict(name="Gundam RG Wing Zero Custom EW", description="Real Grade 1/144 scale model kit. Features advanced inner frame and beautiful angel wing effect parts.", price=2200, original_price=2800, images=["/products/gundam-wing.jpg"], category="model-kits", brand="Bandai", series="Gundam Wing", condition="new", stock=20, sold=412, rating=4.6, rating_count=287, tags=["gundam","bandai","model-kit","real-grade"], is_featured=False, is_flash_sale=True, flash_sale_end=now + timedelta(days=3)),
        dict(name="Jada Toys Batmobile 1989 1:24", description="Die-cast metal Batmobile from Tim Burton's 1989 Batman. Includes Batman figure. Opening cockpit and rubber tires.", price=1800, images=["/products/batmobile.jpg"], category="diecast", brand="Jada Toys", series="DC Comics", condition="new", stock=15, sold=156, rating=4.5, rating_count=98, tags=["dc","batman","diecast","batmobile"], is_featured=False, is_flash_sale=False),
        dict(name="One Piece Monkey D. Luffy Gear 5 Figure", description="Premium Ichiban Kuji prize figure of Luffy in Gear 5 Nika form. 10-inch tall with dynamic pose and cloud effects.", price=3500, original_price=4500, images=["/products/luffy.jpg"], category="action-figures", brand="Banpresto", series="One Piece", condition="new", stock=7, sold=534, rating=4.8, rating_count=321, tags=["anime","one-piece","luffy","gear-5"], is_featured=True, is_flash_sale=True, flash_sale_end=now + timedelta(days=4)),
        dict(name="Naruto Shippuden Itachi Uchiha Statue", description="Premium resin statue of Itachi Uchiha with Susanoo aura effect. 14-inch tall, limited edition with certificate.", price=16500, images=["/products/itachi.jpg"], category="statues", brand="Tsume Art", series="Naruto Shippuden", condition="mint-in-box", stock=2, sold=31, rating=5.0, rating_count=28, tags=["anime","naruto","itachi","limited-edition"], is_featured=True, is_flash_sale=False),
        dict(name="McFarlane DC Multiverse The Flash", description="7-inch action figure with 22 points of articulation. Includes Speed Force lightning effects and display base.", price=1500, original_price=1900, images=["/products/flash.jpg"], category="action-figures", brand="McFarlane", series="DC Comics", condition="new", stock=25, sold=189, rating=4.3, rating_count=142, tags=["dc","flash","mcfarlane","budget-friendly"], is_featured=False, is_flash_sale=True, flash_sale_end=now + timedelta(days=6)),
        dict(name="Demon Slayer Tanjiro & Nezuko Set", description="Twin-pack collectible figures of Tanjiro Kamado and Nezuko. Premium paint finish with water breathing effect parts.", price=4800, images=["/products/demon-slayer.jpg"], category="action-figures", brand="Banpresto", series="Demon Slayer", condition="new", stock=10, sold=267, rating=4.7, rating_count=198, tags=["anime","demon-slayer","tanjiro","nezuko"], is_featured=False, is_flash_sale=False),
        dict(name="Transformers Masterpiece Optimus Prime", description="Masterpiece MP-44 version 3.0. Die-cast parts, trailer included, fully transforms between robot and truck mode.", price=28000, images=["/products/optimus.jpg"], category="action-figures", brand="Takara Tomy", series="Transformers", condition="mint-in-box", stock=3, sold=45, rating=4.9, rating_count=34, tags=["transformers","masterpiece","optimus","die-cast"], is_featured=True, is_flash_sale=False),
    ]

    for p in SEED:
        Product.objects.create(**p)

    return Response({'message': f'Seeded {len(SEED)} products successfully!'})
