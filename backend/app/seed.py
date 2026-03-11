"""
Seed initial data: 3 KKU buildings, sample rooms, admin user.
Run: python -m app.seed
"""
import uuid
from app.database import SessionLocal, engine
from app.models import User, SystemSetting, Building, Room, NotificationSetting
from app.database import Base
from app.config import settings


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Admin user ─────────────────────────────────────────────────────────
        admin = db.query(User).filter(User.kkuMail == settings.ADMIN_SEED_EMAIL).first()
        if not admin:
            admin = User(
                userId=str(uuid.uuid4()),
                kkuMail=settings.ADMIN_SEED_EMAIL,
                name=settings.ADMIN_SEED_NAME,
                role="admin",
            )
            db.add(admin)
            db.flush()
            db.add(SystemSetting(settingId=str(uuid.uuid4()), userId=admin.userId, languageCode="th"))
            db.add(NotificationSetting(settingId=str(uuid.uuid4()), userId=admin.userId))
            print(f"✅ Admin created: {settings.ADMIN_SEED_EMAIL}")
        else:
            if admin.role != "admin":
                admin.role = "admin"
                print(f"✅ Admin role updated: {settings.ADMIN_SEED_EMAIL}")
            else:
                print(f"ℹ️  Admin already exists: {settings.ADMIN_SEED_EMAIL}")

        # ── Buildings ──────────────────────────────────────────────────────────
        buildings_data = [
            {
                "buildId": "SC09",
                "buildName": "SC09 อาคารวิทยวิภาส",
                "buildDesc": "อาคารวิทยวิภาส คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/i1qjR31d32SXEbUJ8",
                "rooms": [],
            },
            {
                "buildId": "SC03",
                "buildName": "SC03 ภาควิชาชีววิทยา",
                "buildDesc": "ภาควิชาชีววิทยา คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/uyNU6sebtb7iQY8o9",
                "rooms": [],
            },
            {
                "buildId": "SC06",
                "buildName": "SC06 ตึกหลอด",
                "buildDesc": "อาคารวิทยาศาสตร์ คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/XmmEsvrJQP5dFTJy9",
                "rooms": [],
            },
            {
                "buildId": "AG07",
                "buildName": "AG07 อาคาร",
                "buildDesc": "อาคาร AG07 คณะเกษตรศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/GrnnPB85UQYSyrpi9",
                "rooms": [],
            },
            {
                "buildId": "AG05",
                "buildName": "AG05 อาคาร",
                "buildDesc": "อาคาร AG05 คณะเกษตรศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/CG2XmWs5ATGYrbFW9",
                "rooms": [],
            },
            {
                "buildId": "AG03",
                "buildName": "AG03 อาคาร",
                "buildDesc": "อาคาร AG03 คณะเกษตรศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "https://maps.app.goo.gl/gs6fFr1uiaGRJ5uh9",
                "rooms": [],
            },
        ]

        for b_data in buildings_data:
            rooms_data = b_data.pop("rooms")
            existing = db.query(Building).filter(Building.buildId == b_data["buildId"]).first()
            if not existing:
                building = Building(**b_data)
                db.add(building)
                db.flush()
                for r in rooms_data:
                    db.add(Room(roomId=str(uuid.uuid4()), buildId=b_data["buildId"], **r))
                print(f"✅ Building created: {b_data['buildName']}")
            else:
                print(f"ℹ️  Building already exists: {b_data['buildName']}")

        db.commit()
        print("\n🎉 Seed completed successfully!")
        print(f"\n📋 Admin credentials:")
        print(f"   Email: {settings.ADMIN_SEED_EMAIL}")
        print(f"   (Login via Google OAuth with this KKU email)")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
