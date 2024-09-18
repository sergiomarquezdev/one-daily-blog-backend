# One dAIly Blog Backend

## Descripción

One dAIly Blog Backend es una aplicación de backend construida con **Node.js** y **Express.js**, diseñada para ofrecer una API robusta para un blog diario. Esta aplicación permite la gestión de publicaciones, incluyendo la creación, obtención y manipulación de posts, así como la integración con OpenAI para generar contenido.

## Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework web para Node.js que facilita la creación de aplicaciones web y APIs.
- **PostgreSQL**: Sistema de gestión de bases de datos relacional utilizado para almacenar los datos de las publicaciones.
- **OpenAI**: API utilizada para generar contenido automáticamente.

## Características

- Autenticación con OpenAI para generación de contenido.
- Conexión a una base de datos PostgreSQL para almacenamiento de posts.
- Rutas para obtener y generar posts.
- Soporte para obtener posts aleatorios, por slug, por autor, etc.

## Instalación

Para instalar y ejecutar la aplicación, sigue estos pasos:

1. Clona el repositorio:
```bash
git clone https://github.com/sergiomarquezdev/one-daily-blog-backend.git
```
2. Navega al directorio del proyecto:
```bash
cd one-daily-blog-backend
```
3. Instala las dependencias:
```bash
npm install
```
4. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:
   - `PGHOST`: Host de la base de datos PostgreSQL.
   - `PGDATABASE`: Nombre de la base de datos.
   - `PGUSER`: Usuario de la base de datos.
   - `PGPASSWORD`: Contraseña del usuario.
   - `OPENAI_API_KEY_BLOG`: Clave de API de OpenAI.
   - `GENERATEPOST_SECRETKEY`: Clave secreta para crear un nuevo post
   - `GENERATESITEMAP_SECRETKEY`: Clave secreta para generar el sitemap
5. Inicia la aplicación:
```bash
npm start
```

## Rutas

La API expone las siguientes rutas:

- **`/posts`**: Obtiene todos los posts.
- **`/posts/random`**: Obtiene posts aleatorios.
- **`/posts/slug`**: Obtiene un post por slug.
- **`/posts/previous`**: Obtiene el post anterior.
- **`/posts/next`**: Obtiene el post siguiente.
- **`/posts/total`**: Obtiene el total de posts.
- **`/posts/generate`**: Genera un nuevo post utilizando OpenAI.
- **`/sitemap/generate`**: Genera el sitemap del blog

## Contribuciones

Si deseas contribuir a este proyecto, por favor, crea un fork del repositorio y envía un pull request con tus cambios. Agradecemos cualquier mejora o sugerencia.

## Licencia

Este proyecto está licenciado bajo la licencia MIT.

## Contacto

Para preguntas o sugerencias, por favor contacta a Sergio Márquez en sergiomarquezdev@gmail.com.

## Agradecimientos

- **Express.js**: Por ser un framework ligero y flexible.
- **PostgreSQL**: Por su robustez y fiabilidad.
- **OpenAI**: Por permitir la generación de contenido innovador.
- **Comunidad de desarrolladores de Node.js**: Por su apoyo y recursos.
