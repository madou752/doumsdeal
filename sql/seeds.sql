INSERT INTO categories (name, icon_name) VALUES
    ('Électronique',     'devices'),
    ('Vêtements',        'checkroom'),
    ('Mobilier',         'chair'),
    ('Livres',           'menu_book'),
    ('Sport & Loisirs',  'sports_soccer'),
    ('Jeux vidéo',       'sports_esports'),
    ('Véhicules',        'directions_car'),
    ('Immobilier',       'home'),
    ('Alimentation',     'restaurant'),
    ('Services',         'miscellaneous_services'),
    ('Autre',            'category')
ON CONFLICT (name) DO NOTHING;
