import LoadingSpinner from '../../common/LoadingSpinner';

export default function BlogList() {
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);
    // ... other state

    // ... existing fetch logic

    const handleDelete = async (blogId) => {
        setIsDeleting(blogId);
        try {
            // ... delete logic
        } finally {
            setIsDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-300 font-medium">Loading blog posts...</p>
            </div>
        );
    }

    return (
        // ... existing JSX
        <button
            onClick={() => handleDelete(blog._id)}
            disabled={isDeleting === blog._id}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
            {isDeleting === blog._id ? (
                <LoadingSpinner size="small" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </button>
        // ... rest of the component
    );
} 