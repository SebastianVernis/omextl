# Chatbot OMEXTL

Este es un chatbot diseñado para el sitio web de OMEXTL, una empresa de logística y transporte en México. El chatbot está construido con HTML, CSS, JavaScript y PHP, y utiliza la API de Gemini para la generación de respuestas.

## Características

-   **Generación de Leads:** El chatbot solicita al usuario su nombre, correo electrónico, servicio de interés y número de teléfono al inicio de la conversación.
-   **Lógica de Persuasión:** Si el usuario intenta hacer una pregunta sin proporcionar sus datos, el chatbot le recuerda amablemente que primero debe completar la información.
-   **Manejo de Errores:** El chatbot incluye manejo de errores para casos como la falta de la clave de API o la imposibilidad de cargar el prompt inicial.
-   **Interfaz de Usuario Mejorada:** La interfaz del chatbot ha sido rediseñada para ser más moderna y amigable.

## Requisitos del Servidor

-   Servidor web con soporte para PHP (se recomienda PHP 7.4 o superior).
-   Acceso a la configuración de variables de entorno (por ejemplo, a través de `httpd.conf`, `.htaccess`, o el panel de control de tu hosting).
-   cURL para PHP debe estar habilitado para que el chatbot pueda comunicarse con la API de Gemini.

## Despliegue

Para desplegar el chatbot en un servidor web, sigue estos pasos:

1.  **Sube los archivos:**
    -   Copia todos los archivos y directorios de este repositorio a la raíz de tu sitio web en el servidor (por ejemplo, al directorio `public_html`).

2.  **Obtén una Clave de API de Gemini:**
    -   Ve al sitio web de [Google AI Studio](https://aistudio.google.com/).
    -   Inicia sesión con tu cuenta de Google.
    -   Crea un nuevo proyecto y obtén tu clave de API.

3.  **Configura la Clave de API en tu Servidor:**
    -   La forma de configurar variables de entorno varía según tu proveedor de hosting y la configuración de tu servidor. Aquí hay algunos métodos comunes:
        -   **cPanel:** Busca la sección "Software" y haz clic en "Setup PHP Version" o "Select PHP Version". Luego, ve a la pestaña "Options" y busca la opción para agregar variables de entorno. Agrega una variable llamada `GEMINI_API_KEY` y pega tu clave de API como valor.
        -   **Apache (`.htaccess`):** Agrega la siguiente línea a tu archivo `.htaccess` en la raíz de tu sitio web:
            ```
            SetEnv GEMINI_API_KEY "TU_CLAVE_DE_API_AQUI"
            ```
        -   **Apache (`httpd.conf`):** Si tienes acceso al archivo de configuración principal de Apache, puedes agregar la siguiente línea:
            ```
            SetEnv GEMINI_API_KEY "TU_CLAVE_DE_API_AQUI"
            ```
        -   **Nginx:** En el archivo de configuración de tu sitio (generalmente en `/etc/nginx/sites-available/`), agrega la siguiente línea dentro del bloque `server`:
            ```
            fastcgi_param GEMINI_API_KEY "TU_CLAVE_DE_API_AQUI";
            ```
    -   **Importante:** Reemplaza `"TU_CLAVE_DE_API_AQUI"` con tu clave de API real.

4.  **Verifica los Permisos:**
    -   Asegúrate de que el servidor web tenga permisos de lectura para todos los archivos, especialmente `prompt.txt`. En la mayoría de los casos, los permisos `644` para los archivos y `755` para los directorios son suficientes.

5.  **Prueba el Chatbot:**
    -   Abre tu sitio web en un navegador y haz clic en el ícono del chatbot para comenzar a interactuar con él.

## Archivos

-   `Chatbot.html`: El archivo HTML principal para la interfaz del chatbot.
-   `assets/js/chatbot.js`: Contiene la lógica del cliente para el chatbot.
-   `chatbot.php`: El script de backend que se comunica con la API de Gemini.
-   `prompt.txt`: Contiene el prompt inicial que define la personalidad y el conocimiento del chatbot.
-   `PoliticaDePrivacidad.html`: Archivo de política de privacidad.
-   `assets/css/style.css`: Archivo de estilos.
-   `index.html`: Archivo principal del sitio web.
-   El resto de los archivos son parte del sitio web y deben mantenerse.
