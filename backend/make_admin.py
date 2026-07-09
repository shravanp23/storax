import psycopg2
conn = psycopg2.connect(
    "postgresql://storax_db_new_user:sZTEaPcs36WaWMlu8bv9RJ1LjMBIiFqr@dpg-d97n2fgk1i2s73eemf2g-a.oregon-postgres.render.com/storax_db_new?sslmode=require"
)
cur = conn.cursor()

# First create admin if not exists
cur.execute("""
    SELECT id FROM users WHERE email = 'admin@storax.com'
""")
existing = cur.fetchone()

if existing:
    cur.execute("UPDATE users SET is_admin = true WHERE email = 'admin@storax.com'")
    print("✅ Admin role updated!")
else:
    import hashlib
    import uuid
    # Insert admin user
    cur.execute("""
        INSERT INTO users (full_name, email, hashed_password, bucket_name, is_admin, is_active)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        'Shravan Admin',
        'admin@storax.com',
        '$2b$12$myE.0dEHaigK2ivd9utkEes2Wrmnno/F5rFo0KAHaEXAdduCsuRF',
        f'admin-{uuid.uuid4().hex[:8]}',
        True,
        True
    ))
    print("✅ Admin created!")

conn.commit()
cur.close()
conn.close()