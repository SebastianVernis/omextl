# Chatbot OMEXTL

Este es un chatbot diseñado para el sitio web de OMEXTL, una empresa de logística y transporte en México. El chatbot está construido con HTML, CSS, JavaScript y PHP, y utiliza la API de Gemini para la generación de respuestas.

## Características

-   **Generación de Leads:** El chatbot solicita al usuario su nombre, correo electrónico, servicio de interés y número de teléfono al inicio de la conversación.
-   **Lógica de Persuasión:** Si el usuario intenta hacer una pregunta sin proporcionar sus datos, el chatbot le recuerda amablemente que primero debe completar la información.
-   **Manejo de Errores:** El chatbot incluye manejo de errores para casos como la falta de la clave de API o la imposibilidad de cargar el prompt inicial.
-   **Interfaz de Usuario Mejorada:** La interfaz del chatbot ha sido rediseñada para ser más moderna y amigable.

## Despliegue

Para desplegar el chatbot en un servidor web, sigue estos pasos:

1.  **Sube los archivos:** Copia todos los archivos del repositorio a tu servidor web.
2.  **Configura la clave de API:** El chatbot utiliza la API de Gemini, que requiere una clave de API. Debes configurar esta clave como una variable de entorno en tu servidor. El nombre de la variable de entorno debe ser `GEMINI_API_KEY`.
3.  **Verifica los permisos:** Asegúrate de que el servidor web tenga permisos de lectura para todos los archivos, especialmente `prompt.txt`.

## Archivos

-   `Chatbot.html`: El archivo HTML principal para la interfaz del chatbot.
-   `assets/js/chatbot.js`: Contiene la lógica del cliente para el chatbot.
-   `chatbot.php`: El script de backend que se comunica con la API de Gemini.
-   `prompt.txt`: Contiene el prompt inicial que define la personalidad y el conocimiento del chatbot.
-   `PoliticaDePrivacidad.html`: Archivo de política de privacidad.
-   `assets/css/style.css`: Archivo de estilos.
-   `index.html`: Archivo principal del sitio web.
-   El resto de los archivos son parte del sitio web y deben mantenerse.
