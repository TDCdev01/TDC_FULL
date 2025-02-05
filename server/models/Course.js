const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    duration: String,
    videoUrl: String,
    content: {
        text: String,
        code: String,
        codeLanguage: {
            type: String,
            default: 'javascript'
        }
    },
    images: [{
        url: String,
        caption: String
    }],
    downloadableFiles: [{
        url: String,
        name: String,
        size: String
    }],
    isLocked: {
        type: Boolean,
        default: true
    }
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    duration: String,
    lessons: [lessonSchema]
});

const resourceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['video', 'exercise', 'quiz', 'download']
    },
    count: {
        type: Number,
        default: 0
    }
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    instructor: {
        name: String,
        title: String,
        image: String
    },
    duration: String,
    students: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    level: String,
    category: String,
    image: String,
    prerequisites: {
        system: [{
            title: String,
            description: String,
            icon: String
        }],
        skills: [{
            title: String,
            description: String,
            level: String,
            icon: String
        }]
    },
    modules: [moduleSchema],
    resources: [resourceSchema],
    relatedTopics: [{
        name: String
    }],
    courseIncludes: [{
        icon: String,
        value: String,
        label: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema); 