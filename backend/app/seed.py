"""
Seed initial data: 3 KKU buildings, sample rooms, admin user.
Run: python -m app.seed
"""
import uuid
from app.database import SessionLocal, engine
from app.models import User, SystemSetting, Building, Room, NotificationSetting
from app.models import Base
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
            print(f"ℹ️  Admin already exists: {settings.ADMIN_SEED_EMAIL}")

        # ── Buildings ──────────────────────────────────────────────────────────
        buildings_data = [
            {
                "buildId": "SC",
                "buildName": "SC อาคารวิทยาศาสตร์",
                "buildDesc": "อาคารเรียนรวม คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น มีห้องเรียนและห้องปฏิบัติการวิทยาศาสตร์",
                "buildLocation": "ChIJ_PLACE_ID_SC_KKU",  # Replace with actual Google Place ID
                "rooms": [
                    {"roomName": "SC01-101", "roomDesc": "ห้องเรียนชั้น 1 อาคาร SC01 จุคนได้ 80 คน"},
                    {"roomName": "SC01-102", "roomDesc": "ห้องเรียนชั้น 1 อาคาร SC01 จุคนได้ 80 คน"},
                    {"roomName": "SC03-305", "roomDesc": "ห้องเรียนชั้น 3 อาคาร SC03 จุคนได้ 50 คน"},
                    {"roomName": "SC08-503", "roomDesc": "ห้องบรรยายชั้น 5 อาคาร SC08 จุคนได้ 120 คน"},
                    {"roomName": "SC08-504", "roomDesc": "ห้องปฏิบัติการชั้น 5 อาคาร SC08"},
                ],
            },
            {
                "buildId": "EN",
                "buildName": "EN อาคารวิศวกรรมศาสตร์",
                "buildDesc": "อาคารเรียนรวม คณะวิศวกรรมศาสตร์ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "ChIJ_PLACE_ID_EN_KKU",  # Replace with actual Google Place ID
                "rooms": [
                    {"roomName": "EN01-101", "roomDesc": "ห้องเรียนชั้น 1 อาคาร EN01 จุคนได้ 60 คน"},
                    {"roomName": "EN01-102", "roomDesc": "ห้องปฏิบัติการคอมพิวเตอร์ชั้น 1"},
                    {"roomName": "EN02-201", "roomDesc": "ห้องเรียนชั้น 2 อาคาร EN02 จุคนได้ 100 คน"},
                    {"roomName": "EN03-301", "roomDesc": "ห้องสัมมนาชั้น 3 อาคาร EN03"},
                ],
            },
            {
                "buildId": "KBS",
                "buildName": "KBS อาคารวิทยาการจัดการ",
                "buildDesc": "อาคารเรียนรวม คณะวิทยาการจัดการ มหาวิทยาลัยขอนแก่น",
                "buildLocation": "ChIJ_PLACE_ID_KBS_KKU",  # Replace with actual Google Place ID
                "rooms": [
                    {"roomName": "KBS01-201", "roomDesc": "ห้องเรียนชั้น 2 จุคนได้ 80 คน"},
                    {"roomName": "KBS02-301", "roomDesc": "ห้องเรียนชั้น 3 จุคนได้ 60 คน"},
                    {"roomName": "KBS03-401", "roomDesc": "ห้องบรรยายใหญ่ชั้น 4 จุคนได้ 200 คน"},
                ],
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
