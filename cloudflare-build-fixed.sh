#!/bin/bash

# Exit on error
set -e

echo "🔍 Starting build process..."

# Create necessary directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p contract-generator/src/lib
mkdir -p contract-generator/src/types
mkdir -p contract-generator/.vercel/output/static

echo "📦 Installing dependencies..."
cd contract-generator
npm install

echo "🔨 Building static HTML for Cloudflare Pages..."

# Create the static HTML files
echo "📝 Creating static HTML files..."

# Create a simple index.html file (overwrite existing file)
cat > .vercel/output/static/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #0070f3;
    }
    .card {
      border: 1px solid #eaeaea;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .message {
      background-color: #f0f9ff;
      border-left: 4px solid #0070f3;
      padding: 15px;
      margin-bottom: 20px;
    }
    .button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #005cc5;
    }
  </style>
</head>
<body>
  <h1>Contract Generator</h1>

  <div class="message">
    <p><strong>Maintenance Notice:</strong> The application is currently undergoing maintenance to fix issues with client-side navigation. We apologize for any inconvenience.</p>
  </div>

  <div class="card">
    <h2>About Contract Generator</h2>
    <p>Contract Generator is a powerful tool that allows you to create customized legal documents with ease. Simply fill out a form with your specific details, and the system will generate professional legal documents tailored to your needs.</p>
  </div>

  <div class="card">
    <h2>Features</h2>
    <ul>
      <li>Generate customized legal documents</li>
      <li>Save templates for future use</li>
      <li>Export documents in PDF format</li>
      <li>Secure document storage</li>
      <li>User-friendly interface</li>
    </ul>
  </div>

  <div class="card">
    <h2>Contact Support</h2>
    <p>If you need assistance, please contact our support team:</p>
    <p>Email: support@contractgenerator.com</p>
    <p>Phone: +1 (555) 123-4567</p>
    <button class="button" onclick="alert('Support form is currently unavailable during maintenance.')">Contact Support</button>
  </div>

  <footer>
    <p>&copy; 2025 Contract Generator. All rights reserved.</p>
  </footer>
</body>
</html>
HTML_EOF

# Create a simple 404 page
cat > .vercel/output/static/404.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Contract Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #0070f3;
      font-size: 3rem;
      margin-bottom: 10px;
    }
    .error-code {
      font-size: 8rem;
      font-weight: bold;
      color: #eaeaea;
      margin: 0;
    }
    .card {
      border: 1px solid #eaeaea;
      border-radius: 10px;
      padding: 40px;
      margin: 40px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
    }
    .button:hover {
      background-color: #005cc5;
    }
  </style>
</head>
<body>
  <div class="card">
    <p class="error-code">404</p>
    <h1>Page Not Found</h1>
    <p>The page you are looking for does not exist or has been moved.</p>
    <a href="/" class="button">Go to Homepage</a>
  </div>

  <footer>
    <p>&copy; 2025 Contract Generator. All rights reserved.</p>
  </footer>
</body>
</html>
HTML_EOF

# Create a _routes.json file for Cloudflare Pages
cat > .vercel/output/static/_routes.json << 'JSON_EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
JSON_EOF

echo "🚀 Static HTML files created successfully! Ready for Cloudflare Pages deployment."

# Return to the root directory
cd ..
