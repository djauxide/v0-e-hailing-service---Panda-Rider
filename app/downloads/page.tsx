"use client";

import Link from "next/link";
import { Download, Github, FileText, Terminal } from "lucide-react";

export default function DownloadsPage() {
  const riderBuildCommand = `cd panda-rider/flutter-customer && flutter build apk`;
  const driverBuildCommand = `cd panda-rider/flutter-driver && flutter build apk`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">PR</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panda Rider Downloads</h1>
          </div>
          <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Download Mobile Apps</h2>
          <p className="text-lg text-gray-600">
            Get the Panda Rider applications for drivers and riders. Choose your platform and follow the setup instructions.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Rider App Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-red-500 to-red-600"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Rider App</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Mobile app for customers to book rides, delivery, and courier services in real-time.
              </p>
              <div className="space-y-3">
                <a
                  href="https://github.com/djauxide/v0-e-hailing-service---Panda-Rider/tree/main/panda-rider/flutter-customer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Github size={18} />
                  View Source Code
                </a>
                <button
                  onClick={() => alert("Build instructions shown below")}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium w-full justify-center"
                >
                  <Download size={18} />
                  Build APK
                </button>
              </div>
            </div>
          </div>

          {/* Driver App Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Driver App</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Mobile app for drivers to accept trips, navigate, and manage earnings.
              </p>
              <div className="space-y-3">
                <a
                  href="https://github.com/djauxide/v0-e-hailing-service---Panda-Rider/tree/main/panda-rider/flutter-driver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Github size={18} />
                  View Source Code
                </a>
                <button
                  onClick={() => alert("Build instructions shown below")}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium w-full justify-center"
                >
                  <Download size={18} />
                  Build APK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Build Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Rider Build Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Terminal size={24} className="text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Build Rider App</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prerequisites:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Flutter SDK installed</li>
                  <li>Android SDK or Xcode (for iOS)</li>
                  <li>Git installed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Steps:</h4>
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-2 overflow-x-auto">
                  <div>$ git clone https://github.com/djauxide/v0-e-hailing-service---Panda-Rider.git</div>
                  <div>$ {riderBuildCommand}</div>
                  <div className="text-gray-500"># APK will be at build/app/outputs/apk/release/</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> For iOS builds, use <code className="bg-blue-100 px-2 py-1 rounded">flutter build ios</code> and follow Xcode signing.
                </p>
              </div>
            </div>
          </div>

          {/* Driver Build Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Terminal size={24} className="text-gray-900" />
              <h3 className="text-xl font-bold text-gray-900">Build Driver App</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prerequisites:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Flutter SDK installed</li>
                  <li>Android SDK or Xcode (for iOS)</li>
                  <li>Git installed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Steps:</h4>
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-2 overflow-x-auto">
                  <div>$ git clone https://github.com/djauxide/v0-e-hailing-service---Panda-Rider.git</div>
                  <div>$ {driverBuildCommand}</div>
                  <div className="text-gray-500"># APK will be at build/app/outputs/apk/release/</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> For iOS builds, use <code className="bg-blue-100 px-2 py-1 rounded">flutter build ios</code> and follow Xcode signing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Options */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Distribution Options</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Google Play Store</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>1. Build signed APK: <code className="bg-gray-100 px-2 py-1 rounded text-xs">flutter build appbundle</code></li>
                <li>2. Create Google Play Developer account</li>
                <li>3. Upload app bundle to Play Console</li>
                <li>4. Configure app details and pricing</li>
                <li>5. Submit for review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">App Store (iOS)</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>1. Create Apple Developer account</li>
                <li>2. Build for iOS: <code className="bg-gray-100 px-2 py-1 rounded text-xs">flutter build ios</code></li>
                <li>3. Configure signing in Xcode</li>
                <li>4. Archive and upload via Xcode</li>
                <li>5. Review on TestFlight then submit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Firebase App Distribution</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>1. Set up Firebase project</li>
                <li>2. Install Firebase CLI</li>
                <li>3. Distribute APK: <code className="bg-gray-100 px-2 py-1 rounded text-xs">firebase appdistribution:distribute</code></li>
                <li>4. Send invite links to testers</li>
                <li>5. Collect feedback and crash reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Direct APK Distribution</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>1. Build release APK</li>
                <li>2. Host on web server or cloud storage</li>
                <li>3. Share download link</li>
                <li>4. Users enable "Unknown Sources" to install</li>
                <li>5. Good for internal testing only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Environment Setup */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Environment Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">1</span>
                Clone Repository
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`git clone https://github.com/djauxide/v0-e-hailing-service---Panda-Rider.git
cd v0-e-hailing-service---Panda-Rider`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">2</span>
                Get Dependencies
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`flutter pub get
# For Rider App
cd panda-rider/flutter-customer
flutter pub get`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">3</span>
                Configure Firebase
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`# Add google-services.json for Android
# Add GoogleService-Info.plist for iOS
# Update .env files with API keys`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">4</span>
                Run & Build
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`flutter run          # Test on device
flutter build apk   # Build for Android
flutter build ios   # Build for iOS`}
              </pre>
            </div>
          </div>
        </div>

        {/* Full Automation Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-4">Full Automation Setup</h3>
          <p className="text-purple-100 mb-6">
            One-click setup for Flutter + Firebase + Google Cloud integration with CI/CD pipelines.
          </p>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="text-green-400"># Clone and setup</div>
            <div className="text-green-400">$ git clone https://github.com/djauxide/v0-e-hailing-service---Panda-Rider.git</div>
            <div className="text-green-400">$ cd v0-e-hailing-service---Panda-Rider</div>
            <div className="text-green-400">$ cd panda-rider/scripts</div>
            <div className="text-green-400">$ chmod +x setup-automation.sh</div>
            <div className="text-green-400">$ ./setup-automation.sh</div>
            <div className="text-gray-400 mt-2"># This will:</div>
            <div className="text-gray-400"># - Configure Firebase project</div>
            <div className="text-gray-400"># - Enable Google Cloud APIs</div>
            <div className="text-gray-400"># - Set up FlutterFire for both apps</div>
            <div className="text-gray-400"># - Deploy Cloud Functions</div>
            <div className="text-gray-400"># - Create CI/CD GitHub Actions</div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://github.com/djauxide/v0-e-hailing-service---Panda-Rider"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              View Full Repository
            </a>
            <Link
              href="/rider"
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-400 transition-colors"
            >
              Preview Rider App
            </Link>
            <Link
              href="/driver"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Preview Driver App
            </Link>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://docs.flutter.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h4 className="font-bold text-gray-900 mb-2">Flutter Documentation</h4>
            <p className="text-sm text-gray-600">Official Flutter docs and tutorials</p>
          </a>
          <a
            href="https://github.com/djauxide/v0-e-hailing-service---Panda-Rider"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h4 className="font-bold text-gray-900 mb-2">GitHub Repository</h4>
            <p className="text-sm text-gray-600">Source code and project structure</p>
          </a>
          <a
            href="/api-docs"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h4 className="font-bold text-gray-900 mb-2">API Documentation</h4>
            <p className="text-sm text-gray-600">Backend API endpoints reference</p>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Panda Rider - Multi-service E-Hailing Platform</p>
          <p className="text-sm mt-2 text-gray-500">Built with Next.js, Flutter, and Node.js</p>
        </div>
      </footer>
    </div>
  );
}
