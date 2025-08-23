<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SocialMediaController extends Controller
{
    public function index(Request $request, $store)
    {
        return response()->json(['data' => [], 'message' => 'OK']);
    }

    public function store(Request $request, $store)
    {
        return response()->json(['message' => 'Created'], 201);
    }

    public function update(Request $request, $store, $socialMedia)
    {
        return response()->json(['message' => 'Updated']);
    }

    public function destroy($store, $socialMedia)
    {
        return response()->json(null, 204);
    }

    public function bulkUpdate(Request $request, $store)
    {
        return response()->json(['message' => 'Bulk updated']);
    }

    public function getPlatforms()
    {
        $platforms = [
            ['key' => 'facebook', 'label' => 'Facebook'],
            ['key' => 'instagram', 'label' => 'Instagram'],
            ['key' => 'twitter', 'label' => 'X/Twitter'],
            ['key' => 'tiktok', 'label' => 'TikTok'],
            ['key' => 'youtube', 'label' => 'YouTube'],
            ['key' => 'linkedin', 'label' => 'LinkedIn'],
            ['key' => 'whatsapp', 'label' => 'WhatsApp'],
            ['key' => 'telegram', 'label' => 'Telegram'],
        ];

        return response()->json(['data' => $platforms]);
    }
}