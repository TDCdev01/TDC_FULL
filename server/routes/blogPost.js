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

// Create blog post
router.post('/admin/blog-posts', auth, async (req, res) => {
  try {
    const { title, sections, tags, topics, bannerImage, authorName } = req.body;

    // Validate required fields
    if (!title || !sections || !authorName) {
      return res.status(400).json({
        success: false,
        message: 'Title, sections, and author name are required'
      });
    }

    // Create new blog post
    const blogPost = new BlogPost({
      title: title.trim(),
      sections,
      tags,
      topics,
      bannerImage: bannerImage || null,
      authorNameFE: authorName.trim(), // Set the frontend author name
      authorName: req.adminName, // Keep admin's name for reference
      author: req.adminId
    });

    await blogPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      post: blogPost
    });
  } catch (error) {
    console.error('Error in blog post creation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
      error: error.message
    });
  }
});

// Get all blog posts
router.get('/blog-posts', async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .select('title content views createdAt updatedAt bannerImage authorName authorNameFE tags topics')
      .lean();

    res.json({
      success: true,
      posts: posts.map(post => ({
        ...post,
        views: post.views || 0,
        bannerImage: post.bannerImage || null,
        authorName: post.authorName,
        authorNameFE: post.authorNameFE || post.author?.name || post.authorName
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
      .populate('author', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      post
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
    const lastViewedAt = req.body.lastViewedAt || new Date().toISOString(); // Default to current time if not provided
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const now = new Date();
    const lastViewedDate = new Date(lastViewedAt);
    const timeSinceLastView = now - lastViewedDate;

    // Only increment if more than 10 minutes have passed since the last view
    if (timeSinceLastView > 600) { // 600000 ms = 10 minutes
      post.views += 1;
      await post.save();
      res.json({ 
        success: true, 
        message: 'View count incremented successfully', 
        newCount: post.views,
        lastViewedAt: now.toISOString()
      });
    } else {
      res.json({ 
        success: true, 
        message: 'View count increment skipped', 
        newCount: post.views,
        lastViewedAt: lastViewedAt
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Error incrementing view count' });
  }
});

// Update entire blog post
router.put('/blog-posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      authorNameFE,
      bannerImage,
      tags,
      topics,
      sections
    } = req.body;

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        title,
        authorNameFE,
        bannerImage,
        tags,
        topics,
        sections
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('[Update Blog Post] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating blog post'
    });
  }
});

// Update a specific section
router.put('/blog-posts/:postId/sections/:sectionId', auth, async (req, res) => {
  try {
    const { postId, sectionId } = req.params;
    const { content, type } = req.body;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const sectionIndex = post.sections.findIndex(
      section => section._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    post.sections[sectionIndex].content = content;
    if (type) {
      post.sections[sectionIndex].type = type;
    }

    await post.save();

    res.json({
      success: true,
      message: 'Section updated successfully',
      section: post.sections[sectionIndex]
    });
  } catch (error) {
    console.error('[Update Section] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating section'
    });
  }
});

// Delete a section
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

    post.sections = post.sections.filter(
      section => section._id.toString() !== sectionId
    );

    await post.save();

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Section] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting section'
    });
  }
});

// Add a new section
router.post('/blog-posts/:postId/sections', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type, content } = req.body;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const newSection = {
      type,
      content
    };

    post.sections.push(newSection);
    await post.save();

    res.json({
      success: true,
      message: 'Section added successfully',
      section: post.sections[post.sections.length - 1]
    });
  } catch (error) {
    console.error('[Add Section] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding section'
    });
  }
});

module.exports = router; 