<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreController extends Controller
{
    /**
     * Check subdomain availability
     */
    public function checkSubdomain(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subdomain' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                'not_regex:/^(www|api|admin|app|mail|ftp|blog|shop|store|dashboard)$/i'
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid subdomain format',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $subdomain = strtolower($request->subdomain);
            
            // Check if subdomain exists
            $exists = Store::where('subdomain', $subdomain)->exists();
            
            return response()->json([
                'available' => !$exists,
                'subdomain' => $subdomain
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check subdomain availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new store
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_toko' => 'required|string|min:2|max:255',
            'subdomain' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                'unique:stores,subdomain',
                'not_regex:/^(www|api|admin|app|mail|ftp|blog|shop|store|dashboard)$/i'
            ],
            'no_hp_toko' => 'required|string|regex:/^(\+62|62|0)[0-9]{9,13}$/',
            'kategori_toko' => 'required|string|in:fashion,elektronik,makanan,kesehatan,rumah_tangga,olahraga,buku_media,otomotif,mainan_hobi,jasa,lainnya',
            'deskripsi_toko' => 'required|string|min:10|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            
            // Check if user already has a store
            $existingStore = Store::where('owner_id', $user->id)->first();
            if ($existingStore) {
                return response()->json([
                    'message' => 'User already has a store'
                ], 400);
            }

            // Double check subdomain availability
            $subdomain = strtolower($request->subdomain);
            if (Store::where('subdomain', $subdomain)->exists()) {
                return response()->json([
                    'message' => 'Subdomain is already taken'
                ], 400);
            }

            DB::beginTransaction();

            // Create store
            $store = Store::create([
                'uuid' => Str::uuid(),
                'nama_toko' => $request->nama_toko,
                'subdomain' => $subdomain, // Only use subdomain field
                'no_hp_toko' => $request->no_hp_toko,
                'kategori_toko' => $request->kategori_toko,
                'deskripsi_toko' => $request->deskripsi_toko,
                'owner_id' => $user->id,
                'user_id' => $user->id,
                'is_active' => true,
                // Bank Info
                'bank_account_owner' => $request->bank_account_owner ?? null,
                'bank_account_number' => $request->bank_account_number ?? null,
                'bank_name' => $request->bank_name ?? null,
                // Social Media
                'instagram_url' => $request->instagram_url ?? null,
                'facebook_url' => $request->facebook_url ?? null,
                'tiktok_url' => $request->tiktok_url ?? null,
                'youtube_url' => $request->youtube_url ?? null
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Store setup completed successfully!',
                'store' => [
                    'id' => $store->id,
                    'uuid' => $store->uuid,
                    'nama_toko' => $store->nama_toko,
                    'subdomain' => $store->subdomain,
                    'no_hp_toko' => $store->no_hp_toko,
                    'kategori_toko' => $store->kategori_toko,
                    'deskripsi_toko' => $store->deskripsi_toko,
                    'is_active' => $store->is_active,
                    'url' => 'https://' . $store->subdomain . '.aidareu.com'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create store',
                'error' => $e->getMessage()
            ], 500);
        }
        
        /*
        $validator = Validator::make($request->all(), [
            'nama_toko' => 'required|string|min:2|max:255',
            'subdomain' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                'unique:stores,subdomain',
                'not_regex:/^(www|api|admin|app|mail|ftp|blog|shop|store|dashboard)$/i'
            ],
            'no_hp_toko' => 'required|string|regex:/^(\+62|62|0)[0-9]{9,13}$/',
            'kategori_toko' => 'required|string|in:fashion,elektronik,makanan,kesehatan,rumah_tangga,olahraga,buku_media,otomotif,mainan_hobi,jasa,lainnya',
            'deskripsi_toko' => 'required|string|min:10|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            
            // Check if user already has a store
            $existingStore = Store::where('owner_id', $user->id)->first();
            if ($existingStore) {
                return response()->json([
                    'message' => 'User already has a store'
                ], 400);
            }

            // Double check subdomain availability
            $subdomain = strtolower($request->subdomain);
            if (Store::where('sub_domain', $subdomain)->exists()) {
                return response()->json([
                    'message' => 'Subdomain is already taken'
                ], 400);
            }

            DB::beginTransaction();

            // Create store
            $store = Store::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'nama_toko' => $request->nama_toko,
                'sub_domain' => $subdomain,
                'subdomain' => $subdomain,
                'no_hp_toko' => $request->no_hp_toko,
                'kategori_toko' => $request->kategori_toko,
                'deskripsi_toko' => $request->deskripsi_toko,
                'owner_id' => $user->id,
                'user_id' => $user->id,
                'is_active' => true
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Store created successfully!',
                'store' => [
                    'id' => $store->id,
                    'nama_toko' => $store->nama_toko,
                    'subdomain' => $store->sub_domain,
                    'no_hp_toko' => $store->no_hp_toko,
                    'kategori_toko' => $store->kategori_toko,
                    'deskripsi_toko' => $store->deskripsi_toko,
                    'is_active' => $store->is_active,
                    'url' => 'https://' . $store->sub_domain . '.aidareu.com'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create store',
                'error' => $e->getMessage()
            ], 500);
        }
        */
    }

    /**
     * Get user's stores
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $stores = Store::where('owner_id', $user->id)
                          ->orderBy('created_at', 'desc')
                          ->get()
                          ->map(function ($store) {
                    return [
                        'id' => $store->id,
                        'nama_toko' => $store->nama_toko,
                        'subdomain' => $store->subdomain,
                        'no_hp_toko' => $store->no_hp_toko,
                        'kategori_toko' => $store->kategori_toko,
                        'deskripsi_toko' => $store->deskripsi_toko,
                        'is_active' => $store->is_active,
                        'url' => 'https://' . $store->subdomain . '.aidareu.com',
                        'created_at' => $store->created_at,
                        'updated_at' => $store->updated_at
                    ];
                });

            return response()->json([
                'stores' => $stores
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get stores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint
     */
    public function test()
    {
        return response()->json([
            'message' => 'Store controller test endpoint works!',
            'user_id' => Auth::check() ? Auth::id() : null,
            'user' => Auth::check() ? Auth::user() : null
        ]);
    }

    /**
     * Get specific store
     */
    public function show(Request $request, $uuid)
    {
        try {
            $user = Auth::user();
            
            $store = Store::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->with(['socialMedia', 'bankAccounts'])
                ->first();

            if (!$store) {
                return response()->json([
                    'message' => 'Store not found'
                ], 404);
            }

            return response()->json([
                'store' => [
                    'id' => $store->id,
                    'uuid' => $store->uuid,
                    'name' => $store->name,
                    'subdomain' => $store->subdomain,
                    'phone' => $store->phone,
                    'category' => $store->category,
                    'description' => $store->description,
                    'status' => $store->status,
                    'is_published' => $store->is_published,
                    'url' => 'https://' . $store->subdomain . '.aidareu.com',
                    'social_media' => $store->socialMedia,
                    'bank_accounts' => $store->bankAccounts,
                    'created_at' => $store->created_at,
                    'updated_at' => $store->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update store
     */
    public function update(Request $request, $uuid)
    {
        $validator = Validator::make($request->all(), [
            'nama_toko' => 'sometimes|required|string|min:2|max:255',
            'no_hp_toko' => 'sometimes|required|string|regex:/^(\+62|62|0)[0-9]{9,13}$/',
            'kategori_toko' => 'sometimes|required|string|in:fashion,elektronik,makanan,kesehatan,rumah_tangga,olahraga,buku_media,otomotif,mainan_hobi,jasa,lainnya',
            'deskripsi_toko' => 'sometimes|required|string|min:10|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            
            $store = Store::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            if (!$store) {
                return response()->json([
                    'message' => 'Store not found'
                ], 404);
            }

            // Update store
            $updateData = [];
            if ($request->has('nama_toko')) {
                $updateData['name'] = $request->nama_toko;
            }
            if ($request->has('no_hp_toko')) {
                $updateData['phone'] = $request->no_hp_toko;
            }
            if ($request->has('kategori_toko')) {
                $updateData['category'] = $request->kategori_toko;
            }
            if ($request->has('deskripsi_toko')) {
                $updateData['description'] = $request->deskripsi_toko;
            }

            $store->update($updateData);

            return response()->json([
                'message' => 'Store updated successfully!',
                'store' => [
                    'id' => $store->id,
                    'uuid' => $store->uuid,
                    'name' => $store->name,
                    'subdomain' => $store->subdomain,
                    'phone' => $store->phone,
                    'category' => $store->category,
                    'description' => $store->description,
                    'status' => $store->status,
                    'is_published' => $store->is_published,
                    'url' => 'https://' . $store->subdomain . '.aidareu.com'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete store
     */
    public function destroy(Request $request, $uuid)
    {
        try {
            $user = Auth::user();
            
            $store = Store::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            if (!$store) {
                return response()->json([
                    'message' => 'Store not found'
                ], 404);
            }

            $store->delete();

            return response()->json([
                'message' => 'Store deleted successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete store setup with all 3 steps
     */
    public function storeSetup(Request $request)
    {
        // Log request data for debugging
        Log::info('Store setup request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            // Store Info
            'storeName' => 'required|string|min:2|max:255',
            'subdomain' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                'unique:stores,subdomain,NULL,id',
                'unique:stores,sub_domain,NULL,id',
                'not_regex:/^(www|api|admin|app|mail|ftp|blog|shop|store|dashboard)$/i'
            ],
            'phoneNumber' => 'required|string|min:10|max:15',
            'category' => 'required|string',
            'description' => 'required|string|min:10',
            // Bank Account
            'accountOwner' => 'required|string|min:2|max:255',
            'accountNumber' => 'required|string|min:8|max:20',
            'bankName' => 'required|string',
            // Social Media (optional)
            'instagram' => 'nullable|string',
            'facebook' => 'nullable|string',
            'tiktok' => 'nullable|string',
            'youtube' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            
            // Check if user already has a store
            $existingStore = Store::where('owner_id', $user->id)->first();
            if ($existingStore) {
                return response()->json([
                    'message' => 'User already has a store',
                    'store' => $existingStore
                ], 400);
            }

            // Check subdomain availability
            $subdomain = strtolower($request->subdomain);
            
            // Log subdomain check
            Log::info('Checking subdomain availability: ' . $subdomain);
            
            if (Store::where('sub_domain', $subdomain)->orWhere('subdomain', $subdomain)->exists()) {
                Log::info('Subdomain is already taken: ' . $subdomain);
                return response()->json([
                    'message' => 'Subdomain is already taken'
                ], 400);
            }
            
            Log::info('Subdomain is available: ' . $subdomain);

            DB::beginTransaction();

            // Log store creation data
            Log::info('Creating store with data:', [
                'storeName' => $request->storeName,
                'subdomain' => $subdomain,
                'phoneNumber' => $request->phoneNumber,
                'category' => $request->category,
                'description' => $request->description,
                'user_id' => $user->id
            ]);
            
            // Map frontend category to database enum value
            $categoryMap = [
                'Fashion & Pakaian' => 'fashion',
                'Elektronik & Gadget' => 'elektronik',
                'Makanan & Minuman' => 'makanan',
                'Kesehatan & Kecantikan' => 'kesehatan',
                'Rumah & Taman' => 'rumah_tangga',
                'Olahraga & Outdoor' => 'olahraga',
                'Buku & Alat Tulis' => 'buku_media',
                'Mainan & Bayi' => 'mainan_hobi',
                'Otomotif' => 'otomotif',
                'Lainnya' => 'lainnya'
            ];
            
            $kategoriToko = $categoryMap[$request->category] ?? 'lainnya';
            
            // Create store
            $store = Store::create([
                'uuid' => Str::uuid(),
                'nama_toko' => $request->storeName,
                'sub_domain' => $subdomain,
                'subdomain' => $subdomain, // Add both fields for compatibility
                'no_hp_toko' => $request->phoneNumber,
                'kategori_toko' => $kategoriToko,
                'deskripsi_toko' => $request->description,
                'owner_id' => $user->id,
                'user_id' => $user->id,
                'is_active' => true,
                // Bank Info
                'bank_account_owner' => $request->accountOwner,
                'bank_account_number' => $request->accountNumber,
                'bank_name' => $request->bankName,
                // Social Media
                'instagram_url' => $request->instagram,
                'facebook_url' => $request->facebook,
                'tiktok_url' => $request->tiktok,
                'youtube_url' => $request->youtube
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Store setup completed successfully!',
                'store' => [
                    'id' => $store->id,
                    'uuid' => $store->uuid,
                    'nama_toko' => $store->nama_toko,
                    'subdomain' => $store->subdomain,
                    'no_hp_toko' => $store->no_hp_toko,
                    'kategori_toko' => $store->kategori_toko,
                    'deskripsi_toko' => $store->deskripsi_toko,
                    'is_active' => $store->is_active,
                    'url' => 'https://' . $store->subdomain . '.aidareu.com'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Store setup error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to setup store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check user store status
     */
    public function checkUserStoreStatus()
    {
        try {
            $user = Auth::user();
            
            $store = Store::where('owner_id', $user->id)->first();
            
            return response()->json([
                'has_store' => !is_null($store),
                'store_id' => $store ? $store->id : null,
                'store_uuid' => $store ? $store->uuid : null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check store status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}