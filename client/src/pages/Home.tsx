import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Cloud, Lock, Zap, Folder } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Folder className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              FileManager
            </span>
          </div>
          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Organize Your Files
                <span className="block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Automatically
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Upload files once, and let our intelligent system organize them
                by type, date, and category. No manual folder management needed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => (window.location.href = getLoginUrl())}
                className="gap-2 text-base"
              >
                <Cloud className="h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base"
                disabled
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-8 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Document.pdf
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      2.3 MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                    🖼
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Photo.jpg
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      5.1 MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                    🎥
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Video.mp4
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      125 MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to manage your files efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Automatic Organization
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Files are automatically sorted by type, year, and month. No
                manual folder management required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload, search, and manage files with blazing-fast performance.
                Optimized for speed and efficiency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your files are encrypted and stored securely. Only you have
                access to your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to organize your files?
          </h2>
          <p className="text-xl text-blue-100">
            Start uploading and let our system handle the organization
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => (window.location.href = getLoginUrl())}
            className="gap-2 text-base"
          >
            <Cloud className="h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2026 FileManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
