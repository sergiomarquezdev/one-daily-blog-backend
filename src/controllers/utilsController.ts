import { Request, Response } from "express";
import pool from "../config/database";
import { create } from 'xmlbuilder2';
import * as fs from 'fs';

export const generateSitemap = async (req: Request, res: Response) => {
    const secretKeyFromEnv = process.env.GENERATESITEMAP_SECRETKEY;

    const { secretKeyFromParams } = req.query;
    if (secretKeyFromParams !== secretKeyFromEnv) {
        return res
            .status(403)
            .json({ error: "Acceso denegado: secretKey inválida." });
    }

    try {
        const query = `
            SELECT url_slug, updated_at
            FROM blog.posts
            WHERE is_published = true
        `;
        const result = await pool.query(query);

        const urlSet = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

        urlSet.ele('url')
            .ele('loc').txt('https://blog.sergiomarquez.dev/').up()
            .ele('lastmod').txt(new Date().toISOString().split('T')[0]).up()
            .ele('changefreq').txt('daily').up()
            .ele('priority').txt('1.0').up()
            .up();

        result.rows.forEach((row: { url_slug: string; updated_at: Date }) => {
            const postUrl = `https://blog.sergiomarquez.dev/post/${row.url_slug}`;
            const lastMod = row.updated_at
                ? row.updated_at.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            urlSet.ele('url')
                .ele('loc').txt(postUrl).up()
                .ele('lastmod').txt(lastMod).up()
                .ele('changefreq').txt('monthly').up()
                .ele('priority').txt('0.8').up()
                .up();
        });

        const xmlString = urlSet.end({ prettyPrint: true });

        const outputPath = '/var/www/one-daily-blog/dist/one-daily-blog/browser/sitemap.xml';
        fs.writeFileSync(outputPath, xmlString);

        console.log('sitemap.xml generado y guardado correctamente en', outputPath);

        res.status(200).json({ message: 'sitemap.xml generado correctamente' });
    } catch (error) {
        console.error('Error al generar el sitemap:', error);
        res.status(500).json({ error: 'Error al generar el sitemap' });
    }
};
