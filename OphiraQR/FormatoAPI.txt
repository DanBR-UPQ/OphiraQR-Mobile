ENDPOINTS PARA CONSUMIR LA API

ASSETS
 URL base => localhost:4000/api/assets
 
    - Crear ACTIVO
        post => localhost:4000/api/assets/
        body:{
        "nombre": "nombre",
        "descripcion" : "descripcion",
        "modelo": "modelo",
        "numero_serie": "numero_serie",
        "fecha_compra" : "fecha_compra",
        "precio_compra" : 10.00,
        "id_categoria" : "1",
        "id_estado_activo": "1",
        "id_aula": "C102"  
        }

    - Listar todos los activos
        get => localhost:4000/api/assets/

    - Buscar un activo por id
        get => localhost:4000/api/assets/id/[id]
    
    - Buscar por nombre
        get => localhost:4000/api/assets/nombre/[nombre]
    
    - Eliminar
        delete => localhost:4000/api/assets/[id]
    
    - Editar    
        put => localhost:4000/api/assets/[id]
        body:{
            "nombre": "nombre",
            "descripcion": "descripcion",
            "modelo": "modelo",
            "numero_serie": "numero_serie",
            "fecha_compra":"fecha_compra",
            "precio_compra": "precio_compra",
            "id_categoria": "id_categoria",
            "id_estado_activo":"id_estado_activo",
            "id_aula":"id_aula"
        }
USUARIOS
URL base => localhost:4000/api/usuarios

    - Crear
        post => localhost:4000/api/usuarios
        body: {
            "nombre": "Carlos", 
            "apaterno": "Mendoza",
            "amaterno": "Hernandez",
            "correo": "correo@gmail.com",
            "telefono": "4411078903",
            "id_rol": "1",
            "id_puesto": "1",
            "password": "12345"
        }
    - Editar
        put => localhost:4000/api/usuarios/[id]
        body: {
            "nombre": "Carlos", 
            "apaterno": "Mendoza",
            "amaterno": "Hernandez",
            "correo": "correo@gmail.com",
            "telefono": "4411078903",
            "id_rol": "1",
            "id_puesto": "1",
            "password": "12345"
        }
        // Recupera el usuario con su id, y solo cambia los valores != null en el body recibido
    - Eliminar
        delete => localhost:4000/api/usuarios/[id]

    - Obtener un usuario
        get => localhost:4000/api/usuarios/[id]
    
    - Obtener todos los usuarios
        get => localhost:4000/api/usuarios


AUTHENTICATION
    - Login
        post => localhost:4000/api/auth/login
        body: {
            "correo": "correo@gmail.com",
            "password": "password"
        }

ROLES
    - Obtener todos los roles
        get => localhost:4000/api/roles/
    
    - registrar nuevo rol
        post => localhost:4000/api/roles/

    - Editar un rol
        put => localhost:4000/api/roles/[nombre]
        body:{
            "nombreNuevo": "Nombre",
            "descripcion": "Descripcion"
        }
        // El rol se recupera con el nombre y solo se esitan los campos != null del body que llega
    
    - Eliminar un rol
        delete => localhost:4000/api/roles/[nombre]


AUDITORIAS
URL base => localhost:4000/api/auditorias

    - Crear auditoría
        post => localhost:4000/api/auditorias/
        body: {
            "id_movimiento": "1",
            "id_usuario_auditor": "1",
            "observaciones": "aughgh"
        }

    - Obtener todas las auditorías
        get => localhost:4000/api/auditorias/

    - Obtener auditoría por id
        get => localhost:4000/api/auditorias/[id]

    - Editar auditoría
        put => localhost:4000/api/auditorias/[id]
        body: {
            "observaciones": "aughg"
        }

    - Eliminar auditoría
        delete => localhost:4000/api/auditorias/[id]