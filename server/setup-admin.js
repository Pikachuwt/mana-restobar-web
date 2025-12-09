// server/setup-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
    console.log('🔧 Configurando administrador inicial para Maná Restobar...\n');
    
    // 1. Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mana-restobar';
    
    try {
        console.log('📡 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        
        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`📊 Base de datos: ${mongoose.connection.name}`);
        
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        console.log('\n🔍 Soluciones:');
        console.log('   1. Verifica tu conexión a internet');
        console.log('   2. Revisa la URI en el archivo .env');
        console.log('   3. Asegúrate de tener Network Access en MongoDB Atlas (añade 0.0.0.0/0)');
        console.log('   4. Espera 5 minutos después de cambiar Network Access');
        console.log(`\n🔗 URI usada: ${MONGODB_URI.replace(/\/\/(.*):(.*)@/, '//***:***@')}`);
        process.exit(1);
    }
    
    // 2. Definir el modelo Admin (si no existe)
    const AdminSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            default: 'admin'
        },
        lastLogin: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    });
    
    // 3. Crear el modelo
    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
    
    try {
        // 4. Verificar si ya existe el admin
        const adminExists = await Admin.findOne({ username: 'admin' });
        
        if (adminExists) {
            console.log('\n⚠️  El administrador ya existe en la base de datos');
            console.log('   Usuario:', adminExists.username);
            console.log('   Email:', adminExists.email);
            console.log('   Creado:', adminExists.createdAt.toLocaleDateString());
            console.log('\n💡 Si necesitas resetear la contraseña:');
            console.log('   1. Ve a MongoDB Atlas → Collections → admins');
            console.log('   2. Elimina el documento del usuario admin');
            console.log('   3. Ejecuta este setup de nuevo');
        } else {
            // 5. Crear contraseña encriptada
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            // 6. Crear nuevo admin
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@manarestobar.com',
                role: 'superadmin'
            });
            
            await admin.save();
            
            console.log('\n🎉 ¡ADMINISTRADOR CREADO EXITOSAMENTE!');
            console.log('========================================');
            console.log('📋 CREDENCIALES DE ACCESO:');
            console.log('   👤 Usuario: admin');
            console.log('   🔑 Contraseña: admin123');
            console.log('   📧 Email: admin@manarestobar.com');
            console.log('   🎯 Rol: superadmin');
            console.log('========================================');
            console.log('\n⚠️  ¡IMPORTANTE!');
            console.log('   1. Estas credenciales son temporales');
            console.log('   2. Cambia la contraseña después del primer login');
            console.log('   3. No compartas estas credenciales');
            console.log('   4. Para mayor seguridad, cambia el email también');
        }
        
        // 7. Verificar otras colecciones importantes
        console.log('\n🔍 Verificando estructura de la base de datos...');
        
        // Modelo para Menu
        const MenuSchema = new mongoose.Schema({
            pdfUrl: String,
            pdfName: String,
            menuEjecutivo: Object,
            menuEspecial: Object,
            lastUpdated: Date
        });
        const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
        
        // Verificar o crear menú por defecto
        let menu = await Menu.findOne();
        if (!menu) {
            menu = new Menu({
                pdfUrl: '/images/carta-completa.pdf.pdf',
                pdfName: 'carta-completa.pdf.pdf',
                menuEjecutivo: { precio: 15000, descripcion: 'Cambia todos los días' },
                menuEspecial: { precio: 20000, descripcion: 'Cambia todos los días' },
                lastUpdated: new Date()
            });
            await menu.save();
            console.log('✅ Menú por defecto creado');
        } else {
            console.log('✅ Menú existente encontrado');
        }
        
        // Modelo para ReservaConfig
        const ReservaConfigSchema = new mongoose.Schema({
            politicaCancelacion: String,
            politicaModificacion: String,
            politicaAbono: String,
            bancoNombre: String,
            cuentaNumero: String,
            cuentaTipo: String,
            cuentaNombre: String,
            nequiNumero: String,
            lastUpdated: Date
        });
        const ReservaConfig = mongoose.models.ReservaConfig || mongoose.model('ReservaConfig', ReservaConfigSchema);
        
        // Verificar o crear configuración de reservas
        let reservaConfig = await ReservaConfig.findOne();
        if (!reservaConfig) {
            reservaConfig = new ReservaConfig({
                politicaCancelacion: 'Se puede cancelar sin costo hasta 2 días antes de la fecha de la reserva.',
                politicaModificacion: 'Se puede modificar la reserva hasta 8 horas antes.',
                politicaAbono: 'Para eventos o platos especiales, se podría requerir un abono del 10% o 15% (configurable).',
                bancoNombre: 'BANCOLOMBIA',
                cuentaNumero: '47675777558',
                cuentaTipo: 'Ahorros',
                cuentaNombre: 'María Mendoza',
                nequiNumero: '@3105539582',
                lastUpdated: new Date()
            });
            await reservaConfig.save();
            console.log('✅ Configuración de reservas creada');
        } else {
            console.log('✅ Configuración de reservas existente encontrada');
        }
        
        // 8. Mostrar resumen
        console.log('\n📊 RESUMEN DE LA BASE DE DATOS:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`   Total colecciones: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));
        
        // 9. Cerrar conexión
        mongoose.connection.close();
        console.log('\n✅ Setup completado exitosamente!');
        console.log('\n🚀 Ahora puedes iniciar el servidor:');
        console.log('   cd mana-restobar-web');
        console.log('   node server/server.js');
        console.log('\n🌐 URLs para acceder:');
        console.log('   Frontend: http://localhost:3000');
        console.log('   Admin: http://localhost:3000/admin');
        console.log('   API Status: http://localhost:3000/api/status');
        
    } catch (error) {
        console.error('\n❌ Error durante el setup:', error.message);
        console.log('\n🔧 Solución de problemas:');
        console.log('   1. Verifica que MongoDB Atlas esté activo');
        console.log('   2. Ejecuta: node test-mongo-exact.js (para probar conexión)');
        console.log('   3. Revisa los logs de MongoDB Atlas');
        process.exit(1);
    }
}

// Ejecutar el setup
setupAdmin();