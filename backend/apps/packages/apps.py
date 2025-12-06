"""
App configuration for the packages app.
"""

from django.apps import AppConfig


class PackagesConfig(AppConfig):
    """Configuration for the packages app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.packages'
    verbose_name = 'Packages'

