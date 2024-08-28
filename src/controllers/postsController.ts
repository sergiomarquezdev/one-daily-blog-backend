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
            LIMIT $1 OFFSET $2
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
    const {slug} = req.params;
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
        const result = await pool.query(query, [slug]);
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

export const generatePost = async (req: Request, res: Response) => {
    const author = "Sergio M�rquez";
    const secretKeyFromEnv = process.env.GENERATEPOST_SECRETKEY;

    const {secretKeyFromParams} = req.query;
    if (secretKeyFromParams !== secretKeyFromEnv) {
        return res.status(403).json({error: "Acceso denegado: secretKey inv�lida."});
    }

    try {
        const recentPostsQuery = `
            SELECT content_short
            FROM blog.posts
            ORDER BY id DESC
            LIMIT 50
        `;
        const recentPostsResult = await pool.query(recentPostsQuery);
        const recentContentShorts = recentPostsResult.rows
            .map((row) => row.content_short)
            .join(", ");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente experto en tecnolog�a, programaci�n y creaci�n de contenido t�cnico para blogs, con un enfoque en generar art�culos detallados y educativos sobre temas de programaci�n, tecnolog�as emergentes, y pr�cticas de desarrollo. Tu tarea es generar posts de blog que sean t�cnicos, informativos y profundos, con el objetivo de educar a una audiencia compuesta por programadores, desarrolladores y entusiastas de la tecnolog�a. Aseg�rate de que el contenido siga las mejores pr�cticas de SEO, sea original, est� bien estructurado, y explique conceptos t�cnicos de manera clara y precisa. El contenido debe ser �til para profesionales que buscan mejorar sus habilidades y mantenerse al d�a con las �ltimas innovaciones. El resultado debe ser entregado en formato JSON, con los campos nombrados seg�n el modelo de datos proporcionado`,
                },
                {
                    role: "user",
                    content: `Necesito que generes un post de blog completo en formato JSON que siga la siguiente estructura basada en mi entidad Post:
                    - **id**: (Generar como null, ser� autogenerado en la base de datos)
                    - **title**: Un t�tulo atractivo y optimizado para SEO que resuma el tema principal del post. Debe captar la atenci�n del lector y ser relevante para las tendencias actuales en programaci�n y desarrollo tecnol�gico.
                    - **content**: Un cuerpo del art�culo de aproximadamente 500 a 2000 palabras, escrito en un tono t�cnico y profesional. El contenido debe explicar detalladamente el tema, abordar conceptos clave de programaci�n o tecnolog�a, proporcionar ejemplos de c�digo cuando sea necesario, y mantener al lector comprometido a lo largo del texto. Es crucial que la informaci�n sea actual, precisa, y de alta calidad, evitando ser un mero resumen de otras fuentes. El art�culo debe ser original y no incurrir en plagio. Adem�s, formatea el contenido en HTML con una sem�ntica adecuada y optimizada para SEO.
                    - **contentShort**: Una breve explicaci�n concisa, de no m�s de 100 caracteres, que indique claramente de qu� trata el post, diferenci�ndose del t�tulo pero proporcionando un resumen muy directo del contenido.
                    - **contentResume**: Un breve resumen de no m�s de 200 caracteres que resuma los puntos clave del post. Este resumen debe ser conciso, informativo y capaz de atraer al lector a profundizar en el contenido.
                    - **urlSlug**: Genera un slug URL �nico y amigable para SEO basado en el t�tulo del art�culo. Este debe ser corto, descriptivo y relevante para el contenido del post.
                    - **createdAt**: (Generar como null, ser� autogenerado al insertar en la base de datos)
                    - **updatedAt**: (Generar como null, ser� autogenerado al insertar en la base de datos)
                    - **tags**: Una lista de 5 etiquetas relevantes para el tema del post. Estas etiquetas deben ayudar a clasificar el contenido en categor�as espec�ficas dentro del campo de la programaci�n y la tecnolog�a.
                    - **isPublished**: (Fijar como false por defecto)
                    Aseg�rate de que el contenido sea completamente original, detallado y pase las verificaciones de plagio. El estilo debe ser t�cnico y alineado con el tono profesional que buscan los lectores del blog, evitando simplificaciones excesivas y enfoc�ndose en aportar valor a programadores y desarrolladores. El post debe estar optimizado para SEO sin sacrificar la calidad de la informaci�n ni la legibilidad.
                    Por favor, solamente devuelve el JSON bien formado, no incluyas nada m�s.
                    Aqu� tienes un listado de los �ltimos 50 content_short para que no generes un post parecido a estos: ${recentContentShorts}`,
                },
            ],
        });

        if (!completion || !completion.choices || !completion.choices.length) {
            throw new Error("Respuesta de OpenAI vac�a o malformada");
        }

        let postData;
        try {
            const jsonContent = completion.choices[0].message.content?.replace(
                /```json|```/g,
                ""
            );
            postData = JSON.parse(jsonContent ?? "");
        } catch (err: any) {
            throw new Error("Error al parsear la respuesta de OpenAI: " + err.message
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
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
            RETURNING *
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
