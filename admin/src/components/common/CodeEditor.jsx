import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language = 'javascript', readOnly = false }) => {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="300px"
        defaultLanguage={language}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          readOnly,
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
};

export default CodeEditor; 