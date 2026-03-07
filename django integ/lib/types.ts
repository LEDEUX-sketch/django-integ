// Product type definition matching Django API response
export type Product = {
    _id: number;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    brand: string;
    series?: string;
    condition: string;
    stock: number;
    sold: number;
    rating: number;
    ratingCount: number;
    tags: string[];
    isFeatured: boolean;
    isFlashSale: boolean;
    flashSaleEnd?: string;
    createdAt: string;
};

export type CartItem = {
    _id: number;
    userId: number;
    productId: number;
    quantity: number;
    product: Product;
};

export type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
};

export type Order = {
    _id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        province: string;
        zipCode: string;
    };
    createdAt: string;
};

export type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: number;
};
