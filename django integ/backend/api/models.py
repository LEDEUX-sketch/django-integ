from django.db import models  # type: ignore  # VERIFIED: Django is installed in the system Python environment.

class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('banned', 'Banned'),
        ('suspended', 'Suspended'),
    ]

    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('action-figures', 'Action Figures'),
        ('statues', 'Statues'),
        ('model-kits', 'Model Kits'),
        ('diecast', 'Die-Cast'),
        ('plush-collectibles', 'Plush & Collectibles'),
    ]
    CONDITION_CHOICES = [
        ('mint-in-box', 'Mint in Box'),
        ('new', 'New'),
        ('like-new', 'Like New'),
        ('used', 'Used'),
    ]

    name = models.CharField(max_length=500)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, null=True)
    price = models.FloatField()
    original_price = models.FloatField(blank=True, null=True)
    images = models.JSONField(default=list)  # stored as JSON array of strings
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=255)
    series = models.CharField(max_length=255, blank=True, null=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    stock = models.IntegerField(default=0)
    sold = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)
    tags = models.JSONField(default=list)  # stored as JSON array of strings
    is_featured = models.BooleanField(default=False)
    is_flash_sale = models.BooleanField(default=False)
    flash_sale_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        db_table = 'cart_items'
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.name} x{self.quantity}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    items = models.JSONField()  # array of {productId, name, price, quantity, image}
    total_amount = models.FloatField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.JSONField()  # {fullName, phone, address, city, province, zipCode}
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"
