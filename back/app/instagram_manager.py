from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ClientError
import logging
from .models import User, db
from .decorators.auth import requires_login
import time
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InstagramManager:
    def __init__(self, user_id):
        self.user_id = user_id
        self.user = self.get_user_by_id(user_id)
        self.client = None
        self.login()

    @requires_login
    def update_profile(self, new_name=None, new_bio=None, new_profile_pic=None):
        try:
            if new_name or new_bio:
                self.client.account_edit(name=new_name or self.user.username, biography=new_bio or self.user.bio)
                logger.info("Profile name or bio updated successfully.")
            
            if new_profile_pic:
                self.client.account_change_picture(new_profile_pic)
                logger.info("Profile picture updated successfully.")
            
            # Update the user object in the database
            if new_name:
                self.user.username = new_name
            if new_bio:
                self.user.bio = new_bio
            if new_profile_pic:
                self.user.avatar = self.client.user_info_by_username(self.user.username).profile_pic_url
            
            db.session.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to update profile: {e}")
            return False
        
    @requires_login
    def get_user_details(self):
        try:
            info = self.client.user_info_by_username(self.user.username)
            stories = self.client.user_stories(info.pk)
            
            # Update user details in the database
            self.user.avatar = info.profile_pic_url
            self.user.followers = info.follower_count
            self.user.posts = info.media_count
            self.user.bio = info.biography
            self.user.infosupdatedat = time.time()
            self.user.stories = len(stories)
            db.session.commit()
            
            # Return the updated user object as JSON
            return {
                "id": self.user.id,
                "username": self.user.username,
                "avatar": self.user.avatar,
                "followers": self.user.followers,
                "posts": self.user.posts,
                "bio": self.user.bio,
                "infosupdatedat": self.user.infosupdatedat,
                "stories": self.user.stories
            }
        except Exception as e:
            logger.error(f"Failed to fetch and update user details: {e}")
            return None

    def get_user_by_id(self, user_id):
        return User.query.get(user_id)

    def get_multiple_users_info(self, usernames):
        users_info = []
        for username in usernames:
            try:
                info = self.client.user_info_by_username(username)
                users_info.append({
                    "username": username,
                    "avatar": info.profile_pic_url,
                    "followers": info.follower_count,
                    "posts": info.media_count
                })
                time.sleep(random.uniform(1.5, 3))  # Anti-bot friendly
            except Exception as e:
                logger.warning(f"Failed to get info for {username}: {e}")
        return users_info

    def login(self):
        if not self.user:
            logger.error(f"User with ID {self.user_id} not found.")
            return

        self.client = Client()
        logged_in = False

        # 1. Essayer via session_id seul
        if self.user.session:
            sessionid = self.user.session.get("sessionid")
            if sessionid:
                try:
                    self.client.sessionid = sessionid
                    self.client.get_timeline_feed()
                    logged_in = True
                    logger.info("Login successful using sessionid.")
                except LoginRequired:
                    logger.info("Sessionid is invalid.")
                except Exception as e:
                    logger.error(f"Sessionid login failed: {e}")

        # 2. Essayer via settings complets
        if not logged_in and self.user.settings:
            try:
                self.client.set_settings(self.user.settings)
                self.client.login(self.user.username, self.user.password)
                self.client.get_timeline_feed()
                logged_in = True
                logger.info("Login successful using full settings.")
            except LoginRequired:
                logger.info("Settings session is invalid. Retrying with UUID preservation.")
                try:
                    old_settings = self.client.get_settings()
                    self.client.set_settings({})
                    self.client.set_uuids(old_settings.get("uuids", {}))
                    self.client.login(self.user.username, self.user.password)
                    logged_in = True
                except Exception as e:
                    logger.error(f"Login with restored UUIDs failed: {e}")
            except Exception as e:
                logger.error(f"Settings login failed: {e}")

        # 3. Login complet
        if not logged_in:
            try:
                logger.info(f"Trying fresh login with username/password: {self.user.username}")
                self.client.set_settings({})
                self.client.login(self.user.username, self.user.password)
                logged_in = True
            except Exception as e:
                logger.error(f"Full login failed: {e}")

        # Sauvegarde si login réussi
        if logged_in:
            try:
                session_data = self.client.get_settings()
                sessionid = self.client.sessionid

                self.user.session = {"sessionid": sessionid}
                self.user.settings = session_data
                db.session.commit()

                logger.info("Session and settings saved successfully.")
            except Exception as e:
                logger.error(f"Failed to save session/settings to DB: {e}")
        else:
            logger.error("All login methods failed.")
            self.client = None

    @requires_login
    def logout(self):
        try:
            self.client.logout()
            logger.info("Logout successful.")
            self.client = None
            return True
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            return False

    @requires_login
    def post_photo(self, photo_path, caption):
        try:
            self.client.photo_upload(photo_path, caption)
            logger.info(f"Photo uploaded successfully: {photo_path}")
            return True
        except Exception as e:
            logger.error(f"Post photo failed: {e}")
            return False
        
    @requires_login
    def post_story(self, photo_path, caption):
        try:
            self.client.photo_upload_to_story(photo_path, caption)
            logger.info(f"Story uploaded successfully: {photo_path}")
            return True
        except Exception as e:
            logger.error(f"Post story failed: {e}")
            return False
