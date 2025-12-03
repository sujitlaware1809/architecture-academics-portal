"""
Seed data for Events, Workshops, and Discussions
"""
from database import SessionLocal, Event, Workshop, Discussion, User
from seed_data import get_sample_events, get_sample_workshops, get_sample_discussions
from schemas import EventStatus, WorkshopStatus
import random

def seed_additional_data():
    """Seed events, workshops, and discussions"""
    db = SessionLocal()
    
    try:
        # Get a user for authoring discussions
        user = db.query(User).first()
        if not user:
            print("No users found. Please seed users first.")
            return

        # Seed Events
        print("Seeding events...")
        events_data = get_sample_events()
        for event_data in events_data:
            # Check if event already exists
            existing_event = db.query(Event).filter(Event.title == event_data["title"]).first()
            if not existing_event:
                event = Event(**event_data)
                db.add(event)
                print(f"Added event: {event.title}")
            else:
                print(f"Event already exists: {event_data['title']}")
        
        # Seed Workshops
        print("Seeding workshops...")
        workshops_data = get_sample_workshops()
        for workshop_data in workshops_data:
            # Check if workshop already exists
            existing_workshop = db.query(Workshop).filter(Workshop.title == workshop_data["title"]).first()
            if not existing_workshop:
                # Handle instructor_name
                if "instructor_name" in workshop_data:
                    del workshop_data["instructor_name"]
                
                # Handle is_online (not in Workshop model)
                if "is_online" in workshop_data:
                    del workshop_data["is_online"]
                
                # Set instructor_id to the user we found
                workshop_data["instructor_id"] = user.id

                workshop = Workshop(**workshop_data)
                db.add(workshop)
                print(f"Added workshop: {workshop.title}")
            else:
                print(f"Workshop already exists: {workshop_data['title']}")

        # Seed Discussions
        print("Seeding discussions...")
        discussions_data = get_sample_discussions()
        for discussion_data in discussions_data:
            # Check if discussion already exists
            existing_discussion = db.query(Discussion).filter(Discussion.title == discussion_data["title"]).first()
            if not existing_discussion:
                discussion = Discussion(
                    **discussion_data,
                    author_id=user.id,
                    views_count=random.randint(10, 100),
                    likes_count=random.randint(0, 20)
                )
                db.add(discussion)
                print(f"Added discussion: {discussion.title}")
            else:
                print(f"Discussion already exists: {discussion_data['title']}")

        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_additional_data()
