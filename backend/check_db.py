"""Quick script to inspect MongoDB users and test auth."""
from pymongo import MongoClient

c = MongoClient("mongodb://localhost:27017/")
db = c["ai_pathway"]

users = list(db.users.find({}, {
    "_id": 1, "email": 1, "full_name": 1, 
    "auth_provider": 1, "password": 1
}))

print(f"Total users in DB: {len(users)}")
for u in users:
    pw = u.get("password", "")
    print(f"  - email: {u['email']}")
    print(f"    name: {u.get('full_name')}")
    print(f"    provider: {u.get('auth_provider')}")
    print(f"    has_password: {bool(pw)}")
    if pw:
        print(f"    pw_hash_prefix: {str(pw)[:20]}...")
    print()

# Test password verification
if users:
    import bcrypt
    test_email = users[0]["email"]
    test_pw = "testpass123"
    stored = users[0].get("password", "")
    if stored:
        try:
            match = bcrypt.checkpw(test_pw.encode(), stored.encode() if isinstance(stored, str) else stored)
            print(f"Password '{test_pw}' matches for {test_email}: {match}")
        except Exception as e:
            print(f"Password check error: {e}")
            print(f"  stored type: {type(stored)}, value: {repr(stored)[:50]}")
