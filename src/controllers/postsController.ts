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
              AND (p.id > $1 OR (p.id = (SELECT MIN(id) FROM blog.posts WHERE is_published = true) AND
                                 NOT EXISTS (SELECT 1 FROM blog.posts WHERE id > $1 AND is_published = true)))
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
              AND (p.id < $1 OR (p.id = (SELECT MAX(id) FROM blog.posts WHERE is_published = true) AND
                                 NOT EXISTS (SELECT 1 FROM blog.posts WHERE id < $1 AND is_published = true)))
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

    const {secretKeyFromParams} = req.query;
    if (secretKeyFromParams !== secretKeyFromEnv) {
        return res
            .status(403)
            .json({error: "Acceso denegado: secretKey inválida."});
    }

    try {
        const recentPostsQuery = `
            SELECT content_short
            FROM blog.posts
            ORDER BY id DESC LIMIT 50
        `;
        const recentPostsResult = await pool.query(recentPostsQuery);
        const recentContentShorts = recentPostsResult.rows
            .map((row: any) => row.content_short)
            .join(", ");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente experto en tecnología, programación y creación de contenido técnico para blogs. Tu tarea principal es generar artículos educativos, detallados y optimizados para SEO sobre temas relacionados con la programación y las tecnologías web. Estos artículos deben estar dirigidos a una audiencia profesional de desarrolladores, proporcionando explicaciones claras y accesibles de conceptos complejos, contenido original, y ejemplos prácticos.Asegúrate de que el contenido sea técnicamente preciso, actualizado y relevante para las tendencias actuales. Estructura el contenido de manera lógica, mantén un tono consistente y formatea el artículo en JSON de acuerdo con el modelo de datos especificado.
                        Incorpora palabras clave relevantes sin comprometer la naturalidad del texto. Usa títulos y subtítulos optimizados, así como meta descripciones concisas y atractivas.
                        Mantén un tono profesional pero accesible. Proporciona ejemplos de código que los desarrolladores puedan aplicar directamente en sus proyectos. El artículo debe ser exhaustivo, cubriendo tanto la teoría como la práctica del tema abordado.
                        Revisa las fuentes más recientes y asegúrate de que todas las referencias estén actualizadas al último trimestre.`,
                },
                {
                    role: "user",
                    content: `Por favor, genera un artículo completo en formato JSON siguiendo esta estructura basada en la entidad 'Post':
                    - **id**: (Establecer como null)
                    - **title**: Un título atractivo y optimizado para SEO de hasta 200 caracteres que resuma el tema principal del post, relevante para las tendencias actuales en programación y tecnología.
                    - **content**: Un artículo detallado y bien estructurado en un tono técnico. El contenido debe profundizar en el tema, cubriendo conceptos clave de programación o tecnologías, proporcionando ejemplos de código y manteniendo al lector comprometido. Debe ser original, libre de plagio, y formateado en HTML optimizado para SEO. El artículo debe aportar un valor significativo a los desarrolladores y entusiastas tecnológicos que buscan profundizar en su experiencia. Utiliza las etiquetas HTML apropiadas para encabezados, listas y bloques de código, todas optimizado para SEO.
                    - **contentShort**: Un resumen conciso de 100 caracteres del post, diferente del título, que indique claramente de qué trata el contenido.
                    - **contentResume**: Un resumen de 200 caracteres que resuma los puntos clave del post, animando a los lectores a profundizar en el contenido.
                    - **urlSlug**: Un slug único y amigable para SEO basado en el título, de hasta 200 caracteres, conciso y descriptivo.
                    - **createdAt**: (Establecer como null)
                    - **updatedAt**: (Establecer como null)
                    - **tags**: Una lista de 5 etiquetas relevantes que clasifiquen el contenido dentro del ámbito de la programación y la tecnología.
                    - **isPublished**: (Establecer como false)
                    Asegúrate de que el contenido sea técnicamente detallado, altamente informativo y completamente original. El estilo de escritura debe ser profesional, con un enfoque en ofrecer valor a desarrolladores y profesionales tecnológicos. El post debe pasar las verificaciones de plagio. Además, el contenido debe estar optimizado para SEO sin comprometer la profundidad y precisión de la información. Devuelve solo la estructura JSON bien formada. No repitas temas de los posts recientes, para ello aquí tienes los últimos 50 resúmenes de 'contentShort' para que no repitas temas: ${recentContentShorts}.`,
                },
            ],
        });

        if (!completion || !completion.choices || !completion.choices.length) {
            throw new Error("Respuesta de OpenAI vacía o malformada");
        }

        let postData;
        try {
            const jsonContent = completion.choices[0].message.content?.replace(
                /```json|```/g,
                ""
            );
            postData = JSON.parse(jsonContent ?? "");
        } catch (err: any) {
            throw new Error(
                "Error al parsear la respuesta de OpenAI: " + err.message
            );
        }

        const {title, content, contentShort, contentResume, urlSlug, tags} =
            postData;
        if (!title || !content || !contentShort || !contentResume || !urlSlug) {
            return res.status(400).json({
                error: "Faltan campos obligatorios en el JSON generado",
            });
        }

        const query = `
            INSERT INTO blog.posts (title, content, content_short, content_resume, author, url_slug, created_at,
                                    is_published)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), true) RETURNING *
        `;

        const values = [
            title,
            content,
            contentShort,
            contentResume,
            author,
            urlSlug,
        ];
        const result = await pool.query(query, values);

        const insertedPost = result.rows[0];

        if (tags && tags.length > 0) {
            const tagQuery = `
                INSERT INTO blog.post_tags (post_id, tag)
                VALUES
                    ${tags.map((_: any, i: any) => `($1, $${i + 2})`).join(", ")}
            `;
            await pool.query(tagQuery, [insertedPost.id, ...tags]);
        }

        res.status(201).json(insertedPost);
    } catch (err: any) {
        console.error("Error al generar y guardar el post:", err);
        res.status(500).json({
            error: "Error interno del servidor",
            details: err.message,
        });
    }
};
