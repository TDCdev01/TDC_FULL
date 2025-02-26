import { Cloudinary } from '@cloudinary/url-gen';
import axios from 'axios';

const cld = new Cloudinary({
    cloud: {
        cloudName: 'dl4zkgesn',
        apiKey: '335993853938643',
        apiSecret: '3ZDq0LKSlpeUbEewxwwrs8625QQ'
    }
});

export const uploadToCloudinary = async (file, resourceType = 'auto') => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'tdc_preset');
        formData.append('cloud_name', 'dl4zkgesn');

        // Set the correct resource type
        const fileType = file.type;
        let actualResourceType = resourceType;
        
        // Handle PDFs and other documents
        if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('application')) {
            actualResourceType = 'raw';
        }

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dl4zkgesn/${actualResourceType}/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error:', errorData);
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        console.log('Upload successful:', data);

        // Return the direct URL without transformations
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

// Helper function to generate signature
const generateSignature = (timestamp, apiSecret) => {
    const crypto = require('crypto');
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
};

// Export the Cloudinary instance for direct use
export const cloudinary = cld; 