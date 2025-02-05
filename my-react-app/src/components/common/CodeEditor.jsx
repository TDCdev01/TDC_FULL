import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, language = 'javascript' }) {
    return (
        <div className="h-64 border border-gray-700 rounded-lg overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage={language}
                theme="vs-dark"
                value={value}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                }}
            />
        </div>
    );
} 