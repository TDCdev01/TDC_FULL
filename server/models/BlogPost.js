const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'code', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sections: [sectionSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
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
  }
});

blogPostSchema.pre('validate', async function(next) {
  if (this.author) {
    try {
      const Admin = mongoose.model('Admin');
      console.log('[BlogPost Pre-validate] Looking up admin with ID:', this.author);

      // Try to get the admin document
      const admin = await Admin.findById(this.author);
      console.log('[BlogPost Pre-validate] Found admin:', admin);
      
      if (admin) {
        // Use the 'name' field from admin document
        this.authorName = admin.name || 'Unknown Author';
        console.log('[BlogPost Pre-validate] Set authorName to:', this.authorName);
      } else {
        // If no admin found, try to get from the current request context
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
      // If we have current user info, use it even if the lookup failed
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