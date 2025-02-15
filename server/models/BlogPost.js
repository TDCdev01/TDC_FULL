const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'code', 'image', 'video', 'callToAction'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  caption: String // Optional, for images
});

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authorNameFE: {  // New field for frontend display
    type: String,
    required: true,
    trim: true
  },
  authorName: {  // Keep this for backend reference
    type: String,
    required: true,
    trim: true
  },
  bannerImage: {
    url: {
      type: String,
      required: false
    },
    alt: {
      type: String,
      required: false
    }
  },
  sections: [sectionSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    enum: ['Featured', 'New', 'Popular', 'Trending']
  }],
  topics: [{
    type: String,
    enum: [
      'Power BI', 
      'Python', 
      'Data Science', 
      'Machine Learning',
      'SQL', 
      'Data Analytics',
      'NumPy',
      'Pandas',
      'Azure',
      'AWS',
      'Database',
      'Big Data',
      'Data Engineering',
      'Data Visualization'
    ]
  }]
}, { timestamps: true });

blogPostSchema.pre('validate', async function(next) {
  if (this.author) {
    try {
      const Admin = mongoose.model('Admin');
      console.log('[BlogPost Pre-validate] Looking up admin with ID:', this.author);

      
      const admin = await Admin.findById(this.author);
      console.log('[BlogPost Pre-validate] Found admin:', admin);
      
      if (admin) {
        
        this.authorName = admin.name || 'Unknown Author';
        console.log('[BlogPost Pre-validate] Set authorName to:', this.authorName);
      } else {
        
        if (this._currentUser) {
          this.authorName = this._currentUser.name || 'Unknown Author';
          console.log('[BlogPost Pre-validate] Set authorName from current user to:', this.authorName);
        } else {
          this.authorName = 'Unknown Author';
          console.log('[BlogPost Pre-validate] No admin information available');
        }
      }
    } catch (error) {
      console.error('[BlogPost Pre-validate] Error setting author name:', error);
      
      if (this._currentUser) {
        this.authorName = this._currentUser.name || 'Unknown Author';
        console.log('[BlogPost Pre-validate] Set authorName from current user after error:', this.authorName);
      } else {
        this.authorName = 'Unknown Author';
      }
    }
  } else {
    console.log('[BlogPost Pre-validate] No author ID provided');
    this.authorName = 'Unknown Author';
  }
  
  console.log('[BlogPost Pre-validate] Final post state:', {
    title: this.title,
    author: this.author,
    authorName: this.authorName
  });
  
  next();
});

blogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

blogPostSchema.methods.incrementViewCount = async function() {
  try {
    // Use findOneAndUpdate to atomically increment the view count
    const updatedPost = await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedPost) {
      throw new Error('Blog post not found');
    }

    // Update the current instance with the new count
    this.viewCount = updatedPost.viewCount;
    
    console.log(`[ViewCount] Successfully updated view count for post ${this._id}. New count: ${this.viewCount}`);
    
    return this;
  } catch (error) {
    console.error(`[ViewCount] Error incrementing view count for post ${this._id}:`, error);
    throw error;
  }
};

// Add a post-save hook to confirm the save operation
blogPostSchema.post('save', function(doc) {
  console.log('[BlogPost Post-save] Successfully saved blog post:', {
    id: doc._id,
    title: doc.title,
    author: doc.author,
    authorName: doc.authorName
  });
});

// Add method to set current user info before saving
blogPostSchema.methods.setCurrentUser = function(user) {
  this._currentUser = user;
  return this;
};

module.exports = mongoose.model('BlogPost', blogPostSchema); 