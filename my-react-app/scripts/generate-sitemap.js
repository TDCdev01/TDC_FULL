import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { API_URL } from '../src/config/config.js';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSitemap() {
  try {
    // Fetch your dynamic routes (courses, blog posts, etc.)
    const coursesResponse = await fetch(`${API_URL}/api/courses`);
    const courses = await coursesResponse.json();
    
    const blogsResponse = await fetch(`${API_URL}/api/blog-posts`);
    const blogs = await blogsResponse.json();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Routes -->
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/courses</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Dynamic Course Routes -->
  ${courses.courses?.map(course => `
  <url>
    <loc>https://yourdomain.com/course/${course._id}</loc>
    <lastmod>${new Date(course.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('') || ''}
  
  <!-- Dynamic Blog Routes -->
  ${blogs.posts?.map(blog => `
  <url>
    <loc>https://yourdomain.com/blog/${blog._id}</loc>
    <lastmod>${new Date(blog.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('') || ''}
</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap(); 