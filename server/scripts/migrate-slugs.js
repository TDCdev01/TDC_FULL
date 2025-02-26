const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const migrateSlugs = async () => {
  await mongoose.connect('mongodb+srv://anshuman:Anshuman123@cluster0.nqygv2g.mongodb.net/TDC?retryWrites=true&w=majority');
  
  const posts = await BlogPost.find({ slug: { $exists: false } });
  
  for (const post of posts) {
    let slug = generateSlug(post.title);
    
    // Check for existing slugs
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      slug = `${slug}-${post._id.toString().slice(-4)}`; // Append short ID
    }
    
    post.slug = slug;
    await post.save();
    console.log(`Migrated post "${post.title}" to slug: ${slug}`);
  }
  
  process.exit(0);
};

migrateSlugs(); 