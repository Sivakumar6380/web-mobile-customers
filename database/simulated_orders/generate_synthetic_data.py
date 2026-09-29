import random
import datetime
import json
import os

try:
    from faker import Faker
    fake = Faker()
except ImportError:
    # Lightweight built-in fallback if Faker is not present
    class MockFaker:
        def user_name(self):
            return f"user_{random.randint(1000, 99999)}"
        def email(self):
            return f"user_{random.randint(1000, 99999)}@example.com"
        def catch_phrase(self):
            adjectives = ["Enterprise", "High-Performance", "Next-Gen", "Cloud", "Secure", "Dynamic"]
            nouns = ["Database Cluster", "API Gateway", "Analytics Engine", "Storage Node", "Query Cache"]
            return f"{random.choice(adjectives)} {random.choice(nouns)}"
        def text(self, max_nb_chars=200):
            return "Simulated production dataset item generated for SQL query regression testing and benchmarking."
        def date_time_between(self, start_date='-2y', end_date='now'):
            days_ago = random.randint(1, 700)
            return datetime.datetime.now() - datetime.timedelta(days=days_ago)
        @property
        def unique(self):
            return self

    fake = MockFaker()

def generate_users(num_users=1000):
    users = []
    for i in range(1, num_users + 1):
        users.append({
            "user_id": i,
            "username": f"{fake.user_name()}_{i}",
            "email": f"customer_{i}_{fake.email()}",
            "created_at": fake.date_time_between().strftime("%Y-%m-%d %H:%M:%S"),
            "status": random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'BANNED'])
        })
    return users

def generate_products(num_products=200):
    products = []
    for i in range(1, num_products + 1):
        products.append({
            "product_id": i,
            "name": f"{fake.catch_phrase()} v{i}",
            "description": fake.text(150),
            "price": round(random.uniform(9.99, 499.99), 2),
            "stock_quantity": random.randint(10, 5000),
            "created_at": fake.date_time_between().strftime("%Y-%m-%d %H:%M:%S")
        })
    return products

def generate_orders_and_items(users, products, num_orders=3000):
    orders = []
    order_items = []
    item_id_counter = 1
    
    for order_id in range(1, num_orders + 1):
        user = random.choice(users)
        num_items = random.randint(1, 6)
        
        total_amount = 0.0
        order_time = fake.date_time_between().strftime("%Y-%m-%d %H:%M:%S")
        
        for _ in range(num_items):
            product = random.choice(products)
            quantity = random.randint(1, 8)
            unit_price = product['price']
            total_amount += quantity * unit_price
            
            order_items.append({
                "order_item_id": item_id_counter,
                "order_id": order_id,
                "product_id": product['product_id'],
                "quantity": quantity,
                "unit_price": unit_price
            })
            item_id_counter += 1
            
        orders.append({
            "order_id": order_id,
            "user_id": user['user_id'],
            "order_date": order_time,
            "total_amount": round(total_amount, 2),
            "status": random.choice(['COMPLETED', 'COMPLETED', 'SHIPPED', 'PENDING', 'CANCELLED'])
        })
        
    return orders, order_items

def export_to_sql_seed(data, filepath):
    """Generates PostgreSQL-compatible INSERT batch scripts."""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("-- PostgreSQL Synthetic Seed Data Dump\n")
        f.write("BEGIN;\n\n")
        
        f.write("-- Users Seed\n")
        for u in data['users']:
            f.write(f"INSERT INTO users (user_id, username, email, created_at, status) VALUES ({u['user_id']}, '{u['username']}', '{u['email']}', '{u['created_at']}', '{u['status']}') ON CONFLICT (user_id) DO NOTHING;\n")
            
        f.write("\n-- Products Seed\n")
        for p in data['products']:
            clean_name = p['name'].replace("'", "''")
            clean_desc = p['description'].replace("'", "''")
            f.write(f"INSERT INTO products (product_id, name, description, price, stock_quantity, created_at) VALUES ({p['product_id']}, '{clean_name}', '{clean_desc}', {p['price']}, {p['stock_quantity']}, '{p['created_at']}') ON CONFLICT (product_id) DO NOTHING;\n")
            
        f.write("\n-- Orders Seed\n")
        for o in data['orders']:
            f.write(f"INSERT INTO orders (order_id, user_id, order_date, total_amount, status) VALUES ({o['order_id']}, {o['user_id']}, '{o['order_date']}', {o['total_amount']}, '{o['status']}') ON CONFLICT (order_id) DO NOTHING;\n")
            
        f.write("\n-- Order Items Seed\n")
        for oi in data['order_items']:
            f.write(f"INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES ({oi['order_item_id']}, {oi['order_id']}, {oi['product_id']}, {oi['quantity']}, {oi['unit_price']}) ON CONFLICT (order_item_id) DO NOTHING;\n")
            
        f.write("\nCOMMIT;\n")

if __name__ == "__main__":
    print("[Data Generator] Synthesizing order dataset for PostgreSQL...")
    users = generate_users(500)
    products = generate_products(100)
    orders, order_items = generate_orders_and_items(users, products, 2000)
    
    data = {
        "users": users,
        "products": products,
        "orders": orders,
        "order_items": order_items
    }
    
    out_dir = os.path.dirname(__file__)
    json_path = os.path.join(out_dir, "synthetic_data.json")
    sql_path = os.path.join(out_dir, "synthetic_data_seed.sql")
    
    with open(json_path, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    export_to_sql_seed(data, sql_path)
    
    print(f"[Data Generator] Successfully generated:")
    print(f"  - Users: {len(users)}")
    print(f"  - Products: {len(products)}")
    print(f"  - Orders: {len(orders)}")
    print(f"  - Order Items: {len(order_items)}")
    print(f"  - JSON Export: {json_path}")
    print(f"  - SQL Seed: {sql_path}")
