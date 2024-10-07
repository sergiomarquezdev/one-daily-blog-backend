import {Request, Response} from "express";
import pool from "../config/database";
import openai from "../config/openai";

export const getPosts = async (req: Request, res: Response) => {
    const {limit = 10, offset = 0} = req.query;
    try {
        const query = `
            SELECT p.id,
                   p.title,
                   p.url_slug,
                   p.content,
                   p.content_resume,
                   p.is_published,
                   p.created_at,
                   p.updated_at,
                   p.author,
                   ARRAY_AGG(t.tag) AS post_tags
            FROM blog.posts p
                     LEFT JOIN blog.post_tags t ON p.id = t.post_id
            WHERE p.is_published = true
            GROUP BY p.id
            ORDER BY p.created_at DESC
                LIMIT $1
            OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error en la consulta de la base de datos:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};

export const getRandomPosts = async (req: Request, res: Response) => {
    const {n = 3} = req.query;
    try {
        const query = `
            SELECT p.id,
                   p.title,
                   p.url_slug,
                   p.content,
                   p.content_resume,
                   p.is_published,
                   p.created_at,
                   p.updated_at,
                   p.author,
                   ARRAY_AGG(t.tag) AS post_tags
            FROM blog.posts p
                     LEFT JOIN blog.post_tags t ON p.id = t.post_id
            WHERE p.is_published = true
            GROUP BY p.id
            ORDER BY RANDOM()
                LIMIT $1
        `;
        const result = await pool.query(query, [n]);
        res.json(result.rows);
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getPostBySlug = async (req: Request, res: Response) => {
    const {urlSlug} = req.query;
    try {
        const query = `
            SELECT p.id,
                   p.title,
                   p.url_slug,
                   p.content,
                   p.content_resume,
                   p.is_published,
                   p.created_at,
                   p.updated_at,
                   p.author,
                   ARRAY_AGG(t.tag) AS post_tags
            FROM blog.posts p
                     LEFT JOIN blog.post_tags t ON p.id = t.post_id
            WHERE p.url_slug = $1
              AND p.is_published = true
            GROUP BY p.id
        `;
        const result = await pool.query(query, [urlSlug]);
        if (result.rows.length === 0) {
            res.status(404).json({error: "Post no encontrado"});
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Error en la consulta de la base de datos:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};

export const getPreviousPostById = async (req: Request, res: Response) => {
    const {postId} = req.query;
    try {
        const query = `
            SELECT p.id,
                   p.title,
                   p.url_slug,
                   p.content,
                   p.content_resume,
                   p.is_published,
                   p.created_at,
                   p.updated_at,
                   p.author,
                   ARRAY_AGG(t.tag) AS post_tags
            FROM blog.posts p
                     LEFT JOIN blog.post_tags t ON p.id = t.post_id
            WHERE p.is_published = true
              AND p.id < $1
            GROUP BY p.id
            ORDER BY p.id DESC LIMIT 1
        `;
        const result = await pool.query(query, [postId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en la consulta de la base de datos:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};


export const getNextPostById = async (req: Request, res: Response) => {
    const {postId} = req.query;
    try {
        const query = `
            SELECT p.id,
                   p.title,
                   p.url_slug,
                   p.content,
                   p.content_resume,
                   p.is_published,
                   p.created_at,
                   p.updated_at,
                   p.author,
                   ARRAY_AGG(t.tag) AS post_tags
            FROM blog.posts p
                     LEFT JOIN blog.post_tags t ON p.id = t.post_id
            WHERE p.is_published = true
              AND p.id > $1
            GROUP BY p.id
            ORDER BY p.id ASC LIMIT 1
        `;
        const result = await pool.query(query, [postId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en la consulta de la base de datos:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};

export const getTotalPosts = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT COUNT(*) AS total_posts
            FROM blog.posts
            WHERE is_published = true
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en la consulta de la base de datos:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};


export const generatePost = async (req: Request, res: Response) => {
    const author = "Sergio Márquez";
    const secretKeyFromEnv = process.env.GENERATEPOST_SECRETKEY;

    const { secretKeyFromParams } = req.query;
    if (secretKeyFromParams !== secretKeyFromEnv) {
        return res.status(403).json({ error: "Acceso denegado: secretKey inválida." });
    }

    try {
        // Consultar los posts recientes
        const recentPostsQuery = `
            SELECT content_short
            FROM blog.posts
            ORDER BY id DESC LIMIT 50
        `;
        const recentPostsResult = await pool.query(recentPostsQuery);
        const recentContentShorts = recentPostsResult.rows
            .map((row: any) => row.content_short)
            .join(", ");

        // Realizar la llamada a la API de OpenAI con el vector store
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente experto en tecnología, programación y creación de contenido técnico para blogs.
                    Tienes acceso a una base de conocimientos almacenada en archivos, y tu tarea principal es generar artículos educativos
                    optimizados para SEO sobre temas actuales de programación y tecnologías web. Debes proporcionar contenido detallado,
                    original y técnicamente preciso dirigido a una audiencia de desarrolladores con diferentes niveles de experiencia.
                    Usa ejemplos prácticos y asegúrate de que el artículo sea claro, accesible y esté actualizado con las últimas tendencias
                    en la industria tecnológica. Utiliza un formato HTML bien estructurado, con títulos y subtítulos optimizados para SEO, y
                    añade meta descripciones y palabras clave relevantes de manera natural.`
                },
                {
                    role: "user",
                    content: `Por favor, genera un artículo completo en formato JSON siguiendo esta estructura basada en la entidad 'Post':
                    - **id**: (Establecer como null)
                    - **title**: Un título atractivo y optimizado para SEO de hasta 200 caracteres que resuma el tema principal del post, relevante para las tendencias actuales en programación y tecnología.
                    - **content**: Un artículo detallado, estructurado en un tono técnico. El contenido debe profundizar en el tema, cubriendo conceptos clave de programación o tecnologías, proporcionando ejemplos prácticos de código y manteniendo al lector comprometido. Debe ser original, libre de plagio, y formateado en HTML optimizado para SEO, incluyendo encabezados, listas y bloques de código. Usa etiquetas HTML apropiadas.
                    - **contentShort**: Un resumen conciso de 100 caracteres que resuma claramente de qué trata el post.
                    - **contentResume**: Un resumen de 200 caracteres que destaque los puntos clave y anime a los lectores a profundizar en el contenido.
                    - **urlSlug**: Un slug único y amigable para SEO basado en el título, de hasta 200 caracteres.
                    - **createdAt**: (Establecer como null)
                    - **updatedAt**: (Establecer como null)
                    - **tags**: Una lista de 5 etiquetas relevantes que clasifiquen el contenido dentro del ámbito de la programación y la tecnología.
                    - **isPublished**: (Establecer como false)
                    Asegúrate de que el contenido sea altamente informativo y completamente original. Si es necesario, cita referencias de los archivos que tienes acceso en el vector store.
                    No repitas temas de los posts recientes, para ello aquí tienes los últimos 50 resúmenes de 'contentShort': ${recentContentShorts}.`
                }
            ]
        });

        if (!completion || !completion.choices || !completion.choices.length) {
            throw new Error("Respuesta de OpenAI vacía o malformada");
        }

        let postData;
        try {
            const jsonContent = completion.choices[0].message.content?.replace(/```json|```/g, "");
            postData = JSON.parse(jsonContent ?? "");
        } catch (err: any) {
            throw new Error("Error al parsear la respuesta de OpenAI: " + err.message);
        }

        const { title, content, contentShort, contentResume, urlSlug, tags } = postData;
        if (!title || !content || !contentShort || !contentResume || !urlSlug) {
            return res.status(400).json({
                error: "Faltan campos obligatorios en el JSON generado"
            });
        }

        const query = `
            INSERT INTO blog.posts (title, content, content_short, content_resume, author, url_slug, created_at, is_published)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), true) RETURNING *
        `;
        const values = [title, content, contentShort, contentResume, author, urlSlug];
        const result = await pool.query(query, values);

        const insertedPost = result.rows[0];

        if (tags && tags.length > 0) {
            const tagQuery = `
                INSERT INTO blog.post_tags (post_id, tag)
                VALUES ${tags.map((_: any, i: any) => `($1, $${i + 2})`).join(", ")}
            `;
            await pool.query(tagQuery, [insertedPost.id, ...tags]);
        }

        res.status(201).json(insertedPost);
    } catch (err: any) {
        console.error("Error al generar y guardar el post:", err);
        res.status(500).json({
            error: "Error interno del servidor",
            details: err.message
        });
    }
};
