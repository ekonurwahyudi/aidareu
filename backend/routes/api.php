<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\Api\LandingPageController;
use App\Http\Controllers\Api\RBACController;
use App\Http\Controllers\Api\SocialMediaController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LocationController;

// Test endpoint
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Test registration endpoint
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'message' => 'Test register endpoint working!',
        'data' => $request->all()
    ]);
});

// Public Auth Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public: Subdomain availability (no auth required)
Route::get('/stores/check-subdomain', [StoreController::class, 'checkSubdomain']);

// Public: Location API (no auth required)
Route::get('/locations/cities', [LocationController::class, 'getCities']);
Route::get('/locations/provinces', [LocationController::class, 'getProvinces']);

// Public: User API for testing (no auth required)
Route::get('/users/me', [UserController::class, 'me']);
Route::put('/users/{uuid}', [UserController::class, 'update']);

// Auth (session-based) - Legacy
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
});

// Authenticated routes (mendukung baik web session ATAU sanctum token)
Route::middleware(['auth:sanctum,web'])->group(function () {
    // User info
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Legacy user route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // User management routes
    Route::prefix('users')->group(function () {
        Route::get('/{uuid}', [UserController::class, 'show']);
    });

    // User store status
    Route::get('/user/store-status', [StoreController::class, 'checkUserStoreStatus']);
    
    // Store setup
    Route::post('/check-subdomain', [StoreController::class, 'checkSubdomain']);
    Route::post('/store/setup', [StoreController::class, 'storeSetup']);

    // RBAC Routes
    Route::prefix('rbac')->group(function () {
        // Users
        Route::get('/users', [RBACController::class, 'getUsers']);
        Route::post('/users', [RBACController::class, 'createUser']);
        Route::put('/users/{id}', [RBACController::class, 'updateUser']);
        Route::put('/users/{id}/toggle-status', [RBACController::class, 'toggleUserStatus']);
        Route::delete('/users/{id}', [RBACController::class, 'deleteUser']);
        Route::post('/assign-roles', [RBACController::class, 'assignRoles']);
        
        // Roles & Permissions
        Route::get('/roles', [RBACController::class, 'getRoles']);
        Route::get('/permissions', [RBACController::class, 'getPermissions']);
        Route::get('/permissions/me', [RBACController::class, 'myPermissions']);
    });

    // Store Routes
    Route::prefix('stores')->group(function () {
        Route::get('/test', [StoreController::class, 'test']);
        Route::get('/', [StoreController::class, 'index']);
        Route::post('/', [StoreController::class, 'store']);
        // Removed GET /stores/check-subdomain from protected routes (now public above)
        Route::get('/{uuid}', [StoreController::class, 'show']);
        Route::put('/{uuid}', [StoreController::class, 'update']);
        Route::delete('/{uuid}', [StoreController::class, 'destroy']);
    });
    
    // Social Media Routes
    Route::prefix('stores/{store}/social-media')->group(function () {
        Route::get('/', [SocialMediaController::class, 'index']);
        Route::post('/', [SocialMediaController::class, 'store']);
        Route::put('/{socialMedia}', [SocialMediaController::class, 'update']);
        Route::delete('/{socialMedia}', [SocialMediaController::class, 'destroy']);
        Route::post('/bulk-update', [SocialMediaController::class, 'bulkUpdate']);
    });
    
    // Bank Account Routes
    Route::prefix('stores/{store}/bank-accounts')->group(function () {
        Route::get('/', [BankAccountController::class, 'index']);
        Route::post('/', [BankAccountController::class, 'store']);
        Route::put('/{bankAccount}', [BankAccountController::class, 'update']);
        Route::delete('/{bankAccount}', [BankAccountController::class, 'destroy']);
        Route::post('/{bankAccount}/set-primary', [BankAccountController::class, 'setPrimary']);
    });
    
    // Direct routes for current user's store (simpler for frontend)
    Route::get('/social-media', [SocialMediaController::class, 'userIndex']);
    Route::post('/social-media', [SocialMediaController::class, 'userStore']);
    Route::put('/social-media/{socialMedia}', [SocialMediaController::class, 'userUpdate']);
    Route::delete('/social-media/{socialMedia}', [SocialMediaController::class, 'userDestroy']);
    
    Route::get('/bank-accounts', [BankAccountController::class, 'userIndex']);
    Route::post('/bank-accounts', [BankAccountController::class, 'userStore']);
    Route::put('/bank-accounts/{bankAccount}', [BankAccountController::class, 'userUpdate']);
    Route::delete('/bank-accounts/{bankAccount}', [BankAccountController::class, 'userDestroy']);

    // Utility Routes
    Route::get('/social-media/platforms', [SocialMediaController::class, 'getPlatforms']);
    Route::get('/bank-accounts/banks', [BankAccountController::class, 'getBanks']);
    

    // Landing Page Routes
    Route::post('/generate-landing', [LandingPageController::class, 'generate']);
    Route::get('/landing', [LandingPageController::class, 'index']);
    Route::get('/test-openai', [LandingPageController::class, 'testOpenAI']);
    
    Route::post('/landing/{landing}/update', [LandingPageController::class, 'update']);
    Route::get('/landing/{landing}', [LandingPageController::class, 'showById']);
    Route::delete('/landing/{landing}', [LandingPageController::class, 'destroy']);
    Route::post('/landing/{landing}/duplicate', [LandingPageController::class, 'duplicate']);

    Route::get('/landing/uuid/{uuid}', [LandingPageController::class, 'showByUuid']);
    Route::post('/landing/uuid/{uuid}/update', [LandingPageController::class, 'updateByUuid']);
    Route::delete('/landing/uuid/{uuid}', [LandingPageController::class, 'destroyByUuid']);
    Route::post('/landing/uuid/{uuid}/duplicate', [LandingPageController::class, 'duplicateByUuid']);
    Route::get('/landing/uuid/{uuid}/images', [LandingPageController::class, 'getConsistentImages']);
});

// Public
Route::get('/landing/slug/{slug}', [LandingPageController::class, 'showBySlug']);