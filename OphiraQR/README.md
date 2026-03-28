Al parecer react native no soporta localhost (http://localhost:4000/api) 
Entonces cada q se quieran conectar con la API tienen q buscar la ip de su compu y ponerla en un env
Se los dejo paso por paso por si cualquier cosa:

# 1. Saquen su IP de su simbolo de sistema
    - Entren al CMD
        (cmd / simbolo de sistema en el buscador, o Windows + r -> cmd)
    - Pongan ipconfig
    - Busquen la linea q dice 'Dirección IPv4. . . . . . . . . . . . . . : 192.168.100.XXX'
    - Copien la dirección

# 2. Guarden su IP en un .env
    - Creen un .env a la misma altura que App.js
    - Pongan EXPO_PUBLIC_API_URL=http://[su ip]:4000/api
        (sin los corchetes)

# 3. Chequen que API_URL en api.js sea const API_URL = process.env.ENV_API_URL
    - Como yo hago pruebas con emulador uso API_URL = API_URL_EMULATOR

Importante: cada vez que levanten el front con otra conexión de internet tienen que volver a guardar su IP

