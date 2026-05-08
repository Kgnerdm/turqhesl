"""
Test factories for TurqHeal models.

Use these to spin up realistic test data without manually wiring fields.
"""

from datetime import date, timedelta
from decimal import Decimal

import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.bookings.models import Booking
from apps.packages.models import Favorite, Package, PackageCategory
from apps.providers.models import Provider, ProviderCategory

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('email',)

    email = factory.Sequence(lambda n: f'user{n}@test.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = User._meta.get_field('role').default
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop('password', 'TestPass123!')
        user = model_class(*args, **kwargs)
        user.set_password(password)
        user.save()
        return user


class PatientFactory(UserFactory):
    role = 'patient'
    email = factory.Sequence(lambda n: f'patient{n}@test.com')


class ProviderUserFactory(UserFactory):
    role = 'provider'
    email = factory.Sequence(lambda n: f'provider{n}@test.com')


class AdminUserFactory(UserFactory):
    role = 'admin'
    email = factory.Sequence(lambda n: f'admin{n}@test.com')
    is_staff = True
    is_superuser = True


class ProviderFactory(DjangoModelFactory):
    class Meta:
        model = Provider

    user = factory.SubFactory(ProviderUserFactory)
    business_name = factory.Faker('company')
    description = factory.Faker('paragraph', nb_sentences=3)
    city = 'Istanbul'
    address = factory.Faker('address')
    phone = factory.Sequence(lambda n: f'+9055512345{n:02d}'[:20])
    email = factory.LazyAttribute(lambda o: o.user.email)
    categories = [ProviderCategory.DENTAL]
    certificates = []
    working_hours = {}
    images = []
    is_verified = False
    is_active = True


class VerifiedProviderFactory(ProviderFactory):
    is_verified = True
    verification_date = factory.LazyFunction(timezone.now)


class PackageFactory(DjangoModelFactory):
    class Meta:
        model = Package

    provider = factory.SubFactory(ProviderFactory)
    name = factory.Sequence(lambda n: f'Package {n}')
    description = factory.Faker('paragraph', nb_sentences=4)
    category = PackageCategory.DENTAL
    price = Decimal('1500.00')
    currency = 'USD'
    duration = '3-5 days'
    includes = ['Consultation', 'Treatment', 'Hotel']
    excludes = ['Flights']
    images = []
    is_active = True


class BookingFactory(DjangoModelFactory):
    class Meta:
        model = Booking

    patient = factory.SubFactory(PatientFactory)
    provider = factory.SubFactory(ProviderFactory)
    package = factory.SubFactory(PackageFactory)
    status = Booking.Status.PENDING
    appointment_date = factory.LazyFunction(lambda: date.today() + timedelta(days=14))
    patient_name = factory.LazyAttribute(lambda o: f'{o.patient.first_name} {o.patient.last_name}')
    patient_email = factory.LazyAttribute(lambda o: o.patient.email)
    patient_phone = '+905551234567'
    total_price = factory.LazyAttribute(lambda o: o.package.price)
    currency = factory.LazyAttribute(lambda o: o.package.currency)


class FavoriteFactory(DjangoModelFactory):
    class Meta:
        model = Favorite

    user = factory.SubFactory(PatientFactory)
    package = factory.SubFactory(PackageFactory)
