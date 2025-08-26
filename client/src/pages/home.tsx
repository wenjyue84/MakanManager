import React from 'react';

interface HelloWorldProps {
  message?: string;
}

const HelloWorld: React.FC<HelloWorldProps> = ({ 
  message = "Hello World" 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-react-bg text-react-dark font-system">
      {/* Header with React logo */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 relative" data-testid="react-logo">
          <div className="w-16 h-16 border-2 border-react-blue rounded-full relative">
            {/* Electron orbit rings */}
            <div className="absolute inset-0 border border-react-blue rounded-full transform rotate-45"></div>
            <div className="absolute inset-0 border border-react-blue rounded-full transform -rotate-45"></div>
            {/* Nucleus */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-react-blue rounded-full"></div>
          </div>
        </div>
        <h1 className="text-2xl font-medium text-react-dark mb-2" data-testid="app-title">
          React TypeScript App
        </h1>
        <p className="text-sm text-gray-600" data-testid="app-subtitle">
          A minimal Hello World implementation
        </p>
      </header>

      {/* Main Hello World content */}
      <main className="text-center max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6 shadow-sm">
          <h2 className="text-3xl font-semibold text-react-dark mb-4" data-testid="hello-message">
            {message}
          </h2>
          <p className="text-gray-600 leading-relaxed" data-testid="description">
            This is a minimal React application built with TypeScript. 
            The component structure demonstrates basic React patterns with 
            type safety provided by TypeScript.
          </p>
        </div>

        {/* Code preview section */}
        <div className="bg-code-bg border border-gray-200 rounded-lg p-6 text-left" data-testid="code-preview">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs text-gray-500 ml-2">src/App.tsx</span>
          </div>
          <pre className="text-sm text-react-dark overflow-x-auto">
            <code data-testid="code-sample">{`import React from 'react';

interface AppProps {
  message?: string;
}

const App: React.FC<AppProps> = ({ 
  message = "Hello World" 
}) => {
  return (
    <div className="app">
      <h1>{message}</h1>
      <p>Built with React & TypeScript</p>
    </div>
  );
};

export default App;`}</code>
          </pre>
        </div>
      </main>

      {/* Footer with build info */}
      <footer className="mt-12 text-center">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500" data-testid="build-status">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            TypeScript Ready
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-react-blue rounded-full mr-2"></span>
            React 18+
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Production Build
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-4" data-testid="footer-text">
          Minimal implementation following React best practices
        </p>
      </footer>
    </div>
  );
};

export default HelloWorld;
