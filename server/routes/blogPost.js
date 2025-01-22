const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');
const mongoose = require('mongoose');

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('BlogPost Route:', req.method, req.path);
  next();
});

// Create a new blog post
router.post('/admin/blog-posts', auth, async (req, res) => {
    try {
        console.log('Received blog post request:', req.body);
        const { title, sections } = req.body;

        if (!title || !sections) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        // Use adminId from token
        const newBlogPost = new BlogPost({
            title,
            sections,
            author: req.user.adminId,
        });

        await newBlogPost.save();
        console.log('Blog post saved successfully');

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            post: newBlogPost
        });
    } catch (error) {
        console.error('Blog post creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating blog post'
        });
    }
});

// Get all blog posts
router.get('/blog-posts', async (req, res) => {
    try {
        const posts = await BlogPost.find()
            .populate({
                path: 'author',
                model: 'Admin',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts: posts.map(post => ({
                _id: post._id,
                title: post.title,
                sections: post.sections,
                author: post.author,
                viewCount: post.viewCount || 0,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog posts'
        });
    }
});

// Get single blog post
router.get('/blog-posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
            .populate('author', 'firstName lastName');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            post: {
                _id: post._id,
                title: post.title,
                sections: post.sections,
                author: post.author,
                viewCount: post.viewCount || 0,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog post'
        });
    }
});

// Update entire blog post
router.put('/admin/blog-posts/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, sections } = req.body;

        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Update the post
        post.title = title;
        if (sections) {
            post.sections = sections;
        }
        post.updatedAt = Date.now();

        await post.save();

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            post
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog post'
        });
    }
});

// Update section route
router.put('/blog-posts/:postId/sections/:sectionId', auth, async (req, res) => {
    console.log('Route hit:', req.path);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Auth token:', req.header('Authorization'));

    try {
        const { postId, sectionId } = req.params;
        const { content, type } = req.body;

        // Log the IDs we're working with
        console.log('Looking for post:', postId);
        console.log('Looking for section:', sectionId);

        const post = await BlogPost.findById(postId);
        console.log('Found post:', post ? 'Yes' : 'No');

        if (!post) {
            console.log('Post not found');
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Find and update the specific section
        const section = post.sections.find(s => s._id.toString() === sectionId);
        console.log('Found section:', section ? 'Yes' : 'No');

        if (!section) {
            console.log('Section not found');
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Update the section
        section.content = content;
        if (type) {
            section.type = type;
        }

        console.log('Saving updated post...');
        await post.save();
        console.log('Post saved successfully');

        return res.json({
            success: true,
            message: 'Section updated successfully',
            post
        });
    } catch (error) {
        console.error('Error updating section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error updating section'
        });
    }
});

// Delete section route
router.delete('/blog-posts/:postId/sections/:sectionId', auth, async (req, res) => {
    try {
        const { postId, sectionId } = req.params;

        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Find section index
        const sectionIndex = post.sections.findIndex(
            section => section._id.toString() === sectionId
        );

        if (sectionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Remove the section
        post.sections.splice(sectionIndex, 1);
        await post.save();

        return res.json({
            success: true,
            message: 'Section deleted successfully',
            post
        });
    } catch (error) {
        console.error('Error deleting section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting section'
        });
    }
});

// Delete entire blog post
router.delete('/blog-posts/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        await BlogPost.findByIdAndDelete(postId);

        return res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting blog post'
        });
    }
});

// Increment view count route
router.post('/blog-posts/:id/increment-view', async (req, res) => {
  try {
    console.log(`[ViewCount API] Incrementing view for post ID: ${req.params.id}`);
    
    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) {
      console.log(`[ViewCount API] Blog post not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    console.log(`[ViewCount API] Current view count: ${blogPost.viewCount}`);
    await blogPost.incrementViewCount();
    console.log(`[ViewCount API] Updated view count: ${blogPost.viewCount}`);
    
    return res.json({ 
      success: true, 
      message: 'View count incremented successfully',
      newCount: blogPost.viewCount
    });
  } catch (error) {
    console.error('[ViewCount API] Error incrementing view count:', error);
    return res.status(500).json({ success: false, message: 'Error incrementing view count' });
  }
});

module.exports = router; 