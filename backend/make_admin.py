import psycopg2

conn = psycopg2.connect('postgresql://stoarx_databse_user:hAXKP34RFhM6FVDF5mmIS8lXCBX1vbHu@dpg-d8aqft3tqb8s73aed8m0-a.oregon-postgres.render.com/stoarx_databse')
cur = conn.cursor()
cur.execute("UPDATE users SET is_admin = true WHERE email = 'admin@storax.com'")
conn.commit()
print('Done! Rows affected:', cur.rowcount)
cur.close()
conn.close()