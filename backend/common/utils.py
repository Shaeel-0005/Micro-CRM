from django.utils import timezone


def get_current_timestamp():
    """Return current timestamp"""
    return timezone.now()


def format_phone_number(phone):
    """Basic phone number formatting"""
    if phone:
        # Remove all non-numeric characters
        digits = ''.join(filter(str.isdigit, phone))
        return digits
    return None