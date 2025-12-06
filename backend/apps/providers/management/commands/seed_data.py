"""
Management command to seed sample providers and packages.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import User
from apps.providers.models import Provider
from apps.packages.models import Package


class Command(BaseCommand):
    help = 'Seed database with sample providers and packages'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create provider users if they don't exist
        provider_users = []
        providers_data = [
            {
                'email': 'dental@turqheal.com',
                'first_name': 'Istanbul',
                'last_name': 'Dental',
                'password': 'Provider123!',
            },
            {
                'email': 'anadolu@turqheal.com',
                'first_name': 'Anadolu',
                'last_name': 'Medical',
                'password': 'Provider123!',
            },
            {
                'email': 'hair@turqheal.com',
                'first_name': 'Hair',
                'last_name': 'Turkey',
                'password': 'Provider123!',
            },
            {
                'email': 'vision@turqheal.com',
                'first_name': 'Vision',
                'last_name': 'Plus',
                'password': 'Provider123!',
            },
        ]
        
        for data in providers_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'role': 'provider',
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(f'  Created user: {user.email}')
            provider_users.append(user)
        
        # Create providers
        providers_info = [
            {
                'user': provider_users[0],
                'business_name': 'Istanbul Dental Center',
                'description': 'Istanbul Dental Center is one of the leading dental clinics in Turkey with over 20 years of experience in providing world-class dental care. Our team of highly skilled dentists and specialists are dedicated to delivering exceptional results using the latest technology and techniques.\n\nWe specialize in dental implants, veneers, smile makeovers, and full mouth rehabilitation. Our clinic is JCI-accredited and follows strict international hygiene and safety protocols.',
                'city': 'Istanbul',
                'address': 'Nişantaşı, Teşvikiye Cad. No:45, 34367 Şişli/Istanbul, Turkey',
                'phone': '+90 212 123 4567',
                'email': 'info@istanbuldental.com',
                'website': 'https://istanbuldental.com',
                'logo_url': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100',
                'cover_image_url': 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1200',
                'categories': ['Dental Care', 'Cosmetic Dentistry'],
                'is_verified': True,
                'certificates': [
                    {'name': 'JCI Accreditation', 'issued_by': 'Joint Commission International', 'issued_date': '2023-06-01'},
                    {'name': 'ISO 9001:2015', 'issued_by': 'International Organization for Standardization', 'issued_date': '2023-01-01'},
                ],
                'working_hours': {
                    'monday': {'is_open': True, 'open_time': '09:00', 'close_time': '18:00'},
                    'tuesday': {'is_open': True, 'open_time': '09:00', 'close_time': '18:00'},
                    'wednesday': {'is_open': True, 'open_time': '09:00', 'close_time': '18:00'},
                    'thursday': {'is_open': True, 'open_time': '09:00', 'close_time': '18:00'},
                    'friday': {'is_open': True, 'open_time': '09:00', 'close_time': '18:00'},
                    'saturday': {'is_open': True, 'open_time': '10:00', 'close_time': '14:00'},
                    'sunday': {'is_open': False},
                },
            },
            {
                'user': provider_users[1],
                'business_name': 'Anadolu Medical Center',
                'description': 'Anadolu Medical Center is a JCI-accredited hospital offering comprehensive healthcare services in partnership with Johns Hopkins Medicine. We provide world-class treatment in oncology, cardiology, orthopedics, and many other specialties.\n\nOur state-of-the-art facility features the latest medical technology and a team of internationally trained physicians.',
                'city': 'Istanbul',
                'address': 'Cumhuriyet Mahallesi, 2255 Sokak No:3, Gebze/Kocaeli, Turkey',
                'phone': '+90 262 654 3200',
                'email': 'info@anadolumedical.com',
                'website': 'https://anadolumedical.com',
                'logo_url': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100',
                'cover_image_url': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
                'categories': ['Oncology', 'Cardiology', 'Orthopedic'],
                'is_verified': True,
                'certificates': [
                    {'name': 'JCI Accreditation', 'issued_by': 'Joint Commission International', 'issued_date': '2023-06-01'},
                    {'name': 'Johns Hopkins Medicine Partner', 'issued_by': 'Johns Hopkins Medicine', 'issued_date': '2022-01-01'},
                ],
                'working_hours': {
                    'monday': {'is_open': True, 'open_time': '08:00', 'close_time': '20:00'},
                    'tuesday': {'is_open': True, 'open_time': '08:00', 'close_time': '20:00'},
                    'wednesday': {'is_open': True, 'open_time': '08:00', 'close_time': '20:00'},
                    'thursday': {'is_open': True, 'open_time': '08:00', 'close_time': '20:00'},
                    'friday': {'is_open': True, 'open_time': '08:00', 'close_time': '20:00'},
                    'saturday': {'is_open': True, 'open_time': '09:00', 'close_time': '17:00'},
                    'sunday': {'is_open': True, 'open_time': '09:00', 'close_time': '17:00'},
                },
            },
            {
                'user': provider_users[2],
                'business_name': 'Hair Turkey Clinic',
                'description': 'Hair Turkey Clinic is a premier hair restoration center specializing in FUE and DHI hair transplant techniques. With over 15,000 successful procedures, we are one of the most experienced clinics in Turkey.\n\nOur team of expert surgeons uses the latest technology including Sapphire FUE and Direct Hair Implantation (DHI) to achieve natural-looking results.',
                'city': 'Istanbul',
                'address': 'Fulya Mahallesi, Büyükdere Cad. No:76, Şişli/Istanbul, Turkey',
                'phone': '+90 212 987 6543',
                'email': 'info@hairturkey.com',
                'website': 'https://hairturkey.com',
                'logo_url': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100',
                'cover_image_url': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
                'categories': ['Hair Transplant'],
                'is_verified': True,
                'certificates': [
                    {'name': 'Turkish Ministry of Health License', 'issued_by': 'Ministry of Health', 'issued_date': '2023-01-01'},
                    {'name': 'ISHRS Member', 'issued_by': 'International Society of Hair Restoration Surgery', 'issued_date': '2022-06-01'},
                ],
                'working_hours': {
                    'monday': {'is_open': True, 'open_time': '09:00', 'close_time': '19:00'},
                    'tuesday': {'is_open': True, 'open_time': '09:00', 'close_time': '19:00'},
                    'wednesday': {'is_open': True, 'open_time': '09:00', 'close_time': '19:00'},
                    'thursday': {'is_open': True, 'open_time': '09:00', 'close_time': '19:00'},
                    'friday': {'is_open': True, 'open_time': '09:00', 'close_time': '19:00'},
                    'saturday': {'is_open': True, 'open_time': '10:00', 'close_time': '16:00'},
                    'sunday': {'is_open': False},
                },
            },
            {
                'user': provider_users[3],
                'business_name': 'Vision Plus Eye Center',
                'description': 'Vision Plus Eye Center is a state-of-the-art ophthalmology clinic specializing in LASIK surgery, cataract treatment, and advanced eye care. Our experienced team of eye surgeons has performed over 50,000 successful procedures.\n\nWe use the latest laser technology including FEMTO LASIK and SMILE for vision correction.',
                'city': 'Ankara',
                'address': 'Çankaya, Kızılırmak Mah. 1450 Sokak No:12, Ankara, Turkey',
                'phone': '+90 312 456 7890',
                'email': 'info@visionplus.com',
                'website': 'https://visionplus.com',
                'logo_url': 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=100',
                'cover_image_url': 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200',
                'categories': ['Eye Surgery'],
                'is_verified': True,
                'certificates': [
                    {'name': 'Turkish Ministry of Health License', 'issued_by': 'Ministry of Health', 'issued_date': '2023-01-01'},
                    {'name': 'ISO 9001:2015', 'issued_by': 'International Organization for Standardization', 'issued_date': '2023-01-01'},
                ],
                'working_hours': {
                    'monday': {'is_open': True, 'open_time': '08:30', 'close_time': '17:30'},
                    'tuesday': {'is_open': True, 'open_time': '08:30', 'close_time': '17:30'},
                    'wednesday': {'is_open': True, 'open_time': '08:30', 'close_time': '17:30'},
                    'thursday': {'is_open': True, 'open_time': '08:30', 'close_time': '17:30'},
                    'friday': {'is_open': True, 'open_time': '08:30', 'close_time': '17:30'},
                    'saturday': {'is_open': True, 'open_time': '09:00', 'close_time': '13:00'},
                    'sunday': {'is_open': False},
                },
            },
        ]
        
        providers = []
        for data in providers_info:
            provider, created = Provider.objects.get_or_create(
                user=data['user'],
                defaults={
                    'business_name': data['business_name'],
                    'description': data['description'],
                    'city': data['city'],
                    'address': data['address'],
                    'phone': data['phone'],
                    'email': data['email'],
                    'website': data.get('website'),
                    'logo_url': data.get('logo_url'),
                    'cover_image_url': data.get('cover_image_url'),
                    'categories': data['categories'],
                    'is_verified': data['is_verified'],
                    'verification_date': timezone.now() if data['is_verified'] else None,
                    'certificates': data.get('certificates', []),
                    'working_hours': data.get('working_hours', {}),
                }
            )
            if created:
                self.stdout.write(f'  Created provider: {provider.business_name}')
            providers.append(provider)
        
        # Create packages
        packages_data = [
            # Istanbul Dental Center packages
            {
                'provider': providers[0],
                'name': 'Premium Dental Implants Package',
                'description': 'Complete dental implant treatment with Swiss implants. Includes consultation, 3D CT scan, implant surgery, and ceramic crown.',
                'category': 'dental',
                'price': 1500,
                'currency': 'USD',
                'duration': '5-7 days',
                'includes': ['Free consultation', '3D CT Scan', 'Swiss Implant', 'Ceramic Crown', 'Hotel (4 nights)', 'Airport Transfer', 'Follow-up care'],
                'excludes': ['Flight tickets', 'Personal expenses'],
                'images': ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
            },
            {
                'provider': providers[0],
                'name': 'Hollywood Smile Package',
                'description': 'Transform your smile with premium E-max veneers. Get the perfect celebrity smile you\'ve always wanted.',
                'category': 'dental',
                'price': 3500,
                'currency': 'USD',
                'duration': '7-10 days',
                'includes': ['Consultation', '20 E-max Veneers', 'Temporary teeth', 'Hotel (7 nights)', 'VIP Transfer', 'Teeth whitening'],
                'excludes': ['Flight tickets'],
                'images': ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800'],
            },
            {
                'provider': providers[0],
                'name': 'Full Mouth Restoration',
                'description': 'Complete smile makeover with implants, crowns, and veneers. Ideal for patients needing comprehensive dental work.',
                'category': 'dental',
                'price': 8500,
                'currency': 'USD',
                'duration': '14-21 days',
                'includes': ['Full examination', 'Treatment planning', 'All-on-4 Implants', 'Zirconia Bridge', 'Hotel (14 nights)', 'All transfers'],
                'excludes': ['Flight tickets', 'Travel insurance'],
                'images': ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
            },
            # Anadolu Medical Center packages
            {
                'provider': providers[1],
                'name': 'Comprehensive Cardiac Check-Up',
                'description': 'Complete heart health evaluation including advanced diagnostics, stress tests, and specialist consultation.',
                'category': 'cardiology',
                'price': 2500,
                'currency': 'USD',
                'duration': '2-3 days',
                'includes': ['Cardiologist consultation', 'ECG', 'Echocardiogram', 'Stress test', 'Blood tests', 'Detailed report'],
                'excludes': ['Accommodation', 'Transport'],
                'images': ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'],
            },
            {
                'provider': providers[1],
                'name': 'Oncology Screening Package',
                'description': 'Comprehensive cancer screening with PET-CT, tumor markers, and oncologist evaluation.',
                'category': 'oncology',
                'price': 4500,
                'currency': 'USD',
                'duration': '3-4 days',
                'includes': ['Oncologist consultation', 'PET-CT Scan', 'Tumor markers', 'Blood panel', 'Ultrasound', 'Biopsy if needed'],
                'excludes': ['Treatment costs', 'Accommodation'],
                'images': ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'],
            },
            {
                'provider': providers[1],
                'name': 'Total Knee Replacement',
                'description': 'Complete knee replacement surgery with rehabilitation program. Regain mobility and live pain-free.',
                'category': 'orthopedic',
                'price': 12000,
                'currency': 'USD',
                'duration': '10-14 days',
                'includes': ['Pre-op evaluation', 'Surgery', 'Prosthesis', 'Hospital stay (5 days)', 'Physical therapy', 'Follow-up'],
                'excludes': ['Accommodation post-discharge', 'Flight tickets'],
                'images': ['https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800'],
            },
            # Hair Turkey Clinic packages
            {
                'provider': providers[2],
                'name': 'FUE Hair Transplant - 3000 Grafts',
                'description': 'Advanced FUE hair transplant with natural-looking results. Includes PRP treatment for better growth.',
                'category': 'hair_transplant',
                'price': 2500,
                'currency': 'USD',
                'duration': '3-4 days',
                'includes': ['Consultation', 'Blood tests', 'FUE procedure', 'PRP treatment', 'Medications', 'Hotel (3 nights)', 'Airport transfer'],
                'excludes': ['Flight tickets'],
                'images': ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'],
            },
            {
                'provider': providers[2],
                'name': 'DHI Hair Transplant - 4500 Grafts',
                'description': 'Premium DHI technique with Choi implanter pens for maximum density and natural hairline.',
                'category': 'hair_transplant',
                'price': 3500,
                'currency': 'USD',
                'duration': '3-4 days',
                'includes': ['Consultation', 'Blood tests', 'DHI procedure', 'PRP treatment', 'Medications', 'Hotel (3 nights)', 'VIP transfer', 'Post-op kit'],
                'excludes': ['Flight tickets'],
                'images': ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
            },
            # Vision Plus Eye Center packages
            {
                'provider': providers[3],
                'name': 'LASIK Eye Surgery',
                'description': 'State-of-the-art LASIK surgery for vision correction. Quick procedure with fast recovery time.',
                'category': 'eye_surgery',
                'price': 1800,
                'currency': 'USD',
                'duration': '2-3 days',
                'includes': ['Pre-op examination', 'LASIK surgery (both eyes)', 'Post-op care', 'Eye drops', 'Protective glasses', 'Follow-up visits'],
                'excludes': ['Accommodation', 'Transport'],
                'images': ['https://images.unsplash.com/photo-1551076805-e1869033e561?w=800'],
            },
            {
                'provider': providers[3],
                'name': 'Premium SMILE Eye Surgery',
                'description': 'Minimally invasive SMILE procedure for vision correction. Faster recovery than traditional LASIK.',
                'category': 'eye_surgery',
                'price': 2500,
                'currency': 'USD',
                'duration': '2-3 days',
                'includes': ['Pre-op examination', 'SMILE surgery (both eyes)', 'Post-op care', 'Medications', 'Protective glasses', '3 follow-up visits'],
                'excludes': ['Accommodation', 'Transport'],
                'images': ['https://images.unsplash.com/photo-1551076805-e1869033e561?w=800'],
            },
        ]
        
        for data in packages_data:
            package, created = Package.objects.get_or_create(
                provider=data['provider'],
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'category': data['category'],
                    'price': data['price'],
                    'currency': data['currency'],
                    'duration': data['duration'],
                    'includes': data['includes'],
                    'excludes': data['excludes'],
                    'images': data['images'],
                }
            )
            if created:
                self.stdout.write(f'  Created package: {package.name}')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write(f'  Providers: {Provider.objects.count()}')
        self.stdout.write(f'  Packages: {Package.objects.count()}')

