<?php

return [
    // Apply CORS for API routes and Sanctum CSRF endpoint
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Methods allowed
    'allowed_methods' => ['*'],

    // Explicit origins - Development (port 3002) and Production domains
    'allowed_origins' => [
        'http://localhost:3002',
        'http://127.0.0.1:3002',
        'https://aidareu.com',
        'https://www.aidareu.com',
        'https://api.aidareu.com',
    ],

    // Allow any subdomain of localhost on port 3002 (e.g., coffee.localhost:3002)
    // Also allow any localhost/127.0.0.1 with any port for development flexibility
    'allowed_origins_patterns' => [
        '/^https?:\/\/([a-z0-9-]+\.)?localhost:3002$/i',
        '/^https?:\/\/127\.0\.0\.1:3002$/i',
        '/^https?:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/i',
        '/^https?:\/\/127\.0\.0\.1(:\d+)?$/i',
    ],

    // Headers
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Important for cookie-based auth (Sanctum): must be true when using credentials: 'include'
    'supports_credentials' => true,
];