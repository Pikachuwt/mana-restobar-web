const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        console.log('🔍 Verificando conexión a MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Conectado a MongoDB');
        
        // Verificar si existe la colección de admins
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Colecciones disponibles:', collections.map(c => c.name));
        
        // Verificar si hay admins
        const Admin = require('./models/Admin');
        const adminCount = await Admin.countDocuments();
        console.log(`👥 Admins en la base de datos: ${adminCount}`);
        
        if (adminCount === 0) {
            console.log('⚠️ No hay admins. Creando admin por defecto...');
            
            // Crear admin manualmente
            const admin = new Admin({
                username: 'admin',
                password: 'admin123', // Se encriptará automáticamente
                email: 'admin@manarestobar.com',
                role: 'admin'
            });
            
            await admin.save();
            console.log('✅ Admin creado exitosamente');
            console.log('👤 Usuario: admin');
            console.log('🔑 Contraseña: admin123');
        } else {
            const admins = await Admin.find({});
            console.log('📋 Admins encontrados:');
            admins.forEach(a => {
                console.log(`- ${a.username} (${a.email})`);
            });
        }
        
        mongoose.connection.close();
        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDatabase();