-- ==========================================
-- STOKKU - Seed Data
-- ==========================================
-- Password: password123 (bcrypt hash)
-- $2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u
-- Users (password = 'password123')
INSERT INTO
    users (name, email, password, role, is_active)
VALUES
    (
        'Budi Santoso',
        'admin@stokku.com',
        '$2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u',
        'admin',
        true
    ),
    (
        'Siti Rahayu',
        'manager@stokku.com',
        '$2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u',
        'manager',
        true
    ),
    (
        'Ahmad Fauzi',
        'staff@stokku.com',
        '$2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u',
        'staff',
        true
    ),
    (
        'Dewi Lestari',
        'dewi@stokku.com',
        '$2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u',
        'staff',
        true
    ),
    (
        'Rizki Pratama',
        'rizki@stokku.com',
        '$2a$10$I.wvAdEkqPst7yg43hsXFO46u.drg1v0OI/p6FYva.u5GQKXPd22u',
        'staff',
        false
    ) ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO
    categories (name, description)
VALUES
    ('Elektronik', 'Perangkat elektronik dan gadget'),
    ('Furniture', 'Perabotan dan furnitur kantor'),
    ('ATK', 'Alat tulis kantor'),
    ('Komputer', 'Komputer, laptop, dan aksesoris'),
    ('Networking', 'Perangkat jaringan dan komunikasi') ON CONFLICT DO NOTHING;

-- Suppliers
INSERT INTO
    suppliers (name, email, phone, address)
VALUES
    (
        'PT. Maju Jaya Elektronik',
        'info@majujaya.co.id',
        '021-55512345',
        'Jl. Mangga Dua Raya No. 88, Jakarta Utara'
    ),
    (
        'CV. Berkah Office Supply',
        'sales@berkahoffice.com',
        '021-44498765',
        'Jl. Sudirman No. 45, Jakarta Selatan'
    ),
    (
        'PT. Digital Nusantara',
        'order@digitalnusa.id',
        '021-33345678',
        'Jl. TB Simatupang No. 12, Jakarta Timur'
    ),
    (
        'UD. Sumber Makmur',
        'sumbermakmur@gmail.com',
        '031-77712345',
        'Jl. Tunjungan No. 33, Surabaya'
    ) ON CONFLICT DO NOTHING;

-- Products (will reference category and supplier IDs)
-- Note: Run this AFTER categories and suppliers are inserted
-- Use subqueries to get correct IDs
INSERT INTO
    products (
        name,
        sku,
        price,
        stock,
        min_stock,
        category_id,
        supplier_id,
        description
    )
VALUES
    (
        'Laptop ASUS VivoBook 14',
        'ELK-001',
        8500000,
        12,
        5,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Elektronik'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'PT. Maju Jaya Elektronik'
            LIMIT
                1
        ),
        'Laptop 14 inch, Intel Core i5, RAM 8GB, SSD 512GB'
    ),
    (
        'Monitor LG 24" IPS',
        'ELK-002',
        2800000,
        8,
        3,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Elektronik'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'PT. Maju Jaya Elektronik'
            LIMIT
                1
        ),
        'Monitor 24 inch IPS Full HD'
    ),
    (
        'Meja Kantor Minimalis',
        'FRN-001',
        1500000,
        15,
        5,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Furniture'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'CV. Berkah Office Supply'
            LIMIT
                1
        ),
        'Meja kantor 120x60cm, rangka besi'
    ),
    (
        'Kursi Ergonomis Pro',
        'FRN-002',
        3200000,
        3,
        5,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Furniture'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'CV. Berkah Office Supply'
            LIMIT
                1
        ),
        'Kursi ergonomis dengan sandaran mesh'
    ),
    (
        'Kertas HVS A4 80gsm',
        'ATK-001',
        55000,
        200,
        50,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'ATK'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'CV. Berkah Office Supply'
            LIMIT
                1
        ),
        'Kertas HVS A4 80gsm, 1 rim (500 lembar)'
    ),
    (
        'Pulpen Pilot G2',
        'ATK-002',
        15000,
        150,
        30,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'ATK'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'UD. Sumber Makmur'
            LIMIT
                1
        ),
        'Pulpen gel 0.5mm, warna hitam'
    ),
    (
        'Keyboard Mechanical RGB',
        'KMP-001',
        750000,
        20,
        5,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Komputer'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'PT. Digital Nusantara'
            LIMIT
                1
        ),
        'Keyboard mechanical switch blue, RGB backlit'
    ),
    (
        'Mouse Wireless Logitech',
        'KMP-002',
        350000,
        25,
        10,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Komputer'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'PT. Digital Nusantara'
            LIMIT
                1
        ),
        'Mouse wireless 2.4GHz, ergonomis'
    ),
    (
        'Router WiFi 6 TP-Link',
        'NET-001',
        1200000,
        2,
        3,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Networking'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'PT. Digital Nusantara'
            LIMIT
                1
        ),
        'Router WiFi 6 AX1500, dual band'
    ),
    (
        'Kabel UTP Cat6 (per meter)',
        'NET-002',
        5000,
        500,
        100,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                name = 'Networking'
            LIMIT
                1
        ),
        (
            SELECT
                id
            FROM
                suppliers
            WHERE
                name = 'UD. Sumber Makmur'
            LIMIT
                1
        ),
        'Kabel LAN Cat6, 1Gbps'
    ) ON CONFLICT (sku) DO NOTHING;