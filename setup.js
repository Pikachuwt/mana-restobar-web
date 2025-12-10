const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Verificar si ya existe un admin
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('✅ El admin ya existe');
            process.exit(0);
        }
        
        // Crear admin por defecto
        const admin = new Admin({
            username: 'admin',
            password: 'admin123',
            email: 'admin@manarestobar.com',
            role: 'admin'
        });
        
        await admin.save();
        console.log('✅ Admin creado exitosamente');
        console.log('👤 Usuario: admin');
        console.log('🔑 Contraseña: admin123');
        console.log('⚠️ Cambia estas credenciales después del primer login');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando admin:', error);
        process.exit(1);
    }
}

setupAdmin();