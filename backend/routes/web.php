<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LandingPageController;
use App\Http\Controllers\TenantController;

// Main domain routes (when no subdomain/custom domain)
Route::domain(config('app.domain', 'localhost'))->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });
    
    // Route untuk menampilkan landing page yang di-generate
    Route::get('/{slug}', [LandingPageController::class, 'showBySlug'])
        ->where('slug', '[a-zA-Z0-9\-_]+');
    
    // Route untuk menampilkan landing page berdasarkan UUID
    Route::get('/uuid/{uuid}', [LandingPageController::class, 'showByUuid'])
        ->where('uuid', '[a-fA-F0-9\-]+');
});

// Tenant routes (for subdomains and custom domains)
// These will be handled by SubdomainMiddleware and CustomDomainMiddleware
Route::middleware(['web'])->group(function () {
    // Home page for tenant
    Route::get('/', [TenantController::class, 'showLandingPage']);
    
    // Dynamic tenant routes
    Route::get('/{path}', [TenantController::class, 'handleDynamicRoute'])
        ->where('path', '[a-zA-Z0-9\-_/]+');
});
