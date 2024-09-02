# One dAIly Blog Backend: Aplicación de backend para un blog diario

## Descripción

One dAIly Blog Backend es una aplicación de backend desarrollada con Node.js y Express.js, diseñada para proporcionar una API para un blog diario.

## Tecnologías utilizadas

-   Node.js
-   Express.js
-   PostgreSQL
-   OpenAI

## Características

-   Autenticación con OpenAI
-   Conexión a una base de datos PostgreSQL
-   Rutas para obtener y generar posts
-   Soporte para obtener posts aleatorios, por slug, por autor, etc.

## Instalación

1.  Clona el repositorio: git clone https://github.com/sergiomarquezdev/one-daily-blog-backend.git
2.  Instala las dependencias: npm install
3.  Crea un archivo .env con tus variables de entorno (PGHOST, PGDATABASE, PGUSER, PGPASSWORD, OPENAI_API_KEY_BLOG)
4.  Inicia la aplicación: npm start

## Rutas

-   `/posts`: Obtiene todos los posts
-   `/posts/random`: Obtiene posts aleatorios
-   `/posts/slug`: Obtiene un post por slug
-   `/posts/previous`: Obtiene el post anterior
-   `/posts/next`: Obtiene el post siguiente
-   `/posts/total`: Obtiene el total de posts
-   `/posts/generate`: Genera un nuevo post

## Contribuciones

Si deseas contribuir a este proyecto, por favor, crea un fork del repositorio y envía un pull request con tus cambios.

## Licencia

Este proyecto está licenciado bajo la licencia MIT.

## Contacto

Para preguntas o sugerencias, por favor contacta a Sergio Márquez en sergiomarquezdev@gmail.com.

## Agradecimientos

Express.js
PostgreSQL
OpenAI
Comunidad de desarrolladores de Node.js
