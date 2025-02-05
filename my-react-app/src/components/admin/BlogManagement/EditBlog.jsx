import LoadingSpinner from '../../common/LoadingSpinner';

export default function EditBlog() {
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ... other state

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // ... fetch blog data
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-300 font-medium">Loading blog post...</p>
            </div>
        );
    }

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
                    <span className="ml-2">Updating Blog Post...</span>
                </>
            ) : (
                <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Blog Post
                </>
            )}
        </button>
        // ... rest of the component
    );
} 