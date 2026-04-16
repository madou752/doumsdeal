import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
    console.log('Seeding de la base de données...');

    // ===== CATEGORIES =====
    const categories = await Promise.all([
        prisma.categories.upsert({ where: { name: 'Électronique' },    update: {}, create: { name: 'Électronique',    icon_name: 'devices' } }),
        prisma.categories.upsert({ where: { name: 'Vêtements' },       update: {}, create: { name: 'Vêtements',       icon_name: 'checkroom' } }),
        prisma.categories.upsert({ where: { name: 'Mobilier' },        update: {}, create: { name: 'Mobilier',        icon_name: 'chair' } }),
        prisma.categories.upsert({ where: { name: 'Livres' },          update: {}, create: { name: 'Livres',          icon_name: 'menu_book' } }),
        prisma.categories.upsert({ where: { name: 'Sport & Loisirs' }, update: {}, create: { name: 'Sport & Loisirs', icon_name: 'sports_soccer' } }),
        prisma.categories.upsert({ where: { name: 'Jeux vidéo' },      update: {}, create: { name: 'Jeux vidéo',      icon_name: 'sports_esports' } }),
        prisma.categories.upsert({ where: { name: 'Véhicules' },       update: {}, create: { name: 'Véhicules',       icon_name: 'directions_car' } }),
        prisma.categories.upsert({ where: { name: 'Immobilier' },      update: {}, create: { name: 'Immobilier',      icon_name: 'home' } }),
        prisma.categories.upsert({ where: { name: 'Alimentation' },    update: {}, create: { name: 'Alimentation',    icon_name: 'restaurant' } }),
        prisma.categories.upsert({ where: { name: 'Services' },        update: {}, create: { name: 'Services',        icon_name: 'miscellaneous_services' } }),
        prisma.categories.upsert({ where: { name: 'Autre' },           update: {}, create: { name: 'Autre',           icon_name: 'category' } }),
    ]);
    console.log(`✓ ${categories.length} catégories créées`);

    // ===== UTILISATEURS =====
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash  = await bcrypt.hash('user123', 10);

    const admin = await prisma.users.upsert({
        where: { email: 'admin@doumsdeal.com' },
        update: {},
        create: {
            username: 'Admin',
            email: 'admin@doumsdeal.com',
            password: adminHash,
            role: 'ADMIN',
        },
    });

    const alice = await prisma.users.upsert({
        where: { email: 'alice@doumsdeal.com' },
        update: {},
        create: {
            username: 'Alice',
            email: 'alice@doumsdeal.com',
            password: userHash,
        },
    });

    const bob = await prisma.users.upsert({
        where: { email: 'bob@doumsdeal.com' },
        update: {},
        create: {
            username: 'Bob',
            email: 'bob@doumsdeal.com',
            password: userHash,
        },
    });

    console.log('✓ 3 utilisateurs créés (admin, alice, bob)');

    const catElec    = categories.find(c => c.name === 'Électronique')!;
    const catLivres  = categories.find(c => c.name === 'Livres')!;
    const catJeux    = categories.find(c => c.name === 'Jeux vidéo')!;
    const catVelo    = categories.find(c => c.name === 'Sport & Loisirs')!;
    const catMobilier = categories.find(c => c.name === 'Mobilier')!;
    const catVetements = categories.find(c => c.name === 'Vêtements')!;

    // ===== ANNONCES =====
    const ads = [
        {
            title: 'MacBook Pro 14" 2023',
            description: 'Excellent état, utilisé 6 mois. Puce M2 Pro, 16 Go RAM, 512 Go SSD. Vendu avec chargeur original et housse de protection.',
            price: 1800,
            location: 'Paris 11e',
            condition: 'LIKE_NEW' as const,
            is_negotiable: true,
            user_id: alice.id,
            category_id: catElec.id,
        },
        {
            title: 'iPhone 14 Pro 256Go Noir',
            description: 'iPhone 14 Pro 256 Go coloris noir sidéral. Quelques micro-rayures sur la coque arrière, écran parfait. Vendu avec câble USB-C.',
            price: 750,
            location: 'Lyon',
            condition: 'GOOD' as const,
            is_negotiable: false,
            user_id: bob.id,
            category_id: catElec.id,
        },
        {
            title: 'Lot de 15 livres développement web',
            description: 'JavaScript: The Good Parts, Clean Code, You Don\'t Know JS (série complète), CSS Secrets, Node.js Design Patterns et plus encore.',
            price: 45,
            location: 'Bordeaux',
            condition: 'GOOD' as const,
            is_negotiable: true,
            user_id: alice.id,
            category_id: catLivres.id,
        },
        {
            title: 'PlayStation 5 + 3 jeux',
            description: 'PS5 édition disque en parfait état. Livrée avec Spider-Man 2, God of War Ragnarök et Horizon Forbidden West. Manette originale incluse.',
            price: 500,
            location: 'Marseille',
            condition: 'LIKE_NEW' as const,
            is_negotiable: false,
            user_id: bob.id,
            category_id: catJeux.id,
        },
        {
            title: 'Vélo de route Trek Émonda SL6',
            description: 'Cadre carbone, Shimano Ultegra, roues Bontrager Aeolus. Taille 54cm. Parfait pour cyclistes confirmés. 3000 km au compteur.',
            price: 2200,
            location: 'Nantes',
            condition: 'GOOD' as const,
            is_negotiable: true,
            user_id: alice.id,
            category_id: catVelo.id,
        },
        {
            title: 'Bureau en chêne massif 160x80cm',
            description: 'Bureau en chêne massif avec 3 tiroirs et câblage intégré. Style industriel. Très bon état, quelques marques d\'usage légères.',
            price: 320,
            location: 'Toulouse',
            condition: 'GOOD' as const,
            is_negotiable: true,
            user_id: bob.id,
            category_id: catMobilier.id,
        },
        {
            title: 'Doudoune Canada Goose taille M',
            description: 'Doudoune Canada Goose Expedition Parka taille M, couleur noir. Portée 2 saisons, parfait état. Authentique avec certificat.',
            price: 650,
            location: 'Paris 8e',
            condition: 'LIKE_NEW' as const,
            is_negotiable: false,
            user_id: alice.id,
            category_id: catVetements.id,
        },
        {
            title: 'Nintendo Switch OLED Blanche',
            description: 'Nintendo Switch OLED édition blanche avec dock, 2 Joy-Con et câbles. Jeu Mario Kart 8 Deluxe inclus. Très peu utilisée.',
            price: 280,
            location: 'Strasbourg',
            condition: 'LIKE_NEW' as const,
            is_negotiable: false,
            user_id: bob.id,
            category_id: catJeux.id,
        },
    ];

    let adsCount = 0;
    for (const ad of ads) {
        await prisma.ads.create({ data: ad });
        adsCount++;
    }
    console.log(`✓ ${adsCount} annonces créées`);
    console.log('\n🎉 Seed terminé ! Comptes de démo :');
    console.log('   Admin  → email: admin@doumsdeal.com  / mdp: admin123');
    console.log('   Alice  → email: alice@doumsdeal.com  / mdp: user123');
    console.log('   Bob    → email: bob@doumsdeal.com    / mdp: user123');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
