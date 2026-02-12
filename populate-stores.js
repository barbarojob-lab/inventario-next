const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:12345@localhost:5432/web_inventario";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function populateStores() {
  try {
    console.log('Agregando 10 tiendas con productos a la base de datos...');

    const storesData = [
      { name: 'Fashion Central', location: 'Centro de la Ciudad', category: 'Ropa' },
      { name: 'Gourmet Deli', location: 'Zona Norte', category: 'Comida' },
      { name: 'Tech Hub', location: 'Centro Tecnológico', category: 'Electrónica' },
      { name: 'Home & Garden', location: 'Zona Residencial', category: 'Hogar' },
      { name: 'Sports Arena', location: 'Complejo Deportivo', category: 'Deportes' },
      { name: 'Beauty Boutique', location: 'Centro Comercial', category: 'Belleza' },
      { name: 'Book World', location: 'Biblioteca Central', category: 'Libros' },
      { name: 'Pet Paradise', location: 'Zona Veterinaria', category: 'Mascotas' },
      { name: 'Auto Parts Plus', location: 'Zona Industrial', category: 'Automotriz' },
      { name: 'Kids Corner', location: 'Centro Familiar', category: 'Niños' }
    ];

    const productsByCategory = {
      'Ropa': [
        'Camiseta Básica', 'Pantalón Jeans', 'Vestido Elegante', 'Chaqueta de Cuero', 'Zapatos Deportivos',
        'Blusa de Seda', 'Shorts Verano', 'Abrigo Invernal', 'Gorra Deportiva', 'Bufanda Lana',
        'Falda Plisada', 'Camisa Formal', 'Sudadera con Capucha', 'Zapatillas Casual', 'Traje de Baño',
        'Calcetines Algodón', 'Cinturón Cuero', 'Sombrero Panamá', 'Guantes Invierno', 'Bikini Playa',
        'Pijama Algodón', 'Ropa Interior', 'Medias Nylon', 'Bolso Mano', 'Mochila Escolar',
        'Corbata Seda', 'Tirantes Elegantes', 'Pulsera Moda', 'Collar Perlas', 'Anillo Plata',
        'Pendientes Oro', 'Reloj Pulsera', 'Gafas Sol', 'Billetera Cuero', 'Cinturón Hebilla'
      ],
      'Comida': [
        'Pan Integral', 'Leche Descremada', 'Queso Cheddar', 'Manzanas Rojas', 'Plátanos Maduros',
        'Arroz Blanco', 'Pasta Espagueti', 'Café Molido', 'Té Verde', 'Azúcar Refinado',
        'Aceite Oliva', 'Vinagre Balsámico', 'Sal Marina', 'Pimienta Negra', 'Canela Molida',
        'Chocolate Amargo', 'Galletas Avena', 'Cereal Maíz', 'Miel Pura', 'Mermelada Fresa',
        'Atún en Lata', 'Sardinas Aceite', 'Tomate en Lata', 'Maíz Dulce', 'Chícharos Verdes',
        'Sopa Pollo', 'Fideos Instantáneos', 'Salsa Tomate', 'Mayonesa', 'Mostaza',
        'Ketchup', 'Aderezo Italiano', 'Vinagre Manzana', 'Especias Mixtas', 'Hierbas Provensales'
      ],
      'Electrónica': [
        'Smartphone Android', 'iPhone Pro', 'Tablet 10"', 'Laptop Gaming', 'Monitor 27"',
        'Teclado Mecánico', 'Mouse Óptico', 'Auriculares Bluetooth', 'Parlantes Portátiles', 'Cámara Digital',
        'Smart TV 55"', 'Consola Videojuegos', 'Router WiFi', 'Disco Duro Externo', 'Memoria USB',
        'Cargador Rápido', 'Batería Portátil', 'Webcam HD', 'Micrófono USB', 'Altavoces 5.1',
        'Proyector HD', 'Drone Profesional', 'Smartwatch', 'E-Reader', 'Impresora Multifunción',
        'Escáner Documentos', 'UPS Energía', 'Cable HDMI', 'Adaptador USB-C', 'Tarjeta Memoria',
        'Control Remoto Universal', 'Reproductor Blu-ray', 'Grabadora DVR', 'Sistema Seguridad', 'Termostato Inteligente'
      ],
      'Hogar': [
        'Sofá 3 Plazas', 'Mesa Comedor', 'Sillas Acabado', 'Cama King Size', 'Cómoda 6 Cajones',
        'Lámpara Mesa', 'Cortinas Opacas', 'Alfombra Sala', 'Espejo Pared', 'Reloj Pared',
        'Juego Platos', 'Vajilla Completa', 'Ollas Acero', 'Sartenes Antiadherente', 'Tazas Cerámica',
        'Cubertería Plata', 'Mantel Individual', 'Servilletas Papel', 'Toallas Baño', 'Sábanas Algodón',
        'Almohadas Pluma', 'Colchón Viscoelástico', 'Mueble TV', 'Estantería Modular', 'Silla Escritorio',
        'Escritorio Madera', 'Librero Alto', 'Cesto Basura', 'Planta Decorativa', 'Marco Fotos',
        'Cojín Decorativo', 'Manta Polar', 'Cortina Ducha', 'Jabón Líquido', 'Detergente Ropa'
      ],
      'Deportes': [
        'Pelota Fútbol', 'Balón Baloncesto', 'Raqueta Tenis', 'Bicicleta Montaña', 'Pesas Mancuernas',
        'Cuerda Saltar', 'Tapete Yoga', 'Banda Elástica', 'Guantes Boxeo', 'Casco Ciclismo',
        'Zapatillas Running', 'Shorts Deportivos', 'Camiseta Dry Fit', 'Mochila Hidratación', 'Reloj Deportivo',
        'Banda Sudor', 'Botella Agua', 'Protector Solar', 'Gafas Natación', 'Aletas Nadar',
        'Tabla Surf', 'Patineta', 'Guantes Portería', 'Red Voleibol', 'Conos Entrenamiento',
        'Cronómetro Digital', 'Medidor Pasos', 'Colchoneta Gimnasio', 'Banco Press', 'Máquina Remo',
        'Bicicleta Estática', 'Eliptica', 'Caminadora', 'Saco Boxeo', 'Pesa Rusa'
      ],
      'Belleza': [
        'Crema Hidratante', 'Serum Vitamina C', 'Máscara Pestañas', 'Labial Rojo', 'Base Maquillaje',
        'Polvos Traslúcidos', 'Rubor Rosado', 'Sombra Ojos', 'Delineador Negro', 'Corrector Verde',
        'Bronzer Natural', 'Iluminador Perla', 'Spray Fijador', 'Champú Hidratante', 'Acondicionador',
        'Mascarilla Cabello', 'Tinte Rubio', 'Removedor Esmalte', 'Esmalte Rosa', 'Crema Manos',
        'Loción Corporal', 'Desodorante Roll-on', 'Perfume Floral', 'Agua Micelar', 'Tónico Facial',
        'Exfoliante Corporal', 'Mascarilla Arcilla', 'Aceite Facial', 'Crema Ojos', 'Bálsamo Labios',
        'Cepillo Cabello', 'Secador Pelo', 'Plancha Alisadora', 'Rizador Pelo', 'Cortauñas'
      ],
      'Libros': [
        'Novela Romántica', 'Thriller Suspense', 'Ciencia Ficción', 'Biografía Política', 'Libro Cocina',
        'Manual Programación', 'Historia Antigua', 'Poesía Contemporánea', 'Cuento Infantil', 'Ensayo Filosófico',
        'Guía Viajes', 'Libro Autoayuda', 'Novela Histórica', 'Cómic Superhéroes', 'Libro Arte',
        'Diccionario Español', 'Atlas Mundial', 'Libro Matemáticas', 'Química Orgánica', 'Física Moderna',
        'Historia Literatura', 'Psicología Cognitiva', 'Economía Básica', 'Derecho Constitucional', 'Medicina General',
        'Arquitectura Moderna', 'Fotografía Digital', 'Música Clásica', 'Teatro Contemporáneo', 'Pintura Renacentista',
        'Escultura Antigua', 'Diseño Gráfico', 'Marketing Digital', 'Emprendimiento', 'Finanzas Personales'
      ],
      'Mascotas': [
        'Croquetas Perro', 'Comida Gato', 'Arena Sanitaria', 'Collar Antipulgas', 'Champú Mascotas',
        'Juguete Pelota', 'Cama Mascota', 'Transportadora', 'Plato Acero', 'Cepillo Pelo',
        'Dentífrico Mascotas', 'Cortaúñas', 'Shampoo Antipulgas', 'Vitaminas Perro', 'Suplementos Gato',
        'Jaula Hamster', 'Pecera Completa', 'Alimento Peces', 'Nido Pájaros', 'Semillas Aves',
        'Heno Conejo', 'Jaula Conejo', 'Comida Tortuga', 'Terrario Reptil', 'Alimento Roedores',
        'Collar Perro', 'Correa Paseo', 'Arnés Gato', 'Identificación', 'Juguete Interactivo',
        'Rascador Gato', 'Limpieza Jaula', 'Filtro Acuario', 'Decoración Terrario', 'Alimento Especial'
      ],
      'Automotriz': [
        'Aceite Motor', 'Filtro Aire', 'Bujías Encendido', 'Pastillas Freno', 'Batería Auto',
        'Llantas Verano', 'Limpiaparabrisas', 'Anticongelante', 'Líquido Frenos', 'Filtro Aceite',
        'Correa Distribución', 'Amortiguadores', 'Bomba Agua', 'Radiador', 'Alternador',
        'Bomba Gasolina', 'Inyectores', 'Sensor Oxígeno', 'Catalizador', 'Escape Completo',
        'Suspensión Delantera', 'Dirección Hidráulica', 'Frenos ABS', 'Airbag', 'Cinturones Seguridad',
        'Espejos Retrovisores', 'Faros LED', 'Luces Neón', 'Alarma Auto', 'GPS Navegador',
        'Cámara Reverso', 'Sensores Estacionamiento', 'Techo Solar', 'Asientos Cuero', 'Volante Deportivo'
      ],
      'Niños': [
        'Muñeca Barbie', 'Carro Control Remoto', 'Lego Creativo', 'Pelota Saltarina', 'Puzzle 500 Piezas',
        'Libro Colorear', 'Crayones 24 Colores', 'Plastilina', 'Juego Mesa', 'Peluche Oso',
        'Ropa Bebé', 'Pañales Talla 3', 'Leche Fórmula', 'Biberón', 'Chupete',
        'Cochecito Plegable', 'Silla Alta', 'Andador Bebé', 'Móvil Cuna', 'Sábanas Cuna',
        'Juguete Educativo', 'Bloques Construcción', 'Rompecabezas', 'Juego Cocina', 'Casa Muñecas',
        'Tren Eléctrico', 'Avión Juguete', 'Barco Pirata', 'Dinosaurio Gigante', 'Princesa Corona',
        'Superhéroe Capa', 'Vaquero Sombrero', 'Payaso Nariz Roja', 'Mago Varita', 'Hada Alas'
      ]
    };

    for (const storeData of storesData) {
      const store = await prisma.store.create({
        data: {
          name: storeData.name,
          location: storeData.location
        }
      });
      console.log(`Tienda "${store.name}" agregada en ${store.location}`);

      const products = productsByCategory[storeData.category];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const price = Math.round((Math.random() * 200 + 10) * 100) / 100; // 10-210
        const cost = Math.round((price * (0.4 + Math.random() * 0.4)) * 100) / 100; // 40-80% of price
        const qty = Math.floor(Math.random() * 200) + 10; // 10-210

        await prisma.product.create({
          data: {
            storeId: store.id,
            code: `${storeData.category.substring(0, 3).toUpperCase()}${String(i + 1).padStart(3, '0')}`,
            name: product,
            price: price,
            cost: cost,
            qty: qty
          }
        });
      }
      console.log(`Agregados ${products.length} productos a ${store.name}`);
    }

    console.log('Todas las tiendas y productos agregados exitosamente.');
    await prisma.$disconnect();
  } catch (error) {
    console.log('Error al poblar datos:', error.message);
  }
}

populateStores();
