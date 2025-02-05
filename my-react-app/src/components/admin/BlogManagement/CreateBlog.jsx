import LoadingSpinner from '../../common/LoadingSpinner';

export default function CreateBlog() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ... other state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // ... submit logic
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // ... existing JSX
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting ? (
                <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Creating Blog Post...</span>
                </>
            ) : (
                <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Blog Post
                </>
            )}
        </button>
        // ... rest of the component
    );
} 