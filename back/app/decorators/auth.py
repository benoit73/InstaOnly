from functools import wraps
import logging

logger = logging.getLogger(__name__)

def requires_login(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        method_name = func.__name__
        if not getattr(self, 'client', None):
            logger.warning(f"[{method_name}] User with ID {getattr(self, 'user_id', '?')} not logged in.")
            return False
        logger.debug(f"[{method_name}] User {getattr(self, 'user_id', '?')} is authenticated. Proceeding...")
        return func(self, *args, **kwargs)
    return wrapper
