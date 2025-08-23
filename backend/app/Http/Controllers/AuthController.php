<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|min:2|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'no_hp' => 'required|string|min:10|max:15',
            'password' => 'required|string|min:8',
            'alasan_gabung' => 'required|string|min:10',
            'info_dari' => 'required|string|in:sosial_media,grup_komunitas,iklan,google,teman_saudara,lainnya'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Test without database operations first
            return response()->json([
                'message' => 'Validation passed, ready to create user',
                'data' => $request->all()
            ], 200);
            
            // Create user (commented for debugging)
            /*
            $user = User::create([
                'uuid' => Str::uuid(),
                'nama_lengkap' => $request->nama_lengkap,
                'email' => $request->email,
                'no_hp' => $request->no_hp,
                'password' => Hash::make($request->password),
                'alasan_gabung' => $request->alasan_gabung,
                'info_dari' => $request->info_dari,
                'email_verified_at' => null
            ]);

            // Assign 'owner' role to the user
            // $user->assignRole('owner'); // Temporarily commented for debugging

            // Generate verification code
            $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            */
            
            // Store verification code in cache for 10 minutes
            Cache::put(
                'email_verification_' . $user->email, 
                $verificationCode, 
                now()->addMinutes(10)
            );

            // Send verification email
            $this->sendVerificationEmail($user, $verificationCode);

            return response()->json([
                'message' => 'User registered successfully. Please check your email for verification code.',
                'user' => [
                    'id' => $user->id,
                    'uuid' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify email with code
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $request->email;
            $code = $request->code;

            // Get stored verification code
            $storedCode = Cache::get('email_verification_' . $email);

            if (!$storedCode) {
                return response()->json([
                    'message' => 'Verification code has expired. Please request a new one.'
                ], 400);
            }

            if ($storedCode !== $code) {
                return response()->json([
                    'message' => 'Invalid verification code.'
                ], 400);
            }

            // Find user and verify email
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not found.'
                ], 404);
            }

            // Mark email as verified
            $user->email_verified_at = now();
            $user->save();

            // Remove verification code from cache
            Cache::forget('email_verification_' . $email);

            return response()->json([
                'message' => 'Email verified successfully!',
                'user' => [
                    'id' => $user->id,
                    'uuid' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Email verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend verification code
     */
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $request->email;
            
            // Find user
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not found.'
                ], 404);
            }

            if ($user->email_verified_at) {
                return response()->json([
                    'message' => 'Email is already verified.'
                ], 400);
            }

            // Check if there's a cooldown (prevent spam)
            $lastSent = Cache::get('last_verification_sent_' . $email);
            if ($lastSent && $lastSent->diffInSeconds(now()) < 60) {
                return response()->json([
                    'message' => 'Please wait before requesting another verification code.'
                ], 429);
            }

            // Generate new verification code
            $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Store verification code in cache for 10 minutes
            Cache::put(
                'email_verification_' . $email, 
                $verificationCode, 
                now()->addMinutes(10)
            );

            // Store last sent time
            Cache::put(
                'last_verification_sent_' . $email,
                now(),
                now()->addMinutes(5)
            );

            // Send verification email
            $this->sendVerificationEmail($user, $verificationCode);

            return response()->json([
                'message' => 'Verification code sent successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to resend verification code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send verification email
     */
    private function sendVerificationEmail($user, $code)
    {
        // For now, we'll just log the code
        // In production, you should send actual email
        Log::info('Verification code for ' . $user->email . ': ' . $code);
        
        // TODO: Implement actual email sending
        // Mail::to($user->email)->send(new VerificationCodeMail($user, $code));
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!$user->email_verified_at) {
                return response()->json([
                    'message' => 'Please verify your email first',
                    'requires_verification' => true
                ], 403);
            }

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'uuid' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'roles' => $user->getRoleNames()
                ],
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logout successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'uuid' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}